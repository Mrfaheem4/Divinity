import { app, shell, BrowserWindow, WebContentsView, ipcMain } from 'electron'
import { join } from 'path'
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

  interface TabData {
    view: WebContentsView
    isHome: boolean
  }

  const tabs = new Map<string, TabData>()
  let activeTab = 'tab1'

  // createTab now sets up EVERYTHING a tab needs, including its own
  // permanent did-navigate listener — no more relying on one global `view`
  function createTab(tabId: string, isHome: boolean) {
    const view = new WebContentsView()
    mainWindow.contentView.addChildView(view)
    view.setBounds(getContentBounds(mainWindow))
    view.setBorderRadius(16)
    view.setVisible(false)

    view.webContents.on('did-navigate', (_event, finalUrl) => {
      // only forward this update if the tab that navigated is CURRENTLY active —
      // otherwise a background tab loading something could incorrectly update the visible searchbar
      if (activeTab === tabId) {
        mainWindow.webContents.send('url-changed', finalUrl)
      }
    })

    tabs.set(tabId, { view, isHome })
  }

  function switchTab(clickedTab: string) {
    tabs.get(activeTab)!.view.setVisible(false)
    tabs.get(clickedTab)!.view.setVisible(true)
    activeTab = clickedTab

    mainWindow.webContents.send('tab-switched', {
      isHome: tabs.get(clickedTab)!.isHome,
      url: tabs.get(clickedTab)!.view.webContents.getURL()
    })
  }

  // actually create our starting tabs — this was the missing piece
  createTab('tab1', true)
  createTab('tab2', true)
  tabs.get('tab1')!.view.webContents.loadURL('https://www.google.com')
  tabs.get('tab2')!.view.webContents.loadURL('https://www.youtube.com')
  tabs.get('tab1')!.view.setVisible(true) // tab1 starts as the visible one

  ipcMain.on('switch-tab', (_event, tabId: string) => {
    switchTab(tabId)
  })

  // resize whichever tab is currently active whenever the window resizes
  const updateBounds = () => {
    tabs.get(activeTab)!.view.setBounds(getContentBounds(mainWindow))
  }
  updateBounds()
  mainWindow.on('resize', updateBounds)

  ipcMain.on('navigate', (_event, url: string) => {
    const tab = tabs.get(activeTab)!
    tab.view.webContents.loadURL(url)
    tab.view.setVisible(true)
    tab.isHome = false
  })

  ipcMain.handle('get-current-state', () => {
    const tab = tabs.get(activeTab)!
    return {
      url: tab.view.webContents.getURL(),
      isHome: tab.isHome
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  ipcMain.on('go-back', () => tabs.get(activeTab)!.view.webContents.navigationHistory.goBack())
  ipcMain.on('go-forward', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.goForward()
  )
  ipcMain.on('reload', () => tabs.get(activeTab)!.view.webContents.reload())
  ipcMain.on('go-home', () => {
    const tab = tabs.get(activeTab)!
    tab.view.setVisible(false)
    tab.isHome = true
  })
  ipcMain.handle('can-go-back', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.canGoBack()
  )
  ipcMain.handle('can-go-forward', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.canGoForward()
  )

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
