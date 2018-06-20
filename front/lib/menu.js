var jquery  = jQuery = $ = require('jquery')
var note    = require(rootpath + '/front/lib/note.js')
var message = require(rootpath + '/front/lib/message.js')
var state   = require(rootpath + '/front/lib/state.js')

// 加载左侧菜单
function load_menu() {
    message.send('get_menu', {}, function (response) {
        var menu = create_menu_object(response.menu)

        // 加载菜单
        $('#menu-tree').jstree(menu)

        // 获取笔记
        $('#menu-tree').on('select_node.jstree', function (e, data) {
            note.load_note(data.node.id)
            state.switch2editor()
        })
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
