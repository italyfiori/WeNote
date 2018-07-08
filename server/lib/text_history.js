'use strict';

const DiffMatchPatch = require('diff-match-patch');
const diff = new DiffMatchPatch();

function TextHistory() {
    if (!(this instanceof TextHistory)) {
        return new TextHistory();
    }
    this.patchesList = []
    this.timeList = []
    this.sizeList = []
    return this;
}

// 获取新content与最新版本的patches
TextHistory.prototype.getPatches = function (new_content) {
    var lastVersion = this.patchesList.reduce((text, patch) => diff.patch_apply(patch, text)[0], '')
    return diff.patch_make(lastVersion, new_content);
}

// 获取指定历史版本
TextHistory.prototype.getVersion = function (index) {
    let patchesList = this.patchesList.slice(0, index + 1);
    return patchesList.reduce((text, patch) => diff.patch_apply(patch, text)[0], '');
};

// 获取最新历史版本
TextHistory.prototype.getLastVersion = function (index) {
    return this.patchesList.reduce((text, patch) => diff.patch_apply(patch, text)[0], '');
};


module.exports = TextHistory;
