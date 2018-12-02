var _locale = ''

var languages = {
	'zh-CN': {
		'side'                  : {
			'create'            : '创建文档',
			'delete'            : '删除',
			'rename'            : '重命名',
			'recover'           : '恢复',
			'clear'             : '清空回收站',
		},
		'alerts'                : {
			START_BACKUP_TITLE  : '开始备份！',
			START_BACKUP_BODY   : '开始备份, 备份过程中请勿关闭软件!',
			BACKUP_SUCCEED      : '备份成功',
			BACKUP_DONE         : '备份到',
			DELETE_NOTE_CONFIRM : '确认要删除文档?',
			DELETE_TRASH_CONFIRM: '确认要彻底删除文档?',
			CLEAN_TRASH_CONFIRM : '确认清空回收站?',
		},
		'modal'                 : {
			link_title          : '插入链接',
			link_label_url      : '链接',
			link_label_text     : '文字',
			link_url            : '输入链接地址',
			link_text           : '输入链接描述',
			link_insert_button  : '插入',
			link_close_button   : '关闭',
			version_title       : '版本列表',
			version_close_button: '关闭',
			version_id          : '版本',
			version_time        : '时间',
			version_operation   : '操作',
			version_recover     : '恢复',
			version_size        : '大小',
		}
	},
	'default': {
		'side'                  : {
			'create'            : 'New Document',
			'delete'            : 'Delete',
			'rename'            : 'Rename',
			'recover'           : 'Recover',
			'clear'             : 'Clean',
		},
		'alerts'                : {
			START_BACKUP_TITLE  : 'Start recover',
			START_BACKUP_BODY   : 'Start Recover, don\'t close note while recovering !',
			BACKUP_SUCCEED      : 'Recover succeed',
			BACKUP_DONE         : 'Recover:',
			DELETE_NOTE_CONFIRM : 'Are you sure delete the note?',
			DELETE_TRASH_CONFIRM: 'Are you sure completely delete note?',
			CLEAN_TRASH_CONFIRM : 'Are you sure clean the trash?',
		},
		'modal'                 : {
			link_title          : 'Insert Link',
			link_label_url      : 'Link',
			link_label_text     : 'Text',
			link_url            : 'input link url',
			link_text           : 'input link text',
			link_insert_button  : 'Insert',
			link_close_button   : 'Close',
			version_title       : 'Version List',
			version_close_button: 'Close',
			version_id          : 'Version',
			version_time        : 'Time',
			version_operation   : 'Operation',
			version_recover     : 'Recover',
			version_size        : 'Size',
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
