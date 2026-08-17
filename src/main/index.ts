import { app, shell, BrowserWindow, WebContentsView, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { loadBookmarks, Bookmark } from './bookmarks'

function getContentBounds(win: BrowserWindow) {
  const [width, height] = win.getContentSize()
  const topBarHeight = 90

  return {
    x: 0,
    y: topBarHeight,
    width: width,
    height: height - topBarHeight
  }
}

interface TabData {
  view: WebContentsView
  isHome: boolean
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    show: false,
    icon: join(__dirname, '../../build/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const tabs = new Map<string, TabData>()
  let activeTab = ''

  function getTabList() {
    const result: { id: string; url: string; isHome: boolean }[] = []
    for (const [id, data] of tabs) {
      result.push({ id, isHome: data.isHome, url: data.view.webContents.getURL() })
    }
    return result
  }

  function createTab(tabId: string, isHome: boolean) {
    const view = new WebContentsView()
    mainWindow.contentView.addChildView(view)
    view.setBounds(getContentBounds(mainWindow))
    view.setVisible(false)

    view.webContents.on('did-navigate', (_event, finalUrl) => {
      if (activeTab === tabId) {
        mainWindow.webContents.send('url-changed', finalUrl)
      }
    })

    tabs.set(tabId, { view, isHome })
  }

  function switchTab(clickedTab: string) {
    if (!tabs.has(clickedTab)) {
      console.warn('A non existent tab was clicked, ignoring the request to switch tabs.')
      return
    }

    const currentTab = tabs.get(activeTab)
    if (currentTab) currentTab.view.setVisible(false)

    const nextTab = tabs.get(clickedTab)!
    nextTab.view.setVisible(!nextTab.isHome)
    activeTab = clickedTab

    mainWindow.webContents.send('tab-switched', {
      id: clickedTab,
      isHome: nextTab.isHome,
      url: nextTab.view.webContents.getURL()
    })
    mainWindow.webContents.send('tabs-updated', getTabList())
  }

  // one real starting tab, no more hardcoded test setup
  const initialTabId = crypto.randomUUID()
  createTab(initialTabId, true)
  tabs.get(initialTabId)!.view.setVisible(false)
  activeTab = initialTabId

  const updateBounds = () => {
    for (const [, data] of tabs) {
      data.view.setBounds(getContentBounds(mainWindow))
    }
  }
  updateBounds()
  mainWindow.on('resize', updateBounds)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // --- tab lifecycle ---

  ipcMain.on('switch-tab', (_event, tabId: string) => {
    switchTab(tabId)
  })

  ipcMain.on('new-tab', () => {
    const newId = crypto.randomUUID()
    createTab(newId, true)
    switchTab(newId)
    mainWindow.webContents.send('tabs-updated', getTabList())
  })

  ipcMain.handle('get-tabs', () => getTabList())

  // --- navigation ---

  ipcMain.on('navigate', (_event, url: string) => {
    const tab = tabs.get(activeTab)!
    tab.view.webContents.loadURL(url)
    tab.view.setVisible(true)
    tab.isHome = false
    mainWindow.webContents.send('tab-switched', { id: activeTab, isHome: false, url })
    mainWindow.webContents.send('tabs-updated', getTabList())
  })

  ipcMain.on('go-home', () => {
    const tab = tabs.get(activeTab)!
    tab.view.setVisible(false)
    tab.isHome = true
    mainWindow.webContents.send('tab-switched', { id: activeTab, isHome: true, url: '' })
    mainWindow.webContents.send('tabs-updated', getTabList())
  })

  ipcMain.on('go-back', () => tabs.get(activeTab)!.view.webContents.navigationHistory.goBack())
  ipcMain.on('go-forward', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.goForward()
  )
  ipcMain.on('reload', () => tabs.get(activeTab)!.view.webContents.reload())

  ipcMain.handle('can-go-back', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.canGoBack()
  )
  ipcMain.handle('can-go-forward', () =>
    tabs.get(activeTab)!.view.webContents.navigationHistory.canGoForward()
  )
  ipcMain.handle('get-current-state', () => {
    const tab = tabs.get(activeTab)!
    return { url: tab.view.webContents.getURL(), isHome: tab.isHome }
  })
  ipcMain.handle('get-current-url', () => tabs.get(activeTab)!.view.webContents.getURL())

  // --- bookmarks ---

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
