var dom     = require(rootpath + '/front/lib/dom.js')
var table   = require(rootpath + '/front/lib/table.js')
var message = require(rootpath + '/front/lib/message.js')

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
}

// 清除编辑器绑定的事件
function clean() {
    $('img').unbind()
    $('a.file').unbind()
    $('div.resize').unbind()
    $(document).unbind()

    var editor = dom.getEditor()
    if (editor) {
        $(editor).unbind()
    }

}

// 初始化编辑器
function init() {
    switch2editor()

    $('img').click(function () {
        dom.selectNode(this)
    })

    $('a.file').click(function(event) {
        event.preventDefault()
        message.send('open_file_link', {}, function (response) {})
    })

    $('table').each(function() {
        table.makeTableResizeable(this)
    })

    var editor = dom.getEditor()
    $(editor).keypress(function() {
        var node = null
        var sel = window.getSelection()
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0)
            node = range.startContainer
            console.log('start');
            console.log(node.tagName);
        }
        // console.log(node.nodeName);
    })
}


exports.clean = clean
exports.init  = init
