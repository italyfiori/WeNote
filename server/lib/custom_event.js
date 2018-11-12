const {
    app,
    ipcMain,
    shell,
    dialog
}               = require('electron')
const path      = require('path')
const fs        = require('fs')
const crypto    = require('crypto');
const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const data_path = util.getDataPath()

const FILE_TYPE_NORMAL = 'files'
const FILE_TYPE_IMAGE  = 'images'
const MAX_FILE_SIZE    = 1000000000;

function getFileSaveDir(note_id) {
    return path.join(data_path, 'data', FILE_TYPE_NORMAL, String(note_id))
}

function getFilePath(note_id, file_name, file_type) {
    var data_path = util.getDataPath()
    return path.join(data_path, 'data', file_type, String(note_id), file_name)
}

function getFileUrl(note_id, file_name, file_type) {
    return path.join('data', file_type, String(note_id), file_name)
}

function getBufferMd5(buffer) {
    var hash = crypto.createHash('md5');
    hash.update(buffer);
    return hash.digest('hex');
}

function getFileMd5(file_path) {
	var buffer = fs.readFileSync(file_path)
    return getBufferMd5(buffer)
}

function getImgPath(note_id, file_name) {
    var data_path = util.getDataPath()
    return path.join(data_path, 'data', FILE_TYPE_IMAGE, String(note_id), file_name)
}

function saveFile(req, note_id, src_file, file_type) {
    // 检查文件是否存在
    if (!fs.existsSync(src_file)) {
        response = util.makeCommonResult(req, -1, '文件不存在!')
    } else if (fs.statSync(src_file).isDirectory()) {
        // 文件大小超过限制
        response = util.makeCommonResult(req, -1, '不支持文件夹或包上传!')
    } else if (fs.statSync(src_file).size > MAX_FILE_SIZE) {
        // 文件大小超过限制
        response = util.makeCommonResult(req, -1, '文件大小超过100M!')
    }

    var file_name = path.basename(src_file)
    if (file_type == FILE_TYPE_IMAGE) {
        var md5 = getFileMd5(src_file)
        file_name = md5 + path.extname(src_file)
    }
    var dst_file  = getFilePath(note_id, file_name, file_type)
    var file_url  = getFileUrl(note_id, file_name, file_type)

    var data = {
        file_url: dst_file,
        file_name: file_name,
    }
    var response = util.makeResult(req, data)

    if (src_file != dst_file) {
        // 拷贝文件
        util.mkdirs(path.dirname(dst_file))
        fs.createReadStream(src_file).pipe(fs.createWriteStream(dst_file));
    }

    return response
}

function saveImageFile(req, note_id, src_file) {
    var file_name = path.basename(src_file)
    var dst_file  = getImgPath(note_id, file_name)
    var file_url  = getImgU(note_id, file_name)

    var data = {
        file_url: file_url,
        file_name: file_name,
    }
    var response = util.makeResult(req, data)

    // 检查文件是否存在
    if (!fs.existsSync(src_file)) {
        response = util.makeCommonResult(req, -1, '文件不存在!')
    } else if (fs.statSync(src_file).isDirectory()) {
        // 文件大小超过限制
        response = util.makeCommonResult(req, -1, '不支持文件夹或包上传!')
    } else if (fs.statSync(src_file).size > MAX_FILE_SIZE) {
        // 文件大小超过限制
        response = util.makeCommonResult(req, -1, '文件大小超过100M!')
    } else if (src_file != dst_file) {
        // 拷贝文件
        util.mkdirs(path.dirname(dst_file))
        fs.createReadStream(src_file).pipe(fs.createWriteStream(dst_file));
    }
}

function init() {
    // 打开文件
    ipcMain.on('open_file_link', (event, req) => {
        var file_url  = req.data.file_url
        if (!fs.existsSync(file_url)) {
            dialog.showErrorBox('文件不存在!',  '文件不存在:' + file_url)
            return
        }
        shell.openItem(file_url);
        var payload = util.makeResult(req)
        event.sender.send('open_file_link', payload)
    })

    // 拖拽文件上传
    ipcMain.on('drag_file', (event, req) => {
        var note_id = req.data.note_id
        var save_dir = getFileSaveDir(note_id)
        if (!fs.existsSync(save_dir)) {
            fs.mkdirSync(save_dir)
        }

        var src_file  = req.data.file_path
        var response  = saveFile(req, note_id, src_file, FILE_TYPE_NORMAL)
        event.sender.send('drag_file', response)
    })

    // 接收文件数据
    ipcMain.on('save_image', (event, req) => {
        if (!Buffer.isBuffer(req.data.buffer)) {
            console.error('data is not buffer, ' + req.message_id)
            return
        }

        var note_id    = req.data.note_id
        var image_dir  = path.join(data_path, 'data', FILE_TYPE_IMAGE, String(note_id))
        var buffer     = req.data.buffer
        var buffer_md5 = getBufferMd5(buffer)
        var file_name  = buffer_md5 + '.png'
        var file_path  = path.join(image_dir, '', file_name)
        util.mkdirs(path.dirname(file_path))
        fs.writeFile(file_path, buffer, {}, (err, res) => {
            if (err) {
                console.error('write file error:' + err);
                return
            }
            var payload = {
                'code': 0,
                'message_id': req.message_id,
                'image_url': getImgPath(note_id, file_name),
            }
            event.sender.send('save_image', payload)
        })
    })

    // 获取当前所在地
    ipcMain.on('get_locale', (event, req) => {
        var locale = app.getLocale()
        var payload = util.makeResult(req, {'locale': locale})
        event.sender.send('get_locale', payload)
    })

    // 上传文件
    ipcMain.on('upload_file', (event, req) => {
        dialog.showOpenDialog({properties: ['openFile']}, function(filePaths) {
            if (filePaths && filePaths.length == 1) {
                var src_file  = filePaths[0]
                var note_id   = req.data.note_id
                var response  = saveFile(req, note_id, src_file, FILE_TYPE_NORMAL)
                event.sender.send('upload_file', response)
            }
        })
    })

    ipcMain.on('upload_image', (event, req) => {
        var options = {
            properties: ['openFile'],
            filters: [{name: FILE_TYPE_IMAGE, extensions: ['jpg', 'png', 'gif', 'jpeg']}]
        }
        dialog.showOpenDialog(options, function(filePaths) {
            if (filePaths && filePaths.length == 1) {
                var src_file  = filePaths[0]
                var note_id   = req.data.note_id
                var response  = saveFile(req, note_id, src_file, FILE_TYPE_IMAGE)
                event.sender.send('upload_image', response)
            }
        })
    })


}

exports.init = init
