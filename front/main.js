// 设置根目录
const rootpath = __dirname

var jquery = jQuery = $ = require('jquery')
var menu   = require(rootpath + '/front/lib/menu.js')
var init   = require(rootpath + '/front/lib/init.js')

$(document).ready(function() {
    init()
    menu.load_menu()
})


// TODO: 快捷键功能(表格 done、历史版本 done)
// TODO: 文件拖拽 done
// TODO: 复制图片 done
// TODO: data路径可配置 done
// TODO: range选择多个范围回退问题修复 done
// TODO: 菜单栏优化: 增加删除提示、增加全部文件和回收站分类 done
// TODO: 菜单栏优化: 增加静止拖拽节点和区域 done
// TODO: 菜单栏图标优化: done
// TODO: 增加回收站功能
// TODO: 增加快捷键(标题等)
// TODO: 增加撤销功能
