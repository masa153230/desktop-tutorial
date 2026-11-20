// エンジンの検証: perft（合法手生成の正しさ）と、chess.js と対局させての合法性・速度
const path = require('path');
const AI = require('../src/chessai.js');
const { Chess } = require(path.join(__dirname, 'node_modules/chess.js'));
let fail = 0;
const PERFT = [
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 4, 197281],
  ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 3, 97862],
  ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', 4, 43238],
  ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', 3, 9467],
  ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', 3, 62379],
];
for (const [fen, d, want] of PERFT) {
  const t = Date.now(); const got = AI.perft(fen, d);
  console.log(got === want ? 'ok' : 'NG', 'perft', d, got, want, (Date.now() - t) + 'ms'); if (got !== want) fail++;
}
// 1手詰めを見つけるか
for (const fen of ['6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', 'k7/7R/8/8/8/8/8/6RK w - - 0 1']) {
  for (const lv of [2, 3]) { const m = AI.best(fen, lv); const g = new Chess(fen); g.move(m); if (!g.in_checkmate()) { fail++; console.log('NG mate-in-1 missed', lv, fen, m); } }
}
console.log('ok mate-in-1 found');
// 自己対局：レベル1〜3同士で合法手のみ・時間
for (const [lw, lb] of [[1, 3], [3, 2], [2, 2]]) {
  const g = new Chess(); let maxT = 0, plies = 0;
  while (!g.game_over() && plies < 160) {
    const t = Date.now(); const m = AI.best(g.fen(), g.turn() === 'w' ? lw : lb); maxT = Math.max(maxT, Date.now() - t);
    if (!m || !g.move(m)) { fail++; console.log('NG illegal', g.fen(), m); break; }
    plies++;
  }
  const res = g.in_checkmate() ? (g.turn() === 'w' ? '黒勝ち' : '白勝ち') : g.game_over() ? '引き分け' : '打ち切り';
  console.log(`self-play 白Lv${lw} vs 黒Lv${lb}: ${plies}手 ${res} 最長思考 ${maxT}ms`);
}
// K+Q vs K を中級で詰ませられるか
{
  const g = new Chess('8/8/8/4k3/8/8/8/3QK3 w - - 0 1'); let n = 0;
  while (!g.game_over() && n < 120) { g.move(AI.best(g.fen(), g.turn() === 'w' ? 3 : 2)); n++; }
  console.log(g.in_checkmate() ? 'ok' : 'NG', 'KQ vs K mate in', Math.ceil(n / 2), 'moves'); if (!g.in_checkmate()) fail++;
}
console.log(fail ? fail + ' NG' : 'engine OK'); process.exit(fail ? 1 : 0);
