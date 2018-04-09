$(document).ready(function() {
    
    var menu_tree = $('#menu-tree').jstree(true)

    // 获取菜单
    getMenu(function(data) {
        var menu = {
            "core": {
                'check_callback': true,
                'multiple': false,
            },
            "plugins" : ["dnd","contextmenu"]
        }
        menu.core.data = data.menu.data
        $('#menu-tree').jstree(menu)
        // setTimeout(function() {
        //     $('#menu-tree').jstree(true).select_node('root')
        // }, 100)
        

    })

    function create_node() {
        var ref = $('#menu-tree').jstree(true)
        var sel = ref.get_selected();
        if(!sel.length) { return false; }
        sel = sel[0];
        sel = ref.create_node(sel, {"type":"file", "id": 100});
        if(sel) {
            ref.edit(sel);
            ref.select_node('100')
        }
    };


    // 创建目录
    $('#create-directory').click(function() {
        var ref = $('#menu-tree').jstree(true)
        var sel = ref.get_selected();
        if(!sel.length) { return false; }
        
        console.log(sel)
        var parent_id = sel[0];
        var node = {
          "id": "p3",
          "text": "Parent-3"
        }
        createDir(parent_id, function(data) {
            var node_id = data.note_id
            $('#menu-tree').jstree("create_node", parent_id, node, "last")
            console.log(data)
        })
        // createDir()
        // create_node()
        // var node = {
        //   "id": "p3",
        //   "text": "Parent-3"
        // }
        // $('#menu-tree').jstree("create_node", "root", node, "last")
        // $('#menu-tree').jstree(true).select_node('p3')
    })

    // 标题输入框获取光标
	$('#title-input').focus()

    // 在标题输入框中键入回车键跳到编辑器中
    $('#title-input').keypress(function(event) {
        if (event.key == "Enter") {
            editor.focus()
        }
    })

    // 失去焦点时记录光标位置
    var lastRange = null
    $('#editor').blur(function(){
        var range = getRange()
        if (range) {
            lastRange = range.cloneRange()
        }
    })

    // 恢复光标位置
    function recoverRange() {
        if (lastRange) {
            console.log('recover')
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(lastRange)
        }
        return lastRange
    }

    // 插入链接
    $('#insert_link').click(function() {
        var url  = link_url.value
        var text = link_text.value
        if (text == '') {
            text = url
        }
        $('#linkModal').modal('hide')
        var range = recoverRange()
        if (range) {
            var link = document.createElement("a")
            link.href = url
            link.appendChild(document.createTextNode(text))
            range.insertNode(link)
            setCursorAfterNode(link)
            document.getElementById("link_url").value = ''
            document.getElementById("link_text").value = ''
        }
    })

    const ipc = require('electron').ipcRenderer
    $('#insertfile').click(function() {
        console.log('insert file')
        ipc.send('open-file-dialog')
    })

    ipc.on('selected-directory', function (event, path) {
        console.log(path)
        // document.getElementById('selected-file').innerHTML = `You selected: ${path}`
    })

    // 调整编辑区的内容格式
    function adjustEditor() {
        // 编辑区内容被全部删除时，增加一个段落标签
        var childNodes = editor.childNodes
        if (childNodes.length == 0) {
            editor.innerHTML = '<p><br/></p>'
            setCursor(editor.children[0])
            return
        }

        // 编辑区下的div标签转换成p标签
        var divs = editor.querySelectorAll("div");
        for (var i = 0; i < divs.length; i++) {
            // var div = divs[i]; 
            // $(div).before('<p>' + div.innerHTML + '</p>')
            // div.remove() 
        }

        // 节点调整
        var nodes = editor.childNodes
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i]
            if (node.nodeName == '#text') {
                // console.log($(node))
            }
        }
    }

    // 绑定编辑区内容变化事件
    $('#editor').bind("DOMSubtreeModified",function(){
        setTimeout(function() {
            adjustEditor()
        }, 10); // 由于adjust函数中修改innerHTML复触发DOMSubtreeModified事件，而获取editor的值还没有发生变化，会形成死循环
    });

    $('#editor').keypress(function(event) {
        // 获取当前节点信息和range范围
        var sel = window.getSelection()
        var range = sel.getRangeAt(0)
        var curNode = getCurNode()
        var parentNode = curNode.parentNode
        var blockNode = getBlockContainer()
        var innerHTML = $(parentNode).html()

        // console.log(curNode.nodeName);
        // console.log(parentNode.nodeName);

        if (event.key == ' ') {
            // 触发标题块markdown语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && innerHTML in titleTagMap) {
                event.preventDefault()  
                var tag = 'h' + innerHTML.length
                var html = '<' + tag + '>' + '<br/></' + tag + '>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
                return
            }

            // 触发引用块markdown语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && innerHTML == '&gt;') {
                event.preventDefault()
                var html = '<blockquote><p><br></p></blockquote>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
                return
            }

            // 触发列表块markdown语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && (innerHTML == '1.' || innerHTML == '*' || innerHTML == '-') ) {
                event.preventDefault()
                var html = innerHTML == '1.' ? '<ol><li><br/></li></ol>' : '<ul><li><br/></li></ul>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
                return
            }

            // 触发水平线markdown语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && (innerHTML == '--')) {
                event.preventDefault()
                var html = '<hr contenteditable="false" /><p><br><p>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode.nextSibling)
                $(parentNode).remove()
                return
            }
        }

        if (event.key == 'Enter') {
            // 触发表格markdown语法
            var pat = /^\|(([^\|]+)\|)+$/
            if (pat.test(innerHTML)) {
                event.preventDefault()
                var titles = innerHTML.substr(1, innerHTML.length - 2)
                var titles = titles.split('|')
                var html = createTableHtml(titles)
                $(parentNode).after(html)
                makeTableResizeable(parentNode.nextSibling)
                setCursor(parentNode.nextSibling.firstChild.firstChild.nextSibling)
                $(parentNode).remove()
                return
            }

            // 表格换行时，进入下一个段落
            console.log(curNode.nodeName)
            if (curNode == editor || curNode.nodeName == 'TD') {
                event.preventDefault()
                var p = document.createElement("p")
                p.appendChild(document.createElement('br'))
                range.insertNode(p)
                setCursor(p)
                return
            }

            // 换行时先清除字体格式(粗体、下划线、斜体)
            var parents = $(curNode).parentsUntil(blockNode)
            var fontTags = {
                'U' : 'underline',
                'I' : 'italic',
                'B' : 'bold',
            }
            for (var i = 0; i < parents.length; i++) {
                parent = parents[i]
                if (parent.tagName in fontTags) {
                    document.execCommand(fontTags[parent.tagName], false, false)
                }
            }

            // 标题块换行后进入段落块
            if (blockNode && titleTagName.indexOf(blockNode.tagName) >= 0) {
                event.preventDefault()
                $(blockNode).after('<p><br></p>')
                setCursorAfterNode(blockNode)
                return
            }

            // 在引用块最后一个空行后换行，退出引用块
            if (curNode.tagName == 'P' && parentNode.tagName == 'BLOCKQUOTE' && parentNode.lastChild == curNode && range.startOffset == 0) {
                event.preventDefault()
                parentNode.removeChild(curNode)
                $(parentNode).after('<p><br></p>')
                setCursorAfterNode(parentNode)
                return
            }    

            // 在列表最后一个空行后换行，退出列表
            if (curNode.tagName == 'LI' && (parentNode.tagName == 'OL' || parentNode.tagName == 'UL') && parentNode.lastChild == curNode && range.startOffset == 0) {
                event.preventDefault()
                parentNode.removeChild(curNode)
                $(parentNode).after('<p><br></p>')
                setCursorAfterNode(parentNode)
                return
            } 

        }
    })
})