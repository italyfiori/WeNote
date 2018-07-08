var util  = require(rootpath + '/front/lib/util.js')
var table = require(rootpath + '/front/lib/table.js')

function init() {
    util.addStringFormat()
    table.setTableAction()
}

module.exports = init
