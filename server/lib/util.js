const path = require('path')
const os   = require('os')
const fs   = require('fs')

function makeResult(req, data = {}) {
    var payload = {
        code: 0,
        msg: 'success',
        message_id: req.message_id,
        data: data
    }
    return payload
}

function makeCommonResult(req, code, msg, data = null) {
    var payload = {
        code: code,
        msg: msg,
        message_id: req.message_id,
        data: data,
    }
    return payload
}

function getDataPath() {
    var homedir = os.homedir()
    return path.join(homedir, 'Library/Mobile Documents/com~apple~CloudDocs/marknote/') + '/'
}

// 读取文档时增加路径前缀
function addImgPrefix(content) {
    var pattern   = new RegExp('src="(data/images/\\d+/[^"]*?)"', 'g')
    var data_path = getDataPath()
    var replace   = 'src="' + data_path + '$1"'
    var result    = content.replace(pattern, replace)

    var pattern   = new RegExp('<a class="file" href="' + '[^"]*?' + '(data/files/\\d+/[^"]*?)"', 'g')
    var data_path = getDataPath()
    var replace   = '<a class="file" href="' + data_path + '$1"'

    return result.replace(pattern, replace)
}

// 保存文档时去除路径前缀
function trimImgPrefix(content) {
    var data_path = getDataPath()
    var pattern   = new RegExp('src="' +  '[^"]*?' + '(data/images/\\d+/[^"]*?)"', 'g')
    var replace   = 'src="$1"'
    var result    = content.replace(pattern, replace)

    var pattern   = new RegExp('<a class="file" href="' +  '[^"]*?' + '(data/files/\\d+/[^"]*?)"', 'g')
    var replace   = '<a class="file" href="$1"'

    return result.replace(pattern, replace)
}

// 递归创建目录
function mkdirs(dir_path, model = 0777) {
    // 目录已经存在，则返回
    if (fs.existsSync(dir_path)) {
        return true
    }
    // 目录不存在, 则先创建父目录
    if (!fs.existsSync(path.dirname(dir_path))) {
        mkdirs(path.dirname(dir_path), model)
    }
    fs.mkdirSync(dir_path, model)
    return true
}

// 删除路径
function delete_path(file_path) {
    // 路径不存在
    if (!fs.existsSync(file_path)) {
        return
    }

    // 文件直接删除
    if (fs.statSync(file_path).isFile()) {
        fs.unlinkSync(file_path)
        return
    }

    // 删除所有子节点
    if (fs.statSync(file_path).isDirectory()) {
        fs.readdirSync(file_path).forEach(function (name, index) {
            delete_path(path.join(file_path, name));
        })
        fs.rmdirSync(file_path);
    }
};


exports.makeResult       = makeResult
exports.addImgPrefix     = addImgPrefix
exports.trimImgPrefix    = trimImgPrefix
exports.getDataPath      = getDataPath
exports.mkdirs           = mkdirs
exports.delete_path      = delete_path
exports.makeCommonResult = makeCommonResult
