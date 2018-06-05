$(document).ready(function () {

    $('#editor').bind('keyup focus click', function () {
        var block = getBlockContainer()
        var source = $('pre.source')
        // 离开代码块加高亮
        if (source.length > 0 && source[0] != block) {
            $(source[0]).addClass('highlight')
            $(source[0]).removeClass('source')
            hljs.highlightBlock(source[0]);
            console.debug(source[0].innerText + ' highlight')
        }

        // 进入代码块取消高亮
        if (block && block.nodeName == "PRE" && $(block).hasClass('highlight')) {
            $(block).addClass('source')
            $(block).removeClass('highlight')
            block.innerText = block.innerText
            console.debug(block.innerText + ' unhighlight')
        }

    })

    // 获取菜单
    sendMessage('get_menu', {}, function (data) {
        var menu = {
            "core": {
                'check_callback': true,
                'multiple': false,
                'data': data.menu
            },
            "plugins": ["wholerow", "dnd", "contextmenu"],
            "types": {
                "default": {
                    "icon": false  // 删除默认图标
                },
            },
        };

        $('#menu-tree').jstree(menu)

        // 创建节点
        $('#menu-tree').on('create_node.jstree', function (e, data) {
            var node = data
            var payload = {
                'parent_id': data.node.parent == '#' ? 0 : data.node.parent,
                'title': data.node.text,
            }
            console.log(data)
            sendMessage('create_node', payload, function (data) {
                console.log(data)
                $('#menu-tree').jstree('set_id', node.node, data.note_id)
            })
        })

        // 删除节点
        $('#menu-tree').on('delete_node.jstree', function (e, data) {
            sendMessage('delete_node', {'id': data.node.id}, function (data) {
                // console.log(data)
            })
        })

        // 修改标题节点
        $('#menu-tree').on('rename_node.jstree', function (e, data) {
            var note_id = data.node.id
            var title = data.node.text
            var payload = {'id': note_id, 'title': title}
            console.log('**rename_node**')
            console.log(data)
            sendMessage('rename_node', payload, function (data) {
                console.log(data)
            })
        })

        // 拖拽节点
        $('#menu-tree').bind('move_node.jstree', function (e, data) {
            var note_id = data.node.id
            var parent_id = data.node.parent == '#' ? 0 : data.node.parent
            var payload = {'id': note_id, 'parent': parent_id}
            console.log(payload)
            sendMessage('move_node', payload, function (data) {
                console.log(data)
            })
        })

        // 获取节点
        $('#menu-tree').on('select_node.jstree', function (e, data) {
            save_note()
            var note_id = data.node.id
            var container = document.getElementById("editor-container");
            var notice = document.getElementById("notice");
            if (container.style.display != "block") {
                container.style.display = "block";
            }
            if (notice.style.display != "none") {
                notice.style.display = "none";
            }

            console.log(data)
            sendMessage('get_node', {'id': note_id}, function (data) {
                var editor = document.getElementById('editor')
                var title = document.getElementById('title-input')
                var content = data.content ? data.content : '<p><br/></p>'
                editor.setAttribute('note_id', note_id)
                editor.innerHTML = content
                setCursor(editor)
                $('img').click(function () {
                    console.log(this)
                    selectNode(this)
                })
            })
        })

    })

    // 保存节点
    function save_note() {
        var editor = document.getElementById('editor')
        var note_id = editor.getAttribute('note_id')
        if (note_id) {
            var content = editor.innerHTML
            var payload = {'id': note_id, 'content': content}
            console.log(payload)
            sendMessage('save_node', payload, function (data) {
                console.log(data)
            })
        } else {
            console.log('未选中笔记')
        }
    }

    // 保存笔记
    ipcRenderer.on('save', function () {
        save_note()
    })

    // 标题输入框获取光标
    // $('#editor').focus()

    // 失去焦点时记录光标位置
    var lastRange = null
    $('#editor').blur(function () {
        var range = getRange()
        if (range) {
            lastRange = range.cloneRange()
        }
        return true
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

    // 调整编辑区的内容格式
    function adjustEditor() {
        // 编辑区内容被全部删除时，增加一个段落标签
        var childNodes = editor.childNodes
        if (childNodes.length == 0) {
            editor.innerHTML = '<p><br/></p>'
            setCursor(editor.children[0])
            return
        }

        // 标注文字后增加空格
        $('p a.code').parent().each(function() {
            var len = this.innerHTML.length
            if(this.innerHTML.slice(len -4, len) == '</a>') {
                $(this).append('&nbsp;')
            }
        })


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
    $('#editor').bind("DOMSubtreeModified", function () {
        setTimeout(function () {
            adjustEditor()
        }, 10); // 由于adjust函数中修改innerHTML复触发DOMSubtreeModified事件，而获取editor的值还没有发生变化，会形成死循环
    });

    $('#editor').keydown(function (event) {
        var sel = window.getSelection()
        var range = sel.getRangeAt(0)
        var blockNode = getBlockContainer()

        if (event.key == 'Backspace') {
            // 引用块回退删除
            if (range.startOffset == 0 && range.endOffset == 0) {
                if (blockNode.nodeName == 'P' && blockNode.parentNode.nodeName == 'BLOCKQUOTE') {
                    $(blockNode.parentNode).remove()
                    return false
                }
            }
        }
    })


    $('#editor').keypress(function (event) {


        // 获取当前节点信息和range范围
        var sel = window.getSelection()
        var range = sel.getRangeAt(0)
        var curNode = getCurNode()
        var parentNode = curNode.parentNode
        var blockNode = getBlockContainer()
        var innerHTML = $(parentNode).html()


        if (event.key == '*') {
            // 触发
            var offset = range.startOffset
            var text   = curNode.nodeValue
            if (text) {
                var start  = text.lastIndexOf('*')
                if (start >= 0 && offset - start > 1) {
                    var text = text.slice(start + 1, offset)
                    var html = '<a class="code">' + text + '</a>';
                    range.setStart(curNode, start)
                    range.setEnd(curNode, offset)
                    document.execCommand('insertHTML', false, html)
                    range.deleteContents()
                    event.preventDefault()
                    return
                }
            }
        }

        if (event.key == '$') {
            // 触发
            var offset = range.startOffset
            var text   = curNode.nodeValue
            if (text) {
                var start  = text.lastIndexOf('$$')
                if (start >= 0 && offset - start >= 4 && text.charAt(text.length - 1) == '$') {
                    var text = text.slice(start + 2, offset - 1)
                    var id   = 'math' + getRandomInt(100000)
                    var html = '<a class="math" id="' + id + '"> ' + text + '</a>';
                    console.log(html)
                    // MQ.StaticMath(problemSpan);
                    range.setStart(curNode, start)
                    range.setEnd(curNode, offset)
                    document.execCommand('insertHTML', false, html)
                    range.deleteContents()
                    event.preventDefault()
                    return
                }
            }
        }

        if (event.key == '`') {
            // 触发代码块
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && innerHTML == '``') {
                event.preventDefault()
                var html = '<pre class="source hljs"><br/></pre>';
                document.execCommand('insertHTML', false, html)
                $(parentNode).remove()
                return
            }
        }

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

            // 触发引用块语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && innerHTML == '&gt;') {
                event.preventDefault()
                var html = '<blockquote><p><br></p></blockquote>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
                return
            }

            // 触发列表块语法
            if (curNode.nodeName == '#text' && parentNode.tagName == 'P' && (innerHTML == '1.' || innerHTML == '*' || innerHTML == '-')) {
                event.preventDefault()
                var html = innerHTML == '1.' ? '<ol><li><br/></li></ol>' : '<ul><li><br/></li></ul>'
                $(parentNode).after(html)
                setCursorAfterNode(parentNode)
                $(parentNode).remove()
                return
            }

            // 触发水平线语法
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

            // 在表格里换行时，进入下一个段落
            if (curNode.nodeName == 'TD') {
                console.log('come here')
                event.preventDefault()
                var p = document.createElement("p")
                p.appendChild(document.createElement('br'))
                range.insertNode(p)
                setCursor(p)
                return
            }

            // 代码块换行
            if (blockNode && blockNode.nodeName == 'PRE') {
                var html = blockNode.innerHTML
                var last_index = html.lastIndexOf("\n")
                var html_length = html.length
                if (last_index < 0 || last_index != html_length - 1) {
                    document.execCommand('insertHTML', false, "\n")
                }
                document.execCommand('insertHTML', false, "\n")
                event.preventDefault()
                return
            }

            // 换行时先清除字体格式(粗体、下划线、斜体)
            var parents = $(curNode).parentsUntil(blockNode)
            var fontTags = {
                'U': 'underline',
                'I': 'italic',
                'B': 'bold',
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
                console.log('here')
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