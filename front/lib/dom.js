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

exports.getEditor          = getEditor
exports.getNotice          = getNotice
exports.getEditorContainer = getEditorContainer
exports.selectNode         = selectNode
