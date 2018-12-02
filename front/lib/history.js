const {ipcRenderer} = require('electron')
var message         = require(rootpath + '/front/lib/message.js')
var dom             = require(rootpath + '/front/lib/dom.js')
var state           = require(rootpath + '/front/lib/state.js')
var util            = require(rootpath + '/front/lib/util.js')
var language        = require(rootpath + '/front/lib/language.js')

var MODAL_TEXT = language.getLanguage().modal

function createHistoryTable(version_list) {
    var html  = '<table class="table table-bordered table-hover">'
    html     += '<tr><th>{version_id}</th><th>{version_time}</th><th>{version_size}</th><th>{version_operation}</th></tr>'.format(MODAL_TEXT)
    for (i in version_list) {
        var version = version_list[i]
        var data = {
            id:   version.id + 1,
            time: util.ts2time(version.time),
            size: String(version.size).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
            op:   '<a class="version" href="">{version_recover}</a>'
        }
        html += '<tr><td>{id}</td><td>{time}</td><td>{size}</td><td>{op}</td></tr>'.format(data).format(MODAL_TEXT)
    }
    html += '</table>';
    return html
}

function setHistoryAction() {
    ipcRenderer.on('history_action', function () {
        var note_id = editor.getAttribute('note_id')
        if (!note_id) {
            console.warn('no note selected')
            return
        }
        var payload = {'id': note_id}

        message.send('get_version_list', payload, function (response) {
            var html = createHistoryTable(response.data)
            $('#version_list_body').html(html)
            $('#version_list').modal()

            $('a.version').unbind()
            $('a.version').click(function () {
                var version_id = $(this).parents('tr')[0].firstChild.innerHTML - 1
                var payload    = {note_id: note_id, version_id: version_id}
                message.send('recover_version', payload, function(response) {
                    state.clean()
                    editor.innerHTML = response.data
                    $('#version_list').modal('hide')
                    state.init()
                })
                return false
            })
        })
    })
}

exports.setHistoryAction = setHistoryAction
