/**
 * Electronメインプロセス側に定義した処理
 * windowオブジェクトに設定しているため、型定義を拡張する必要がある
 */
export interface IElectronAPI {
  saveFile: (fileDir: string, fileName: string, data: string) => Promise<string>
  savePngFile: (fileDir: string, fileName: string, data: string) => Promise<string>
  copyFile: (fromPath: string, toPath: string) => Promise<string>
  saveStoreData: (key: string, value: any) => Promise<void>
  loadStoreData: (key: string) => Promise<any>
  clearStoreData: () => Promise<void>
}
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

/**
 * Electron API
 * Composition Function
 * @returns
 */
export const useElectronApi = () => {
  const saveFile = (fileDir: string, fileName: string, data: string, callback: (result: string) => void) => {
    if (!window.electronAPI) {
      callback('current platform is not support electron api.')
      return
    }
    window.electronAPI.saveFile(fileDir, fileName, data).then(callback)
  }

  const savePngFile = (fileDir: string, fileName: string, data: string, callback: (result: string) => void) => {
    if (!window.electronAPI) {
      callback('current platform is not support electron api.')
      return
    }
    window.electronAPI.savePngFile(fileDir, fileName, data).then(callback)
  }

  const copyFile = (fromPath: string, toPath: string, callback: (result: string) => void) => {
    if (!window.electronAPI) {
      callback('current platform is not support electron api.')
      return
    }
    window.electronAPI.copyFile(fromPath, toPath).then(callback)
  }

  const saveStoreData = (key: string, value: any) => {
    window.electronAPI?.saveStoreData(key, value)
  }

  const loadStoreData = (key: string, callback: (result: any) => void): any => {
    if (!window.electronAPI) {
      callback(null)
      return
    }
    window.electronAPI.loadStoreData(key).then(callback)
  }

  const clearStoreData = () => {
    window.electronAPI?.clearStoreData()
  }

  return {
    saveFile,
    savePngFile,
    copyFile,
    saveStoreData,
    loadStoreData,
    clearStoreData,
  }
}
