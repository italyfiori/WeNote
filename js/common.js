// 获取随机数 0到max
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// 将光标移动到当前节点之后
function setCursorAfterNode(node) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStartAfter(node)
    range.setEndAfter(node)
    selection.addRange(range)
}

function setCursor(node) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStart(node, 0)
    range.setEnd(node, 0)
    selection.addRange(range)
}

// 获取当前节点
function getCurNode() {
    var sel = window.getSelection()
    var range = sel.getRangeAt(0)
    return range.startContainer
}

// 获取第一个块节点
var blockTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI']
function getBlockContainer() {
    var curNode = getCurNode()
    var tagName = curNode.tagName
    while(curNode != editor && blockTags.indexOf(tagName) < 0) {
        curNode = curNode.parentNode
        tagName = curNode.tagName
    }
    return blockTags.indexOf(tagName) >= 0 ? curNode : undefined
}

// 标题标签markdown触发条件
var titleTagMap = {
    '#' : 'h1',
    '##': 'h2',
    '###': 'h3',
    '####': 'h4',
    '#####': 'h5',
    '######': 'h6'
}

// 标题标签
var titleTagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']