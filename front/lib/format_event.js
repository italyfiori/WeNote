const {
    shell,
    ipcRenderer,
    dialog
} = require('electron')
var message         = require(rootpath + '/front/lib/message.js')
var dom             = require(rootpath + '/front/lib/dom.js')
var state           = require(rootpath + '/front/lib/state.js')
var util            = require(rootpath + '/front/lib/util.js')
var table           = require(rootpath + '/front/lib/table.js')
var image           = require(rootpath + '/front/lib/image.js')
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

    ipcRenderer.on('justify_left', function () {
        document.execCommand('justifyLeft')
    })

    ipcRenderer.on('justify_right', function () {
        document.execCommand('justifyRight')
    })

    ipcRenderer.on('justify_center', function () {
        document.execCommand('justifyCenter')
    })

    // 备份所有文档
    ipcRenderer.on('backup_notes_action', function () {
        new window.Notification('开始备份', {body: '开始备份所有文档,备份过程中请勿关闭软件!'})
        message.send('backup_notes', {}, function(response) {
            let notification = new window.Notification('备份成功', {body: '已备份到:' + response.data.file_path})
            notification.onclick = () => {
                shell.showItemInFolder(response.data.file_path)
            }
        }, 300000)
    })

    ipcRenderer.on('recover_notes_action', function () {
        message.send('recover_notes', {}, function(response) {

        })
    })

    ipcRenderer.on('add_table', function () {
        // 创建表格
        var titles    = ['', '']
        var html      = table.createTableHtml(titles)
        var tableNode = dom.insertHtml(html, false)
        table.makeTableResizeable(tableNode)

        // 设置光标
        var firstRow = $(tableNode).find('tr')[0]
        dom.setCursor(firstRow.firstChild.firstChild.firstChild)
    })

    // 上传文件动作
    ipcRenderer.on('upload_file_action', function () {
        // 检查是否选中笔记
        var editor  = dom.getEditor()
        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.warn("没有选中笔记!")
            return
        }

        var payload = {'note_id': note_id}
        message.send('upload_file', payload, function(response) {
            var file_url  = response.data.file_url
            var file_name = response.data.file_name
            var file_id   = 'file' + util.getRandomInt(100000)
            var html      = '<a class="file" href="{0}" id="{1}">{2}</a>&nbsp;'.format(file_url, file_id, file_name)
            document.execCommand('insertHTML', false, html)
            var ele = document.getElementById(file_id)
            ele.contentEditable = "false"

            $('a.file').unbind()
            $('a.file').click(function(event) {
                event.preventDefault()
                message.send('open_file_link', {file_url: this.getAttribute("href")}, function(response) {

                })
            })
        })
    })

    // 上传图片动作
    ipcRenderer.on('upload_image_action', function () {
        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.warn("没有选中笔记!")
            return
        }

        var payload = {'note_id': note_id}
        message.send('upload_image', payload, function(response) {
            var file_url  = response.data.file_url
            var html      = '<img src="{0}">'.format(file_url)

            var img = new Image();
            img.onload = function(){
                var width  = this.width
                var height = this.height
                delete img

                width = Math.ceil(width / 1.3)
                var html = '<img width=' + width + ' src="' + file_url + '">'
                document.execCommand('insertHTML', false, html)
                setTimeout(function() {
                    image.setImageEvent()
                }, 100)
            };

            setTimeout(function() {
                img.src = file_url
            }, 300)
        })
    })
}

exports.setEvent = setEvent
