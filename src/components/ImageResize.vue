<script setup lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue'
import { useElectronApi } from '../api/electron-api'

const electronApi = useElectronApi()

declare global {
  interface File {
    path: string
  }
}

onMounted(() => {
  loadAllStoreData()
})

/**
 * 保存データキー
 */
const StoreDataKey = {
  IsKeepRatio: 'IsKeepRatio',
  OutputPath: 'OutputPath',
}

/**
 * 保存データロード処理
 */
const loadAllStoreData = () => {
  // 保存されているデータがあれば設定する
  electronApi.loadStoreData(StoreDataKey.IsKeepRatio, (storeData) => {
    if (storeData != undefined) {
      isKeepRatio.value = storeData
    }
  })
  electronApi.loadStoreData(StoreDataKey.OutputPath, (storeData) => {
    if (storeData != undefined) {
      outputPath.value = storeData
    }
  })
}

/**
 * オリジナル画像データ
 */
const originalImage = reactive({
  name: '',
  extention: '',
  path: '',
  ratio: 0,
  element: null,
})

/**
 * リサイズ画像情報
 */
const resizeImageSrc = ref('')
const resizeImageWidth = ref(0)
const resizeImageHeight = ref(0)

/**
 * ファイルドロップ処理
 */
const onDropFile = (event: DragEvent) => {
  if (!event?.dataTransfer) {
    return
  }
  if (event.dataTransfer.files.length === 0) {
    return
  }
  const file = event.dataTransfer.files[0]
  onSetPreviewImage(file)
}

/**
 * プレビュー画像の設定
 */
const onSetPreviewImage = (file: File) => {
  // 画像情報設定
  originalImage.name = file.name
  originalImage.extention = file.name.split('.').pop()
  originalImage.path = file.path
  originalImage.element = null

  resizeImageSrc.value = URL.createObjectURL(file)

  // gifはリサイズできないメッセージ
  message.value = ''
  if (originalImage.extention == 'gif') {
    message.value = 'gif形式のファイルはリサイズに対応していません'
  }

  // 画像読み込んで幅を設定
  const reader = new FileReader()
  reader.onloadend = () => {
    if (!reader.result || !(typeof reader.result == 'string')) {
      return
    }
    let loadImage = new Image()
    loadImage.src = reader.result
    loadImage.onload = () => {
      resizeImageHeight.value = loadImage.naturalHeight
      resizeImageWidth.value = loadImage.naturalWidth
      // 横のサイズをベースに比率を計算
      originalImage.ratio = resizeImageWidth.value / resizeImageHeight.value
      originalImage.element = loadImage
    }
  }
  reader.readAsDataURL(file)
}

/**
 * 画像最大サイズ
 */
const IMAGE_SIZE_MAX_VALUE = 1200

/**
 * 画像サイズ変更処理
 */
const onChangeWidthValue = (e: any) => {
  if (!originalImage.element) {
    resizeImageWidth.value = 0
    return
  }
  let inputValue = e.target.value
  if (inputValue >= IMAGE_SIZE_MAX_VALUE) {
    inputValue = IMAGE_SIZE_MAX_VALUE
  }
  resizeImageWidth.value = inputValue
  if (isKeepRatio.value) {
    resizeImageHeight.value = resizeImageWidth.value / originalImage.ratio
  }
  const base64 = onGetResizeImageBase64(originalImage.element, resizeImageWidth.value, resizeImageHeight.value)
  resizeImageSrc.value = base64
}
const onChangeHeightValue = (e: any) => {
  if (!originalImage.element) {
    resizeImageHeight.value = 0
    return
  }
  let inputValue = e.target.value
  if (inputValue >= IMAGE_SIZE_MAX_VALUE) {
    inputValue = IMAGE_SIZE_MAX_VALUE
  }
  resizeImageHeight.value = inputValue
  if (isKeepRatio.value) {
    resizeImageWidth.value = resizeImageHeight.value * originalImage.ratio
  }
  const base64 = onGetResizeImageBase64(originalImage.element, resizeImageWidth.value, resizeImageHeight.value)
  resizeImageSrc.value = base64
}

/**
 * リサイズしたbase64データを取得
 * https://qiita.com/komakomako/items/8efd4184f6d7cf1363f2
 */
const onGetResizeImageBase64 = (image: HTMLImageElement, width: number, height: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    return ''
  }
  context.drawImage(image, 0, 0, width, height)
  const base64 = canvas.toDataURL('image/png')
  return base64
}

/**
 * リサイズした画像ファイルを保存
 */
