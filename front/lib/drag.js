var message = require(rootpath + '/front/lib/message.js')
var util    = require(rootpath + '/front/lib/util.js')
var $       = require('jquery')

function setDragFile() {
    // 文件拖拽
    var holder = document

    holder.ondragover = () => {
        return false;
    };

    holder.ondragleave = () => {
        return false;
    };

    holder.ondragend = () => {
        return false;
    };

    holder.ondrop = (e) => {
        e.preventDefault();

        var editor  = document.getElementById('editor')
        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.warn("没有选中笔记!")
            return
        }
        if (e.dataTransfer.files.length != 1) {
            console.warn("不支持多个文件!")
            return
        }

        var filePath = e.dataTransfer.files[0].path
        var payload  = {note_id: note_id, file_path: filePath}

        //
        message.send('drag_file', payload, function(response) {
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
                    // do nothing
                })
            })

        })

        return false;
    }
}

exports.setDragFile = setDragFile
