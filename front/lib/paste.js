var dom     = require(rootpath + '/front/lib/dom.js')
var image   = require(rootpath + '/front/lib/image.js')
var message = require(rootpath + '/front/lib/message.js')
var table   = require(rootpath + '/front/lib/table.js')
var $       = require('jquery')

function removeStyle(html) {
    html = html.replace(/style="[^"]+"/g, '')
    html = html.replace(/<meta [^>]+>/gi, '')
    html = html.replace('<br class="Apple-interchange-newline">', '')
    return html
}

function setPasteImage() {
    var editor = dom.getEditor()
    editor.addEventListener('paste', function (event) {
        event.preventDefault()

        var blob  = null
        var items = []

        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
        var text = clipboardData.getData("text/html") || "";
        text = removeStyle(text)
        if (text !== "") {
            document.execCommand('insertHTML', false, text)
            // 表格可拖拽
            $('table').each(function() {
                table.makeTableResizeable(this)
            })
        }

        if (clipboardData.items) {
            var items = clipboardData.items
        }

        for (var i = 0; i < items.length; i++) {        
            if (items[i].type.indexOf("image") !== -1) {
                blob = items[i].getAsFile();
            }
        }

        if(blob === null) {
            setTimeout(function() {
                image.setImageEvent()
            }, 100)
            return
        }

        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.log("没有选定note");
            return;
        }

        var img = new Image();
        img.onload = function(){
            var width  = this.width
            var height = this.height
            delete img

            // 图像读取完成，执行回调     
            var bufferReader = new FileReader();
            bufferReader.onload = function(event) {       
                var buffer  = new Buffer(bufferReader.result)
                var payload = {'buffer': buffer, 'note_id': note_id}
                message.send('save_image', payload, function(data) {
                    if (data.code == 0 && data.image_url) {
                        width = width / 2
                        var html = '<img width=' + width + ' src="' + data.image_url + '">'
                        document.execCommand('insertHTML', false, html)
                        setTimeout(function() {
                            image.setImageEvent()
                        }, 100)
                    }
                })
            }

            // 读取图像数据
            bufferReader.readAsArrayBuffer(blob);
        };

        var URLObj = window.URL || window.webkitURL;
        img.src = URLObj.createObjectURL(blob);
    })
}

exports.setPasteImage = setPasteImage
