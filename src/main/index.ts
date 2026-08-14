import { app, shell, BrowserWindow, WebContentsView, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { loadBookmarks, saveBookmarks, Bookmark } from './bookmarks'

function getContentBounds(win: BrowserWindow) {
  const [width, height] = win.getContentSize()
  const topBarHeight = 64
  const sideMargin = 16
  const bottomMargin = 16

  return {
    x: sideMargin,
    y: topBarHeight,
    width: width - sideMargin * 2,
    height: height - topBarHeight - bottomMargin
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../build/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const view = new WebContentsView()
  mainWindow.contentView.addChildView(view)
  view.setBorderRadius(16)
  view.setVisible(false)

  const updateBounds = () => {
    view.setBounds(getContentBounds(mainWindow))
  }
  updateBounds()
  mainWindow.on('resize', updateBounds)

  ipcMain.on('navigate', (_event, url: string) => {
    view.webContents.loadURL(url)
    view.setVisible(true)
  })

  ipcMain.handle('get-current-state', () => {
    return {
      url: view.webContents.getURL(),
      isVisible: view.getVisible() // WebContentsView has a getVisible() method
    }
  })

  view.webContents.on('did-navigate', (__event, finalUrl) => {
    mainWindow.webContents.send('url-changed', finalUrl)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  ipcMain.on('go-back', () => view.webContents.navigationHistory.goBack())
  ipcMain.on('go-forward', () => view.webContents.navigationHistory.goForward())
  ipcMain.on('reload', () => view.webContents.reload())
  ipcMain.on('go-home', () => {
    view.setVisible(false)
  })
  ipcMain.handle('can-go-back', () => view.webContents.navigationHistory.canGoBack())
  ipcMain.handle('can-go-forward', () => view.webContents.navigationHistory.canGoForward())

  let bookmarks: Bookmark[] = loadBookmarks()

  ipcMain.handle('get-bookmarks', () => bookmarks)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
