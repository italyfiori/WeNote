var _locale = ''

var languages = {
	'zh-CN': {
		'side': {
			'create': '创建文档',
			'delete': '删除文档',
			'rename': '重命名',
			'recover': '恢复文档',
			'clear': '清空回收站',
		},
		'alerts': {
			START_BACKUP_TITLE: '开始备份！',
			START_BACKUP_BODY: '开始备份, 备份过程中请勿关闭软件!',
			BACKUP_SUCCEED: '备份成功',
			BACKUP_DONE: '备份到',
			DELETE_NOTE_CONFIRM: '确认要删除文档?',
			DELETE_TRASH_CONFIRM: '确认要彻底删除文档?',
			CLEAN_TRASH_CONFIRM: '确认清空回收站?',
		}
	},
	'default': {
		'side': {
			'create': '创建文档',
			'delete': '删除文档',
			'rename': '重命名',
			'recover': '恢复文档',
			'clear': '清空回收站',
		},
		'alerts': {
			START_BACKUP_TITLE: '开始备份！',
			START_BACKUP_BODY: '开始备份, 备份过程中请勿关闭软件!',
			BACKUP_SUCCEED: '备份成功',
			BACKUP_DONE: '备份到',
			DELETE_NOTE_CONFIRM: '确认要删除文档?',
			DELETE_TRASH_CONFIRM: '确认要彻底删除文档?',
			CLEAN_TRASH_CONFIRM: '确认清空回收站?',
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
