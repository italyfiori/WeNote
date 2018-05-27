const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = require('electron')
const electron = require('electron')
const path = require('path')
const url = require('url')

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
                win.webContents.send('save_file');
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
    }
]

if (process.platform === 'darwin') {
    const name = electron.app.getName()
    template.unshift({
        label: name,
        submenu: [{
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


let fs = require('fs')

// 接收文件数据
ipcMain.on('send_image', (event, data) => {
    if (!Buffer.isBuffer(data.data)) {
        console.log('data is not buffer, ' + data.message_id)
        return
    }

    var image_dir = path.join(__dirname, 'data', 'images')
    if (!fs.existsSync(image_dir)) {
        fs.mkdirSync(image_dir, 755);
    }

    var buffer = data.data
    var buffer_md5 = getBufferMd5(buffer)
    var file_name = buffer_md5 + '.png'
    var file_path = path.join(image_dir, file_name)
    fs.writeFile(file_path, buffer, {}, (err, res) => {
        if (err) {
            console.log('write file error:' + err);
            return
        }
        var payload = {
            'code': 0,
            'message_id': data.message_id,
            'image_url': path.join('data', 'images', file_name),
        }
        event.sender.send('send_image', payload)
    })
})

// 获取笔记列表
var sqlite3 = require('sqlite3-offline').verbose();
var db_file = path.join(__dirname, 'data/db/wiki.db')
var db = new sqlite3.Database(db_file);

// 获取列表
ipcMain.on('get_menu', (event, data) => {
    var sql = "select title as text, id, case parent_id when 0 then '#' else parent_id end as parent from note;"
    db.all(sql, function (err, rows) {
        var payload = {
            'code': 0,
            'message_id': data.message_id,
            'menu': rows,
        }
        event.sender.send('get_menu', payload)
    })
})


// 创建节点
ipcMain.on('create_node', (event, ret) => {
    console.log(ret)
    if (ret.data.parent_id >= 0) {
        var sql = "insert into note(title, parent_id) values('" + ret.data.title + "'," + ret.data.parent_id + ")"
        console.log(sql)
        db.run(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
                note_id: this.lastID
            }
            event.sender.send('create_note', payload)
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
ipcMain.on('get_node', (event, ret) => {
    if (ret.data.id >= 0) {
        var sql = "select id, parent_id as parent, title as text from note where id = " + ret.data.id + ";"
        var file_path = path.join(__dirname, ret.data.id + 'html')
        db.get(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
            }
            console.log(payload)
            event.sender.send('get_node', payload)
        })
    }
})

// 保存节点
ipcMain.on('save_node', (event, ret) => {
    if (ret.data.id >= 0) {
        var sql = "update note set title = '" + ret.data.title + "'  where id = " + ret.data.id + ";"
        console.log(sql)
        // var file_path = path.join(__dirname, ret.data.id + 'html')
        db.get(sql, function (err, res) {
            var payload = {
                code: 0,
                message_id: ret.message_id,
                msg: 'success',
            }

            event.sender.send('get_node', payload)
        })
    }
})

