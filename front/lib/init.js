var util    = require(rootpath + '/front/lib/util.js')
var table   = require(rootpath + '/front/lib/table.js')
var history = require(rootpath + '/front/lib/history.js')
var paste   = require(rootpath + '/front/lib/paste.js')

function init() {
    util.addStringFormat()
    table.setTableAction()
    history.setHistoryAction()
    paste.setPasteImage()
}

module.exports = init
