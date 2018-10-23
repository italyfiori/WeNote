var jquery = jQuery = $ = require('jquery')

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

exports.setLinkDialogEvent = setLinkDialogEvent
