const { ipcRenderer, contextBridge } = require('electron')

// レンダラープロセス -> メインプロセス 処理を呼び出すためのブリッジ
// コンテキストを分離してwindowオブジェクトに設定する
// https://www.electronjs.org/ja/docs/latest/tutorial/context-isolation
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (fileDir: string, fileName: string, data: string) =>
    ipcRenderer.invoke('saveFile', fileDir, fileName, data),
  savePngFile: (fileDir: string, fileName: string, data: string) =>
    ipcRenderer.invoke('savePngFile', fileDir, fileName, data),
  copyFile: (fromPath: string, toPath: string) => ipcRenderer.invoke('copyFile', fromPath, toPath),
  saveStoreData: (key: string, value: any) => ipcRenderer.invoke('saveStoreData', key, value),
  loadStoreData: (key: string) => ipcRenderer.invoke('loadStoreData', key),
  getAllStoreData: () => ipcRenderer.invoke('getAllStoreData'),
  clearStoreData: () => ipcRenderer.invoke('clearStoreData'),
})
