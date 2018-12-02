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
