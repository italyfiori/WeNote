var dom = require(rootpath + '/front/lib/dom.js')
var $   = require('jquery')

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
        if ($(this).children(':not(div.resize)').length == 0) {
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

    //
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

    // 标题标签清除非字符元素
    $("#editor h1, #editor h2, #editor h3, #editor h4, #editor h5, #editor h6").each(function() {
        if (this.innerHTML != this.innerText && this.innerHTML != '<br>') {
            this.innerHTML = this.innerText
        }
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

exports.adjustEditor = adjustEditor
