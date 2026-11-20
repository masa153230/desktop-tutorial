// 麻雀対局エンジンの検証: 点数の既知値（門前・副露）、CPU同士の半荘で点棒の保存と終局
global.MJ = require('../src/mahjong.js');
const G = require('../src/mjgame.js');
let fail = 0;
const C = (s) => MJ.counts(MJ.parse(s));
const I = (c) => MJ.idx(c);
function check(label, hand, win, ctx, want, melds = []) {
  const c = C(hand); c[I(win)]++;
  const ev = G.evaluateWin(c, melds.map(([kind, t]) => ({ kind, t: I(t) })), Object.assign({ win: I(win), tsumo: false, riichi: false, ippatsu: false, haitei: false, houtei: false, seat: 1, round: 0, dealer: false, doraInd: [], uraInd: [], aka: 0 }, ctx));
  const got = ev ? { total: ev.total, fu: ev.fu, han: ev.han, yaku: ev.yaku.map((y) => y[0]).join(',') } : null;
  const ok = JSON.stringify(got && Object.fromEntries(Object.keys(want || {}).map((k) => [k, got[k]]))) === JSON.stringify(want);
  console.log(ok ? 'ok' : 'NG', label, JSON.stringify(got)); if (!ok) { fail++; console.log('   want', JSON.stringify(want)); }
}
// 門前
check('単騎ツモは平和にならない 30符1翻', '234m567m345p678s9s', '9s', { tsumo: true }, { total: 1100, fu: 30, han: 1 });
check('平和ツモ（両面で）', '23m567m345p678s99s', '4m', { tsumo: true }, { total: 1500, fu: 20, han: 2 });
check('七対子 親ロン', '11m33m55p77p99s22z6z', '6z', { dealer: true, seat: 0 }, { total: 2400, fu: 25, han: 2 });
check('国士無双 単騎', '119m19p19s123456z', '7z', {}, { total: 32000 });
check('国士13面はダブル', '19m19p19s1234567z', '1m', {}, { total: 64000 });
check('シャンポン中ロン 40符1翻', '123m456p789s22m77z', '7z', {}, { total: 1300, fu: 40, han: 1 });
check('四暗刻ツモ', '111m333p555s77z99s', '7z', { tsumo: true }, { total: 32000 });
check('四暗刻単騎はダブル', '111m333p555s777z9s', '9s', { tsumo: true }, { total: 64000 });
check('シャンポンロンは三暗刻対々', '111m333p55s777z99s', '5s', {}, { yaku: '役牌 中,対々和,三暗刻', total: 8000 });
check('純正九蓮はダブル', '1112345678999m', '5m', {}, { total: 64000 });
check('九蓮（純正でない）', '1112345678899m', '9m', {}, { total: 32000, yaku: '九蓮宝燈' });
check('役なしロンは不可', '123m456p789s234s5p', '5p', {}, null);
check('純チャン三色リーチ', '123m123p123s789m9p', '9p', { riichi: true }, { han: 6, yaku: '立直,三色同順,純全帯幺九' });
check('二盃口', '223344m667788p5s', '5s', {}, { yaku: '断幺九,二盃口', total: 8000 });
check('ドラ・赤・裏', '234m567m345p678s9s', '9s', { riichi: true, doraInd: [I('8s')], uraInd: [I('3m')], aka: 1 }, { han: 5, yaku: '立直,ドラ,赤ドラ,裏ドラ' });
check('ダブ東（親・東場）暗刻ツモ', '111z234m567p678s9s', '9s', { tsumo: true, dealer: true, seat: 0 }, { yaku: '門前清自摸和,場風 東,自風 東' });
// 副露
check('喰いタン 30符1翻', '234m567p5s', '5s', {}, { total: 1000, fu: 30, han: 1, yaku: '断幺九' }, [['chi', '3s'], ['pon', '6m']]);
check('副露で役なしは不可', '123m567p5s', '5s', {}, null, [['chi', '3s'], ['pon', '6m']]);
check('喰い一通＋中', '123m456m5p', '5p', {}, { total: 2000, fu: 30, han: 2, yaku: '役牌 中,一気通貫' }, [['chi', '7m'], ['pon', '7z']]);
check('喰い平和形は30符', '234m567p23s88s', '4s', {}, { total: 1000, fu: 30, han: 1 }, [['chi', '4p']]);
check('暗槓ダブ東 60符2翻 親', '234m567p5s', '5s', { dealer: true, seat: 0 }, { total: 5800, fu: 60, han: 2 }, [['ankan', '1z'], ['chi', '3s']]);
check('喰い混一色＋自風（＋一通）', '123p456p1z', '1z', {}, { yaku: '自風 南,一気通貫,混一色', han: 4 }, [['chi', '7p'], ['pon', '2z']]);
check('嶺上開花', '234m567p8s', '8s', { tsumo: true, rinshan: true }, { yaku: '嶺上開花,断幺九' }, [['minkan', '4s'], ['chi', '5s']]);
check('槍槓', '23m567m345p678s99s', '4m', { chankan: true }, { yaku: '槍槓,平和', total: 2000 });
check('三槓子', '23m55p', '4m', {}, { yaku: '三槓子' }, [['minkan', '1s'], ['minkan', '9p'], ['ankan', '7m']]);
// 向聴数（副露込み）
const S = (s, k) => G.shanten(C(s), k);
for (const [h, k, w] of [['123m456p789s234s5p', 0, 0], ['1357m2468p13579s', 0, 4], ['234m55p', 3, -1], ['234m5p', 3, 0], ['5p', 4, 0], ['13m5p8p', 3, 1]]) {
  const got = S(h, k); console.log(got === w ? 'ok' : 'NG', 'shanten', h, k, got, w); if (got !== w) fail++;
}
// CPU 4人で半荘
let seed = 11; const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
(async () => {
  const yaku = {}; const reasons = {}; let hands = 0, calls = 0, kans = 0; const t0 = Date.now();
  const N = +(process.argv[2] || 20);
  for (let k = 0; k < N; k++) {
    const g = new G.Game({ rand, rules: { length: k % 2 ? 'hanchan' : 'tonpu' }, agents: [0, 1, 2, 3].map(() => G.cpuAgent()), hooks: {
      emit: (ev) => { if (ev === 'kan') kans++; if (ev === 'call') calls++; },
      pause: async (r) => {
        if (r.wins) r.wins.forEach((w) => w.ev.yaku.forEach(([n]) => { yaku[n] = (yaku[n] || 0) + 1; }));
        if (r.type === 'draw') reasons[r.reason] = (reasons[r.reason] || 0) + 1;
        if (r.type !== 'end') hands++;
        const sum = g.scores.reduce((a, b) => a + b, 0) + g.sticks * 1000;
        if (sum !== 100000) { fail++; console.log('NG 点棒合計', sum, r.type, r.reason || ''); }
        if (r.type === 'end') { const ps = r.pts.reduce((a, b) => a + b, 0); if (Math.abs(ps) > 0.01) { fail++; console.log('NG pt合計', ps); } }
      } } });
    const fin = await g.run();
    if (!fin) { fail++; console.log('NG not finished'); }
  }
  console.log(`${N}半荘 ${hands}局 鳴き${calls} 槓${kans} ${(Date.now() - t0)}ms`);
  console.log('流局:', JSON.stringify(reasons));
  console.log('役:', Object.entries(yaku).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}${v}`).join(' '));
  console.log(fail ? fail + ' NG' : 'mj game OK'); process.exit(fail ? 1 : 0);
})();
