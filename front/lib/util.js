// 获取随机数
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function addStringFormat() {
    String.prototype.format = function(args) {
        var result = this;
        if (arguments.length > 0) {
            if (arguments.length == 1 && typeof (args) == "object") {
                for (var key in args) {
                    if(args[key]!=undefined){
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            }
            else {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        var reg= new RegExp("({)" + i + "(})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    }
}

function ts2time(ts) {
    var date = new Date(ts);
    var year = date.getFullYear() + '-';
    var month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var day = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
    var hour = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
    var minute = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
    var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return year + month + day + hour + minute + seconds
}

exports.getRandomInt    = getRandomInt
exports.addStringFormat = addStringFormat
exports.ts2time         = ts2time
