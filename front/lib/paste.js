var dom     = require(rootpath + '/front/lib/dom.js')
var message = require(rootpath + '/front/lib/message.js')
var $       = require('jquery')

function setPasteImage() {
    var editor = dom.getEditor()
    editor.addEventListener('paste', function (event) {
        var blob  = null
        var items = []

        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
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
                $('img').unbind()
                $('img').click(function() {
                    dom.selectNode(this)
                })
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
                            $('img').unbind()
                            $('img').click(function() {
                                dom.selectNode(this)
                            })
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
