const { shell } = require('electron')
var dom   = require(rootpath + '/front/lib/dom.js')
var table = require(rootpath + '/front/lib/table.js')
var util  = require(rootpath + '/front/lib/util.js')
var $     = require('jquery')
var katex = require('katex')

var caretPosition;
var caretOffset;

let titleMap = {
    '#': 'h1',
    '##': 'h2',
    '###': 'h3',
    '####': 'h4',
    '#####': 'h5',
    '######': 'h6'
}

let titleNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']

let fontTags = {
    'U': 'underline',
    'I': 'italic',
    'B': 'bold',
}

// 改写编辑器按键功能
function setActions(node) {
    $(node).keypress(function(e) {
        var selection = window.getSelection()
        if(selection.rangeCount !== 1) {
            return true
        }

        var key        = e.key
        var range      = selection.getRangeAt(0)
        var curNode    = range.startContainer
        var parentNode = curNode.parentNode
        var blockNode  = dom.getBlockParent(curNode)
        var innerHTML  = $(parentNode).html()

        // markdown语法功能
        var actionResult = markdownAction(key, range, curNode, parentNode, innerHTML)
        if (actionResult === true) {
            return false
        }

        // 改写换行功能
        if (key == 'Enter') {
            return !enterAction(curNode, parentNode, blockNode, range)
        }

        return true
    })

    $(node).keydown(function (e) {
        var selection = window.getSelection()
        if(selection.rangeCount !== 1) {
            return true
        }

        var key        = e.key
        var range      = selection.getRangeAt(0)
        var curNode    = range.startContainer
        var parentNode = curNode.parentNode
        var blockNode  = dom.getBlockParent(curNode)
        var innerHTML  = $(parentNode).html()

        // 改写回退键功能
        if(key == 'Backspace' && range.startOffset == 0 && range.collapsed) {
            return !backAction(curNode, parentNode, blockNode, range)
        }
    })
}

// 换行建功能改写
function enterAction(curNode, parentNode, blockNode, range) {
    // 换行时先清除字体格式(粗体、下划线、斜体)
    var parents = $(curNode).parentsUntil(blockNode) // 找到当前文本的所有格式标签
    for (var i = 0; i < parents.length; i++) {
        parent = parents[i]
        if (parent.nodeName in fontTags) {
            document.execCommand(fontTags[parent.tagName], false, false)
        }
    }

    // 重置字体颜色
    document.execCommand('forecolor',false,'#333')
    document.execCommand('backColor',false,'white')

    // 表格内换行
    if (curNode.nodeName == 'TD') {
        var p = document.createElement("p")
        p.appendChild(document.createElement('br'))
        range.insertNode(p)
        dom.setCursor(p)
        return true
    }

    // 代码块换行
    if (blockNode && blockNode.nodeName == 'PRE') {
        var html        = blockNode.innerHTML
        var last_index  = html.lastIndexOf("\n")
        var html_length = html.length

        if (last_index < 0 || (last_index != html_length - 1 && range.endOffset == html_length)) {
            document.execCommand('insertHTML', false, "\n")
        }
        document.execCommand('insertHTML', false, "\n")
        return true
    }

    // 标题换行
    if (blockNode && titleNames.indexOf(blockNode.tagName) >= 0) {
        if (range.startOffset == 0) {
            $(blockNode).before('<p><br></p>')
            return true
        } else if(range.startOffset == blockNode.innerText.length){
            $(blockNode).after('<p><br></p>')
            dom.setCursor(blockNode.nextSibling)
            return true
        }
        return false
    }

    // 在引用块最后一个空行后换行，退出引用块
    if (curNode.nodeName == 'P' && parentNode.nodeName == 'BLOCKQUOTE' && parentNode.lastChild == curNode && range.startOffset == 0) {
        $(parentNode).after('<p><br></p>')
        dom.setCursor(parentNode.nextSibling)
        if (parentNode.childNodes.length == 1) {
            $(parentNode).remove()
        } else {
            parentNode.removeChild(curNode)
        }
        return true
    }

    // 在列表最后一个空行后换行，退出列表
    if (curNode.nodeName == 'LI' && (parentNode.nodeName == 'OL' || parentNode.nodeName == 'UL') && parentNode.lastChild == curNode && range.startOffset == 0) {
        $(parentNode).after('<p><br></p>')
        dom.setCursor(curNode.parentNode.nextSibling)
        parentNode.removeChild(curNode)
        return true
    }
}

