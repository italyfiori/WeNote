$(document).ready(function() {
	editor.addEventListener('paste', function (event) { 
        
        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
        if (clipboardData.items) {
            var items = clipboardData.items
            var len = items.length
            var blob = null
        }

        // 点击后选中当前图像
        
        
        
        for (var i = 0; i < len; i++) {        
            if (items[i].type.indexOf("image") !== -1) {
                blob = items[i].getAsFile();
            }
        }

        if(blob === null) {
            setTimeout(function() {
                $('img').unbind()
                $('img').click(function() {
                    console.log(this)
                    selectNode(this)
                })
            }, 100)
            return;
        }

        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.log("没有选定note");
            return;
        }

        // if (blob !== null) {
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
                    var payload = {'buffer': buffer, 'note_id': note_id}
                    console.log(payload);
                    sendMessage('save_image', payload, function(data) {
                        console.log(data);
                        if (data.code == 0 && data.image_url) {
                            width = width / 2
                            var html = '<img width=' + width + ' src="' + data.image_url + '">'
                            document.execCommand('insertHTML', false, html)
                            console.log('come here');
                            setTimeout(function() {
                                $('img').unbind()
                                $('img').click(function() {
                                    console.log(this)
                                    selectNode(this)
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
        // }
    })
})