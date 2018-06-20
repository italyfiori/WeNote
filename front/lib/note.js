var message = require(rootpath + '/front/lib/message.js')
var dom     = require(rootpath + '/front/lib/dom.js')

// 获取note内容
function load_note(note_id) {
    message.send('get_node', {'id': note_id}, function (response) {
        var editor  = dom.getEditor()
        var content = response.content ? response.content : '<p><br/></p>'
        editor.setAttribute('note_id', note_id)
        editor.innerHTML = content
    })
}

exports.load_note = load_note
