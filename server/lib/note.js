const ipcMain   = require('electron').ipcMain
const path      = require('path')
const fs        = require('fs')
const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const history   = require(path.join(rootpath, 'server/lib/history'))
const sqlite3   = require('sqlite3-offline').verbose();
const data_path = util.getDataPath()
const db_file   = path.join(data_path, 'data/db/wiki.db')

// 构建树
function buildTree(rows) {
    var node_list = {}
    var parent_set = {}
    for (idx in rows) {
        var row = rows[idx]
        var node_id = row['id']
        var parent_id = row['parent_id']

        // 构造辅助对象
        if (!parent_set[parent_id]) {
            parent_set[parent_id] = []
        }
        parent_set[parent_id].push(row)
        node_list[node_id] = row
    }

    var menu = _buildTree('0', parent_set, node_list)
    return menu['children']
}

// 构建树
function _buildTree(cur_node_id, parent_set, node_list) {
    var sub_nodes = parent_set[cur_node_id]
    var cur_node = node_list[cur_node_id] ? node_list[cur_node_id] : {}

    var menu = cur_node
    menu['children'] = []

    for (idx in sub_nodes) {
        var sub_node = sub_nodes[idx]
        var sub_node_id = sub_node['id']

        if (!parent_set[sub_node_id]) {
            menu['children'].push({'id': sub_node_id, 'text': sub_node['text']})
        } else {
            menu['children'].push(_buildTree(sub_node_id, parent_set, node_list))
        }
    }
    return menu
}

// 获取note文件路径
function get_note_path(note_id) {
    return path.join(data_path, 'data', 'notes', note_id + '.html')
}

// 获取note内容
function get_note(note_id) {
    var file_path = get_note_path(note_id)
    if (!fs.existsSync(file_path)) {
        console.warn('file not exists:' + String(file_path))
        return ''
    }
    var content = fs.readFileSync(file_path, "utf8")
    return util.addImgPrefix(content)
}

// 保存note
function save_note(note_id, file_cont) {
    var file_path = get_note_path(note_id)
    return fs.writeFileSync(file_path, file_cont)
}


function init() {
    // 获取笔记列表
    var db = new sqlite3.Database(db_file);

    // 获取列表
    ipcMain.on('get_menu', (event, data) => {
        var sql = "select title as text, id, parent_id from note where is_del = 0 order by title;"
        db.all(sql, function (err, rows) {
            var menu = buildTree(rows)
            var payload = {
                'code': 0,
                'message_id': data.message_id,
                'menu': menu,
            }

            event.sender.send('get_menu', payload)
        })
    })

    // 创建节点
    ipcMain.on('create_note', (event, req) => {
        if (req.data.parent_id >= 0) {
            var sql = "insert into note(title, parent_id) values('" + req.data.title + "'," + req.data.parent_id + ")"
            db.run(sql, function (err, res) {
                var payload = {
                    code: 0,
                    message_id: req.message_id,
                    msg: 'success',
                    note_id: this.lastID
                }
                event.sender.send('create_note', payload)
            })
        }
    })

    // 删除节点
    ipcMain.on('delete_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "update note set is_del = 1 where id = " + req.data.id + ";"
            db.run(sql, function (err, res) {
                var payload = util.makeResult(req)
                event.sender.send('delete_note', payload)
            })
        }
    })

    // 获取节点
    ipcMain.on('get_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "select id, title from note where id = " + req.data.id + ";"
            var content = get_note(req.data.id)
            db.get(sql, function (err, res) {
                var payload = {
                    code: 0,
                    message_id: req.message_id,
                    msg: 'success',
                    content: content,
                    title: res.title,
                }
                event.sender.send('get_note', payload)
            })
        }
    })

    // 保存节点
    ipcMain.on('save_note', (event, req) => {
        if (req.data.id >= 0) {
            // 保存文件
            var note_id = req.data.id
            var file_cont = req.data.content
            file_cont = util.trimImgPrefix(file_cont)
            if (get_note(note_id) === file_cont) {
                console.warn('note has no change:' + String(req.data.id))
                return
            }
            save_note(note_id, file_cont)

            // 保存历史
            history.append_history(note_id, file_cont)

            var payload = util.makeResult(req)
            event.sender.send('save_note', payload)
        }
    })

    // 拖拽移动节点
    ipcMain.on('move_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "update note set parent_id = '" + req.data.parent + "'  where id = " + req.data.id + ";"
            db.get(sql, function (err, res) {
                var payload = util.makeResult(req)
                event.sender.send('move_note', payload)
            })
        }
    })

    // 保存节点
    ipcMain.on('rename_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "update note set title = '" + req.data.title + "'  where id = " + req.data.id + ";"
            db.get(sql, function (err, res) {
                var payload = util.makeResult(req, {})
                event.sender.send('rename_note', payload)
            })
        }
    })
}

exports.init = init
