var dom     = require(rootpath + '/front/lib/dom.js')
var image   = require(rootpath + '/front/lib/image.js')
var message = require(rootpath + '/front/lib/message.js')
var table   = require(rootpath + '/front/lib/table.js')
var link    = require(rootpath + '/front/lib/link.js')
var adjust  = require(rootpath + '/front/lib/adjust.js')
var $       = require('jquery')

// 清除html样式
function removeStyle(html) {
    if (html.startsWith('<html')) {

        html = html.replace(/[\s]+/g," ");
        html = html.replace(/width=\d+ style='[^>]+\d+pt'>/gi, '')
        console.log(html);
        return html
    }
    html = html.replace(/style="[^"]+"/gi, '')
    html = html.replace(/<meta [^>]+>/gi, '')
    html = html.replace('<br class="Apple-interchange-newline">', '')
    html = html.replace(/\n/g,"<br>");
    return html
}

// 字符串实体转换
function encodedString(str){
     var s = "";
     if(str.length == 0) return "";
     s = str.replace(/&/g,"&amp;");
     s = s.replace(/</g,"&lt;");
     s = s.replace(/>/g,"&gt;");
     s = s.replace(/ /g,"&nbsp;");
     s = s.replace(/\'/g,"&#39;");
     s = s.replace(/\"/g,"&quot;");
     s = s.replace(/\n/g,"<br>");
     return s;
}

function setPasteImage() {
    var editor = dom.getEditor()
    editor.addEventListener('paste', function (event) {
        event.preventDefault()

        var blob  = null
        var items = []

        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
        var html = clipboardData.getData("text/html") || "";
        var text = clipboardData.getData("text")

        // 清除复制时的样式
        if (html !== "") {
            html = removeStyle(html) // 清除样式
            document.execCommand('insertHTML', false, html)
            // 表格可拖拽
            $('table').each(function() {
                table.makeTableResizeable(this)
            })

            link.setLinkClickEvent()
        } else if (text !== "") {
            text = encodedString(text)
            document.execCommand('insertHTML', false, text)
        }

        // 网络图像转存到本地
        setTimeout(function() {
            adjust.adjustImage()
        }, 200)

        if (clipboardData.items) {
            var items = clipboardData.items
        }

        // 获取图像blob
        for (var i = 0; i < items.length; i++) {        
            if (items[i].type.indexOf("image") !== -1) {
                blob = items[i].getAsFile();
            }
        }

        // 没有图像直接返回
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
                message.send('save_image', payload, function(response) {
                    if (response.code == 0 && response.data.image_url) {
                        width = width / 2
                        var html = '<img width=' + width + ' src="' + response.data.image_url + '">'
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
