var util    = require(rootpath + '/front/lib/util.js')
var table   = require(rootpath + '/front/lib/table.js')
var history = require(rootpath + '/front/lib/history.js')
var paste   = require(rootpath + '/front/lib/paste.js')
var undo    = require(rootpath + '/front/lib/undo.js')
var view    = require(rootpath + '/front/lib/view.js')

function init() {
    util.addStringFormat()
    table.setTableAction()
    history.setHistoryAction()
    paste.setPasteImage()
    undo.setUndo()
    view.setView()
}

module.exports = init
