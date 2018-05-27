const {ipcRenderer} = require('electron')

var EventEmitter  = require('events').EventEmitter; 
var event_emitter = new EventEmitter(); 

// 发送消息到主进程
function sendMessage(message, data, func) {
    // 发送消息的主进程
    var message_id = message + ':' +  getRandomInt(1000000)
    var payload    = {'message_id': message_id, 'data': data}
    ipcRenderer.send(message, payload)

    // 接受event回调
    event_emitter.once(message_id, function(data) {
        func(data)
    })

    // 超时处理
    setTimeout(function() {
        event_emitter.removeAllListeners(message_id)
    }, 5000);
}

function sendImage(data, func) {
    sendMessage('send_image', data, func)
}


function createDir(parent_id, func) {
    sendMessage('create_dir', {'parent_id': parent_id}, func)
}

// 监听主进程消息
function listenIpc(message) {
    ipcRenderer.on(message, (event, data) => {
        if (data.code == 0 && data.message_id) {
            event_emitter.emit(data.message_id, data)
            return
        }
        console.error('get message error:' + data.msg)
    })
}

// 监听回调
var messages = ['send_image', 'get_menu', 'get_node', 'create_node', 'delete_node', 'save_node']
for (var i = 0; i < messages.length; i++) {
    var message = messages[i]
    listenIpc(message)
}






