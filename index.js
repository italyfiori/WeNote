const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = require('electron')
const electron = require('electron')
const path = require('path')
const url = require('url')
let fs = require('fs')
var NoteData = require('./server/NoteData')
var Util = require('./server/Util')

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win

function createWindow() {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        width: 1600,
        height: 1000
    })

    // 然后加载应用的 index.html。
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // 打开开发者工具。
    win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
var template = [
    {
        label: 'File',
        submenu: [{
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: function () {
                win.webContents.send('save');
            }
        }]
    },
    {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }]
    },
    {
        label: 'History',
        submenu: [{
            label: 'History List',
            accelerator: 'CmdOrCtrl+K',
            click: function () {
                win.webContents.send('history_action');
            }
        }]
    },
]

if (process.platform === 'darwin') {
    const name = electron.app.getName()
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        // on reload, start fresh and close any old
                        // open secondary windows
                        if (focusedWindow.id === 1) {
                            BrowserWindow.getAllWindows().forEach(function (win) {
                                if (win.id > 1) {
                                    win.close()
                                }
                            })
                        }
                        focusedWindow.reload()
                    }
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    if (process.platform === 'darwin') {
                        return 'Alt+Command+I'
                    } else {
                        return 'Ctrl+Shift+I'
                    }
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.toggleDevTools()
                    }
                }
            },
            {
                label: `About ${name}`,
                role: 'about'
            }, {
                type: 'separator'
            }, {
                label: 'Services',
                role: 'services',
                submenu: []
            }, {
                type: 'separator'
            }, {
                label: `Hide ${name}`,
                accelerator: 'Command+H',
                role: 'hide'
            }, {
                label: 'Hide Others',
                accelerator: 'Command+Alt+H',
                role: 'hideothers'
            }, {
                label: 'Show All',
                role: 'unhide'
            }, {
                type: 'separator'
            }, {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () {
                    app.quit()
                }
            }]
    })
}

app.on('ready', function () {
    createWindow()
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
})

var crypto = require('crypto');

function getFileMd5(file_path) {
    var buffer = fs.readFileSync(file_path);
    var fsHash = crypto.createHash('md5');
    fsHash.update(buffer);
    return fsHash.digest('hex');
}

function getBufferMd5(buffer) {
    var hash = crypto.createHash('md5');
    hash.update(buffer);
    return hash.digest('hex');
}

// 接收文件数据
ipcMain.on('save_image', (event, data) => {
    if (!Buffer.isBuffer(data.data.buffer)) {
        console.error('data is not buffer, ' + data.message_id)
        return
    }

    var note_id = data.data.note_id
    var image_dir = path.join(__dirname, 'data', 'images', String(note_id))
    if (!fs.existsSync(image_dir)) {
        fs.mkdirSync(image_dir);
    }

    var buffer = data.data.buffer
    var buffer_md5 = getBufferMd5(buffer)
    var file_name = buffer_md5 + '.png'
    var file_path = path.join(image_dir, '', file_name)
    fs.writeFile(file_path, buffer, {}, (err, res) => {
        if (err) {
            console.error('write file error:' + err);
            return
        }
        var payload = {
            'code': 0,
            'message_id': data.message_id,
            'image_url': path.join(image_dir, file_name),
        }
        event.sender.send('save_image', payload)
    })
})

// 获取笔记列表
var sqlite3 = require('sqlite3-offline').verbose();
var db_file = path.join(__dirname, 'data/db/wiki.db')
var db = new sqlite3.Database(db_file);

// 获取列表
ipcMain.on('get_menu', (event, data) => {
    var sql = "select title as text, id, parent_id from note order by title;"
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
ipcMain.on('create_node', (event, ret) => {
    if (ret.data.parent_id >= 0) {
        var sql = "insert into note(title, parent_id) values('" + ret.data.title + "'," + ret.data.parent_id + ")"
        db.run(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
                note_id: this.lastID
            }
            event.sender.send('create_node', payload)
        })
    }
})

// 删除节点
ipcMain.on('delete_node', (event, ret) => {
    if (ret.data.id >= 0) {
        var sql = "delete from note where id = " + ret.data.id + ";"
        db.run(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
            }
            event.sender.send('delete_node', payload)
        })
    }
})

// 获取节点
ipcMain.on('get_node', (event, req) => {
    if (req.data.id >= 0) {
        var sql = "select id, title from note where id = " + req.data.id + ";"
        var content = NoteData.get_note(req.data.id)
        db.get(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: req.message_id,
                msg: 'success',
                content: content,
                title: res.title,
            }
            event.sender.send('get_node', payload)
        })
    }
})

// 保存节点
ipcMain.on('save_node', (event, ret) => {
    if (ret.data.id >= 0) {
        // 保存文件
        var note_id = ret.data.id
        var file_cont = ret.data.content
        if (NoteData.get_note(note_id) === file_cont) {
            console.warn('note has no change:' + String(ret.data.id))
            return
        }
        NoteData.save_note(note_id, file_cont)

        // 保存历史
        NoteData.append_history(note_id, file_cont)

        // 返回
        var payload = {
            code: 0,
            message_id: ret.message_id,
            msg: 'success',
        }
        event.sender.send('save_node', payload)
    }
})

// 拖拽移动节点
ipcMain.on('move_node', (event, ret) => {

    if (ret.data.id >= 0) {
        var sql = "update note set parent_id = '" + ret.data.parent + "'  where id = " + ret.data.id + ";"
        var file_path = path.join(__dirname, 'data', 'notes', ret.data.id + '.html')
        db.get(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
            }

            event.sender.send('move_node', payload)
        })
    }
})

// 保存节点
ipcMain.on('rename_node', (event, ret) => {

    if (ret.data.id >= 0) {
        var sql = "update note set title = '" + ret.data.title + "'  where id = " + ret.data.id + ";"
        db.get(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
            }
            event.sender.send('rename_node', payload)
        })
    }
})

ipcMain.on('get_version_list', (event, req) => {
    if(req.data.id >= 0) {
        var note_id = req.data.id
        var history_list = NoteData.get_version_list(note_id)
        event.sender.send('get_version_list', Util.makeResult(req, history_list))
    }
})

ipcMain.on('recover_version', (event, req) => {
    if(req.data.note_id >= 0 && req.data.version_id >= 0) {
        var note_id = req.data.note_id
        var version_id = req.data.version_id
        var version = NoteData.get_version(note_id, parseInt(version_id))
        event.sender.send('recover_version', Util.makeResult(req, version))
    }
})


// 构建树
function buildTree(rows) {
    node_list = {}
    parent_set = {}
    // rows.push({'nodeId': 0, 'parentId': -1})
    for (id in rows) {
        row = rows[id]
        node_id = row['id']
        parent_id = row['parent_id']

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

    for (i in sub_nodes) {
        sub_node = sub_nodes[i]
        sub_node_id = sub_node['id']

        if (!parent_set[sub_node_id]) {
            menu['children'].push({'id': sub_node_id, 'text': sub_node['text']})
        } else {
            menu['children'].push(_buildTree(sub_node_id, parent_set, node_list))
        }
    }
    return menu
}

function receiveMessage(message, func) {
    ipcMain.on(message, (event, request) => {
        var response = func(data)
        var response
        response['message_id'] = request.id
        event.sender.send(response)
    })
}

