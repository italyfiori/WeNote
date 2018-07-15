var message = require(rootpath + '/front/lib/message.js')
var dom     = require(rootpath + '/front/lib/dom.js')
var state   = require(rootpath + '/front/lib/state.js')
var util    = require(rootpath + '/front/lib/util.js')
var async   = require("async");

// 获取笔记内容
function load_note(note_id) {
    async.series([
        function(next) {
            message.send('get_note', {'id': note_id}, function (response) {
                var editor  = dom.getEditor()
                var content = response.content ? response.content : '<p><br/></p>'
                state.clean()
                editor.setAttribute('note_id', note_id)
                editor.innerHTML = content
                next()
            })
        },
        function() {
            state.init()
        }
    ])
}

function load_notice() {
    state.swtich2Notice()
    state.clean()
    editor.setAttribute('note_id', '')
}

// 创建笔记
function create_note(obj) {
    var cur_node    = $('#menu-tree').jstree('get_node', obj.reference)
    var new_node_id = $('#menu-tree').jstree('create_node', cur_node, 'new note')
    var new_node    = $('#menu-tree').jstree('get_node', new_node_id)
    $('#menu-tree').jstree('deselect_node', cur_node)
    $('#menu-tree').jstree('select_node', new_node)
    $('#menu-tree').jstree('edit', new_node)
    var payload = {
        'parent_id': util.isInt(new_node.parent) ? new_node.parent : 0,
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
    // 判断是否选中笔记
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

// 删除笔记
function delete_note(obj) {
    var cur_node = $('#menu-tree').jstree('get_node', obj.reference)
    var result   = confirm("are you sure delte the note?");
    if (result == true){
        var recycle_node = $('#menu-tree').jstree('get_node', '-1')
        $('#menu-tree').jstree('move_node', cur_node, recycle_node)
        // var payload      = {'id': cur_node.id, 'parent': -1}
        // message.send('move_note', payload, function (response) {
        //     console.log(response);
        //
        //     $('#menu-tree').jstree('refres')
        // })
    }
}

// 移动笔记
function move_note(note_id, parent_id) {
    var payload = {'id': note_id, 'parent': parent_id}
    message.send('move_note', payload, function (response) {
        $('#menu-tree').jstree('refres')
        // do nothing
    })
}

exports.load_note    = load_note
exports.load_notice  = load_notice
exports.create_note  = create_note
exports.update_title = update_title
exports.save_note    = save_note
exports.delete_note  = delete_note
exports.move_note    = move_note
