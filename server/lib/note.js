const ipcMain   = require('electron').ipcMain
const path      = require('path')
const fs        = require('fs')
const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const history   = require(path.join(rootpath, 'server/lib/history'))
const sqlite3   = require('sqlite3')
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

    var base            = getBaseMenu()
    var all_menu        = _buildTree('0', parent_set, node_list)
    var recycle_menu    = _buildTree('-1', parent_set, node_list)
    base[0]['children'] = all_menu['children']
    base[0]['state']    = {"opened" : true}
    base[1]['children'] = recycle_menu['children']
    return base
}

function getBaseMenu() {
    return [
        {
            text: '全部文档',
            id: '0',
            icon: 'jstree-folder',
            parent_id: '#',
            children: [],
        }, {
            text: '回收站',
            id: '-1',
            icon: 'front/images/recycle.png',
            parent_id: '#',
            children: [],
        }
    ]
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

function get_history_path(note_id) {
    return path.join(data_path, 'data', 'notes', note_id + '.history')
}

function get_image_dir(note_id) {
    return path.join(data_path, 'data', 'images', note_id)
}

function get_attachment_dir(note_id) {
    return path.join(data_path, 'data', 'files', note_id)
}

// 获取note内容
function get_note(note_id) {
    var file_path = get_note_path(note_id)
    if (!fs.existsSync(file_path)) {
        console.warn('file not exists:' + String(file_path))
        return ''
    }
    var content = fs.readFileSync(file_path, "utf8")
    return util.addImgPrefix(content) // 增加图像和文件路径前缀
}

// 保存note
function save_note(note_id, file_cont) {
    var file_path = get_note_path(note_id)
    if (!fs.existsSync(path.dirname(file_path))) {
        util.mkdirs(path.dirname(file_path))
    }
    return fs.writeFileSync(file_path, file_cont)
}



function init() {
    // 获取笔记列表
    var db = new sqlite3.Database(db_file);

    // 获取列表
    ipcMain.on('get_menu', (event, req) => {
        var sql = "select title as text, id, parent_id from note where is_del = 0 order by title;"
        db.all(sql, function (err, rows) {
            var menu = buildTree(rows)
            var response = util.makeResult(req, {'menu': menu})
            event.sender.send('get_menu', response)
        })
    })

    // 创建节点
    ipcMain.on('create_note', (event, req) => {
        if (req.data.parent_id >= 0) {
            var sql = "insert into note(title, parent_id) values('" + req.data.title + "'," + req.data.parent_id + ")"
            db.run(sql, function (err, res) {
                var response = util.makeResult(req, {note_id: this.lastID})
                event.sender.send('create_note', response)
                fs.utimesSync(db_file, new Date(), new Date())
            })
        }
    })

    // 删除节点
    ipcMain.on('delete_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "update note set parent_id = -1 where id = " + req.data.id + ";"
            db.run(sql, function (err, res) {
                var response = util.makeResult(req)
                event.sender.send('delete_note', response)
                fs.utimesSync(db_file, new Date(), new Date())
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
                    content: content,
                    title: res.title,
                }
                var response = util.makeResult(req, payload)
                event.sender.send('get_note', response)
            })
        }
    })

    // 保存节点
    ipcMain.on('save_note', (event, req) => {
        if (req.data.id >= 0) {
            // 保存文件
            var note_id = req.data.id
            var file_cont = req.data.content
            file_cont = util.trimImgPrefix(file_cont) // 去除图像和文件前缀
            // 文件内容没有变化
            if (get_note(note_id) === file_cont) {
                return
            }

            // 保存文件
            save_note(note_id, file_cont)
            // 保存历史
            history.append_history(note_id, file_cont)

            var response = util.makeResult(req)
            event.sender.send('save_note', response)
        }
    })

    // 拖拽移动节点
    ipcMain.on('move_note', (event, req) => {
        if (req.data.id >= -1) {
            var sql = "update note set parent_id = '" + req.data.parent + "'  where id = " + req.data.id + ";"
            db.get(sql, function (err, res) {
                var response = util.makeResult(req)
                event.sender.send('move_note', response)
                fs.utimesSync(db_file, new Date(), new Date())
            })
        }
    })

    // 保存节点
    ipcMain.on('rename_note', (event, req) => {
        if (req.data.id >= 0) {
            var sql = "update note set title = '" + req.data.title + "'  where id = " + req.data.id + ";"
            db.get(sql, function (err, res) {
                var response = util.makeResult(req, {})
                event.sender.send('rename_note', response)
                fs.utimesSync(db_file, new Date(), new Date())
            })
        }
    })

    ipcMain.on('delete_trash', (event, req) => {
        if (req.data.ids.length > 0) {
            var sql = "delete from note where id in (" + req.data.ids.join(',') + ");"
            db.run(sql, function (err, res) {
                for (var i = 0; i < req.data.ids.length; i++) {
                    var note_id = req.data.ids[i]
                    delete_note_files(note_id)
                }
                var response = util.makeResult(req)
                event.sender.send('delete_trash', response)
                fs.utimesSync(db_file, new Date(), new Date())
            })
        }
    })
}

function delete_note_files(note_id) {
    var file_paths = []
    file_paths.push(get_note_path(note_id))
    file_paths.push(get_history_path(note_id))
    file_paths.push(get_image_dir(note_id))
    file_paths.push(get_attachment_dir(note_id))

    for (var i = 0; i < file_paths.length; i++) {
        var file_path = file_paths[i]
        if (fs.existsSync(file_path)) {
            util.delete_path(file_path)
        }
    }
}

exports.init = init
