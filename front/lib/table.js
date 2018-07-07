// 记录被选中的单元
var tdSelected = null

// 创建表格html
function createTableHtml(titles) {
    var html = '<table border="1">'
    var col = titles.length

    // 插入首行
    html += '<tr class="head">'
    for (var i = 0; i < col; i++) {
        html += '<td><p>' + titles[i] + '</p></td>'
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
            continue
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

    $(table).find('div.resize').unbind()
    $(table).find('div.resize').each(function() {
        // 按下鼠标开始拖拽
        this.addEventListener('mousedown', function (e) {
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

exports.makeTableResizeable = makeTableResizeable
exports.createTableHtml     = createTableHtml
