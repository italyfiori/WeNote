var dom             = require(rootpath + '/front/lib/dom.js')
var state           = require(rootpath + '/front/lib/state.js')
var Undoo           = require('undoo')
const {ipcRenderer} = require('electron')

function setUndo() {
    var editor    = dom.getEditor()
    var history   = new Undoo();
    var blocked   = false;
    var blockOut  = false
    var blockTime = 1000
    history.clear()

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function (mutations) {
        if(blocked || blockOut){
            blocked = false;
            return;
        }
        var html  = editor.innerHTML;
        var range = dom.getRange()
        console.log(range);
        history.save({'html': html, 'range': range})

        // 暂停
        blockOut = true
        setTimeout(function() {
            blockOut = false
        }, blockTime)
    });

    observer.observe(editor, {
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    });

    ipcRenderer.on('undo', function() {
        history.undo((item) => {
            if (item.html) {
                editor.innerHTML = item.html
                dom.resetRange(item.range)
                blocked = true
                state.clean()
                state.init()
            }
        })
    })

    ipcRenderer.on('redo', function() {
        history.redo((item) => {
            if (item.html) {
                editor.innerHTML = item.html
                dom.resetRange(item.range)
                blocked = true
                state.clean()
                state.init()
            }
        })
    })
}

exports.setUndo = setUndo
