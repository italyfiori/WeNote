var dom             = require(rootpath + '/front/lib/dom.js')
var table           = require(rootpath + '/front/lib/table.js')
var message         = require(rootpath + '/front/lib/message.js')
var action          = require(rootpath + '/front/lib/action.js')
var adjust          = require(rootpath + '/front/lib/adjust.js')
var drag            = require(rootpath + '/front/lib/drag.js')
var paste           = require(rootpath + '/front/lib/paste.js')
var history         = require(rootpath + '/front/lib/history.js')
var highlight       = require(rootpath + '/front/lib/highlight.js')
var image           = require(rootpath + '/front/lib/image.js')
var undo            = require(rootpath + '/front/lib/undo.js')
var $               = require('jquery')
const {ipcRenderer} = require('electron')

// 切换到编辑器模式
function switch2editor() {
    var editor    = dom.getEditor()
    var container = dom.getEditorContainer()
    var notice    = dom.getNotice()
    if (container.style.display != "block") {
        container.style.display = "block";
    }
    if (notice.style.display != "none") {
        notice.style.display = "none";
    }
    dom.setCursor(editor)
}

function swtich2Notice() {
    var editor    = dom.getEditor()
    var container = dom.getEditorContainer()
    var notice    = dom.getNotice()
    if (container.style.display != "none") {
        container.style.display = "none";
    }
    if (notice.style.display != "block") {
        notice.style.display = "block";
    }
}

// 清除编辑器绑定的事件
function clean(open_note = true) {
    $('img').unbind()
    $('.image_size').unbind()
    $('a.file').unbind()
    $('div.resize').each(function() {
        dom.removeAllListeners(this)
    })

    var editor = dom.getEditor()
    if (editor) {
        $(editor).unbind()
    }

    if (open_note) {
        undo.clear()
    }

    $('.popover').remove()
}

// 清除辅助元素
function cleanNote() {
    $('img').popover('hide')
}

// 初始化编辑器
function init() {
    switch2editor()

    // 图片点击功能
    image.setImageInit()
    image.setImageEvent()

    // 点击文件
    $('a.file').click(function(event) {
        event.preventDefault()
        message.send('open_file_link', {file_url: this.getAttribute("href")}, function (response) {
            // console.log(response);
        })
    })

    // 表格可拖拽
    $('table').each(function() {
        table.makeTableResizeable(this)
    })

    // 按键功能改写
    var editor = dom.getEditor()

    action.setActions(editor)
    drag.setDragFile()
    highlight.setHighlight()

    // 编辑器内容改写
    $(editor).bind("DOMSubtreeModified", function () {
        setTimeout(function () {
            adjust.adjustEditor()
        }, 10); // 由于adjust函数中修改innerHTML复触发DOMSubtreeModified事件，而获取editor的值还没有发生变化，会形成死循环
    });
}



exports.swtich2Notice = swtich2Notice
exports.switch2editor = switch2editor
exports.clean         = clean
exports.init          = init
exports.cleanNote     = cleanNote
