// 设置根目录
const rootpath = __dirname

var jquery = jQuery = $ = require('jquery')
var menu   = require(rootpath + '/front/lib/menu.js')
var init   = require(rootpath + '/front/lib/init.js')

init()
menu.load_menu()

// TODO: 快捷键功能(表格 done、历史版本 done)
// TODO: 文件拖拽 done
// TODO: 复制图片 done
