const {
    app,
    BrowserWindow,
}              = require('electron')
const electron = require('electron')

function getTemplate(win) {
    var template = [
        {
            label: 'File',
            submenu: [{
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click: function () {
                    win.webContents.send('save');
                }
            }]
        },
        {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                click: function () {
                    win.webContents.send('undo');
                }
            }, {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                click: function () {
                    win.webContents.send('redo');
                }
            }, {
                type: 'separator'
            }, {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            }, {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            }, {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            }, {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            }]
        },
        {
            label: 'History',
            submenu: [{
                label: 'History List',
                accelerator: 'CmdOrCtrl+K',
                click: function () {
                    win.webContents.send('history_action');
                }
            }]
        },
        {
            label: 'Table',
            submenu: [{
                label: 'insert row abover',
                accelerator: 'CmdOrCtrl+Alt+Up',
                click: function () {
                    win.webContents.send('add_row_before');
                }
            }, {
                label: 'insert row after',
                accelerator: 'CmdOrCtrl+Alt+Down',
                click: function () {
                    win.webContents.send('add_row_after');
                }
            }, {
                label: 'delete row',
                accelerator: 'CmdOrCtrl+Alt+Delete',
                click: function () {
                    win.webContents.send('delete_row');
                }
            }, {
                type: 'separator'
            }, {
                label: 'insert column before',
                accelerator: 'CmdOrCtrl+Alt+Left',
                click: function () {
                    win.webContents.send('add_col_before');
                }
            }, {
                label: 'insert column after',
                accelerator: 'CmdOrCtrl+Alt+Right',
                click: function () {
                    win.webContents.send('add_col_after');
                }
            }, {
                label: 'delete column',
                click: function () {
                    win.webContents.send('delete_col');
                }
            }, {
                type: 'separator'
            }, {
                label: 'Heading Row',
                click: function () {
                    win.webContents.send('heading_row');
                }
            }, {
                label: 'Heading Column',
                click: function () {
                    win.webContents.send('heading_col');
                }
            }, {
                type: 'separator'
            }, {
                label: 'delete table',
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
                    label: `About ${name}`,
                    role: 'about'
                }, {
                    type: 'separator'
                }, {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                }, {
                    type: 'separator'
                }, {
                    label: `Hide ${name}`,
                    accelerator: 'Command+H',
                    role: 'hide'
                }, {
                    label: 'Hide Others',
                    accelerator: 'Command+Alt+H',
                    role: 'hideothers'
                }, {
                    label: 'Show All',
                    role: 'unhide'
                }, {
                    type: 'separator'
                }, {
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
