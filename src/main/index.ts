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

  function getActiveTab(): TabData {
    const tab = tabs.get(activeTab)
    if (!tab) {
      throw new Error(`Active tab "${activeTab}" not found`)
    }
    return tab
  }

  function getTabList() {
    const result: { id: string; url: string; isHome: boolean }[] = []
    for (const [id, data] of tabs) {
      result.push({ id, isHome: data.isHome, url: data.view.webContents.getURL() })
    }
    return result
  }

  function createTab(tabId: string, isHome: boolean): TabData {
    const view = new WebContentsView()
    mainWindow.contentView.addChildView(view)
    view.setBounds(getContentBounds(mainWindow))
    view.setVisible(false)

    view.webContents.on('did-navigate', (_event, finalUrl) => {
      if (activeTab === tabId) {
        mainWindow.webContents.send('url-changed', finalUrl)
      }
    })

    const tabData: TabData = { view, isHome }
    tabs.set(tabId, tabData)
    return tabData
  }

  function switchTab(clickedTab: string) {
    const nextTab = tabs.get(clickedTab)
    if (!nextTab) {
      console.warn('A non existent tab was clicked, ignoring the request to switch tabs.')
      return
    }

    const currentTab = tabs.get(activeTab)
    if (currentTab) currentTab.view.setVisible(false)

    nextTab.view.setVisible(!nextTab.isHome)
    activeTab = clickedTab

    mainWindow.webContents.send('tab-switched', {
      id: clickedTab,
      isHome: nextTab.isHome,
      url: nextTab.view.webContents.getURL()
    })
    mainWindow.webContents.send('tabs-updated', getTabList())
  }

  function closeTab(tabId: string) {
    const target = tabs.get(tabId)
    if (!target) return

    target.view.setVisible(false)
    mainWindow.contentView.removeChildView(target.view)
    target.view.webContents.close()
    tabs.delete(tabId)

    if (tabs.size === 0) {
      const fallbackId = crypto.randomUUID()
      createTab(fallbackId, true)
      activeTab = fallbackId
      mainWindow.webContents.send('tab-switched', {
        id: fallbackId,
        isHome: true,
        url: ''
      })
      mainWindow.webContents.send('tabs-updated', getTabList())
      return
    }

    const remaining = Array.from(tabs.keys())
    const nextTabId =
      remaining[remaining.indexOf(tabId) + 1] ?? remaining[remaining.indexOf(tabId) - 1]

    if (tabId === activeTab) {
      activeTab = nextTabId ?? remaining[0]
      const nextTab = tabs.get(activeTab)
      if (nextTab) {
        nextTab.view.setVisible(!nextTab.isHome)
        mainWindow.webContents.send('tab-switched', {
          id: activeTab,
          isHome: nextTab.isHome,
          url: nextTab.view.webContents.getURL()
        })
      }
    }

    mainWindow.webContents.send('tabs-updated', getTabList())
  }

  // one real starting tab, no more hardcoded test setup
  const initialTabId = crypto.randomUUID()
  const initialTab = createTab(initialTabId, true)
  initialTab.view.setVisible(false)
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

  ipcMain.on('close-tab', (_event, tabId: string) => {
    closeTab(tabId)
  })

  ipcMain.handle('get-tabs', () => getTabList())

  // --- navigation ---

  ipcMain.on('navigate', (_event, url: string) => {
    const tab = getActiveTab()
    tab.view.webContents.loadURL(url)
    tab.view.setVisible(true)
    tab.isHome = false
    mainWindow.webContents.send('tab-switched', { id: activeTab, isHome: false, url })
    mainWindow.webContents.send('tabs-updated', getTabList())
  })

  ipcMain.on('go-home', () => {
    const tab = getActiveTab()
    tab.view.setVisible(false)
    tab.isHome = true
    mainWindow.webContents.send('tab-switched', { id: activeTab, isHome: true, url: '' })
    mainWindow.webContents.send('tabs-updated', getTabList())
  })

  ipcMain.on('go-back', () => getActiveTab().view.webContents.navigationHistory.goBack())
  ipcMain.on('go-forward', () => getActiveTab().view.webContents.navigationHistory.goForward())
  ipcMain.on('reload', () => getActiveTab().view.webContents.reload())

  ipcMain.handle('can-go-back', () => getActiveTab().view.webContents.navigationHistory.canGoBack())
  ipcMain.handle('can-go-forward', () =>
    getActiveTab().view.webContents.navigationHistory.canGoForward()
  )
  ipcMain.handle('get-current-state', () => {
    const tab = getActiveTab()
    return { url: tab.view.webContents.getURL(), isHome: tab.isHome }
  })
  ipcMain.handle('get-current-url', () => getActiveTab().view.webContents.getURL())

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
