const fs = require('fs')
const path = require('path')
var TextHistory = require('./lib/history');
var striptags = require('striptags');


const base_path = path.dirname(__dirname);





exports.get_note = get_note
exports.save_note = save_note
exports.get_history = get_history
exports.append_history = append_history
exports.get_version_list = get_version_list
exports.get_version = get_version
