var _locale = ''

var languages = {
	'zh-CN': {
		'side': {
			'create': '创建文档',
			'delete': '删除文档',
			'rename': '重命名',
			'recover': '恢复文档',
			'clear': '清空回收站',
		}
	},
	'default': {
		'side': {
			'create': '创建文档',
			'delete': '删除文档',
			'rename': '重命名',
			'recover': '恢复文档',
			'clear': '清空回收站',
		}
	}
}

function setLocale(locale) {
	_locale = locale
}

function getLanguage() {
	if (!(_locale in languages)) {
		_locale = 'default'
	}

	return languages[_locale]
}


exports.setLocale   = setLocale
exports.getLanguage = getLanguage