const onSaveFile = () => {
  if (!originalImage.element) {
    message.value = '画像を読み込んでいません'
    return
  }
  if (!outputPath.value) {
    message.value = '出力フォルダが定義されていません'
    return
  }

  message.value = ''
  let outputDirPath: string = outputPath.value
  if (outputDirPath.endsWith('/')) {
    outputDirPath = outputDirPath.slice(0, -1)
  }
  if (originalImage.extention == 'gif') {
    // gifはリサイズできないのでファイルコピー
    const fromPath = originalImage.path
    const fileName = originalImage.name.split('.')[0] + '.gif'
    const toPath = outputDirPath + '/' + fileName
    electronApi.copyFile(fromPath, toPath, (result) => (message.value = result))
  } else {
    // それ以外はpng形式でリサイズして保存
    const fileName = originalImage.name.split('.')[0] + '.png'
    const data = onGetResizeImageBase64(originalImage.element, resizeImageWidth.value, resizeImageHeight.value)
    electronApi.savePngFile(outputDirPath, fileName, data, (result) => (message.value = result))
  }
}

/**
 * 画像の縦横比固定するか？
 */
const isKeepRatio = ref(true)
const onChangeIsKeepRatio = (e: any) => {
  let inputValue = e.target.checked
  electronApi.saveStoreData(StoreDataKey.IsKeepRatio, inputValue)
}

/**
 * 出力パス
 */
const outputPath = ref('')
const onChangeOutputPath = (e: any) => {
  let inputValue = e.target.value
  electronApi.saveStoreData(StoreDataKey.OutputPath, inputValue)
}

/**
 * メッセージ
 */
const message = ref('')
</script>

<template>
  <div class="container">
    <div class="container-item image-area" @dragover.prevent @drop.prevent="onDropFile">
      <img v-if:="resizeImageSrc" class="image-item" :src="resizeImageSrc" />
      <div v-if:="!resizeImageSrc" class="image-drop-box">画像をドラッグ＆ドロップしてください。</div>
    </div>
    <label class="container-item image-name-area">{{ originalImage.name }}</label>
    <div class="container-item size-info-area">
      <input
        @input="onChangeWidthValue"
        class="size-input-value-item"
        type="number"
        min="0"
        maxlength="1200"
        placeholder="width"
        v-model.number="resizeImageWidth"
        :disabled="originalImage.extention == 'gif'"
      />
      <span class="size-input-value-px">px</span>
      <div class="size-input-value-between">x</div>
      <input
        @input="onChangeHeightValue"
        class="size-input-value-item"
        type="number"
        min="0"
        maxlength="1200"
        placeholder="height"
        v-model.number="resizeImageHeight"
        :disabled="originalImage.extention == 'gif'"
      />
      <span class="size-input-value-px">px</span>
      <div class="size-input-keep-ratio-area">
        <input @input="onChangeIsKeepRatio" class="size-input-keep-ratio-check" type="checkbox" v-model="isKeepRatio" />
        <label>縦横比<br />固定</label>
      </div>
    </div>
    <div class="container-item output-file-area">
      <input
        @input="onChangeOutputPath"
        class="output-file-value"
        type="text"
        placeholder="出力フォルダ"
        v-model="outputPath"
      />
      <button class="output-file-button" v-on:click="onSaveFile">出力</button>
    </div>
    <div class="container-item message-area">{{ message }}</div>
  </div>
</template>

<style scoped>
input {
  border-radius: 4px;
}
.container {
  text-align: center;
  display: flex;
  flex-flow: column;
  max-width: 640px;
}
.container-item {
  margin-bottom: 24px;
}
/** 画像エリア */
.image-area {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 280px;
  width: 100%;
}
.image-item {
  max-width: 100%;
  max-height: 280px;
}
.image-drop-box {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  border: 10px dashed #aaa;
  padding: 0px 12px;
  vertical-align: middle;
  text-align: center;
  border-radius: 8px;
}
.image-name-area {
  height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/** サイズ情報 */
.size-info-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 32px;
  margin-left: auto;
  margin-right: auto;
}
.size-input-value-px {
  width: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
  margin-left: 8px;
}
.size-input-value-between {
  width: 80px;
}
.size-input-value-item {
  width: 80%;
  height: 100%;
  text-align: right;
}
.size-input-keep-ratio-area {
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.size-input-keep-ratio-check {
  height: 18px;
  width: 18px;
  margin-right: 6px;
}
/** 出力パスエリア */
.output-file-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 32px;
  margin-left: auto;
  margin-right: auto;
}
.output-file-value {
  height: 100%;
  width: 100%;
}
.output-file-button {
  width: 80px;
  height: 120%;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 12px;
  box-shadow: 2px 2px 6px #555555;
}
/** メッセージ */
.message-area {
  height: 20px;
}
</style>
