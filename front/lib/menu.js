const {ipcRenderer} = require('electron')
var jquery          = jQuery = $ = require('jquery')
var note            = require(rootpath + '/front/lib/note.js')
var message         = require(rootpath + '/front/lib/message.js')
var state           = require(rootpath + '/front/lib/state.js')
var util            = require(rootpath + '/front/lib/util.js')
var dom             = require(rootpath + '/front/lib/dom.js')

// 加载左侧菜单
function load_menu() {
    message.send('get_menu', {}, function (response) {
        // 加载菜单
        var menu = create_menu_object(response.menu)
        $('#menu-tree').jstree(menu)

        // 获取笔记
        $('#menu-tree').on('select_node.jstree', function (e, data) {
            note.save_note()
            if (data.node.id == '0' || data.node.id == '-1') {
                note.load_notice()
                return
            }
            note.load_note(data.node.id, !note.is_trash_node(data.node))
        })

        // 修改笔记标题事件
        $('#menu-tree').on('rename_node.jstree', function (e, data) {
            note.update_title(data.node.id, data.node.text)
        })

        // 移动笔记
        $('#menu-tree').bind('move_node.jstree', function (e, data) {
            var note_id   = data.node.id
            var parent_id = data.node.parent
            note.move_note(note_id, parent_id)
        })

    })

    // 接收到master请求, 保存笔记
    ipcRenderer.on('save', function () {
        note.save_note()
    })
}

// 创建菜单对象
function create_menu_object(menu_content) {
    return {
        "core": {
            'multiple': false,
            'data': menu_content,
            "check_callback" : function(operation, node, node_parent, node_position, more) {
                if (operation == 'move_node') {
                    if (node.id == '0' || node.id == '-1') {
                        return false
                    } else if (node_parent.id == '#') {
                        return false
                    }
                }
                return true
            },
        },
        "plugins": ["wholerow", "dnd", "contextmenu", "types"],
        "contextmenu" : {
            "items" : customMenu
        },
        "types": {
            "default": {
                "icon": "jstree-file"
            },
        },
        "dnd": {
            // open_timeout: 100,
            always_copy: false,
            large_drag_target: true,
            large_drop_target: true,
        },

    }
}

// 根据节点自定义右键菜单
function customMenu(node) {
    var items = {
        "create": {
            "label": "New Note",
            "action": function (obj) {
                note.create_note(obj)
            }
        },
        "rename": {
            "label": 'Rename Note',
            "action": function (obj) {
                var cur_node = $('#menu-tree').jstree('get_node', obj.reference)
                $('#menu-tree').jstree('edit', cur_node)
            }
        },
        "delete": {
            "label": "Delete Note",
            "action": function (obj) {
                note.delete_note(obj)
            }
        }
    }

    if (node.id == '0') {
        delete items.delete
        delete items.rename
    } else if(node.id == '-1') {
        items = []
    }

    return items
}

exports.load_menu = load_menu
