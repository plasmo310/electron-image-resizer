<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Electronメインプロセス側に定義した処理
 * windowオブジェクトに設定しているため、型定義を拡張する必要がある
 */
export interface IElectronAPI {
  saveFile: (fileDir: string, fileName: string, data: string) => Promise<string>
  saveBase64File: (fileDir: string, fileName: string, data: string) => Promise<string>
}
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

// 画像最大サイズ
const IMAGE_SIZE_MAX_VALUE = 1200

/**
 * Vue処理定義
 */
export default defineComponent({
  data() {
    return {
      // 画像サイズ
      imageWidth: 0,
      imageHeight: 0,
      imageRatio: 0,
      isKeepRatio: true,
      // 画像データ
      imageSrc: '',
      image: null,
      // 出力パス
      outputPath: '',
      // 表示メッセージ
      message: '',
    }
  },
  computed: {},
  methods: {
    // ファイルドロップ処理
    onDropFile(event: DragEvent) {
      if (!event?.dataTransfer) {
        return
      }
      if (event.dataTransfer.files.length === 0) {
        return
      }
      const file = event.dataTransfer.files[0]
      this.onSetPreviewImage(file)
    },
    // プレビュー画像の設定
    onSetPreviewImage(image: File) {
      // URL設定
      this.imageSrc = URL.createObjectURL(image)
      this.image = null

      // 画像読み込んで幅を設定
      const reader = new FileReader()
      reader.onloadend = () => {
        if (!reader.result || !(typeof reader.result == 'string')) {
          return
        }
        let image = new Image()
        image.src = reader.result
        image.onload = () => {
          this.imageHeight = image.naturalHeight
          this.imageWidth = image.naturalWidth
          // 横のサイズをベースに比率を計算
          this.imageRatio = this.imageWidth / this.imageHeight
          this.image = image
        }
      }
      reader.readAsDataURL(image)
    },
    // 画像幅変更
    onChangeWidthValue(e: any) {
      if (!this.image) {
        this.imageWidth = 0
        return
      }
      let inputValue = e.target.value
      if (inputValue >= IMAGE_SIZE_MAX_VALUE) {
        inputValue = IMAGE_SIZE_MAX_VALUE
      }
      this.imageWidth = inputValue
      if (this.isKeepRatio) {
        this.imageHeight = this.imageWidth / this.imageRatio
      }
      const base64 = this.onGetResizeImageBase64(this.image, this.imageWidth, this.imageHeight)
      this.imageSrc = base64
    },
    onChangeHeightValue(e: any) {
      if (!this.image) {
        this.imageHeight = 0
        return
      }
      let inputValue = e.target.value
      if (inputValue >= IMAGE_SIZE_MAX_VALUE) {
        inputValue = IMAGE_SIZE_MAX_VALUE
      }
      this.imageHeight = inputValue
      if (this.isKeepRatio) {
        this.imageWidth = this.imageHeight * this.imageRatio
      }
      const base64 = this.onGetResizeImageBase64(this.image, this.imageWidth, this.imageHeight)
      this.imageSrc = base64
    },
    // リサイズしたbase64データを取得
    // https://qiita.com/komakomako/items/8efd4184f6d7cf1363f2
    onGetResizeImageBase64(image: HTMLImageElement, width: number, height: number) {
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
    },
    // リサイズした画像ファイルを保存
    async onSaveFile() {
      if (!this.image) {
        this.message = '画像を読み込んでいません'
        return
      }
      if (!this.outputPath) {
        this.message = '出力フォルダが定義されていません'
        return
      }
      this.message = ''
      if (window.electronAPI) {
        const outputPath = this.outputPath
        const fileName = this.getYYYYMMDD_HHMMSS() + '.png'
        const data = this.onGetResizeImageBase64(this.image, this.imageWidth, this.imageHeight)
        window.electronAPI.saveBase64File(outputPath, fileName, data).then((message) => (this.message = message))
      }
    },
    getYYYYMMDD_HHMMSS() {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const day = currentDate.getDate()
      const hour = currentDate.getHours()
      const min = currentDate.getMinutes()
      const sec = currentDate.getSeconds()
      const date =
        year +
        String(month).padStart(2, '0') +
        String(day).padStart(2, '0') +
        '_' +
        String(hour).padStart(2, '0') +
        String(min).padStart(2, '0') +
        String(sec).padStart(2, '0')
      return date
    },
  },
})
</script>

<template>
  <div class="container">
    <div class="container-item image-area" @dragover.prevent @drop.prevent="onDropFile">
      <img v-if:="imageSrc" class="image-item" :src="imageSrc" />
      <div v-if:="!imageSrc" class="image-drop-box">画像をドラッグ＆ドロップしてください。</div>
    </div>
    <div class="container-item size-info-area">
      <input
        @input="onChangeWidthValue"
        class="size-input-value-item"
        type="number"
        min="0"
        maxlength="1200"
        placeholder="width"
        v-model.number="imageWidth"
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
        v-model.number="imageHeight"
      />
      <span class="size-input-value-px">px</span>
      <div class="size-input-keep-ratio-area">
        <input class="size-input-keep-ratio-check" type="checkbox" v-model="isKeepRatio" />
        <label>縦横比<br />固定</label>
      </div>
    </div>
    <div class="container-item output-file-area">
      <input class="output-file-value" type="text" placeholder="出力フォルダ" v-model="outputPath" />
      <button class="output-file-button" v-on:click="onSaveFile">出力</button>
    </div>
    <div class="container-item">{{ message }}</div>
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
  padding: 12px 0px;
}
.image-item {
  max-width: 100%;
  max-height: 280px;
}
.image-drop-box {
  width: 100%;
  height: 100%;
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
</style>
