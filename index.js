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

const {
  ipcMain
} = require('electron')

let fs = require('fs')

// 接收文件数据
ipcMain.on('send_file', (event, data) => {
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
    file_name = buffer_md5 + '.png'
    file_path = path.join(image_dir, file_name)
    fs.writeFile(file_path, buffer, {}, (err, res) => {
        if(err) {
            console.log('write file error:' + err);
            return
        }
        payload = {
            'code': 0,
            'message_id': data.message_id,
            'image_url': path.join('data', 'images', file_name),
        }
        event.sender.send('send_file', payload)
    })
})

function getMenu() {
  var menu = {
      'data': [
        {'text': '最新文档', 'id': 'new'},
        {'text': '我的文档', 'id': '0'},
        {'text': '回收站', 'id': 'recycle'},
      ]
  }
  return menu
}


ipcMain.on('get_menu', (event, data) => {
  var menu = getMenu()
  var payload = {
    'code': 0,
    'message_id': data.message_id,
    'menu': menu,
  }
  event.sender.send('get_menu', payload)
})


var sqlite3 = require('sqlite3-offline').verbose();
var db_file = path.join(__dirname, 'data/db/wiki.db')
console.log(db_file)
var db = new sqlite3.Database(db_file);


// 创建目录
ipcMain.on('create_dir', (event, ret) => {
  console.log(ret)
  if(ret.data.parent_id >= 0) {
    var sql = "insert into note(title, is_del, note_type, create_time, update_time) values('新建目录', 1, 1, 0, 0)"
    db.run(sql, function(err, res) {
      // console.log(err)
      // console.log(res)
      // return
      // // console.log(this.changes);
      // // console.log(this.lastId);
      if(this.changes > 0 && this.lastID) {
        var payload = {
          code: 0,
          message_id: ret.message_id,
          msg: 'success',
          note_id: this.lastID
        }
        event.sender.send('create_dir', payload)
      } else {
        var payload = {
          code: -1,
          message_id: ret.message_id,
          msg: 'fail',
        }
        event.sender.send('create_dir', payload)
      }
    })
  }  
})

