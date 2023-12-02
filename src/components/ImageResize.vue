<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      url: '', // 画像のURL
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
      this.url = URL.createObjectURL(image)
      console.log(this.url)
    },
  },
})
</script>
<template>
  <div class="container">
    <div class="container-item image-area" @dragover.prevent @drop.prevent="onDropFile">
      <img v-if:="url" class="image-item" :src="url" />
      <div v-if:="!url" class="image-drop-box">画像をドラッグ＆ドロップしてください。</div>
    </div>
    <div class="container-item size-info-area">
      <input class="size-input-value-item" type="number" min="0" placeholder="width (px)" />
      <div class="size-input-value-between">x</div>
      <input class="size-input-value-item" type="number" min="0" placeholder="height (px)" />
    </div>
    <div class="container-item output-file-area">
      <input class="output-file-value" type="text" />
      <button class="output-file-button">出力</button>
    </div>
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
  max-width: 600px;
}
.container-item {
  margin-bottom: 24px;
}
/** 画像エリア */
.image-area {
  display: table;
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
  color: #777;
  border: 10px dashed #aaa;
  padding: 0px 12px;
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  border-radius: 8px;
}
/** サイズ情報 */
.size-info-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  height: 32px;
  margin-left: auto;
  margin-right: auto;
}
.size-input-value-between {
  width: 80px;
}
.size-input-value-item {
  width: 80%;
  height: 100%;
  text-align: right;
}
/** 出力パスエリア */
.output-file-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
