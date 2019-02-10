const fs        = require('fs')
const path      = require('path')
const async     = require('async')
const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const sqlite3   = require('sqlite3-offline-darwin')
const data_path = util.getDataPath()
const db_file   = path.join(data_path, 'data/db/wiki.db')

// 创建数据库
function initDB() {
    if (!fs.existsSync(db_file)) {
        // 创建文件夹
        if(!util.mkdirs(path.dirname(db_file))) {
            console.error('create db path failed!');
            return
        }

        util.initDir()

        var manual_dir = path.join(path.dirname(__dirname), 'manual')
        var documents = [{
            name: '1 简介',
            path: path.join(manual_dir, 'intro.html'),
        },
        {
            name: '2 文档操作',
            path: path.join(manual_dir, 'operation.html'),
        },
        {
            name: '3 文档管理',
            path: path.join(manual_dir, 'document.html'),
        },
        {
            name: '4 历史版本',
            path: path.join(manual_dir, 'version.html'),
        },
        {
            name: '5 数据备份',
            path: path.join(manual_dir, 'backup.html'),
        }]

        var db  = new sqlite3.Database(db_file)
        async.waterfall([
            // 创建数据库
            function(cb) {
                var sql = "CREATE TABLE note(id INTEGER PRIMARY KEY AUTOINCREMENT,parent_id INT NOT NULL DEFAULT 0,title TEXT NOT NULL DEFAULT '' ,is_del TINYINT NOT NULL DEFAULT 0 ,create_time INT NOT NULL DEFAULT 0,update_time INT NOT NULL DEFAULT 0);"
                db.run(sql, function(err) {
                    cb(err)
                })
            },
            // 插入文档节点
            function(cb) {
                var sql = "insert into note(title, parent_id) values('帮助', 0)"
                db.run(sql, function(err) {
                    cb(err)
                })
            },
            // 插入文档
            function(cb) {
                async.each(documents, function(obj, innerCb) {
                    var sql = "insert into note(title, parent_id) values('" + obj.name + "'," + 1 + ")"
                    db.run(sql, function(err) {
                        if (err) {
                            innerCb(err)
                        } else {
                            var dst_file = path.join(data_path, 'data/notes', this.lastID + '.html')
                            console.log(dst_file);
                            fs.createReadStream(obj.path).pipe(fs.createWriteStream(dst_file));
                            innerCb(null)
                        }
                    })
                }, function(err){
                    cb(err)
                })
            },
        ])
    }
}

function setTimeFunc() {
    Date.prototype.Format = function(fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}


function init() {
    initDB()
    setTimeFunc()
}

module.exports = init
