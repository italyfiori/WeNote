var fs = require('fs')

export.checkDir = function(dir) {
	if (!fs.existsSync(dir)) {
        return fs.mkdirSync(dir);
    }
    return true
}