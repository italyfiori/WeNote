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
// TODO: 修复不能拖拽的bug 待排查、暂未找到原因 done (原因是清除编辑器绑定事件时, 解绑了document对象的事件，从而引起bug)
// TODO: 增加回收站功能 done

// TODO: 增加教学文档 预计2小时
// TODO: 增加数据初始化功能 4小时
// TODO: 增加基本设置功能(文档路径) 4小时
// TODO: 增加回收站删除和回收站禁止编辑功能 预计3小时
// TODO: 增加快捷键(标题等) 预计2小时
// TODO: 增加撤销功能 预计1天
// TODO: 增加导出和打印功能 预计2小时
// TODO: 分享功能 预计2天
// TODO: 样式优化 预计2天
// TODO: 增加对话框上传文件和图片 2小时
// TODO: 菜单栏状态动态变化 4小时
// TODO: 所有文案使用使用常量获取
// TODO: 表格增加排序功能
// TODO:
