// 获取随机数
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

// 绑定编辑区内容变化事件
$('#editor').bind("DOMSubtreeModified",function(){
    setTimeout(function() {
        adjustEditor()
    }, 10); // 由于adjust函数中修改innerHTML复触发DOMSubtreeModified事件，而获取editor的值还没有发生变化，会形成死循环
});

// 调整编辑区的内容格式
function adjustEditor() {
    // 编辑区内容被全部删除时，增加一个段落标签
    var childNodes = editor.childNodes
    if (childNodes.length == 0) {
        editor.innerHTML = '<p><br/></p>'
        return
    }

    // 编辑区下的div标签转换成p标签
    var divs = editor.querySelectorAll("div");
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i]; 
        $(div).before('<p>' + div.innerHTML + '</p>')
        div.remove()    
    }
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