var _locale = ''

var languages = {
	'zh-CN': {
		'menu': {
			'note': {
				'label_name': '笔记',
				'create': '创建文档',
				'save': '保存文档',
			},
			'edit': {
				'label_name': '编辑',
				'undo':       '撤销',
				'redo':       '重做',
				'cut':        '剪切',
				'copy':       '拷贝',
				'paste':      '粘贴',
				'all': '全选',
			},
			'view': {
				'label_name': '视图',
				'side': '侧边栏',
			},
			'style': {
				'label_name': '格式',
				'p': '正文',
				'h1': '标题1',
				'h2': '标题2',
				'h3': '标题3',
				'ol': '有序列表',
				'ul': '无序列表',
				'line': '水平线',
				'blockquote': '引用',
				'code': '代码块',
				'table': '表格',
				'file': '上传文件',
				'image': '上传图片',
			},
			'table': {
				'label_name': '表格',
				'table_insert': '插入表格',
				'row_before': '向前插入行',
				'row_after': '向后插入行',
				'row_del': '删除此行',
				'col_before': '向前插入列',
				'col_after': '向后插入列',
				'col_del': '删除此列',
				'row_head': '设置表头行',
				'col_head': '设置表头列',
				'table_del': '删除表格',
			},
			'history': {
				'label_name': '历史',
				'history': '历史版本'
			}
		},
	},
	'default': {
		'menu': {
			'note': {
				'label_name': '笔记',
				'create': '创建文档',
				'save': '保存文档',
			},
			'edit': {
				'label_name': '编辑',
				'undo':       '撤销',
				'redo':       '重做',
				'cut':        '剪切',
				'copy':       '拷贝',
				'paste':      '粘贴',
				'all': '全选',
			},
			'view': {
				'label_name': '视图',
				'side': '侧边栏',
			},
			'style': {
				'label_name': '格式',
				'p': '正文',
				'h1': '标题1',
				'h2': '标题2',
				'h3': '标题3',
				'ol': '有序列表',
				'ul': '无序列表',
				'line': '水平线',
				'blockquote': '引用',
				'code': '代码块',
				'table': '表格',
				'file': '上传文件',
				'image': '上传图片',
				'justify_left': '左对齐',
				'justify_right': '右对齐',
				'justify_center': '居中对齐',
			},
			'table': {
				'label_name': '表格',
				'table_insert': '插入表格',
				'row_before': '向前插入行',
				'row_after': '向后插入行',
				'row_del': '删除此行',
				'col_before': '向前插入列',
				'col_after': '向后插入列',
				'col_del': '删除此列',
				'row_head': '设置表头行',
				'col_head': '设置表头列',
				'table_del': '删除表格',
			},
			'history': {
				'label_name': '历史',
				'history': '历史版本'
			},
		},
	}
}

function setLocale(locale) {
	_locale = locale
}

function getLanguage() {
	console.log(_locale);
	if (!(_locale in languages)) {
		_locale = 'default'
	}

	return languages[_locale]
}


exports.setLocale   = setLocale
exports.getLanguage = getLanguage
