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
            // 图像读取完成，执行回调     
            var reader = new FileReader();
            reader.onload = function(event) {           
                var buffer = new Buffer(reader.result)
                sendFile(buffer, function(data) {
                    if (data.code == 0 && data.image_url) {
                        document.execCommand('insertimage', false, data.image_url);
                    }
                })
            }

            // 开始读取图像数据
            reader.readAsArrayBuffer(blob);
        }
    })
})