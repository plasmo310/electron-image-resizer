const { ipcRenderer, contextBridge } = require('electron')

// レンダラープロセス -> メインプロセス 処理を呼び出すためのブリッジ
// コンテキストを分離してwindowオブジェクトに設定する
// https://www.electronjs.org/ja/docs/latest/tutorial/context-isolation
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (fileDir: string, fileName: string, data: string) =>
    ipcRenderer.invoke('saveFile', fileDir, fileName, data),
  saveBase64File: (fileDir: string, fileName: string, data: string) =>
    ipcRenderer.invoke('saveBase64File', fileDir, fileName, data),
})
