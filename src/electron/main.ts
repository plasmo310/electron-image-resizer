import { app, BrowserWindow, ipcMain, screen } from 'electron'
import * as path from 'path'

// 保存データ
const Store = require('electron-store')
const store = new Store()

const StoreDataKey = {
  WindowPosition: 'WindowPosition',
  WindowSize: 'WindowSize',
}

const DefaultWindowSize = {
  width: 800,
  height: 600,
}

function createWindow() {
  const windowSize = store.get(StoreDataKey.WindowSize) || [DefaultWindowSize.width, DefaultWindowSize.height]
  const windowPosition = store.get(StoreDataKey.WindowPosition) || getCenterPosition()

  const mainWindow = new BrowserWindow({
    width: windowSize[0],
    height: windowSize[1],
    x: windowPosition[0],
    y: windowPosition[1],
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../index.html'))

  mainWindow.on('close', () => {
    // ウィンドウ情報を保存
    store.set(StoreDataKey.WindowPosition, mainWindow.getPosition())
    store.set(StoreDataKey.WindowSize, mainWindow.getSize())
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
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

/**
 * ウィンドウの中央の座標を返却
 *
 * @return {array}
 */
function getCenterPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.floor((width - DefaultWindowSize.width) / 2)
  const y = Math.floor((height - DefaultWindowSize.height) / 2)
  return [x, y]
}

// ----- レンダラープロセスから呼び出される処理 -----

/** ファイル保存関連 */
const fs = require('fs')

/**
 * ファイル保存処理
 */
ipcMain.handle('saveFile', async (event, fileDir, fileName, data) => {
  // 存在チェック
  try {
    fs.statSync(fileDir)
  } catch (e) {
    return `フォルダが存在しません => ${fileDir}`
  }

  // 保存処理
  const outputFilePath = path.join(fileDir, fileName)
  try {
    fs.writeFileSync(outputFilePath, data)
  } catch (e) {
    return `ファイルの保存に失敗しました => ${outputFilePath}`
  }
  return `ファイルを保存しました => ${outputFilePath}`
})

/**
 * base64ファイル保存処理
 */
ipcMain.handle('saveBase64File', async (event, fileDir: string, fileName: string, data: string) => {
  // 存在チェック
  try {
    fs.statSync(fileDir)
  } catch (e) {
    return `フォルダが存在しません => ${fileDir}`
  }

  // 保存処理
  const base64Data = data.replace(/^data:image\/png;base64,/, '')
  const outputFilePath = path.join(fileDir, fileName)
  try {
    fs.writeFileSync(outputFilePath, base64Data, 'base64')
  } catch (e) {
    return `ファイルの保存に失敗しました => ${outputFilePath}`
  }
  return `ファイルを保存しました => ${outputFilePath}`
})

/** データ保存関連 */
ipcMain.handle('saveStoreData', async (event, key: string, value: any) => {
  store.set(key, value)
})

ipcMain.handle('loadStoreData', async (event, key: string) => {
  return store.get(key)
})

ipcMain.handle('getAllStoreData', async (event) => {
  return store
})

ipcMain.handle('clearStoreData', async (event) => {
  store.clear()
})
