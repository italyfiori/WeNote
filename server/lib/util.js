const path      = require('path')

function makeResult(req, data = {}) {
    var payload = {
        code: 0,
        msg: 'success',
        message_id: req.message_id,
        data: data
    }
    return payload
}

function getDataPath() {
    return '/Users/louis/Documents/marknote/'
}

// 增加路径前缀
function addImgPrefix(content) {
    var pattern   = new RegExp('src="(data/images/\\d+/\\w+.\\w+)"', 'g')
    var data_path = getDataPath()
    var replace   = 'src="' + data_path + '$1"'
    return content.replace(pattern, replace)
}

// 去除路径前缀
function trimImgPrefix(content) {
    var data_path = getDataPath()
    var pattern   = new RegExp('src="' +  data_path + '(data/images/\\d+/\\w+.\\w+)"', 'g')
    var replace   = 'src="$1"'
    return content.replace(pattern, replace)
}

exports.makeResult    = makeResult
exports.addImgPrefix  = addImgPrefix
exports.trimImgPrefix = trimImgPrefix
exports.getDataPath   = getDataPath
