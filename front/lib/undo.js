var dom             = require(rootpath + '/front/lib/dom.js')
var state           = require(rootpath + '/front/lib/state.js')
var Undoo           = require('undoo')
const {ipcRenderer} = require('electron')

var undo_history   = new Undoo();

function clear() {
    undo_history.clear()
}

function setUndo() {
    var editor         = dom.getEditor()
    var blocked        = false;
    var continousInput = false
    var blockTime      = 1000

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function (mutations) {
        if(blocked){
            blocked = false;
            return;
        }

        var html  = editor.innerHTML;
        var caret = dom.getCaret(editor)
        if (continousInput) {
            undo_history.undo((item) => {
                // 记录内容和光标
                undo_history.save({'html': html, 'caret': caret})
            })
        } else {
            // 记录内容和光标
            undo_history.save({'html': html, 'caret': caret})

            // 连续输入
            continousInput = true
            setTimeout(function() {
                continousInput = false
            }, blockTime)
        }
    });

    observer.observe(editor, {
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    });

    ipcRenderer.on('undo', function() {
        undo_history.undo((item) => {
            if (item.html) {
                editor.innerHTML = item.html
                blocked = true
                state.clean(false)
                state.init()
                dom.setCaret(editor, item.caret)
            }
        })
    })

    ipcRenderer.on('redo', function() {
        undo_history.redo((item) => {
            if (item.html) {
                editor.innerHTML = item.html
                blocked = true
                state.clean(false)
                state.init()
                dom.setCaret(editor, item.caret)
            }
        })
    })
}

exports.setUndo = setUndo
exports.clear   = clear
