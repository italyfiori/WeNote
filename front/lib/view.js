const {ipcRenderer} = require('electron')

function setView() {
	var side_menu     = document.getElementById("side-menu")
	var main_content  = document.getElementById("main-content")
	var side_width    = side_menu.style.width
	var hidden_switch = false
	ipcRenderer.on('hidden_side', function () {
		hidden_switch = !hidden_switch
		if (hidden_switch) {
			side_width              = side_menu.style.width
			side_menu.style.width   = 0
			main_content.style.left = 0
		} else {
			side_menu.style.width   = side_width
			main_content.style.left = side_width
		}
	})
}

exports.setView = setView