// 回退键功能改写
function backAction(curNode, parentNode, blockNode, range) {
    // 引用块回退删除
    if (curNode.nodeName == 'P' && parentNode.nodeName == 'BLOCKQUOTE' &&
        parentNode.childNodes.length == 1 && dom.blockEmpty(curNode)) {
        $(parentNode).after('<p><br></p>')
        dom.setCursor(parentNode.nextSibling)
        $(parentNode).remove()
        return true
    }

    // 代码块回退删除
    if (blockNode.nodeName == 'PRE' && dom.blockEmpty(blockNode)) {
        $(blockNode).after('<p><br></p>')
        dom.setCursor(blockNode.nextSibling)
        $(blockNode).remove()
        return true
    }

    // 列表回退删除
    if (blockNode.nodeName == 'LI' && blockNode.parentNode.childNodes.length == 1 && dom.blockEmpty(blockNode)) {
        $(blockNode.parentNode).after('<p><br></p>')
        dom.setCursor(blockNode.parentNode.nextSibling)
        $(blockNode.parentNode).remove()
        return true
    }

    // 标题回退删除自身
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(blockNode.nodeName) >= 0 && dom.blockEmpty(blockNode)) {
        $(blockNode).after('<p><br></p>')
        dom.setCursor(blockNode.nextSibling)
        $(blockNode).remove()
        return true
    }

    // 标题回退改写
    if (titleNames.indexOf(blockNode.nodeName) >= 0) {
        // 前面是空行，回退一行
        blockPrevious = blockNode.previousSibling
        if (blockPrevious && dom.blockEmpty(blockPrevious)) {
            dom.selectNode(blockPrevious)
            document.execCommand('delete', null, false)
            return true
        } else if (blockPrevious && blockPrevious.nodeName == 'P') {
            document.execCommand('formatBlock', false, "<p>")
            return true
        }
    }

    // 跳入上一个节点
    if (jumpBack(blockNode)) {
        return true
    }
}

// 尝试跳入上一个节点，并返回是否阻止默认回退行为
function jumpBack(blockNode) {
    var shouldPrevent = false
    var previousNode  = null

    // 从引用跳到上一个块的末尾
    if (blockNode.nodeName == 'P' && blockNode.parentNode.nodeName == 'BLOCKQUOTE' && blockNode.parentNode.firstChild == blockNode) {
        previousNode = blockNode.parentNode.previousSibling
        shouldPrevent = true
    } else if (blockNode.nodeName == 'PRE') {
        // 从代码跳到上一个块的末尾
        previousNode = blockNode.previousSibling
        shouldPrevent = true
    } else if (blockNode.nodeName == 'LI' && blockNode.parentNode.firstChild == blockNode) {
        // 从列表跳到上一个块的末尾
        previousNode = blockNode.parentNode.previousSibling
        shouldPrevent = true
    } else if (titleNames.indexOf(blockNode.nodeName) >= 0) {
        previousNode = blockNode.previousSibling
        shouldPrevent = true
    } else if(blockNode.nodeName == 'P') {
        if (blockNode.previousSibling && blockNode.previousSibling.nodeName == 'P') {
            shouldPrevent = false
        } else {
            shouldPrevent = true
            previousNode = blockNode.previousSibling
        }
    }

    if (previousNode) {
        var cursorNode = dom.findLastChild(previousNode)
        var offset     = 0
        if (cursorNode.lastChild && cursorNode.lastChild.nodeName == '#text') {
            cursorNode = cursorNode.lastChild
            offset     = cursorNode.length
        }
        if (dom.blockEmpty(blockNode)) {
            $(blockNode).remove()
        }
        dom.setCursor(cursorNode, offset)
    }

    return shouldPrevent
}

