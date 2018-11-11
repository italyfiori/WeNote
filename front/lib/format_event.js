const {ipcRenderer} = require('electron')
var message         = require(rootpath + '/front/lib/message.js')
var dom             = require(rootpath + '/front/lib/dom.js')
var state           = require(rootpath + '/front/lib/state.js')
var util            = require(rootpath + '/front/lib/util.js')
var table           = require(rootpath + '/front/lib/table.js')
var $               = require('jquery')


function setEvent(){
    ipcRenderer.on('format_p', function () {
        document.execCommand('formatBlock', false, '<p>')
    })

    ipcRenderer.on('format_h1', function () {
        document.execCommand('formatBlock', false, '<h1>')
    })

    ipcRenderer.on('format_h2', function () {
        document.execCommand('formatBlock', false, '<h2>')
    })

    ipcRenderer.on('format_h3', function () {
        document.execCommand('formatBlock', false, '<h3>')
    })

    ipcRenderer.on('format_ol', function () {
        document.execCommand('insertorderedlist', false, '<h3>')
    })

    ipcRenderer.on('format_ul', function () {
        document.execCommand('insertunorderedlist', false, '<h3>')
    })

    ipcRenderer.on('format_line', function () {
        var html   = '<hr contenteditable="false" /><p><br><p>'
        var hrNode = dom.insertHtml(html, false)
        dom.setCursor(hrNode.nextSibling)
    })

    ipcRenderer.on('format_blockquote', function () {
        var html = '<blockquote><p><br></p></blockquote>'
        var node = dom.insertHtml(html, false)
        dom.setCursor(node.firstChild)
    })

    ipcRenderer.on('format_code', function () {
        var html = '<pre class="source hljs"><br/></pre>';
        var node = dom.insertHtml(html, false)
        dom.setCursor(node.firstChild)
    })

    ipcRenderer.on('add_table', function () {
        // 创建表格
        var titles    = ['col1', 'col2']
        var html      = table.createTableHtml(titles)
        var tableNode = dom.insertHtml(html, false)
        table.makeTableResizeable(tableNode)

        // 设置光标
        var secondRow = $(tableNode).find('tr')[1]
        dom.setCursor(secondRow.firstChild.firstChild.firstChild)
    })
}

exports.setEvent = setEvent
