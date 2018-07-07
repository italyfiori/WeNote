var dom     = require(rootpath + '/front/lib/dom.js')

var $       = require('jquery')
let table   = require(rootpath + '/front/lib/table.js')

console.log(table);

var titleMap = {
    '#': 'h1',
    '##': 'h2',
    '###': 'h3',
    '####': 'h4',
    '#####': 'h5',
    '######': 'h6'
}

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

        // 获取markdown激活标签
        var actionResult = markdownAction(key, curNode, parentNode, innerHTML)
        if (actionResult === true) {
            return false
        }

    })
}

function markdownAction(key, curNode, parentNode, innerHTML) {
    if (key == '`' && curNode.nodeName == '#text' && parentNode.nodeName == 'P' && innerHTML == '`') {
        codeAction(parentNode)
        return true
    } else if (key == ' ') {
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

    return null
}

function titleAction(titleTag, parentNode) {
    var html = '<' + titleTag + '>' + '<br/></' + titleTag + '>'
    $(parentNode).after(html)
    dom.setCursor(parentNode.nextSibling)
    $(parentNode).remove()
    return false
}

function codeAction(parentNode) {
    var html = '<pre class="source hljs"><br/></pre>';
    $(parentNode).after(html)
    dom.setCursor(parentNode.nextSibling.firstChild)
    $(parentNode).remove()
}

function quoteAction(parentNode) {
    var html = '<blockquote><p><br></p></blockquote>'
    $(parentNode).after(html)
    dom.setCursor(parentNode.nextSibling.firstChild)
    $(parentNode).remove()
}

function olAction(parentNode) {
    var html = '<ol><li><br/></li></ol>'
    $(parentNode).after(html)
    dom.setCursor(parentNode.nextSibling.firstChild)
    $(parentNode).remove()
}

function ulAction(parentNode) {
    var html = '<ul><li><br/></li></ul>'
    $(parentNode).after(html)
    dom.setCursor(parentNode.nextSibling.firstChild)
    $(parentNode).remove()
}

function hrAction(parentNode) {
    var html = '<hr contenteditable="false" /><p><br><p>'
    $(parentNode).after(html)
    dom.setCursorAfter(parentNode.nextSibling)
    $(parentNode).remove()
}

function tableAction(innerHTML, parentNode) {
    var titles = innerHTML.substr(1, innerHTML.length - 2)
    var titles = titles.split('|')
    var html   = table.createTableHtml(titles)
    $(parentNode).after(html)
    table.makeTableResizeable(parentNode.nextSibling)
    var secondRow = $(parentNode.nextSibling).find('tr')[1]
    dom.setCursor(secondRow.firstChild.firstChild.firstChild)
    $(parentNode).remove()
}

exports.setActions = setActions
