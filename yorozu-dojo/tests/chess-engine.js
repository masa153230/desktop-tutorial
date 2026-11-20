// チェスCPUの検証: perft（合法手生成）、詰み発見、終盤の詰ませ、レベル間の自己対局
const path = require('path');
const { ChessAI: AI } = require('../src/chessai.js');
const { Chess } = require(path.join(__dirname, 'node_modules/chess.js'));
let fail = 0;
const quick = process.argv[2] === 'quick';
const PERFT = [
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 4, 197281],
  ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 3, 97862],
  ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', 4, 43238],
  ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', 3, 9467],
  ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', 3, 62379],
];
for (const [fen, d, want] of PERFT) {
  const t = Date.now(); const got = AI.perft(fen, d);
  console.log(got === want ? 'ok' : 'NG', 'perft', d, got, (Date.now() - t) + 'ms'); if (got !== want) fail++;
}
for (const fen of ['6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', 'k7/7R/8/8/8/8/8/6RK w - - 0 1']) {
  for (const lv of [2, 3, 4]) { const m = AI.best(fen, lv); const g = new Chess(fen); g.move(m); if (!g.in_checkmate()) { fail++; console.log('NG mate-in-1 missed', lv, fen, m); } }
}
console.log('ok mate-in-1');
// 2手詰め（フィリドールの遺産）
{ const ms = AI.mateIn('r1b3kr/ppp3pp/8/3N4/8/8/PPP2nPP/R1BQ2K1 w - - 0 1', 2); console.log('mateIn2 sample:', ms.map((m) => m.from + m.to).join(',') || 'なし'); }
{ const a = AI.analyze('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 500); console.log(a.mate === 1 ? 'ok' : 'NG', 'analyze mate', JSON.stringify(a)); if (a.mate !== 1) fail++; }
// 終盤の詰ませ（KQK・KRK）を上級で
for (const [fen, lim] of [['8/8/8/4k3/8/8/8/3QK3 w - - 0 1', 30], ['8/8/8/4k3/8/8/8/R3K3 w - - 0 1', 50]]) {
  const g = new Chess(fen); let n = 0; const prev = [];
  while (!g.game_over() && n < lim * 2) { const m = AI.best(g.fen(), g.turn() === 'w' ? 4 : 3, prev); prev.push(g.fen()); g.move(m); n++; }
  console.log(g.in_checkmate() ? 'ok' : 'NG', fen.split(' ')[0], 'mate in', Math.ceil(n / 2)); if (!g.in_checkmate()) fail++;
}
// 自己対局
function play(lw, lb, maxPly = 200) {
  const g = new Chess(); let maxT = 0; const prev = [];
  while (!g.game_over() && g.history().length < maxPly) {
    const t = Date.now(); const m = AI.best(g.fen(), g.turn() === 'w' ? lw : lb, prev.slice(-100)); maxT = Math.max(maxT, Date.now() - t);
    prev.push(g.fen());
    if (!m || !g.move(m)) { fail++; console.log('NG illegal', g.fen(), JSON.stringify(m)); break; }
  }
  const res = g.in_checkmate() ? (g.turn() === 'w' ? 'b' : 'w') : 'd';
  return { res, plies: g.history().length, maxT };
}
const pairs = quick ? [[4, 2], [2, 4]] : [[4, 2], [2, 4], [4, 3], [3, 4], [3, 1], [1, 3]];
for (const [a, b] of pairs) { const r = play(a, b); console.log(`Lv${a}(白) vs Lv${b}(黒): ${r.res === 'd' ? '引き分け/打切' : r.res === 'w' ? '白勝ち' : '黒勝ち'} ${r.plies}手 最長思考${r.maxT}ms`); }
console.log(fail ? fail + ' NG' : 'engine OK'); process.exit(fail ? 1 : 0);
