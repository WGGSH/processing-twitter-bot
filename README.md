# Processing Twitter Bot

## 概要
Twitter 上で Processing のプログラムを実行し結果をツイートするbot

## 依存
- nodejs
- npm
- chromium-browser (無くても動くかも)

## 環境構築
- `npm install`
- [Twitter API Key](https://developer.twitter.com/en) を取得する
- [./.env\_example](./.env_example) を参考に `.env` にキーと chromium のパスを書く (chromiumは npm モジュールのchromium-browser が実行できない場合)

## 実行
- `npm run start`
