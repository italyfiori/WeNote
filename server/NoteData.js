const fs = require('fs')
const path = require('path')
var TextHistory = require('text-history');

const base_path = path.dirname(__dirname);

// 获取note文件路径
function get_note_path(note_id) {
    return path.join(base_path, 'data', 'notes', note_id + '.html')
}

// 获取note历史数据
function get_history_path(note_id) {
    return path.join(base_path, 'data', 'notes', note_id + '.history')
}

// 获取note内容
function get_note(note_id) {
    var file_path = get_note_path(note_id)
    if (!fs.existsSync(file_path)) {
        console.warn('file not exists:' + String(file_path))
        return ''
    }
    return fs.readFileSync(file_path)
}

// 保存note
function save_note(note_id, file_cont) {
    var file_path = get_note_path(note_id)
    return fs.writeFileSync(file_path, file_cont)
}

// 解析note历史版本信息
function parse_history_content(history_content) {
    try {
        var history = new TextHistory()
        var rows = history_content.split('\n')    
        for (var i = 0; i < rows.length; i++) {
            var row = JSON.parse(rows[i])
            if(!row.patches || !row.time) {
                return history
            }
            history.patchesList.push(row.patches)
            history.timeList.push(row.time)
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
        return new TextHistory()
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
    var version_cont = JSON.stringify( {'time': Date.now(), 'patches': patches} )
    if (fs.existsSync(file_path)) {
        version_cont = "\n" + version_cont
    }
    
    fs.appendFileSync(file_path, version_cont)
}

exports.get_note = get_note
exports.save_note = save_note
exports.get_history = get_history
exports.append_history = append_history