// 激活markdown语法标记
function markdownAction(key, range, curNode, parentNode, innerHTML) {
    if (key == ' ') {
        if (curNode.nodeName == '#text' && parentNode.nodeName == 'P' && innerHTML in titleMap) {
            titleAction(titleMap[innerHTML], parentNode)
            return true
        } else if (curNode.nodeName == '#text' && parentNode.nodeName == 'P' && innerHTML == '&gt;') {
            quoteAction(parentNode)
            return true;
        } else if (curNode.nodeName == '#text' && parentNode.nodeName == 'P' && innerHTML == '1.') {
            olAction(parentNode)
            return true
        } else if (curNode.nodeName == '#text' && parentNode.nodeName == 'P' && (innerHTML == '*' || innerHTML == '-')) {
            ulAction(parentNode)
            return true
        }
    } else if (key == '-' && curNode.nodeName == '#text' && parentNode.nodeName == 'P' && (innerHTML == '-')) {
        hrAction(parentNode)
        return true
    }

    var pat = /^\|(([^\|]+)\|)+$/
    if (key == 'Enter' && pat.test(innerHTML) && curNode.nodeName == '#text' && parentNode.nodeName == 'P') {
        tableAction(innerHTML, parentNode)
        return true
    }

    if (key == 'Enter' && curNode.nodeName == '#text' && parentNode.nodeName == 'P' && innerHTML.indexOf('```') == 0) {
        var language = innerHTML.substr(3)
        codeAction(parentNode, language)
        return true
    }

    // 超链接
    if (event.key == ']') {
        var text   = curNode.nodeValue
        var editor = dom.getEditor()
        caretPosition  = dom.getCaret(editor)
        linkOffset = range.startOffset

        if (text && text.endsWith('![')) {
            event.preventDefault()
            $('#link_input').modal('show')
            $('#link_url').focus()
            $('#link_input_insert').click(function() {
                var link_url  = $('#link_url').val()
                var link_text = $('#link_text').val()
                if (link_url && link_text) {
                    $('#link_input').modal('hide')
                    linkAction(link_url, link_text, linkOffset - 2, linkOffset, range, caretPosition)
                }
            })
        }
    }

    if (event.key == '$') {
        // 触发数学公式
        var offset = range.startOffset
        var text   = curNode.nodeValue
        if (text) {
            var start = text.lastIndexOf('$$')
            if (start >= 0 && offset - start >= 4 && text.charAt(offset - 1) == '$') {
                mathAction(text, start, offset, curNode, range)
                return true
            }
        }
    }

    if (event.key == '`') {
        // 触发着重符号
        var offset = range.startOffset
        var text   = curNode.nodeValue
        if (text) {
            var start  = text.lastIndexOf('`')
            if (start >= 0 && offset - start >= 2) {
                emphAction(text, start, offset, curNode, range)
                return true
            }
        }
    }

    return false
}

// markdown标题
function titleAction(titleTag, parentNode) {
    var html = '<' + titleTag + '>' + '<br/></' + titleTag + '>'
    var node = dom.insertHtml(html)
    dom.setCursor(node)
}

// markdown代码块
function codeAction(parentNode, language = '') {
    if(language == '') {
        var html = '<pre class="source hljs"><br/></pre>';
    } else {
        var html = '<pre class="source hljs ' + language + ' "><br/></pre>';
    }

    var node = dom.insertHtml(html)
    dom.setCursor(node.firstChild)
}

// markdown引用块
function quoteAction(parentNode) {
    var html = '<blockquote><p><br></p></blockquote>'
    var node = dom.insertHtml(html)
    dom.setCursor(node.firstChild)
}

// markdown顺序列表
function olAction(parentNode) {
    var html = '<ol><li><br/></li></ol>'
    var olNode = dom.insertHtml(html)
    dom.setCursor(olNode.firstChild)
}

