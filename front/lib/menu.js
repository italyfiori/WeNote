const {ipcRenderer} = require('electron')
var jquery          = jQuery = $ = require('jquery')
var note            = require(rootpath + '/front/lib/note.js')
var message         = require(rootpath + '/front/lib/message.js')
var state           = require(rootpath + '/front/lib/state.js')
var util            = require(rootpath + '/front/lib/util.js')
var dom             = require(rootpath + '/front/lib/dom.js')
var language        = require(rootpath + '/front/lib/language.js')
var $               = require('jquery')

var side_lang = language.getLanguage().side

// 加载左侧菜单
function load_menu() {
    message.send('get_menu', {}, function (response) {
        // 加载菜单
        var menu = create_menu_object(response.data.menu)
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
    ipcRenderer.on('save_note_action', function () {
        note.save_note()
    })

    ipcRenderer.on('create_note_action', function () {
        var root = $('#menu-tree').jstree('get_node', '0')
        note.create_note(root)
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
            "label": side_lang.create,
            "action": function (obj) {
                var cur_node = $('#menu-tree').jstree('get_node', obj.reference)
                note.create_note(cur_node)
            }
        },
        "rename": {
            "label": side_lang.rename,
            "action": function (obj) {
                var cur_node = $('#menu-tree').jstree('get_node', obj.reference)
                $('#menu-tree').jstree('edit', cur_node)
            }
        },
        "delete": {
            "label": side_lang.delete,
            "action": function (obj) {
                note.delete_note(obj)
            }
        },
        "recover": {
            "label": side_lang.recover,
            "action": function (obj) {
                note.recover_note(obj)
            }
        },
        "clear": {
            "label": side_lang.clear,
            "action": function (obj) {
                note.clear_trash()
            }
        },
    }

    if (node.id == '0') {
        return util.extract(items, ['create'])
    } else if(node.id == '-1') {
        return util.extract(items, ['clear'])
    } else if (note.is_trash_node(node)) {
        return util.extract(items, ['recover', 'delete'])
    } else {
        return util.extract(items, ['create', 'rename', 'delete'])
    }
}

exports.load_menu = load_menu
