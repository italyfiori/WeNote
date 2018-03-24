// 获取随机数 0到max
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// 将光标移动到当前节点之后
function setCursorAfterNode(node) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStartAfter(node)
    range.setEndAfter(node)
    selection.addRange(range)
}

function getRange() {
    var sel = window.getSelection()
    return sel.getRangeAt(0)
}

function setCursor(node) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStart(node, 0)
    range.setEnd(node, 0)
    selection.addRange(range)
}

// 获取当前节点
function getCurNode() {
    var sel = window.getSelection()
    var range = sel.getRangeAt(0)
    return range.startContainer
}

// 获取第一个块节点
var blockTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI']
function getBlockContainer() {
    var curNode = getCurNode()
    var tagName = curNode.tagName
    while(curNode != editor && blockTags.indexOf(tagName) < 0) {
        curNode = curNode.parentNode
        tagName = curNode.tagName
    }
    return blockTags.indexOf(tagName) >= 0 ? curNode : undefined
}

// 根据标题创建表格html
function createTableHtml(titles) {
    var html  = '<table border="1">'
    var col = titles.length

    // 插入首行
    html += '<tr>'
    for (var i = 0; i < col; i++) {
        html += '<td class="head"><p>' + titles[i] + '</p></td>'
    }
    html += '</tr>'

    // 首行后插入2行
    for (var i = 0; i < 2; i++) {
        html += '<tr>'
        for (var j = 0; j < col; j++) {
            html += '<td><p><br/></p></td>'
        }
        html += '</tr>'
    }

    html += '</table>'
    return html
}

// 表格单元宽度缩放
var tdElm = undefined
function makeTableResizeable(table) {
    var tds = $(table).find('td')
    for (var i = 0; i < tds.length; i++) {
        (function(i) {
            var td = tds[i]
            // 已经添加过缩放div，则不再添加
            if ($(td).children('.resize').length > 0) {
                return
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
            grip.addEventListener('mousedown', function (e) {
                tdElm = td;
                startOffset = td.offsetWidth - e.pageX;
            });
            td.appendChild(grip);
        })(i)
    }

    document.addEventListener('mousemove', function (e) {
      if (tdElm) {
        tdElm.style.width = startOffset + e.pageX + 'px';
      }
    });

    document.addEventListener('mouseup', function () {
        tdElm = undefined;
    });
}

// 标题标签markdown触发条件
var titleTagMap = {
    '#' : 'h1',
    '##': 'h2',
    '###': 'h3',
    '####': 'h4',
    '#####': 'h5',
    '######': 'h6'
}

// 标题标签
var titleTagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']