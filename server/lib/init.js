const fs        = require('fs')
const path      = require('path')
const async     = require('async')
const rootpath  = path.dirname(path.dirname(__dirname))
const util      = require(path.join(rootpath, 'server/lib/util'))
const sqlite3   = require('sqlite3-offline').verbose();
const data_path = util.getDataPath()
const db_file   = path.join(data_path, 'data/db/wiki.db')

// 创建数据库
function createDB() {
    if (!fs.existsSync(db_file)) {
        // 创建文件夹
        if(!util.mkdirs(path.dirname(db_file))) {
            console.error('create db path failed!');
            return
        }

        // 创建数据库和表
        var db  = new sqlite3.Database(db_file)
        var sql = "CREATE TABLE note(id INTEGER PRIMARY KEY AUTOINCREMENT,parent_id INT NOT NULL DEFAULT 0,title TEXT NOT NULL DEFAULT '' ,is_del TINYINT NOT NULL DEFAULT 0 ,create_time INT NOT NULL DEFAULT 0,update_time INT NOT NULL DEFAULT 0);"
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
            }
        })

        // todo插入使用手册文档
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
    createDB()
    setTimeFunc()
}

module.exports = init
