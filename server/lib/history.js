const {
    ipcMain,
}                  = require('electron')
const path         = require('path')
const fs           = require('fs')
const striptags    = require('striptags');
const rootpath     = path.dirname(path.dirname(__dirname))
const text_history = require(path.join(rootpath, 'server/lib/text_history'))
const util         = require(path.join(rootpath, 'server/lib/util'))
const data_path    = util.getDataPath()

// 解析note历史版本信息
function parse_history_content(history_content) {
    try {
        var history = new text_history()
        var rows = history_content.split('\n')
        for (var i = 0; i < rows.length; i++) {
            var row = JSON.parse(rows[i])
            if (!row.patches || !row.time) {
                return history
            }
            history.patchesList.push(row.patches)
            history.timeList.push(row.time)
            history.sizeList.push(row.size || 0)
        }
    } catch (err) {
        console.error('parse history error:' + err)
    }

    return history
}

// 获取note历史版本信息
function get_history(note_id) {
    var file_path = get_history_path(note_id)
    if (!fs.existsSync(file_path)) {
        return new text_history()
    }

    var history_content = fs.readFileSync(file_path, 'utf8')
    return parse_history_content(history_content)

}

// 添加note历史版本信息
function append_history(note_id, new_cont) {
    var history = get_history(note_id)
    var patches = history.getPatches(new_cont)
    if (patches.length == 0) {
        console.warn('note has not change:' + String(note_id))
        return
    }

    var file_path = get_history_path(note_id)
    var version_cont = JSON.stringify({'time': Date.now(), 'size': striptags(new_cont).length, 'patches': patches})
    if (fs.existsSync(file_path)) {
        version_cont = "\n" + version_cont
    }

    fs.appendFileSync(file_path, version_cont)
}

function get_version_list(note_id) {
    var history = get_history(note_id)
    var time_list = history.timeList
    var size_list = history.sizeList

    var version_list = []
    for (let i = time_list.length - 1; i >= 0; i--) {
        version_list.push({id: i, time: time_list[i], size: size_list[i]})
    }
    return version_list
}

function get_version(note_id, version_id) {
    var history = get_history(note_id)
    return history.getVersion(version_id)
}

function get_history_path(note_id) {
    return path.join(data_path, 'data', 'notes', note_id + '.history')
}


function init() {
    ipcMain.on('get_version_list', (event, req) => {
        if(req.data.id >= 0) {
            var note_id = req.data.id
            var history_list = get_version_list(note_id)
            event.sender.send('get_version_list', util.makeResult(req, history_list))
        }
    })

    ipcMain.on('recover_version', (event, req) => {
        if(req.data.note_id >= 0 && req.data.version_id >= 0) {
            var note_id = req.data.note_id
            var version_id = req.data.version_id
            var version = get_version(note_id, parseInt(version_id))
            version = util.addImgPrefix(version)
            event.sender.send('recover_version', util.makeResult(req, version))
        }
    })
}

exports.init           = init
exports.append_history = append_history
