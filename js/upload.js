const {ipcRenderer} = require('electron')

var EventEmitter  = require('events').EventEmitter; 
var event_emitter = new EventEmitter(); 

// 上传文件
function sendFile(file_data, func) {
    // 发送文件提
    var message_id = 'message' + getRandomInt(1000000)
    var payload = {'message_id': message_id, 'data': file_data}
    ipcRenderer.send('send_file', payload)

    // 接收回调
    var event_id = 'send_file:' + message_id
    event_emitter.once(event_id, function(data) {
        func(data)
    })

    // 超时处理
    setTimeout(function() {
        event_emitter.removeAllListeners(event_id)
    }, 5000);
}

// 监听上传文件回调
ipcRenderer.on('send_file', (event, data) => {
    if (data.code == 0 && data.message_id) {
        var event_id = 'send_file:' + data.message_id
        // 触发回调
        event_emitter.emit(event_id, data)
        return
    }
    console.log('send file error:' + data.msg)
})