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
function getParents(curNode, parentTags) {
    if (!curNode) {
        return null
    }

    var tagName = curNode.tagName
    while (tagName && tags.indexOf(tagName) < 0) {
        curNode = curNode.parentNode
        tagName = curNode.tagName
    }
    return tags.indexOf(tagName) >= 0 ? curNode : null
}

// 获取第一个块父节点
function getBlockParent(curNode) {
    var blockTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'PRE', 'DIV']
    return getParents(curNode, blockTags)
}

exports.getEditor          = getEditor
exports.getNotice          = getNotice
exports.getEditorContainer = getEditorContainer
exports.selectNode         = selectNode
