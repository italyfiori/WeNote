const {ipcRenderer} = require('electron')
var dom             = require(rootpath + '/front/lib/dom.js')
var $               = require('jquery')

// 记录被选中的单元
var tdSelected = null

function createRow(len) {
    var html = ''
    // 插入首行
    html += '<tr>'
    for (var i = 0; i < len; i++) {
        html += '<td><p><br/></p></td>'
    }
    html += '</tr>'
    return html
}

// 创建表格html
function createTableHtml(titles) {
    var html = '<table border="1">'
    var col = titles.length

    // 插入首行
    html += '<tr class="head">'
    for (var i = 0; i < col; i++) {
        if (titles[i] == '') {
            html += '<td><p><br/></p></td>'
        } else {
            html += '<td><p>' + titles[i] + '</p></td>'
        }

    }
    html += '</tr>'

    // 首行后插入2行
    for (var i = 0; i < 1; i++) {
        html += '<tr>'
        for (var j = 0; j < col; j++) {
            html += '<td><p><br/></p></td>'
        }
        html += '</tr>'
    }

    html += '</table>'
    return html
}

// 使表格可拖拽
function makeTableResizeable(table) {
    var tds = $(table).find('td')
    for (let i = 0; i < tds.length; i++) {
        var td = tds[i]
        // 已经添加过缩放div，则不再添加
        if ($(td).children('.resize').length > 0) {
            $(td).children('.resize').remove()
            // continue
        }

        // 添加缩放div
        var grip = document.createElement('div');
        grip.innerHTML = "&nbsp;";
        grip.className = "resize";
        grip.contentEditable = "false";
        grip.style.top = 0;
        grip.style.right = '-2.5px';
        grip.style.bottom = 0;
        grip.style.width = '5px';
        grip.style.position = 'absolute';
        grip.style.cursor = 'col-resize';
        td.appendChild(grip);
    }

    // 拖拽功能
    $(table).find('div.resize').each(function() {
        // 移除所有事件
        var new_node = dom.removeAllListeners(this)

        // 按下鼠标开始拖拽
        new_node.addEventListener('mousedown', function (e) {
            var td = this.parentNode
            tdSelected = td;
            startOffset = td.offsetWidth - e.pageX;
        });
    })

    // 移动中
    document.addEventListener('mousemove', function (e) {
        if (tdSelected) {
            var col = tdSelected.cellIndex + 1
            var width = startOffset + e.pageX + 'px';
            $(tdSelected.parentNode).siblings().find('td:nth-child(' + col + ')').css('width', width)
            tdSelected.style.width = width
        }
    });

    // 抬起鼠标
    document.addEventListener('mouseup', function () {
        tdSelected = null;
    });
}

function setTableAction() {
    ipcRenderer.on('add_row_after', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        row        = row[0]
        var td_len = $(row).children('td').length
        var html   = createRow(td_len)
        $(row).after(html)
        makeTableResizeable(row.parentNode)
    })

    ipcRenderer.on('add_row_before', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        row        = row[0]
        var td_len = $(row).children('td').length
        var html   = createRow(td_len)
        $(row).before(html)
        makeTableResizeable(row.parentNode)
    })

    ipcRenderer.on('add_col_before', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        var index = $(curNode).parents('td').index()
        var table = row.parents('table')[0]
        $(row[0]).parent().children().each(function() {
            $(this).children().eq(index).before('<td><p><br/></p></td>')
        })
        makeTableResizeable(row[0].parentNode)
    })

    ipcRenderer.on('add_col_after', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        var index = $(curNode).parents('td').index()
        var table = row.parents('table')[0]
        $(row[0]).parent().children().each(function() {
            $(this).children().eq(index).after('<td><p><br/></p></td>')
        })
        makeTableResizeable(row[0].parentNode)
    })

    ipcRenderer.on('delete_col', function() {
        // 不在表格中, 无效操作
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }

        // 只有一列, 删除整个表格
        var td = $(curNode).parents('td').first()
        if (td.siblings().length ==0) {
            $(row.parents('table')[0]).remove()
            return
        }

        // 查找上一列或下一列
        if (td.next()[0]) {
            next_cursor = td.next()[0].firstChild
        } else if (td.prev()[0]) {
            next_cursor = td.prev()[0].firstChild
        }

        // 删除当前列
        var index = td.index()
        $(row[0]).parent().children().each(function() {
            $(this).children().eq(index).remove()
        })

        // 光标调到上一列或下一列
        if (next_cursor) {
            dom.setCursor(next_cursor)
        }

        makeTableResizeable(row[0].parentNode)
    })

    ipcRenderer.on('heading_row', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        var row = $(curNode).parents('tr').first().toggleClass('head')
    })

    ipcRenderer.on('heading_col', function() {
        var curNode = dom.getCurNode()
        var row     = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }
        var td = $(curNode).parents('td').first()
        var index = td.index()
        $(row).parent().children().each(function() {
            $(this).children().eq(index).toggleClass('head')
        })
    })

    ipcRenderer.on('delete_row', function() {
        // 不在表格中, 无效操作
        var curNode = dom.getCurNode()
        var row = $(curNode).parents('tr')
        if (row.length == 0) {
            console.warn('not in table')
            return
        }

        // 查找上一行或下一行
        row = $(row[0])
        var table = row.parents('table')[0]
        var next_cursor = null
        if (row.next()[0]) {
            next_cursor = row.next()[0].firstChild.firstChild
        } else if (row.prev()[0]) {
            next_cursor = row.prev()[0].firstChild.firstChild
        }

        if (next_cursor) {
            row.remove()
            dom.setCursor(next_cursor)
        } else {
            $(row).remove()
        }
    })

    ipcRenderer.on('delete_table', function() {
        var curNode = dom.getCurNode()
        var table = $(curNode).parents('table')
        if (table.length == 0) {
            console.warn('not in table')
            return
        }
        $(table[0]).remove()
    })
}

exports.makeTableResizeable = makeTableResizeable
exports.createTableHtml     = createTableHtml
exports.setTableAction      = setTableAction
