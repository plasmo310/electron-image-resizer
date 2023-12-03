import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'

function createWindow() {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../index.html'))

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

// ----- レンダラープロセスから呼び出される処理 -----
const fs = require('fs')

// ファイル保存処理
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

// base64ファイル保存処理
ipcMain.handle('saveBase64File', async (event, fileDir, fileName, data) => {
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
