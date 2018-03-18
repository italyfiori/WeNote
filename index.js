const {
  app,
  BrowserWindow
} = require('electron')
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
app.on('ready', createWindow)

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

function md5(file_path) {
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

const {
  ipcMain
} = require('electron')

let fs = require('fs')
ipcMain.on('send_file', (event, data) => {
    if (Buffer.isBuffer(data.data)) {
        var image_dir = path.join(__dirname, 'data', 'images')
        if (!fs.existsSync(image_dir)) {
            fs.mkdirSync(image_dir, 755);
        }

        var buffer = data.data
        var buffer_md5 = getBufferMd5(buffer)
        file_name = buffer_md5 + '.png'
        file_path = path.join(image_dir, file_name)
        fs.writeFile(file_path, buffer, {}, (err, res) => {
            if(err) {
                console.log('err:' + err);
                return
            }
            payload = {
                'code': 0,
                'message_id': data.message_id,
                'image_url': path.join('data', 'images', file_name),
            }
            event.sender.send('send_file', payload)
        })
    }
})
