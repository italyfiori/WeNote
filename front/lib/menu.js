const {ipcRenderer} = require('electron')
var jquery          = jQuery = $ = require('jquery')
var note            = require(rootpath + '/front/lib/note.js')
var message         = require(rootpath + '/front/lib/message.js')
var state           = require(rootpath + '/front/lib/state.js')

// 加载左侧菜单
function load_menu() {
    message.send('get_menu', {}, function (response) {
        // 加载菜单
        var menu = create_menu_object(response.menu)
        $('#menu-tree').jstree(menu)

        // 获取笔记
        $('#menu-tree').on('select_node.jstree', function (e, data) {
            note.load_note(data.node.id)
            state.switch2editor()
        })

        // 创建笔记
        $('#menu-tree').on('create_node.jstree', function (e, data) {
            var new_node = data.node
            note.create_note(new_node)
        })

        // 修改笔记标题
        $('#menu-tree').on('rename_node.jstree', function (e, data) {
            note.update_title(data.node.id, data.node.text)
        })

        // 删除笔记
        $('#menu-tree').on('delete_node.jstree', function (e, data) {
            var note_id = data.node.id
            note.delete_note(note_id)
        })

        // 移动笔记
        $('#menu-tree').bind('move_node.jstree', function (e, data) {
            var note_id   = data.node.id
            var parent_id = data.node.parent == '#' ? 0 : data.node.parent
            note.move_note(note_id, parent_id)
        })
    })

    ipcRenderer.on('save', function () {
        note.save_note()
    })
}

// 创建菜单对象
function create_menu_object(menu_content) {
    return {
        "core": {
            'check_callback': true,
            'multiple': false,
            'data': menu_content
        },
        "plugins": ["wholerow", "dnd", "contextmenu"],
        "types": {
            "default": {
                "icon": false  // 删除默认图标
            },
        },
    }
}

exports.load_menu = load_menu