// markdown无序列表
function ulAction(parentNode) {
    var html = '<ul><li><br/></li></ul>'
    var ulNode = dom.insertHtml(html)
    dom.setCursor(ulNode.firstChild)
}

// markdown水平线
function hrAction(parentNode) {
    var html   = '<hr contenteditable="false" /><p><br><p>'
    var hrNode = dom.insertHtml(html)
    dom.setCursor(hrNode.nextSibling)
}

// markdown表格
function tableAction(innerHTML, parentNode) {
    var titles = innerHTML.substr(1, innerHTML.length - 2)
    var titles = titles.split('|')

    // 创建表格
    var html      = table.createTableHtml(titles)
    var tableNode = dom.insertHtml(html)
    table.makeTableResizeable(tableNode)

    // 设置光标
    var secondRow = $(tableNode).find('tr')[1]
    dom.setCursor(secondRow.firstChild.firstChild.firstChild)
}

// 插入超链接
function linkAction(link_url, link_text, start, offset, range, caretPosition) {
    // 光标
    var editor = dom.getEditor()
    dom.setCaret(editor, caretPosition)

    // 插入连接
    var id   = 'link' + util.getRandomInt(100000)
    var html = '<a class="link" href="{0}" id="{1}">{2}</a>&nbsp;'.format(link_url, id, link_text)
    $('#link_url').val('')
    $('#link_text').val('')
    document.execCommand('insertHTML', false, html)

    // 删除输入的文本
    var ele  = document.getElementById(id)
    var node = ele.previousSibling
    console.log(ele);;
    console.log(node)

    range.setStart(node, start)
    range.setEnd(node, offset)
    range.deleteContents()

    // 设置光标位置
    range.setStart(ele.nextSibling, 1)
    range.collapse(true)
    var selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    $('a.link').unbind()
    $('a.link').click(function(event) {
        event.preventDefault()
        var href = $(this).attr('href')
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            href = 'http://' + href
        }
        shell.openExternal(href);
    })
}

// markdown数学公式
function mathAction(text, start, offset, curNode, range) {
    // 插入公式标签
    var text = text.slice(start + 2, offset - 1)
    var id   = 'math' + util.getRandomInt(100000)
    var html = '<a class="math" id="' + id + '"> ' + text + '</a>&nbsp;'; // 末尾增加空格，否则光标可能跑到段落最右边
    document.execCommand('insertHTML', false, html)

    // 执行insertHTML后curNode会变化
    curNode         = range.startContainer
    var block       = dom.getBlockParent(curNode)
    block.innerHTML = block.innerHTML.replace(/<span style="background-color: transparent;">(.*?)<\/span>/g, '$1')

    // 删除输入的文本
    var ele  = document.getElementById(id)
    var node = ele.previousSibling // 通过preivous找到文本节点，直接用curNode还有问题
    range.setStart(node, start)
    range.setEnd(node, offset)
    range.deleteContents()

    // 渲染数学公式
    katex.render(text, ele)

    // 设置光标位置
    range.setStart(ele.nextSibling, 1)
    range.collapse(true)
    var selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    ele  = document.getElementById(id)
    ele.contentEditable = "false"
}

// markdown重点标记
function emphAction(text, start, offset, curNode, range) {
    var text = text.slice(start + 1, offset)
    var id   = 'code' + util.getRandomInt(100000)
    var html = '<a class="code" id="' + id + '">' + text + '</a>&nbsp;';
    document.execCommand('insertHTML', false, html)

    // 执行insertHTML后curNode会变化
    curNode         = range.startContainer
    var block       = dom.getBlockParent(curNode)
    block.innerHTML = block.innerHTML.replace(/<span style="background-color: transparent;">(.*?)<\/span>/g, '$1')

    // 删除输入的文本
    var ele  = document.getElementById(id)
    var node = ele.previousSibling // 通过preivous找到文本节点
    range.setStart(node, start)
    range.setEnd(node, offset)
    range.deleteContents()

    // 设置光标位置
    range.setStart(ele.nextSibling, 1)
    range.collapse(true)
    var selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}

exports.setActions = setActions
