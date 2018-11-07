const {
    app,
    BrowserWindow,
}              = require('electron')
const electron = require('electron')
const path     = require('path')
const rootpath = path.dirname(path.dirname(__dirname))
const language = require(path.join(rootpath, 'server/lib/language'))

var menu_lang = language.getLanguage().menu

function getTemplate(win) {
    var template = [
        {
            label: menu_lang.note.label_name,
            submenu: [{
                label: menu_lang.note.save,
                accelerator: 'CmdOrCtrl+S',
                click: function () {
                    win.webContents.send('save');
                }
            }]
        },
        {
            label: menu_lang.edit.label_name,
            submenu: [{
                label: menu_lang.edit.undo,
                accelerator: 'CmdOrCtrl+Z',
                click: function () {
                    win.webContents.send('undo');
                }
            }, {
                label: menu_lang.edit.redo,
                accelerator: 'Shift+CmdOrCtrl+Z',
                click: function () {
                    win.webContents.send('redo');
                }
            }, {
                type: 'separator'
            }, {
                label: menu_lang.edit.cut,
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            }, {
                label: menu_lang.edit.copy,
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            }, {
                label: menu_lang.edit.paste,
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            }, {
                label: menu_lang.edit.all,
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            }]
        },
        {
            label: menu_lang.view.label_name,
            submenu: [{
                label: menu_lang.view.side,
                accelerator: 'CmdOrCtrl+G',
                click: function () {
                    win.webContents.send('hidden_side');
                },
            }, {
                label: menu_lang.view.history,
                accelerator: 'CmdOrCtrl+H',
                click: function () {
                    win.webContents.send('history_action');
                }
            }]
        },
        {
            label: menu_lang.style.label_name,
            submenu: [{
                label: menu_lang.style.p,
                accelerator: 'CmdOrCtrl+0',
                click: function () {
                    // win.webContents.send('hidden_side');
                },
            }, {
                label: menu_lang.style.h1,
                accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.h2,
                accelerator: 'CmdOrCtrl+2',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.h3,
                accelerator: 'CmdOrCtrl+3',
                click: function () {
                    // win.webContents.send('history_action');
                }
            },{
                type: 'separator'
            }, {
                label: menu_lang.style.ol,
                // accelerator: 'CmdOrCtrl+3',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.ul,
                // accelerator: 'CmdOrCtrl+3',
                click: function () {
                    // win.webContents.send('history_action');
                }
            } ,{
                type: 'separator'
            }, {
                label: menu_lang.style.line,
                // accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.blockquote,
                // accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.code,
                // accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                type: 'separator'
            },{
                label: menu_lang.style.file,
                // accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }, {
                label: menu_lang.style.image,
                // accelerator: 'CmdOrCtrl+1',
                click: function () {
                    // win.webContents.send('history_action');
                }
            }]
        },
        {
            label: menu_lang.table.label_name,
            submenu: [{
                label: menu_lang.table.table_insert,
                click: function () {
                    // win.webContents.send('add_row_before');
                }
            },{
                type: 'separator'
            },{
                label: menu_lang.table.row_before,
                accelerator: 'CmdOrCtrl+Alt+Up',
                click: function () {
                    win.webContents.send('add_row_before');
                }
            }, {
                label: menu_lang.table.row_after,
                accelerator: 'CmdOrCtrl+Alt+Down',
                click: function () {
                    win.webContents.send('add_row_after');
                }
            }, {
                label: menu_lang.table.row_del,
                accelerator: 'CmdOrCtrl+Alt+K',
                click: function () {
                    win.webContents.send('delete_row');
                }
            }, {
                type: 'separator'
            }, {
                label: menu_lang.table.col_before,
                accelerator: 'CmdOrCtrl+Alt+Left',
                click: function () {
                    win.webContents.send('add_col_before');
                }
            }, {
                label: menu_lang.table.col_after,
                accelerator: 'CmdOrCtrl+Alt+Right',
                click: function () {
                    win.webContents.send('add_col_after');
                }
            }, {
                label: menu_lang.table.col_del,
                accelerator: 'CmdOrCtrl+Alt+L',
                click: function () {
                    win.webContents.send('delete_col');
                }
            }, {
                type: 'separator'
            }, {
                label: menu_lang.table.row_head,
                click: function () {
                    win.webContents.send('heading_row');
                }
            }, {
                label: menu_lang.table.col_head,
                click: function () {
                    win.webContents.send('heading_col');
                }
            }, {
                type: 'separator'
            }, {
                label: menu_lang.table.table_del,
                click: function () {
                    win.webContents.send('delete_table');
                }
            }]
        },
    ]

    if (process.platform === 'darwin') {
        const name = electron.app.getName()
        template.unshift({
            label: name,
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            // on reload, start fresh and close any old
                            // open secondary windows
                            if (focusedWindow.id === 1) {
                                BrowserWindow.getAllWindows().forEach(function (win) {
                                    if (win.id > 1) {
                                        win.close()
                                    }
                                })
                            }
                            focusedWindow.reload()
                        }
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I'
                        } else {
                            return 'Ctrl+Shift+I'
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools()
                        }
                    }
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit()
                    }
                }]
        })
    }

    return template
}


exports.getTemplate = getTemplate
