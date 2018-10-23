var jquery = jQuery = $ = require('jquery')
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

exports.setLinkDialogEvent = setLinkDialogEvent
exports.setLinkClickEvent = setLinkClickEvent
