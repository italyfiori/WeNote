const {
    app,
    BrowserWindow,
    Menu,
}                  = require('electron')

const rootpath     = __dirname
const path         = require('path')
const language     = require(path.join(rootpath, 'server/lib/language'))
const url          = require('url')
const fs           = require('fs')
const custom_event = require(path.join(rootpath, '/server/lib/custom_event'))
const note         = require(path.join(rootpath, 'server/lib/note'))
const history      = require(path.join(rootpath, 'server/lib/history'))
const init         = require(path.join(rootpath, 'server/lib/init'))


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
        slashes:  true
    }))

    // 打开开发者工具。
    // win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', function () {
    createWindow()
    language.setLocale(app.getLocale(), function() {
        const template = require(path.join(rootpath, '/server/lib/sys_menu'))
        const menu     = Menu.buildFromTemplate(template.getTemplate(win))
        Menu.setApplicationMenu(menu)
    })

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

init()
note.init()
custom_event.init()
history.init()
