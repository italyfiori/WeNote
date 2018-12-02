var dom         = require(rootpath + '/front/lib/dom.js')
var util        = require(rootpath + '/front/lib/util.js')
var jquery      = jQuery = $ = require('jquery')
const { shell } = require('electron')

function setLinkDialogEvent() {
	$('.close-button').click(function() {
		$(this).closest('.modal').modal('hide');
	})

	$('#link_input').on('shown.bs.modal', function() {
		$('#link_url').get(0).focus()
		$('#link_url').unbind()
		$('#link_url').on('input', function() {
			$('#link_text').val($('#link_url').val())
		})
	})
}

// link点击事件
function setLinkClickEvent() {
	$('a.link').unbind()
	$('a.link').click(function(event) {
        event.preventDefault()
        var href = $(this).attr('href')
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            href = 'http://' + href
        }
        shell.openExternal(href);
    })
}

// 插入链接
function insertLink(link_url, link_text, start, offset, range, caretPosition, deleteInput =false) {
    // 光标
    var editor = dom.getEditor()
	dom.setCaret(editor, caretPosition)

    // 插入连接
    var id   = 'link' + util.getRandomInt(100000)
    var html = '<a class="link" href="{0}" id="{1}">{2}</a>&nbsp;'.format(link_url, id, link_text)
    $('#link_url').val('')
    $('#link_text').val('')
    document.execCommand('insertHTML', false, html)

    // 执行insertHTML后curNode会变化
    curNode         = range.startContainer
    var block       = dom.getBlockParent(curNode)
    block.innerHTML = block.innerHTML.replace(/<span style="background-color: transparent;">(.*?)<\/span>/g, '$1')

	var ele = document.getElementById(id)
	if (!ele) {
		console.error('插入链接失败!');
		return false
	}
	if (deleteInput) {
		// 删除输入的文本
	    var node = ele.previousSibling
	    range.setStart(node, start)
	    range.setEnd(node, offset)
	    range.deleteContents()
	}

    // 设置光标位置
	if (ele.nextSibling) {
		range.setStart(ele.nextSibling, 1)
	    range.collapse(true)
	    var selection = window.getSelection()
	    selection.removeAllRanges()
	    selection.addRange(range)
	}

    // 设置链接点击
    setLinkClickEvent()
}

exports.setLinkDialogEvent = setLinkDialogEvent
exports.setLinkClickEvent  = setLinkClickEvent
exports.insertLink         = insertLink
