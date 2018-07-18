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
    async.waterfall([
        function(callback) {
            if (!fs.existsSync(db_file)) {
                if(!util.mkdirs(path.dirname(db_file))) {
                    console.log(db_file);
                    return callback('create db path failed!')
                }
            }
            callback(null)
        },
        function(callback) {
            var db  = new sqlite3.Database(db_file)
            var sql = "CREATE TABLE note(id INTEGER PRIMARY KEY AUTOINCREMENT,parent_id INT NOT NULL DEFAULT 0,title TEXT NOT NULL DEFAULT '' ,is_del TINYINT NOT NULL DEFAULT 0 ,create_time INT NOT NULL DEFAULT 0,update_time INT NOT NULL DEFAULT 0);"
            db.run(sql, function(err) {
                callback(err)
            })
        }
    ], function(err, results) {
        if (err) {
            console.error(err);
        }
    })
}

function init() {
    createDB()
}

module.exports = init
