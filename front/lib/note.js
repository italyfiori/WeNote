var message = require(rootpath + '/front/lib/message.js')
var dom     = require(rootpath + '/front/lib/dom.js')

// 获取笔记内容
function load_note(note_id) {
    message.send('get_note', {'id': note_id}, function (response) {
        var editor  = dom.getEditor()
        var content = response.content ? response.content : '<p><br/></p>'
        editor.setAttribute('note_id', note_id)
        editor.innerHTML = content
    })
}

// 创建笔记
function create_note(new_node) {
    var payload = {
        'parent_id': new_node.parent == '#' ? 0 : new_node.parent,
        'title':     new_node.text,
    }
    message.send('create_note', payload, function (response) {
        $('#menu-tree').jstree('set_id', new_node, response.note_id)
    })
}

// 修改笔记标题
function update_title(note_id, title) {
    var payload = {'id': note_id, 'title': title}
    message.send('rename_note', payload, function (response) {
        // do nothing
    })
}

// 保存笔记
function save_note() {
    var editor  = dom.getEditor()
    var note_id = editor.getAttribute('note_id')
    if (!note_id) {
        console.warn('未选中笔记')
        return
    }
    // 保存笔记
    var content = editor.innerHTML
    var payload = {'id': note_id, 'content': content}
    message.send('save_note', payload, function (response) {
        // do nothing
    })
}

exports.load_note    = load_note
exports.create_note  = create_note
exports.update_title = update_title
exports.save_note    = save_note
