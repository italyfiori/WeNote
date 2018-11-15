var message = require(rootpath + '/front/lib/message.js')
var dom     = require(rootpath + '/front/lib/dom.js')
var state   = require(rootpath + '/front/lib/state.js')
var util    = require(rootpath + '/front/lib/util.js')
var undo    = require(rootpath + '/front/lib/undo.js')
var async   = require("async");

// 获取笔记内容
function load_note(note_id, editable = true) {
    async.series([
        function(next) {
            message.send('get_note', {'id': note_id}, function (response) {
                var editor  = dom.getEditor()
                var content = response.content ? response.content : '<p><br/></p>'
                state.clean()
                editor.setAttribute('note_id', note_id)
                editor.innerHTML = content
                // undo.setContent(response.content, dom.getCaret())
                next()
            })
        },
        function() {
            if (editable) {
                state.init()
                editor.contentEditable = "true"
            } else {
                state.switch2editor()
                editor.contentEditable = "false"
            }
        }
    ])
}

function load_notice() {
    state.swtich2Notice()
    state.clean()
    editor.setAttribute('note_id', '')
}

// 创建笔记
function create_note(cur_node) {
    var new_node_id = $('#menu-tree').jstree('create_node', cur_node, 'new note')
    var new_node    = $('#menu-tree').jstree('get_node', new_node_id)
    var payload = {
        'parent_id': util.isInt(new_node.parent) ? new_node.parent : 0,
        'title':     new_node.text,
    }
    message.send('create_note', payload, function (response) {
        $('#menu-tree').jstree('deselect_all')
        $('#menu-tree').jstree('set_id', new_node, response.note_id)
        $('#menu-tree').jstree('select_node', new_node)
        // setTimeout(function(){
        //     $('#menu-tree').jstree('edit', new_node)
        // }, 200)
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

    // 清除辅助元素
    state.cleanNote()

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
        if (is_trash_node(cur_node)) {
            node_ids = get_children_ids(cur_node)
            node_ids.push(cur_node.id)

            var payload = {'ids': node_ids}
            message.send('delete_note', payload, function (response) {
                $('#menu-tree').jstree('delete_node', cur_node)
            })
        } else {
            var recycle_node = $('#menu-tree').jstree('get_node', '-1')
            $('#menu-tree').jstree('move_node', cur_node, recycle_node)
        }
        state.swtich2Notice()
    }
}

// 清空回收站
function clear_trash() {
    var result   = confirm("are you sure to clear the trash?");
    if (result == true){
        var recycle_node = $('#menu-tree').jstree('get_node', '-1')
        var node_ids = get_children_ids(recycle_node)

        var payload = {'ids': node_ids}
        message.send('delete_trash', payload, function (response) {
            for (var i = 0; i < node_ids.length; i++) {
                var node = $('#menu-tree').jstree('get_node', node_ids[i])
                $('#menu-tree').jstree('delete_node', node)
            }
            state.swtich2Notice()
        })
    }
}

// 恢复笔记
function recover_note(obj) {
    var cur_node = $('#menu-tree').jstree('get_node', obj.reference)
    var doc_node = $('#menu-tree').jstree('get_node', '0')
    $('#menu-tree').jstree('move_node', cur_node, doc_node)
}

// 获取所有子节点
function get_children_ids(cur_node) {
    var ret_ids  = []
    var node_ids = []

    while (cur_node) {
        for (var i = 0; i < cur_node.children.length; i++) {
            var child_id   = cur_node.children[i]
            node_ids.push(child_id)
            ret_ids.push(child_id)
        }

        node_id  = node_ids.pop()
        cur_node = node_id ? $('#menu-tree').jstree('get_node', node_id) : false
    }

    return ret_ids
}

function is_trash_node(node) {
    var parents = node.parents
    return parents.length >= 2 ? parents[parents.length - 2] == "-1" : false
}

// 移动笔记(请求server)
function move_note(note_id, parent_id) {
    var payload = {'id': note_id, 'parent': parent_id}
    message.send('move_note', payload, function (response) {
        $('#menu-tree').jstree('refres')
        // do nothing
    })
}

exports.load_note     = load_note
exports.load_notice   = load_notice
exports.create_note   = create_note
exports.update_title  = update_title
exports.save_note     = save_note
exports.delete_note   = delete_note
exports.move_note     = move_note
exports.is_trash_node = is_trash_node
exports.recover_note  = recover_note
exports.clear_trash   = clear_trash
