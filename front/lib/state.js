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
}


exports.clean = clean
exports.init  = init
