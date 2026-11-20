# よろず道場

英語・モンゴル語・チェス・麻雀をレッスン形式で学ぶ1ファイルの学習アプリ。

- 公開版（claude.ai アーティファクト）: https://claude.ai/artifact/FEDj4yYjMQMXkeoFqrrktb
- 進捗はアーティファクトの `db`（本人だけが読める `data/users/<id>/progress`）と、ブラウザの localStorage に保存。

## 構成

| ファイル | 中身 |
| --- | --- |
| `src/content.js` | 教材（英語・モンゴル語の例文、チェスの局面、麻雀の手牌） |
| `src/mahjong.js` | アガリ判定・待ち計算・打牌候補・点数計算・牌のSVG |
| `src/app.js` | 画面とレッスン進行 |
| `src/head.html` | タイトルとスタイル |
| `build.js` | 上を1枚の `index.html` にまとめる |
| `tests/verify.js` | チェス問題の合法性・詰みの有無、待ち計算、点数計算の検証 |

```sh
node build.js                 # index.html を作る
cd tests && npm i && node verify.js
```

チェスの合法手判定は chess.js 0.10.3（cdnjs → jsDelivr の順に読み込み）。
