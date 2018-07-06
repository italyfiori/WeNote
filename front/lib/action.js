var dom = require(rootpath + '/front/lib/dom.js')

function addActions() {
    var editor = dom.getEditor()
    $(editor).keypress(function(e)) {

    }
}

function getAction(key) {
    var selection = window.getSelection()
    if(selection.rangeCount !== 1) {
        return null
    }
    var range      = selection.getRangeAt(0)
    var curNode    = range.startContainer
    var parentNode = curNode.parentNode
    var blockNode  = getBlockContainer()
    var innerHTML  = $(parentNode).html()
}

function tableAction() {

}

function titleAction() {

}

function codeAction() {

}

function
