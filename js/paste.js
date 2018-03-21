$(document).ready(function() {
	editor.addEventListener('paste', function (event) { 
        
        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
        if (clipboardData.items) {
            var items = clipboardData.items
            var len = items.length
            var blob = null
        }
        
        for (var i = 0; i < len; i++) {        
            if (items[i].type.indexOf("image") !== -1) {
                blob = items[i].getAsFile();
            }      
        }

        if (blob !== null) {
            // 获取图像信息
            var img = new Image();
            img.onload = function(){
                var width = this.width
                var height = this.height
                delete img

                // 图像读取完成，执行回调     
                var bufferReader = new FileReader();
                bufferReader.onload = function(event) {           
                    var buffer = new Buffer(bufferReader.result)
                    sendFile(buffer, function(data) {
                        if (data.code == 0 && data.image_url) {
                            width = width / 2
                            var html = '<img width=' + width + ' src="' + data.image_url + '">'
                            document.execCommand('insertHTML', false, html)
                        }
                    })
                }

                // 读取图像数据
                bufferReader.readAsArrayBuffer(blob);
            };

            var URLObj = window.URL || window.webkitURL;
            img.src = URLObj.createObjectURL(blob);
        }
    })
})