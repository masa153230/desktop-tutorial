// 麻雀対局エンジンの検証: 点数の既知値、CPU同士の対局で点棒が保存されるか・必ず終わるか
global.MJ = require('../src/mahjong.js');
const G = require('../src/mjgame.js');
let fail = 0;
const C = (s) => MJ.counts(MJ.parse(s));
const I = (c) => MJ.idx(c);
function check(label, hand, win, ctx, want) {
  const ev = G.evaluateWin(C(hand), Object.assign({ win: I(win), tsumo: false, riichi: false, ippatsu: false, haitei: false, houtei: false, seat: 1, round: 0, dealer: false, doraInd: [], uraInd: [] }, ctx));
  const got = ev ? { total: ev.total, fu: ev.fu, han: ev.han, yaku: ev.yaku.map((y) => y[0]).join(',') } : null;
  const ok = JSON.stringify(got && Object.fromEntries(Object.keys(want).map((k) => [k, got[k]]))) === JSON.stringify(want);
  console.log(ok ? 'ok' : 'NG', label, JSON.stringify(got)); if (!ok) { fail++; console.log('   want', JSON.stringify(want)); }
}
check('平和ツモ 子 20符2翻', '234m567m345p678s99s', '4m', { tsumo: true }, { total: 1500, fu: 20, han: 2 });
check('七対子 親ロン', '11m33m55p77p99s22z66z', '6z', { dealer: true, seat: 0 }, { total: 2400, fu: 25, han: 2 });
check('国士無双', '119m19p19s1234567z', '1m', {}, { total: 32000 });
check('シャンポン中ロン 40符1翻', '123m456p789s22m777z', '7z', {}, { total: 1300, fu: 40, han: 1 });
check('四暗刻ツモ', '111m333p555s777z99s', '9s', { tsumo: true }, { total: 32000 });
check('四暗刻シャンポンロンは三暗刻対々', '111m333p555s777z99s', '5s', {}, { yaku: '役牌 中,対々和,三暗刻' });
check('役なしロンは不可', '123m456p789s234s55p', '5p', {}, null);
check('純チャン三色リーチ', '123m123p123s789m99p', '9p', { riichi: true }, { han: 6, yaku: '立直,三色同順,純全帯幺九' });
check('一気通貫 嵌張 ロン', '123m456m789m234p55s', '5m', {}, { fu: 40, han: 2, total: 2600 });
check('二盃口', '223344m667788p55s', '5s', {}, { yaku: '断幺九,二盃口', total: 8000 });
check('清一色 九蓮', '11123456789999m', '9m', { tsumo: true }, { total: 32000 });
check('ドラ・裏ドラ', '234m567m345p678s99s', '4m', { riichi: true, doraInd: [I('8s')], uraInd: [I('3m')] }, { han: 5, total: 8000, yaku: '立直,平和,ドラ,裏ドラ' });
check('ダブ東（親・東場）暗刻', '111z234m567p678s99s', '9s', { tsumo: true, dealer: true, seat: 0 }, { yaku: '門前清自摸和,場風 東,自風 東' });
// 向聴数
const S = (s) => G.shanten(C(s));
for (const [h, w] of [['123m456p789s234s5p', 0], ['123m456p789s23s5p9p', 1], ['19m19p19s1234567z', 0], ['1357m2468p13579s', 4]]) {
  const got = S(h); console.log(got === w ? 'ok' : 'NG', 'shanten', h, got, w); if (got !== w) fail++;
}
// CPU 4人で対局
let seed = 7; const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
(async () => {
  const yakuCount = {}; let hands = 0, draws = 0; const t0 = Date.now();
  for (let k = 0; k < 40; k++) {
    const g = new G.Game({ rand, agents: [0, 1, 2, 3].map(() => G.cpuAgent()), hooks: { pause: async (r) => {
      if (r.type === 'ron' || r.type === 'tsumo') r.ev.yaku.forEach(([n]) => { yakuCount[n] = (yakuCount[n] || 0) + 1; });
      if (r.type === 'draw') draws++;
      if (r.type !== 'end') hands++;
      const sum = g.scores.reduce((a, b) => a + b, 0) + g.sticks * 1000;
      if (sum !== 100000) { fail++; console.log('NG 点棒合計', sum, r.type); }
    } } });
    const fin = await g.run();
    if (!fin) { fail++; console.log('NG not finished'); }
  }
  console.log(`40半荘(東風) ${hands}局 流局${draws} ${(Date.now() - t0)}ms`);
  console.log('役の出現:', Object.entries(yakuCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}${v}`).join(' '));
  console.log(fail ? fail + ' NG' : 'mj game OK'); process.exit(fail ? 1 : 0);
})();
