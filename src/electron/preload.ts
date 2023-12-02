const { ipcRenderer, contextBridge } = require('electron')

// レンダラープロセス -> メインプロセス 処理を呼び出すためのブリッジ
// コンテキストを分離してwindowオブジェクトに設定する
// https://www.electronjs.org/ja/docs/latest/tutorial/context-isolation
contextBridge.exposeInMainWorld('electronAPI', {
  testFunc: () => ipcRenderer.invoke('testFunc'),
  saveFile: (fileDir: string, fileName: string, data: string) =>
    ipcRenderer.invoke('saveFile', fileDir, fileName, data),
})
