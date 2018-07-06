var dom = require(rootpath + '/front/lib/dom.js')

// 切换到编辑器模式
function switch2editor() {
    var editor    = dom.getEditor()
    var container = dom.getEditorContainer()
    var notice    = dom.getNotice()
    if (container.style.display != "block") {
        container.style.display = "block";
    }
    if (notice.style.display != "none") {
        notice.style.display = "none";
    }
}



exports.switch2editor = switch2editor
