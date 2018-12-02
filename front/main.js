// 设置根目录
const rootpath = __dirname

var jquery   = jQuery = $ = require('jquery')
var language = require(rootpath + '/front/lib/language.js')
var util     = require(rootpath + '/front/lib/util.js')
var table    = require(rootpath + '/front/lib/table.js')
var message  = require(rootpath + '/front/lib/message.js')
var link     = require(rootpath + '/front/lib/link.js')
var view     = require(rootpath + '/front/lib/view.js')

message.send('get_locale', {}, function(response) {
    // 文案初始化
    language.setLocale(response.data.locale)
    const MODAL_TEXT = language.getLanguage().modal

    // 加载其他库
    var undo         = require(rootpath + '/front/lib/undo.js')
    var menu         = require(rootpath + '/front/lib/menu.js')
    var history      = require(rootpath + '/front/lib/history.js')
    var paste        = require(rootpath + '/front/lib/paste.js')
    var format_event = require(rootpath + '/front/lib/format_event.js')

    // 初始化功能
    util.addStringFormat()
    table.setTableAction()
    history.setHistoryAction()
    paste.setPasteImage()
    undo.setUndo()
    view.setView()
    link.setLinkDialogEvent()
    format_event.setEvent()

    // 禁止缩放
    var webFrame = require('electron').webFrame
    webFrame.setZoomLevelLimits(1, 1);


    $(document).ready(function() {
        // 加载菜单
        menu.load_menu()

        // 弹窗文案
        for (var id in MODAL_TEXT) {
            if ($('#' + id).is("input")) {
                $('#' + id).attr('placeholder', MODAL_TEXT[id])
            } else {
                $('#' + id).text(MODAL_TEXT[id])
            }
        }
    })
})
