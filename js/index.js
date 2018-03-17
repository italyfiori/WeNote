$(document).ready(function() {

    // 标题输入框获取光标
	$('#title-input').focus()

    // 在标题输入框中键入回车键跳到编辑器中
    $('#title-input').keypress(function(event) {
        if (event.key == "Enter") {
            editor.focus()
        }
    })

    // 将光标移动到当前节点之后
    function setCursorAfterNode(node) {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        range.setStartAfter(node)
        range.setEndAfter(node)
        selection.addRange(range)
    }

    // 获取选取范围
    function getRange() {
        var sel = window.getSelection()
        return sel.getRangeAt(0)
    }

    // 获取当前节点
    function getCurNode() {
        var sel = window.getSelection()
        var range = sel.getRangeAt(0)
        return range.startContainer
    }

    // 插入标题h1-h6
    function insertTitle(tag) {
        document.execCommand('formatBlock', false, '<' + tag + '>');
    }

    // 插入引用块
    function insertQuote() {    
        var html = '<blockquote><p><br></p></blockquote>'
        document.execCommand('insertHTML', false, html)
    }

    // 绑定编辑区内容变化事件
    $('#editor').bind("DOMSubtreeModified",function(){
    	// console.log('here')
	});

    
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

    $('#editor').keypress(function(event) {
        // 获取当前节点信息和range范围
        var sel = window.getSelection()
        var range = sel.getRangeAt(0)
        var curNode = getCurNode()
        var parentNode = curNode.parentNode
        var innerHTML = $(parentNode).html()

        // console.log(curNode)
        // console.log(parentNode.tagName)
        
        if (event.key == ' ') {
            // 触发标题块markdown语法
            if (typeof(curNode.tagName) == 'undefined' && parentNode.tagName == 'P' && innerHTML in titleTagMap) {
                event.preventDefault()  
                var tag = 'h' + innerHTML.length
                var html = '<' + tag + '>' + '<br/></' + tag + '>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
            }

            // 触发引用块markdown语法
            if (typeof(curNode.tagName) == 'undefined' && parentNode.tagName == 'P' && innerHTML == '&gt;') {
                event.preventDefault()
                $(parentNode).remove()
                insertQuote()
            }
        }

        if (event.key == 'Enter') {
            // 标题块后键入回车，换行进入段落块
            if (parentNode.tagName && titleTagName.indexOf(parentNode.tagName) >= 0) {
                event.preventDefault()
                $(parentNode).after('<p><br></p>')
                setCursorAfterNode(parentNode)
                return
            }

            // 在引用块最后一个空行后键入回车键，退出引用块
            if (curNode.tagName == 'P' && parentNode.tagName == 'BLOCKQUOTE' && parentNode.lastChild == curNode && range.startOffset == 0) {
                event.preventDefault()
                parentNode.removeChild(curNode)
                $(parentNode).after('<p><br></p>')
                setCursorAfterNode(parentNode)
                return
            }    
        }

    })
})