// 教材の検証: node yorozu-dojo/tests/verify.js （chess.js@0.10.3 が必要: tests/ で npm i chess.js@0.10.3）
const path = require('path');
const { Chess } = require(path.join(__dirname, 'node_modules/chess.js'));
const CONTENT = require('../src/content.js');
const MJ = require('../src/mahjong.js');

let fail = 0;
const bad = (msg) => { fail++; console.log('NG', msg); };

const ch = CONTENT.courses.find((c) => c.id === 'ch');
const allChess = [];
for (const u of ch.units) for (const l of u.lessons) for (const e of l.ex || []) allChess.push([u.id + '.' + l.id, e]);
for (const [where, e] of allChess) {
  if (!e.fen) continue;
  const g = new Chess();
  if (!g.load(e.fen)) { bad(`${where} FEN不正 ${e.fen}`); continue; }
  if (e.t === 'chess' && e.mode === 'squares') {
    const ms = g.moves({ square: e.from, verbose: true });
    console.log(`ok ${where} squares ${e.from}: ${ms.length}マス [${ms.map((m) => m.to).join(' ')}]`);
    if (!ms.length) bad(`${where} 動けるマスが0`);
  } else if (e.t === 'chess' && e.goal === 'mate') {
    const mates = g.moves({ verbose: true }).filter((m) => { g.move(m); const r = g.in_checkmate(); g.undo(); return r; });
    console.log(`ok ${where} mate: ${mates.map((m) => m.san).join(', ') || 'なし'}`);
    if (!mates.length) bad(`${where} 詰みがない ${e.fen}`);
  } else if (e.t === 'chess') {
    for (const mv of e.goal) {
      const m = g.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: 'q' });
      if (!m) bad(`${where} 非合法 ${mv}`); else { console.log(`ok ${where} ${m.san}`); g.undo(); }
    }
  } else if (e.t === 'mc') {
    console.log(`ok ${where} mc-board stalemate=${g.in_stalemate()} pinnedKnightMoves=${g.moves({ square: 'd2' }).length}`);
  }
}

// 麻雀: 待ちの形の問題と役の手牌
const tcase = (s) => MJ.counts(MJ.parse(s));
const W = (s) => MJ.waits(tcase(s)).map(MJ.code).join(',');
const expect = (label, got, want) => { if (got !== want) bad(`${label}: got ${got} want ${want}`); else console.log('ok', label, got); };
expect('両面 45m+', W('45m123p456p789s11z'), '3m,6m');
expect('嵌張 46p', W('46p123m456m789s11z'), '5p');
expect('辺張 12s', W('12s123m456m789p11z'), '3s');
expect('双碰', W('22m66p123s456s789s'), '2m,6p');
expect('単騎 中', W('7z123m456m789p123s'), '7z');
expect('ノベタン', W('3456m123p456p789s'), '3m,6m');
expect('三面張', W('23456m123p456p55s'), '1m,4m,7m');
expect('1112', W('1112m456p789p123s'), '2m,3m');
expect('九蓮', W('1112345678999m'), '1m,2m,3m,4m,5m,6m,7m,8m,9m');
expect('国士13面', W('19m19p19s1234567z'), '1m,9m,1p,9p,1s,9s,1z,2z,3z,4z,5z,6z,7z');
expect('七対子単騎', W('11m33m55p77p99s22z6z'), '6z');

const mj = CONTENT.courses.find((c) => c.id === 'mj');
for (const u of mj.units) for (const l of u.lessons) for (const e of l.ex || []) {
  if (e.tiles && MJ.parse(e.tiles).length === 14) {
    const a = MJ.agari(MJ.counts(MJ.parse(e.tiles)));
    if (!a) bad(`役の手がアガリ形でない ${e.tiles}`); else console.log('ok agari', e.tiles, '→', MJ.describe(a));
  }
}

// ランダム生成の健全性
let seed = 1; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let k = 0; k < 2000; k++) {
  const h = MJ.randomComplete(rand, k % 3 ? {} : { suits: 'p', honors: false });
  const c = MJ.counts(h);
  if (h.length !== 14 || c.some((x) => x > 4) || !MJ.agari(c)) { bad('random complete ' + MJ.toStr(h)); break; }
}
expect('score 30-2 子', String(MJ.score(30, 2, false).pts), '2000');
expect('score 40-3 子', String(MJ.score(40, 3, false).pts), '5200');
expect('score 30-4 子', String(MJ.score(30, 4, false).pts), '7700');
expect('score 30-3 親', String(MJ.score(30, 3, true).pts), '5800');
expect('score 25-4 子', String(MJ.score(25, 4, false).pts), '6400');
expect('score 40-4 子', String(MJ.score(40, 4, false).pts), '8000');
expect('score 6翻 親', String(MJ.score(30, 6, true).pts), '18000');

console.log(fail ? `\n${fail} 件NG` : '\nすべてOK');
process.exit(fail ? 1 : 0);
