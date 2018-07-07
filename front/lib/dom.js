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

exports.getEditor          = getEditor
exports.getNotice          = getNotice
exports.getEditorContainer = getEditorContainer
exports.selectNode         = selectNode
exports.getBlockParent     = getBlockParent
exports.setCursor          = setCursor
exports.blockEmpty         = blockEmpty
exports.findLastChild      = findLastChild
