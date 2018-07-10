var util    = require(rootpath + '/front/lib/util.js')
var table   = require(rootpath + '/front/lib/table.js')
var history = require(rootpath + '/front/lib/history.js')

function init() {
    util.addStringFormat()
    table.setTableAction()
    history.setHistoryAction()
}

module.exports = init
