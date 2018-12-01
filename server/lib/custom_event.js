const {
    app,
    ipcMain,
    shell,
    dialog
}               = require('electron')
const path      = require('path')
const fs        = require('fs')
const crypto    = require('crypto');
const tar       = require('tar')

const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const language  = require(path.join(rootpath, 'server/lib/language'))

const data_path = util.getDataPath()

const FILE_TYPE_NORMAL = 'files'
const FILE_TYPE_IMAGE  = 'images'
const MAX_FILE_SIZE    = 100000000;
const ALERTS   = language.getLanguage().alerts

var backup_running = false;

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
    var response = util.makeResult(req, {})
    if (!fs.existsSync(src_file)) {
        // 检查文件是否存在
        return util.makeCommonResult(req, -1, ALERTS.FILE_NOT_EXISTS)
    } else if (fs.statSync(src_file).isDirectory()) {
        // 不支持文件夹上传
        return util.makeCommonResult(req, -1, ALERTS.NOT_SUPPORT_FOLDER_UPLOAD )
    } else if (fs.statSync(src_file).size > MAX_FILE_SIZE) {
        // 文件大小超过限制
        return util.makeCommonResult(req, -1, ALERTS.FILE_OVER_SIZE)
    } else {
        var file_name = path.basename(src_file)
        if (file_type == FILE_TYPE_IMAGE) {
            var md5 = getFileMd5(src_file)
            file_name = md5 + path.extname(src_file)
        }
        var dst_file  = getFilePath(note_id, file_name, file_type)
        var file_url  = getFileUrl(note_id, file_name, file_type)
        if (src_file != dst_file) {
            // 拷贝文件
            util.mkdirs(path.dirname(dst_file))
            fs.createReadStream(src_file).pipe(fs.createWriteStream(dst_file));
        }

        var data = {
            file_url: dst_file,
            file_name: file_name,
        }
        return util.makeResult(req, data)
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
        response = util.makeCommonResult(req, -1, ALERTS.FILE_NOT_EXISTS)
    } else if (fs.statSync(src_file).isDirectory()) {
        // 不支持文件夹上传
        response = util.makeCommonResult(req, -1, ALERTS.NOT_SUPPORT_FOLDER_UPLOAD)
    } else if (fs.statSync(src_file).size > MAX_FILE_SIZE) {
        // 文件大小超过限制
        response = util.makeCommonResult(req, -1, ALERTS.FILE_OVER_SIZE)
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
            var response = util.makeCommonResult(req, -1, ALERTS.FILE_NOT_EXISTS)
            return event.sender.send('open_file_link', response)
        }

        shell.openItem(file_url);
        var response = util.makeResult(req)
        event.sender.send('open_file_link', response)
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
            var response = util.makeCommonResult(req, -1, ALERTS.UPLOAD_NOT_BUFFER)
            return event.sender.send('save_image', response)
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
                var response = util.makeCommonResult(req, -1, ALERTS.SAVE_IMAGE_FAILED)
                return event.sender.send('save_image', response)
            }

            var response = util.makeResult(req, {'image_url': getImgPath(note_id, file_name)})
            event.sender.send('save_image', response)
        })
    })

    // 获取当前所在地
    ipcMain.on('get_locale', (event, req) => {
        var locale = app.getLocale()
        var response = util.makeResult(req, {'locale': locale})
        event.sender.send('get_locale', response)
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

    // 获取当前所在地
    ipcMain.on('backup_notes', (event, req) => {
        // 正在备份中
        if (backup_running) {
            response = util.makeCommonResult(req, -1, ALERTS.SYS_SAVING_BACKUP)
            return event.sender.send('backup_notes', response)
        }

        util.initDir()

        backup_running = true
        var tar_file = path.join(data_path, 'backup', (new Date()).Format("yyyyMMddhhmmss") + '.tar.gz')

        tar.c({
            gzip: true,
            file: tar_file,
            cwd: data_path,
        }, ['data']).then(_ => {
            backup_running = false
            var response   = util.makeResult(req, {file_path : tar_file})
            event.sender.send('backup_notes', response)
        })
    })

}

exports.init = init
