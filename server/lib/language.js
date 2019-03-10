const {
    app,
} = require('electron')

var _locale = ''

var languages = {
	'zh-CN'                            : {
		'menu'                         : {
			'note'                     : {
				'label_name'           : '文档',
				'create'               : '创建文档',
				'save'                 : '保存文档',
				'backup'               : '备份所有文档',
				'recover'              : '恢复所有文档',
			},
			'edit'                     : {
				'label_name'           : '编辑',
				'undo'                 : '撤销',
				'redo'                 : '重做',
				'cut'                  : '剪切',
				'copy'                 : '拷贝',
				'paste'                : '粘贴',
				'all'                  : '全选',
			},
			'view'                     : {
				'label_name'           : '视图',
				'side'                 : '侧边栏',
			},
			'style'                    : {
				'label_name'           : '格式',
				'p'                    : '正文',
				'h1'                   : '标题1',
				'h2'                   : '标题2',
				'h3'                   : '标题3',
				'h4'                   : '标题4',
				'ol'                   : '有序列表',
				'ul'                   : '无序列表',
				'line'                 : '水平线',
				'blockquote'           : '引用',
				'code'                 : '代码块',
				'table'                : '表格',
				'file'                 : '上传文件',
				'image'                : '上传图片',
				'link'                 : '插入链接',
				'justify_left'         : '左对齐',
				'justify_right'        : '右对齐',
				'justify_center'       : '居中对齐',
			},
			'table'                    : {
				'label_name'           : '表格',
				'table_insert'         : '插入表格',
				'row_before'           : '向前插入行',
				'row_after'            : '向后插入行',
				'row_del'              : '删除此行',
				'col_before'           : '向前插入列',
				'col_after'            : '向后插入列',
				'col_del'              : '删除此列',
				'row_head'             : '设置表头行',
				'col_head'             : '设置表头列',
				'table_del'            : '删除表格',
			},
			'history'                  : {
				'label_name'           : '历史',
				'history'              : '历史版本'
			},
		},
		'alerts'                       : {
			'FILE_NOT_EXISTS'          : '文件不存在!',
			'NOT_SUPPORT_FOLDER_UPLOAD': '不支持上传文件夹!',
			'FILE_OVER_SIZE'           : '文件大小超过限制!',

			'START_BACKUP_TITLE'       : '开始备份!',
			'START_BACKUP_BODY'        : '开始备份,完成之前请勿关闭软件!',
			'SYS_SAVING_BACKUP'        : '系统正在备份!',

			'UPLOAD_NOT_BUFFER'        : '上传内容错误!',
			'SAVE_IMAGE_FAILED'        : '保存图片失败!',
		}
	},
	'default'                          : {
		'menu'                         : {
			'note'                     : {
				'label_name'           : 'Document',
				'create'               : 'New Document',
				'save'                 : 'Save',
				'backup'               : 'Backup All Documents',
				'recover'              : 'Recover All Documents',
			},
			'edit'                     : {
				'label_name'           : 'Edit',
				'undo'                 : 'Undo',
				'redo'                 : 'Redo',
				'cut'                  : 'Cut',
				'copy'                 : 'Copy',
				'paste'                : 'Paste',
				'all'                  : 'Select All',
			},
			'view'                     : {
				'label_name'           : 'View',
				'side'                 : 'Side Bar',
			},
			'style'                    : {
				'label_name'           : 'Format',
				'p'                    : 'Paragraph',
				'h1'                   : 'Heading 1',
				'h2'                   : 'Heading 2',
				'h3'                   : 'Heading 3',
				'h4'                   : 'Heading 4',
				'ol'                   : 'Ordered List',
				'ul'                   : 'Unordered List',
				'line'                 : 'Horizontal Line',
				'blockquote'           : 'Quote',
				'code'                 : 'Code',
				'table'                : 'Table',
				'file'                 : 'Upload File',
				'image'                : 'Upload Image',
				'link'                 : 'Insert Link',
				'justify_left'         : 'Justify Left',
				'justify_right'        : 'Justify Right',
				'justify_center'       : 'Justify Center',
			},
			'table'                    : {
				'label_name'           : 'Table',
				'table_insert'         : 'Insert Table',
				'row_before'           : 'Insert Row Before',
				'row_after'            : 'Insert Row After',
				'row_del'              : 'Delete Row',
				'col_before'           : 'Insert Column Before',
				'col_after'            : 'Insert Column After',
				'col_del'              : 'Delete Column',
				'row_head'             : 'Heading Row',
				'col_head'             : 'Heading Column',
				'table_del'            : 'Delete Table',
			},
			'history'                  : {
				'label_name'           : 'Version',
				'history'              : 'Version List'
			},
		},
		'alerts'                       : {
			'FILE_NOT_EXISTS'          : 'File Not Exists!',
			'NOT_SUPPORT_FOLDER_UPLOAD': 'Folder Not Support!',
			'FILE_OVER_SIZE'           : 'File Over Max Size!',

			'START_BACKUP_TITLE'       : 'Start Backup',
			'START_BACKUP_BODY'        : 'Start backup, don\'t shutdown soft in the backup!',
			'SYS_SAVING_BACKUP'        : 'System is in backup!',

			'UPLOAD_NOT_BUFFER'        : 'Upload content error!',
			'SAVE_IMAGE_FAILED'        : 'Save iamge failed!',
		}
	},
}

function setLocale(locale, func) {
	_locale = locale
	func()
}

function getLocale() {
	return _locale
}

function getLanguage() {
	if (!(_locale in languages)) {
		_locale = 'default'
	}
	return languages[_locale]
}

exports.setLocale   = setLocale
exports.getLocale   = getLocale
exports.getLanguage = getLanguage
