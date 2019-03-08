var dom     = require(rootpath + '/front/lib/dom.js')
var message = require(rootpath + '/front/lib/message.js')
var image   = require(rootpath + '/front/lib/image.js')
var $       = require('jquery')

// 调整编辑区的内容格式
function adjustEditor() {
    var editor = dom.getEditor()

    // 编辑区内容被全部删除时，增加一个段落标签
    if ($(editor).children().length == 0) {
        $(editor).append('<p><br/></p>')
        dom.setCursor(editor.firstChild)
        return
    }

    // 表格单元内容被全部删除时，增加一个段落标签
    $('#editor td').each(function() {
        if ($(this).children(':not(div.resize)').length == 0 && $(this).text() == '') {
            $(this).prepend('<p><br/></p>')
        }
    })

    // p标签改写
    $('#editor p').each(function() {
        if ( $(this).children().length == 0 && $(this).text() == '' ) {
            $(this).append('<br/>')
        }
    })

    // 编辑区末尾增加p标签
    if ($(editor).children().last()[0].nodeName != 'P') {
        $(editor).append('<p><br/></p>')
        return
    }

    adjustList()

    // 空标签处理
    $('#editor, td').children().each(function() {
        // 空的换行变成嵌套p标签
        if (this.nodeName == 'BR') {
            let range = document.createRange();
            let p     = document.createElement("p");
            range.selectNode(this)
            range.surroundContents(p)
            dom.setCursor(p)
            return
        } else if ($(this).nodeName == 'DIV' && dom.blockEmpty(this)) {
            // 空的div转换成p标签
            $(this).after('<p><br></p>')
            dom.setCursor(this.nextSibling)
            $(this).remove()
            return
        }
    })

    // 给标题增加序号
    adjustTitles()
}

var processingTitles = false
function adjustTitles() {
    if (processingTitles) {
        return false
    }

    // 100毫秒更新一次
    processingTitles = true
    setTimeout(function() {
        processingTitles = false
    }, 100)
    

    // 获取所有标题类型
    var titles = $("#editor h1, #editor h2, #editor h3, #editor h4, #editor h5, #editor h6").not('.popover-title')
    var nodeNames = []
    titles.each(function() {
        if (nodeNames.indexOf(this.nodeName) == -1) {
            nodeNames.push(this.nodeName)
        }
    });
    nodeNames.sort()

    $('head style').remove()
    var titleSerials = []
    var prevSerial = []
    titles.each(function() {
        var serialsLen = nodeNames.indexOf(this.nodeName) + 1
        
        if (prevSerial.length == 0) {
            // 第一个标题
            var curSerial  = new Array(serialsLen).fill(1)
        }else if (serialsLen > prevSerial.length) {
            // 是上一个标题的子标题
            var curSerial = prevSerial.concat(new Array(serialsLen - prevSerial.length).fill(1))
        } else { 
            // 与上一个标题同级或更高级
            var lastNum = prevSerial[serialsLen - 1]  + 1
            var curSerial = prevSerial.slice(0, serialsLen - 1)
            curSerial.push(lastNum)
        }
        prevSerial = curSerial
        titleSerials.push(curSerial)

        var title_id = 'title_' + curSerial.join('_')
        var title_serial = curSerial.join('.') + ' '
        this.id = title_id
        var style = '<style>#{0}:before{content:"{1}"}</style>'.format(title_id, title_serial)
        $('head').append(style)
    })
}

function adjustList() {
    let lists = document.querySelectorAll("ol, ul");
     for (let i = 0; i < lists.length; i++) {
        let ele = lists[i]; // ol
        let parentNode = ele.parentNode;
        if (parentNode.tagName === 'P' && parentNode.lastChild === parentNode.firstChild) {
                parentNode.insertAdjacentElement('beforebegin', ele);
                parentNode.remove()
                dom.setCursor(ele)
        }
    }
}

function adjustImage() {
    var imgs = $('img')

    // 判断是否选中笔记
    var editor  = dom.getEditor()
    var note_id = editor.getAttribute('note_id')
    if (!note_id) {
        console.warn('未选中笔记')
        return
    }

    for (var i = 0; i < imgs.length; i++) {
        var url = imgs[i].src
        if ( url.startsWith('http://') || url.startsWith('https://') ) {
            saveImage(note_id, imgs[i])
        }
    }
}

function saveImage(note_id, img){
    // 处理过的图像不再处理
    if (img.processed) {
        return
    }
    img.processed = true

    // 重新读取图像
    var url  = img.src
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";

    // 读取成功后回调
    xhr.onload = function() {
        var blob = xhr.response;
        var bufferReader = new FileReader();
        bufferReader.onload = function(event) {       
            var buffer  = new Buffer(bufferReader.result)
            var payload = {'buffer': buffer, 'note_id': note_id}
            message.send('save_image', payload, function(response) {
                if (response.code == 0 && response.data.image_url) {
                    img.src = response.data.image_url
                    img.width /= 1.5
                    setTimeout(function() {
                        image.setImageEvent()
                    }, 100)
                }
            })
        }

        // 读取图像blob数据
        bufferReader.readAsArrayBuffer(blob);
    }

    // 启动读取图像
    xhr.send();
}

exports.adjustEditor = adjustEditor
exports.adjustImage  = adjustImage
exports.adjustTitles = adjustTitles
