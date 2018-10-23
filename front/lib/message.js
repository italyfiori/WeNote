const {ipcRenderer} = require('electron')
let EventEmitter    = require('events').EventEmitter;
let event_emitter   = new EventEmitter();
let util            = require(rootpath + '/front/lib/util.js')

// 要监听的主进程消息
let listen_messages = {}

// 发送消息到主进程
function send(message_type, data, func) {
    if(!listen_messages.hasOwnProperty(message_type)) {
        // 首次发送消息时, 监听指定类型的回调
        listenIpc(message_type)
        listen_messages[message_type] = true
    }

    // 发送消息到主进程
    var message_id = message_type + ':' +  util.getRandomInt(1000000)
    var payload    = {'message_id': message_id, 'data': data}
    ipcRenderer.send(message_type, payload)


    // 指定message_id的回调
    event_emitter.once(message_id, function(response) {
        if (response.code != 0) {
            alert(response.msg)
        } else {
            func(response)
        }
    })

    // 超时处理
    setTimeout(function() {
        event_emitter.removeAllListeners(message_id)
    }, 5000);
}

// 监听主进程消息
function listenIpc(message_type) {
    ipcRenderer.on(message_type, (event, response) => {
        if (!response.message_id) {
            console.warn('response not have message id!')
        }
        event_emitter.emit(response.message_id, response)
    })
}

exports.send = send
