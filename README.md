# electron-image-resizer
画像をリサイズして指定ディレクトリに保存するツール (個人ブログ執筆用)

<img width="600" alt="screenshot 2023-12-03 23 58 49" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/08d86649-384c-4432-a7df-803b68f09d4a">

## 使用フレームワーク・ライブラリ
* バックエンド
  * Electron
* フロントエンド
  * Vue.js
* ビルドツール
  * Vite

## 動作環境
* 画像形式
  * png形式で出力 (リサイズ可)
    * png
    * jpg
  * gif形式で出力 (リサイズ不可)
    * gif
    
* 確認済のOS環境
  * 機種：MacBook Pro M2
  * OS：MacOS 13.3.1

## 使い方

1. アプリを起動し、リサイズしたい画像をドラッグ＆ドロップします。<br><img width="600" alt="screenshot 2023-12-03 23 59 43" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/5bb6fd71-1c80-44ce-b588-ac596c285f5a">
2. リサイズしたい数値を入力します。<br><img width="600" alt="screenshot 2023-12-04 0 10 21" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/b19ee5a7-f88e-4293-9c0e-69f9d896d078">
3. この時、「縦横比固定」のチェックを外すと自由に画像を変形できます。<br><img width="600" alt="screenshot 2023-12-04 0 11 20" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/e63f3db8-13de-49d3-91ba-097cd47d4efe">
4. 出力パスを入力して「出力」ボタンを押下します。<br><img width="600" alt="screenshot 2023-12-04 0 12 48" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/fd4b0e05-3f31-4c1c-8bfd-19a4c7a3d8bb">
5. 指定パスに出力されます。<br><img width="600" alt="screenshot 2023-12-04 0 13 40" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/c95ed7da-66c9-42ce-b2c2-021bdec57f76">

## 注意事項

* 現状gifアニメーションのリサイズには対応しておらず、指定フォルダ出力のみ行える状態になっています。<br><img width="600" alt="screenshot 2023-12-04 0 14 58" src="https://github.com/masarito617/electron-image-resizer/assets/77447256/f319a660-a8f8-4f12-95e0-c078b95351bd">
