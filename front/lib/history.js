function createTableHtml(version_list) {
    var html  = '<table class="table table-bordered table-hover">'
    html     += '<tr><th>版本</th><th>时间</th><th>大小</th><th>操作</th></tr>'
    for (i in version_list) {
        var version = version_list[i]
        var data = {
            id:   version.id,
            time: ts2time(version.time),
            size: String(version.size).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
            op:   '<a class="version" href="">恢复</a>'.format(version.id)
        }
        html += '<tr><td>{id}</td><td>{time}</td><td>{size}</td><td>{op}</td></tr>'.format(data)
    }
    html += '</table>';
    return html
}
