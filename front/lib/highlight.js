var dom  = require(rootpath + '/front/lib/dom.js')
var $    = require('jquery')

function setHighlight() {
    var editor = dom.getEditor()
    $(editor).bind('keyup focus click', function () {
        var curNode = dom.getCurNode()
        var block   = dom.getBlockParent(curNode)
        var source  = $('pre.source')

        // 离开代码块加高亮
        if (source.length > 0 && source[0] != block) {
            $(source[0]).addClass('highlight')
            $(source[0]).removeClass('source')
            hljs.highlightBlock(source[0]);
        }

        // 进入代码块取消高亮
        if (block && block.nodeName == "PRE" && $(block).hasClass('highlight')) {
            var startPosition = block.selectionStart;
            $(block).addClass('source')
            $(block).removeClass('highlight')
            block.innerText = block.innerText
        }
    })
}

exports.setHighlight = setHighlight
