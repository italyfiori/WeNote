var util = require(rootpath + '/front/lib/util.js')

// 获取编辑区
function getEditor() {
    return document.getElementById('editor')
}

// 获取提示节点
function getNotice() {
    return document.getElementById("notice");
}

// 获取编辑区container
function getEditorContainer() {
    return document.getElementById("editor-container");;
}

// 选中节点
function selectNode(node) {
    var selection = window.getSelection();
    var range     = document.createRange();
    range.selectNode(node)
    selection.removeAllRanges();
    selection.addRange(range);
}

// 获取指定tag类型的第一个父节点
function getParents(curNode, nodeNames) {
    if (!curNode) {
        return null
    }

    while (curNode && nodeNames.indexOf(curNode.nodeName) < 0) {
        curNode = curNode.parentNode
    }
    return curNode && nodeNames.indexOf(curNode.nodeName) >= 0 ? curNode : null
}

// 获取第一个块父节点
function getBlockParent(curNode) {
    var nodeNames = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'PRE', 'DIV']
    return getParents(curNode, nodeNames)
}

// 设置光标到节点
function setCursor(node, offset = 0) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStart(node, offset)
    range.setEnd(node, offset)
    selection.addRange(range)
}

// 判断块节点是否为空
function blockEmpty(blockNode) {
    if (!blockNode.childNodes || blockNode.childNodes.length == 0) {
        return true
    } else if (blockNode.childNodes.length == 1 && blockNode.childNodes[0].nodeName == 'BR') {
        return true
    } else if (blockNode.childNodes.length == 1 && blockNode.childNodes[0].innerText == '') {
        return true
    } else if(blockNode.innerText == "\n" || blockNode.innerText == "") {
        return true
    }
    return false
}

// 找到最后一个子节点
function findLastChild(blockNode) {
    var node = blockNode
    while ($(node).children(':not(div.resize)').length > 0) {
        node = $(node).children(':not(div.resize)').last()[0]
    }
    return node
}

// 获取当前节点
function getCurNode() {
    var sel = window.getSelection()
    if (sel.rangeCount > 0) {
        var range = sel.getRangeAt(0)
        return range.startContainer
    }
    return null
}

function getRange() {
    var sel = window.getSelection()
    if (sel.rangeCount > 0) {
        return sel.getRangeAt(0)
    }
    return null
}

function resetRange(range) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range)
}

function removeAllListeners(node) {
    var cloneNode = node.cloneNode(true);
    node.parentNode.replaceChild(cloneNode, node);
    return cloneNode
}

function insertHtml(html, delete_prev = true) {
    // 插入html
    var id = util.getRandomInt(10000000)
    html = html.replace(/>/, ' id="' + id + '">')
    document.execCommand('insertHTML', false, html)

    // 删除激活语法文本
    var range = document.createRange();
    var ele   = document.getElementById(id)
    if (delete_prev) {
        range.selectNode(ele.previousSibling)
        range.deleteContents()
    }

    // 恢复光标
    range.setStartAfter(ele)
    range.collapse(true)
    var selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    return ele
}

function getCaret(el) {
    var caretOffset = 0,
        sel;
    if (typeof window.getSelection !== "undefined" && window.getSelection().rangeCount) {
        var range = window.getSelection().getRangeAt(0);
        var selected = range.toString().length;
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length - selected;
    }
    return caretOffset;
}

function getAllTextnodes(el) {
    var n, a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while (n = walk.nextNode()) a.push(n);
    return a;
}

function getCaretData(el, position) {
    var node;
    nodes = getAllTextnodes(el);
    for (var n = 0; n < nodes.length; n++) {
        if (position > nodes[n].nodeValue.length && nodes[n + 1]) {
            position -= nodes[n].nodeValue.length;
        } else {
            node = nodes[n];
            break;
        }
    }
    return {
        node: node,
        position: position
    };
}

function setCaret(node, position) {
    var data = getCaretData(node, position);
    setCaretPosition(data)
}

function setCaretPosition(d) {
    if (d.node) {
        var sel   = window.getSelection()
        var range = document.createRange()
        range.setStart(d.node, d.position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

exports.getEditor          = getEditor
exports.getNotice          = getNotice
exports.getEditorContainer = getEditorContainer
exports.selectNode         = selectNode
exports.getBlockParent     = getBlockParent
exports.setCursor          = setCursor
exports.blockEmpty         = blockEmpty
exports.findLastChild      = findLastChild
exports.getCurNode         = getCurNode
exports.insertHtml         = insertHtml
exports.getCaret           = getCaret
exports.setCaret           = setCaret
exports.removeAllListeners = removeAllListeners
exports.getRange           = getRange
