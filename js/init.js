// 
const path = require('path')
var app_path = __dirname
var img_path = path.join(app_path, 'data/images')

// 阻止按键和光标缩放
document.addEventListener('DOMContentLoaded', function (event) {
    document.body.style.zoom = 'reset';
    document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey === true || event.metaKey === true)
            && (event.which === 61 || event.which === 107
                || event.which === 173 || event.which === 109
                || event.which === 187 || event.which === 189)) {
            event.preventDefault();
        }
    }, false);
    document.addEventListener('mousewheel DOMMouseScroll', function (event) {
        if (event.ctrlKey === true || event.metaKey) {
            event.preventDefault();
        }
    }, false);
}, false);

$(document).ready(function () {
    // 阻止tab键
    $(editor).keydown(function (event) {
        if (event.key == 'Tab') {
            event.preventDefault()
        }
    })
})