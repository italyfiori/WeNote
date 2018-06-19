var message = require(__dirname + '/front/lib/message.js')

message.send('get_menu', {}, function (response) {
    console.log(response)
})
