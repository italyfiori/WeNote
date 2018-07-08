const path = require('path')
const fs = require('fs')
var crypto = require('crypto');
const rootpath = path.dirname(path.dirname(__dirname))
const util = require(path.join(rootpath, 'server/lib/util'))
const {
    ipcMain,
    shell
}              = require('electron')

function getFileSaveDir(note_id) {
    return path.join(rootpath, 'data', 'files', String(note_id))
}

function getFilePath(note_id, file_name) {
    return path.join(rootpath, 'data', 'files', String(note_id), file_name)
}

function getFileUrl(note_id, file_name) {
    return path.join('data', 'files', String(note_id), file_name)
}

function getBufferMd5(buffer) {
    var hash = crypto.createHash('md5');
    hash.update(buffer);
    return hash.digest('hex');
}

function init() {
    // 保存节点
    ipcMain.on('open_file_link', (event, req) => {
        var file_url = req.data.file_url
        if (!fs.existsSync(file_url)) {
            console.warn('file not exists, ' + file_url)
            return
        }
        shell.openItem(file_url);
        var payload = util.makeResult(req)
        event.sender.send('open_file_link', payload)
    })

    // 保存节点
    ipcMain.on('drag_file', (event, req) => {
        var note_id = req.data.note_id
        var save_dir = getFileSaveDir(note_id)
        if (!fs.existsSync(save_dir)) {
            fs.mkdirSync(save_dir)
        }

        var src_file = req.data.file_path
        var file_name = path.basename(src_file)
        var dst_file = getFilePath(note_id, file_name)
        fs.createReadStream(src_file).pipe(fs.createWriteStream(dst_file));

        var file_url = getFileUrl(note_id, file_name)
        var data = {
            file_url: file_url,
            file_name: file_name,
        }
        var response = util.makeResult(req, data)
        event.sender.send('drag_file', response)
    })

    // 接收文件数据
    ipcMain.on('save_image', (event, req) => {
        if (!Buffer.isBuffer(req.data.buffer)) {
            console.error('data is not buffer, ' + req.message_id)
            return
        }

        var note_id = req.data.note_id
        var image_dir = path.join(rootpath, 'data', 'images', String(note_id))
        if (!fs.existsSync(image_dir)) {
            fs.mkdirSync(image_dir);
        }

        var buffer = req.data.buffer
        var buffer_md5 = getBufferMd5(buffer)
        var file_name = buffer_md5 + '.png'
        var file_path = path.join(image_dir, '', file_name)
        fs.writeFile(file_path, buffer, {}, (err, res) => {
            if (err) {
                console.error('write file error:' + err);
                return
            }
            var payload = {
                'code': 0,
                'message_id': req.message_id,
                'image_url': path.join('data', 'images', String(note_id), file_name),
            }
            event.sender.send('save_image', payload)
        })
    })

}

exports.init = init