var util    = require(rootpath + '/front/lib/util.js')
var table   = require(rootpath + '/front/lib/table.js')
var history = require(rootpath + '/front/lib/history.js')
var paste   = require(rootpath + '/front/lib/paste.js')
var undo    = require(rootpath + '/front/lib/undo.js')
var view    = require(rootpath + '/front/lib/view.js')
var link    = require(rootpath + '/front/lib/link.js')
var message = require(rootpath + '/front/lib/message.js')
var language = require(rootpath + '/front/lib/language.js')
var format_event = require(rootpath + '/front/lib/format_event.js')

function init() {
    util.addStringFormat()
    table.setTableAction()
    history.setHistoryAction()
    paste.setPasteImage()
    undo.setUndo()
    view.setView()
    link.setLinkDialogEvent()
    format_event.setEvent()

    // 获取本地语言
    message.send('get_locale', {}, function(response) {
        language.setLocale(response.data.locale)
    })

    // 禁止缩放
    var webFrame = require('electron').webFrame
    webFrame.setZoomLevelLimits(1, 1);
}

module.exports = init
