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
| `src/play.js` | フリープレイの画面（チェス対局・麻雀の卓）。ビルド時に app.js の中へ入る |
| `src/chessai.js` | チェスCPU（0x88盤の αβ探索＋静止探索）。ルール判定と棋譜は chess.js |
| `src/mjgame.js` | 麻雀の対局：向聴数、役・符・点数、4人の進行、CPUの打ち方（押し引き込み） |
| `src/head.html` | タイトルとスタイル |
| `build.js` | 上を1枚の `index.html` にまとめる |
| `tests/verify.js` | チェス問題の合法性・詰みの有無、待ち計算、点数計算の検証 |
| `tests/chess-engine.js` | チェスCPUの perft（標準5局面）、1手詰め、自己対局 |
| `tests/mj-game.js` | 役・符・点数の既知値、向聴数、CPU4人の東風戦40回で点棒が保存されるか |

```sh
node build.js                 # index.html を作る
cd tests && npm i && node verify.js && node chess-engine.js && node mj-game.js
```

## フリープレイ

- チェス：CPU（入門・初級・中級）と対局。待った・ヒント・投了。途中の対局は保存され、続きから指せる。
- 麻雀：CPU3人と東風戦または1局。門前のみ（チー・ポン・カンなし）、リーチ・一発・ツモ・ロン・ドラ・裏ドラ・海底・河底・本場・供託・流局時のテンパイ料あり。ヒント（向聴数・おすすめ打牌・待ち・フリテン・役なし警告）と手牌公開の切り替えつき。

チェスの合法手判定は chess.js 0.10.3（cdnjs → jsDelivr の順に読み込み）。
