  // ================= フリープレイ（app.js の中に組み込まれる） =================
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function statsOf(k) {
    P.stats = P.stats || {};
    if (k === 'chess') { const s = P.stats.chess || (P.stats.chess = {}); for (const l of [1, 2, 3, 4, 5]) s[l] = s[l] || { w: 0, d: 0, l: 0 }; return s; }
    return P.stats.mj || (P.stats.mj = { games: 0, ranks: [0, 0, 0, 0], agari: 0, houju: 0, hands: 0, best: null, pt: 0 });
  }
  function playCards() {
    const cs = statsOf('chess'); const ms = statsOf('mj');
    const lv = [1, 2, 3, 4, 5]; const w = lv.reduce((a, l) => a + cs[l].w, 0), all = lv.reduce((a, l) => a + cs[l].w + cs[l].d + cs[l].l, 0);
    const resume = P.play && P.play.chess;
    return h('div', { class: 'playcards' },
      h('button', { class: 'pcard', style: `background:${cdeep('ch')}`, onclick: () => go({ name: 'chess' }) },
        h('span', { class: 'big' }, '♞︎'), h('b', {}, 'チェス対局'),
        h('span', {}, resume ? `対局の途中（${CLEVELS[resume.level - 1].name}）` : all ? `${all}局 ${w}勝` : 'CPU 5段階・対局後に解析')),
      h('button', { class: 'pcard', style: `background:${cdeep('mj')}`, onclick: () => go({ name: 'mjplay' }) },
        h('span', { class: 'big mjbig' }, '中'), h('b', {}, '麻雀 CPU3人'),
        h('span', {}, ms.games ? `${ms.games}戦 トップ${ms.ranks[0]}回` : '鳴き・槓・赤ドラありの本ルール')));
  }
  function playTopbar(title, chipText, onBack, extra) {
    return h('div', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': '戻る', onclick: onBack }, icon('back')),
      h('h2', {}, title), extra || null, chipText ? h('span', { class: 'chip' }, chipText) : null));
  }
  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); btn.textContent = 'コピーしました'; }
    catch { const ta = h('textarea', { class: 'type-in', readonly: true, style: 'min-height:90px;margin-top:8px' }); ta.value = text; btn.after(ta); ta.select(); btn.textContent = '選択したのでコピーしてください'; }
  }

  // ---------------- チェス ----------------
  const CLEVELS = [
    { v: 1, name: '入門', note: 'ときどき大きなミスをする' },
    { v: 2, name: '初級', note: '駒をタダではくれない' },
    { v: 3, name: '中級', note: '4手先まで読む' },
    { v: 4, name: '上級', note: '1.5秒しっかり読む（定跡あり）' },
    { v: 5, name: '最強', note: '3.5秒フルに読む。勝てたら本物' },
  ];
  const CLOCKS = [{ v: 'none', name: 'なし' }, { v: '10+0', name: '10分' }, { v: '5+3', name: '5分+3秒' }, { v: '3+2', name: '3分+2秒' }];
  const OPENINGS = [
    ['e4', 'キングズ・ポーン'], ['d4', 'クイーンズ・ポーン'], ['c4', 'イングリッシュ・オープニング'], ['Nf3', 'レティ・オープニング'],
    ['e4 e5', 'オープン・ゲーム'], ['e4 e5 Nf3 Nc6 Bc4', 'イタリアン・ゲーム'], ['e4 e5 Nf3 Nc6 Bb5', 'ルイ・ロペス（スペイン）'],
    ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', 'ルイ・ロペス：クローズド'],
    ['e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6', 'ルイ・ロペス：ベルリン・ディフェンス'],
    ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O', 'イタリアン：ジュオコ・ピアノ'],
    ['e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O', 'ツー・ナイツ・ディフェンス'],
    ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6', 'スコッチ・ゲーム'],
    ['e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5', 'ペトロフ・ディフェンス'],
    ['e4 e5 Nf3 d6 d4 Nf6 Nc3 Nbd7', 'フィリドール・ディフェンス'],
    ['e4 e5 Nc3 Nf6 f4 d5', 'ウィーン・ゲーム'], ['e4 e5 f4 exf4 Nf3 g5', 'キングズ・ギャンビット'],
    ['e4 c5', 'シシリアン・ディフェンス'],
    ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5', 'シシリアン：ナイドルフ'],
    ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7', 'シシリアン：ドラゴン'],
    ['e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6', 'シシリアン：スヴェシニコフ'],
    ['e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6 Nc3 Qc7', 'シシリアン：カン'], ['e4 c5 c3 Nf6 e5 Nd5 d4 cxd4', 'シシリアン：アラピン'],
    ['e4 e6', 'フレンチ・ディフェンス'], ['e4 e6 d4 d5 Nc3 Bb4 e5 c5', 'フレンチ：ウィナワー'], ['e4 e6 d4 d5 e5 c5 c3 Nc6', 'フレンチ：アドバンス'],
    ['e4 c6', 'カロ・カン・ディフェンス'], ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6', 'カロ・カン：クラシカル'], ['e4 c6 d4 d5 e5 Bf5 Nf3 e6', 'カロ・カン：アドバンス'],
    ['e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6', 'スカンジナビアン・ディフェンス'], ['e4 d6 d4 Nf6 Nc3 g6', 'ピルツ・ディフェンス'],
    ['e4 Nf6 e5 Nd5 d4 d6', 'アレヒン・ディフェンス'], ['e4 g6 d4 Bg7 Nc3 d6', 'モダン・ディフェンス'],
    ['d4 d5 c4', 'クイーンズ・ギャンビット'], ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O', 'クイーンズ・ギャンビット辞退'],
    ['d4 d5 c4 dxc4 Nf3 Nf6 e3 e6', 'クイーンズ・ギャンビット受諾'], ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4', 'スラブ・ディフェンス'],
    ['d4 d5 Nf3 Nf6 Bf4 e6 e3 c5', 'ロンドン・システム'], ['d4 Nf6 Bf4 d5 e3 e6', 'ロンドン・システム'],
    ['d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O', 'ニムゾ・インディアン'], ['d4 Nf6 c4 e6 Nf3 b6 g3 Bb7', 'クイーンズ・インディアン'],
    ['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O', 'キングズ・インディアン'], ['d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3', 'グリュンフェルド'],
    ['d4 f5 g3 Nf6 Bg2 e6', 'ダッチ・ディフェンス'], ['c4 e5 Nc3 Nf6 g3 d5', 'イングリッシュ：逆シシリアン'], ['c4 c5 Nc3 Nc6 g3 g6', 'イングリッシュ：シンメトリカル'],
    ['Nf3 d5 g3 Nf6 Bg2 c6', 'レティ・オープニング'],
  ].map(([l, n]) => [l.split(' '), n]);
  function openingName(sans) {
    let best = null;
    for (const [line, name] of OPENINGS) { if (line.length <= sans.length && line.every((m, i) => sans[i] === m) && (!best || line.length >= best[0].length)) best = [line, name]; }
    return best ? best[1] : null;
  }
  function bookMove(sans) {
    if (sans.length >= 16) return null;
    const cands = OPENINGS.filter(([line]) => line.length > sans.length && sans.every((m, i) => line[i] === m)).map(([line]) => line[sans.length]);
    return cands.length ? pick(cands) : null;
  }
  // エンジンは Web Worker で動かす（画面を止めない）。だめならメインスレッドで
  const Eng = (() => {
    let w = null, seq = 0; const pend = new Map();
    const fallback = (cmd, args) => new Promise((res) => setTimeout(() => res(ChessAI[cmd](...args)), 30));
    try {
      const src = `${makeChessEngine.toString()}\nconst E = makeChessEngine();\nself.onmessage = (e) => { const { id, cmd, args } = e.data; let r = null; try { r = E[cmd](...args); } catch (err) { r = { error: String(err) }; } self.postMessage({ id, r }); };`;
      w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      w.onmessage = (e) => { const p = pend.get(e.data.id); if (p) { pend.delete(e.data.id); p.res(e.data.r); } };
      w.onerror = () => { const all = [...pend.values()]; pend.clear(); w = null; all.forEach((p) => fallback(p.cmd, p.args).then(p.res)); };
    } catch { w = null; }
    return {
      call(cmd, ...args) { if (!w) return fallback(cmd, args); return new Promise((res) => { const id = ++seq; pend.set(id, { res, cmd, args }); w.postMessage({ id, cmd, args }); }); },
    };
  })();
  const CP = { game: null, color: 'w', level: 3, sel: null, hint: null, thinking: false, promo: null, resignArmed: false, newArmed: false, over: null, pickColor: 'w', pickLevel: 3, pickClock: 'none', clock: null, evalOn: false, evalCp: null, flip: false, review: null, viewPly: null, timer: null };
  const PIECE_JA = { k: 'キング', q: 'クイーン', r: 'ルーク', b: 'ビショップ', n: 'ナイト', p: 'ポーン' };
  const prevFens = (g) => { const tmp = new window.Chess(); const out = [tmp.fen()]; for (const m of g.history()) { tmp.move(m); out.push(tmp.fen()); } out.pop(); return out.slice(-100); };

  function chessView() {
    if (!window.Chess) {
      app.append(playTopbar('チェス対局', null, () => go({ name: 'home' })), h('div', { class: 'wrap empty' }, '盤面を読み込み中…'));
      ensureChess().then((ok) => { if (view.name !== 'chess') return; if (ok) render(); else { const e = app.querySelector('.empty'); if (e) e.textContent = 'チェス盤を読み込めませんでした。通信を確認して開き直してください。'; } });
      return;
    }
    if (!CP.game && P.play && P.play.chess) resumeChess();
    if (!CP.game) return chessSetup();
    chessGame();
  }
  function resumeChess() {
    const s = P.play.chess; const g = new window.Chess();
    for (const m of s.moves || []) if (!g.move(m)) break;
    Object.assign(CP, { game: g, color: s.color, level: s.level, sel: null, hint: null, thinking: false, promo: null, over: null, resignArmed: false, newArmed: false, clock: s.clock || null, review: null, viewPly: null, evalCp: null });
    if (CP.clock) CP.clock.last = Date.now();
  }
  function chessSetup() {
    const st = statsOf('chess');
    const root = h('div', { class: 'wrap setup', style: cvars('ch') });
    root.append(h('div', { class: 'sec-title' }, '相手の強さ'));
    const lv = h('div', { class: 'opt-list', role: 'radiogroup', 'aria-label': '相手の強さ' });
    for (const L2 of CLEVELS) {
      const s = st[L2.v];
      lv.append(h('button', { class: 'opt' + (CP.pickLevel === L2.v ? ' on' : ''), role: 'radio', 'aria-checked': String(CP.pickLevel === L2.v), onclick: () => { CP.pickLevel = L2.v; render(); } },
        h('span', { class: 'sl' }, h('b', {}, `Lv${L2.v} ${L2.name}`), h('small', {}, L2.note)), h('small', { class: 'num' }, `${s.w}勝 ${s.d}分 ${s.l}敗`)));
    }
    root.append(lv, h('div', { class: 'sec-title' }, 'あなたの色'));
    const seg = h('div', { class: 'seg wide', role: 'group', 'aria-label': 'あなたの色' });
    for (const [v, t] of [['w', '白（先手）'], ['b', '黒（後手）'], ['r', 'おまかせ']]) seg.append(h('button', { class: CP.pickColor === v ? 'on' : '', onclick: () => { CP.pickColor = v; render(); } }, t));
    root.append(seg, h('div', { class: 'sec-title' }, '持ち時間'));
    const seg2 = h('div', { class: 'seg wide', role: 'group', 'aria-label': '持ち時間' });
    for (const c of CLOCKS) seg2.append(h('button', { class: CP.pickClock === c.v ? 'on' : '', onclick: () => { CP.pickClock = c.v; render(); } }, c.name));
    root.append(seg2, h('button', { class: 'cta', onclick: startChess }, '対局をはじめる'),
      h('p', { class: 'note' }, '駒をタップ→行き先をタップ。待った・ヒント・評価バーあり。終局後は全手をエンジンで解析して、悪手と正解手を見せます。'));
    app.append(playTopbar('チェス対局', null, () => go({ name: 'home' })), root);
  }
  function startChess() {
    const color = CP.pickColor === 'r' ? (rand() < 0.5 ? 'w' : 'b') : CP.pickColor;
    let clock = null;
    if (CP.pickClock !== 'none') { const [m, inc] = CP.pickClock.split('+').map(Number); clock = { w: m * 60000, b: m * 60000, inc: inc * 1000, last: Date.now(), label: CP.pickClock }; }
    Object.assign(CP, { game: new window.Chess(), color, level: CP.pickLevel, sel: null, hint: null, thinking: false, promo: null, over: null, resignArmed: false, newArmed: false, clock, review: null, viewPly: null, evalCp: null, flip: false });
    persistChess(); render();
  }
  function persistChess() {
    P.play = P.play || {};
    P.play.chess = CP.game && !CP.over ? { moves: CP.game.history(), color: CP.color, level: CP.level, clock: CP.clock ? { w: CP.clock.w, b: CP.clock.b, inc: CP.clock.inc, label: CP.clock.label } : null } : null;
    save();
  }
  function tickClock() {
    const c = CP.clock; if (!c || CP.over || !CP.game) return;
    const now = Date.now(); const t = CP.game.turn(); c[t] -= now - c.last; c.last = now;
    if (c[t] <= 0) { c[t] = 0; finishChess(t === CP.color ? 'flag' : 'cpuflag'); return; }
    document.querySelectorAll('[data-clock]').forEach((el) => { const side = el.dataset.clock; el.textContent = fmtClock(c[side]); el.classList.toggle('run', side === t); el.classList.toggle('low', c[side] < 20000); });
  }
  const fmtClock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function pressClock(mover) { const c = CP.clock; if (!c) return; const now = Date.now(); c[mover] -= now - c.last; c[mover] += c.inc; c.last = now; }
  async function aiMove() {
    if (CP.thinking || !CP.game || CP.over) return;
    CP.thinking = true; const g = CP.game; const fen = g.fen(); render();
    let mv = null;
    const sans = g.history();
    const bm = CP.level >= 2 || rand() < 0.5 ? bookMove(sans) : null;
    if (bm) { await wait(450); const t = new window.Chess(fen); const r = t.move(bm); if (r) mv = { from: r.from, to: r.to, promotion: r.promotion }; }
    if (!mv) mv = await Eng.call('best', fen, CP.level, prevFens(g));
    if (view.name !== 'chess' || CP.game !== g || g.fen() !== fen || CP.over) { CP.thinking = false; return; }
    if (mv && mv.from) { pressClock(g.turn()); g.move({ from: mv.from, to: mv.to, promotion: mv.promotion }); }
    CP.thinking = false; sfx(g.in_check() ? 'bad' : 'good');
    afterMove();
  }
  function afterMove() {
    CP.hint = null; CP.sel = null; CP.resignArmed = false; CP.newArmed = false;
    if (CP.game.game_over()) return finishChess(null);
    persistChess(); render();
    if (CP.evalOn) refreshEval();
  }
  async function refreshEval() { const g = CP.game; const fen = g.fen(); const r = await Eng.call('analyze', fen, 250, prevFens(g)); if (CP.game === g && g.fen() === fen) { CP.evalCp = r; if (view.name === 'chess' && !CP.thinking) render(); } }
  function finishChess(kind) {
    const g = CP.game; let res, why;
    if (kind === 'resign') { res = 'l'; why = '投了'; }
    else if (kind === 'flag') { res = 'l'; why = '時間切れ'; }
    else if (kind === 'cpuflag') { res = 'w'; why = 'CPUの時間切れ'; }
    else if (g.in_checkmate()) { res = g.turn() === CP.color ? 'l' : 'w'; why = 'チェックメイト'; }
    else { res = 'd'; why = g.in_stalemate() ? 'ステイルメイト' : g.in_threefold_repetition() ? '同じ局面が3回' : g.insufficient_material() ? '詰ませる駒が足りない' : '50手ルール'; }
    const xp = res === 'w' ? 10 + CP.level * 5 : res === 'd' ? 8 + CP.level : 5;
    statsOf('chess')[CP.level][res]++;
    CP.over = { res, why, xp }; CP.thinking = false;
    awardXP(xp); persistChess(); sfx(res === 'w' ? 'done' : 'bad'); render();
  }
  function chessTap(sq) {
    const g = CP.game;
    if (CP.over || CP.thinking || g.turn() !== CP.color || CP.promo || CP.viewPly != null) return;
    if (CP.sel) {
      const mv = g.moves({ square: CP.sel, verbose: true }).filter((m) => m.to === sq);
      if (mv.length) {
        if (mv.some((m) => m.promotion)) { CP.promo = { from: CP.sel, to: sq }; render(); return; }
        pressClock(g.turn()); const r = g.move({ from: CP.sel, to: sq }); sfx(r && r.captured ? 'good' : 'good'); afterMove(); return;
      }
    }
    const p = g.get(sq);
    CP.sel = p && p.color === CP.color && CP.sel !== sq ? sq : null;
    render();
  }
  function capturedBy(g, color) {
    const start = { p: 8, n: 2, b: 2, r: 2, q: 1 }; const now = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const opp = color === 'w' ? 'b' : 'w';
    for (const row of g.board()) for (const x of row) if (x && x.color === opp && x.type !== 'k') now[x.type]++;
    let s = '', val = 0; const V = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    for (const t of ['q', 'r', 'b', 'n', 'p']) { const n = Math.max(0, start[t] - now[t]); s += (GLYPH[t] + '︎').repeat(n); val += n * V[t]; }
    return { s, val };
  }
  const evalText = (r) => (r == null ? '' : r.mate != null ? `M${Math.abs(r.mate)}${r.mate > 0 ? '（白）' : '（黒）'}` : `${r.score > 0 ? '+' : ''}${(r.score / 100).toFixed(1)}`);
  const winPct = (cp) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  const cpOf = (r) => (r.mate != null ? Math.sign(r.mate) * 10000 : r.score);
  function chessGame() {
    const g0 = CP.game;
    // 解析中の手の表示（viewPly）なら、その局面を盤に出す
    let g = g0; let reviewMove = null;
    if (CP.viewPly != null) { g = new window.Chess(); const hs = g0.history(); for (let i = 0; i < CP.viewPly; i++) g.move(hs[i]); reviewMove = CP.review && CP.review.moves[CP.viewPly - 1]; }
    const flip = (CP.color === 'b') !== CP.flip; const myTurn = g0.turn() === CP.color && !CP.over;
    const B = boardEl(g, flip, chessTap);
    const hist = g.history({ verbose: true }); const last = hist[hist.length - 1];
    if (last) { B.sqs[last.from].classList.add('last'); B.sqs[last.to].classList.add('last'); }
    if (g.in_check()) for (const [n, b] of Object.entries(B.sqs)) { const p = g.get(n); if (p && p.type === 'k' && p.color === g.turn()) b.classList.add('chk'); }
    if (CP.hint) { B.sqs[CP.hint.from].classList.add('hint'); B.sqs[CP.hint.to].classList.add('hint'); }
    if (reviewMove && reviewMove.best && reviewMove.cls !== 'best') { const bb = reviewMove.best; if (B.sqs[bb.from]) { B.sqs[bb.from].classList.add('hint'); B.sqs[bb.to].classList.add('hint'); } }
    if (CP.sel && CP.viewPly == null) {
      B.sqs[CP.sel].classList.add('sel');
      const seen = new Set();
      g.moves({ square: CP.sel, verbose: true }).forEach((m) => { if (seen.has(m.to)) return; seen.add(m.to); B.sqs[m.to].append(h('span', { class: 'dot' + (m.captured ? ' cap' : '') })); });
    }
    const mine = capturedBy(g, CP.color), theirs = capturedBy(g, CP.color === 'w' ? 'b' : 'w');
    const diff = mine.val - theirs.val;
    const lvName = `Lv${CP.level} ${CLEVELS[CP.level - 1].name}`;
    const oppC = CP.color === 'w' ? 'b' : 'w';
    const strip = (name, cap, d, color) => h('div', { class: 'cplayer' },
      h('span', { class: 'nm' }, h('span', { class: 'turn' }, h('i', { class: color })), name, CP.thinking && color === oppC ? h('span', { class: 'thinking' }, '考え中') : null),
      h('span', { class: 'caps' }, cap.s, d > 0 ? h('small', { class: 'num' }, ' +' + d) : null),
      CP.clock ? h('span', { class: 'clock num' + (g0.turn() === color && !CP.over ? ' run' : ''), 'data-clock': color }, fmtClock(CP.clock[color])) : null);
    const root = h('div', { class: 'wrap cplay', style: cvars('ch') });
    const name = openingName(g0.history());
    if (name) root.append(h('div', { class: 'opening' }, name));
    root.append(strip(`CPU（${lvName}）`, theirs, -diff, oppC));
    const bw = h('div', { class: 'board-wrap' + (CP.evalOn ? ' with-eval' : '') });
    if (CP.evalOn) {
      const r = CP.viewPly != null && CP.review ? CP.review.evals[CP.viewPly] : CP.evalCp;
      const wp = r ? winPct(cpOf(r)) : 50;
      const bar = h('div', { class: 'evalbar' + (flip ? ' flip' : ''), title: evalText(r) }, h('i', { style: `height:${wp}%` }), h('span', { class: 'num' }, evalText(r)));
      bw.append(bar);
    }
    bw.append(B.el); root.append(bw);
    root.append(strip('あなた', mine, diff, CP.color));
    if (CP.promo) {
      const row = h('div', { class: 'promo', role: 'group', 'aria-label': '昇格する駒' });
      for (const t of ['q', 'r', 'b', 'n']) row.append(h('button', { class: 'pc-btn', 'aria-label': PIECE_JA[t], onclick: () => { const pr = CP.promo; CP.promo = null; pressClock(g0.turn()); g0.move({ from: pr.from, to: pr.to, promotion: t }); afterMove(); } }, h('span', { class: 'pc ' + CP.color }, GLYPH[t] + '︎')));
      row.append(h('button', { class: 'sbtn', onclick: () => { CP.promo = null; render(); } }, 'やめる'));
      root.append(h('div', { class: 'cstatus' }, '昇格する駒を選んでください'), row);
    } else if (!CP.over) {
      const status = CP.thinking || !myTurn ? 'CPUが考え中…' : g0.in_check() ? 'チェックされています！' : 'あなたの番';
      root.append(h('div', { class: 'cstatus' + (g0.in_check() && myTurn ? ' warn' : '') }, status, CP.hint ? h('span', { class: 'hinttext' }, `　ヒント：${CP.hint.san}`) : null));
    }
    if (CP.over) root.append(chessOverPanel(g0));
    else {
      const canUndo = !CP.thinking && g0.history().length >= (CP.color === 'w' ? 1 : 2) && !CP.clock;
      const btn = (label, on, f, cls = '') => h('button', { class: 'sbtn ' + cls, disabled: !on, onclick: f }, label);
      root.append(h('div', { class: 'cbtns' },
        btn('待った', canUndo, () => { g0.undo(); if (g0.turn() !== CP.color) g0.undo(); CP.sel = null; CP.hint = null; persistChess(); render(); if (CP.evalOn) refreshEval(); }),
        btn('ヒント', myTurn && !CP.thinking, async (e) => { e.target.textContent = '考え中…'; const fen = g0.fen(); const m = await Eng.call('best', fen, 'hint', prevFens(g0)); if (m && CP.game === g0 && g0.fen() === fen) { const t2 = new window.Chess(fen); const mv = t2.move({ from: m.from, to: m.to, promotion: m.promotion }); CP.hint = { from: m.from, to: m.to, san: mv ? mv.san : '' }; render(); } }),
        btn(CP.evalOn ? '評価バー○' : '評価バー', true, () => { CP.evalOn = !CP.evalOn; render(); if (CP.evalOn) refreshEval(); }, CP.evalOn ? 'on' : ''),
        btn('盤を反転', true, () => { CP.flip = !CP.flip; render(); }),
        btn(CP.newArmed ? '本当に新しく' : '新しく', true, () => { if (!CP.newArmed) { CP.newArmed = true; render(); return; } CP.game = null; CP.over = null; persistChess(); render(); }, CP.newArmed ? 'warn' : ''),
        btn(CP.resignArmed ? '本当に投了' : '投了', !CP.thinking, () => { if (!CP.resignArmed) { CP.resignArmed = true; render(); return; } finishChess('resign'); }, CP.resignArmed ? 'warn' : '')));
      if (CP.clock) root.append(h('p', { class: 'note' }, '持ち時間ありの対局では待ったは使えません。'));
    }
    root.append(moveList(g0));
    app.append(playTopbar('チェス対局', lvName, () => { CP.sel = null; go({ name: 'home' }); }), root);
    const ml = root.querySelector('.movelist'); if (ml && CP.viewPly == null) ml.scrollTop = ml.scrollHeight;
    clearInterval(CP.timer); if (CP.clock && !CP.over) CP.timer = setInterval(() => { if (view.name === 'chess') tickClock(); else clearInterval(CP.timer); }, 250);
    if (!CP.over && g0.turn() !== CP.color && !CP.thinking) aiMove();
  }
  function moveList(g0) {
    const sans = g0.history(); const box = h('div', { class: 'movelist', 'aria-label': '棋譜' });
    if (!sans.length) { box.textContent = '棋譜はここに出ます'; return box; }
    const marks = CP.review ? CP.review.moves : null;
    for (let i = 0; i < sans.length; i++) {
      if (i % 2 === 0) box.append(h('span', { class: 'mno' }, `${i / 2 + 1}.`));
      const mk = marks && marks[i] ? marks[i].mark : '';
      const el = h(CP.review ? 'button' : 'span', { class: 'mv' + (CP.viewPly === i + 1 ? ' cur' : '') + (mk ? ' m-' + marks[i].cls : '') }, sans[i] + mk);
      if (CP.review) el.onclick = () => { CP.viewPly = i + 1; render(); };
      box.append(el);
    }
    return box;
  }
  function chessOverPanel(g0) {
    const t = { w: 'あなたの勝ち！', l: 'CPUの勝ち', d: '引き分け' }[CP.over.res];
    const panel = h('div', { class: 'cover' }, h('h3', {}, t), h('p', {}, `${CP.over.why} ・ +${CP.over.xp} XP`));
    const rv = CP.review;
    if (!rv) panel.append(h('button', { class: 'cta', onclick: () => runReview(g0) }, '全手を解析する'));
    else if (rv.running) panel.append(h('div', { class: 'goalbar' }, h('i', { style: `width:${Math.round(rv.done / rv.total * 100)}%;background:var(--c-ch)` })), h('p', { class: 'note' }, `解析中… ${rv.done}/${rv.total}`));
    else {
      panel.append(h('div', { class: 'acc' },
        h('div', {}, h('div', { class: 'lbl' }, 'あなたの精度'), h('b', { class: 'num' }, `${rv.acc[CP.color]}%`)),
        h('div', {}, h('div', { class: 'lbl' }, 'CPUの精度'), h('b', { class: 'num' }, `${rv.acc[CP.color === 'w' ? 'b' : 'w']}%`)),
        h('div', {}, h('div', { class: 'lbl' }, '悪手・大悪手'), h('b', { class: 'num' }, `${rv.count.mistake}・${rv.count.blunder}`))));
      panel.append(evalGraph(rv));
      const nav = h('div', { class: 'cbtns nav' },
        h('button', { class: 'sbtn', onclick: () => { CP.viewPly = 0; render(); } }, '|◀'),
        h('button', { class: 'sbtn', onclick: () => { CP.viewPly = Math.max(0, (CP.viewPly ?? g0.history().length) - 1); render(); } }, '◀'),
        h('button', { class: 'sbtn', onclick: () => { CP.viewPly = Math.min(g0.history().length, (CP.viewPly ?? 0) + 1); render(); } }, '▶'),
        h('button', { class: 'sbtn', onclick: () => { const i = rv.moves.findIndex((m, k) => k >= (CP.viewPly ?? 0) && m.color === CP.color && (m.cls === 'blunder' || m.cls === 'mistake')); if (i >= 0) { CP.viewPly = i + 1; render(); } } }, '次の悪手'));
      panel.append(nav);
      const cur = CP.viewPly ? rv.moves[CP.viewPly - 1] : null;
      if (cur) panel.append(h('p', { class: 'note' }, `${Math.ceil(CP.viewPly / 2)}${CP.viewPly % 2 ? '.' : '...'} ${cur.san}：${cur.label}${cur.cls !== 'best' && cur.bestSan ? `　最善は ${cur.bestSan}（緑のマス）` : ''}`));
      else panel.append(h('p', { class: 'note' }, '棋譜の手をタップするとその局面と最善手を表示します。'));
    }
    const pgnBtn = h('button', { class: 'sbtn' }, '棋譜（PGN）をコピー');
    pgnBtn.onclick = () => { g0.header('Event', 'よろず道場', 'White', CP.color === 'w' ? 'あなた' : 'CPU Lv' + CP.level, 'Black', CP.color === 'b' ? 'あなた' : 'CPU Lv' + CP.level, 'Result', CP.over.res === 'd' ? '1/2-1/2' : (CP.over.res === 'w') === (CP.color === 'w') ? '1-0' : '0-1'); copyText(g0.pgn(), pgnBtn); };
    panel.append(h('div', { class: 'row2' }, h('button', { class: 'cta', onclick: () => { CP.game = null; CP.over = null; CP.review = null; CP.viewPly = null; render(); } }, 'もう1局'), h('button', { class: 'cta alt', onclick: () => go({ name: 'home' }) }, 'ホーム')), pgnBtn);
    return panel;
  }
  function evalGraph(rv) {
    const W = 300, H = 70; const n = rv.evals.length;
    const y = (r) => H / 2 - (winPct(cpOf(r)) - 50) / 50 * (H / 2 - 2);
    const pts = rv.evals.map((r, i) => `${(i / Math.max(1, n - 1)) * W},${y(r).toFixed(1)}`).join(' ');
    const sel = CP.viewPly != null ? (CP.viewPly / Math.max(1, n - 1)) * W : null;
    const marks = rv.moves.map((m, i) => (m.cls === 'blunder' || m.cls === 'mistake') ? `<circle cx="${((i + 1) / Math.max(1, n - 1)) * W}" cy="${y(rv.evals[i + 1]).toFixed(1)}" r="3" fill="${m.cls === 'blunder' ? 'var(--bad)' : 'var(--gold)'}"/>` : '').join('');
    const el = h('div', { class: 'evalgraph', role: 'img', 'aria-label': '評価値の推移' });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><rect width="${W}" height="${H}" fill="var(--surface-2)"/><polygon points="0,${H} ${pts} ${W},${H}" fill="var(--eval-white)"/><line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" stroke="var(--line)" stroke-width="1"/><polyline points="${pts}" fill="none" stroke="var(--c-ch)" stroke-width="1.6"/>${marks}${sel != null ? `<line x1="${sel}" x2="${sel}" y1="0" y2="${H}" stroke="var(--accent)" stroke-width="1.5"/>` : ''}</svg>`;
    el.onclick = (e) => { const r = el.getBoundingClientRect(); CP.viewPly = Math.round((e.clientX - r.left) / r.width * (n - 1)); render(); };
    return el;
  }
  async function runReview(g0) {
    const sans = g0.history(); const t = new window.Chess(); const fens = [t.fen()];
    for (const m of sans) { t.move(m); fens.push(t.fen()); }
    CP.review = { running: true, done: 0, total: fens.length, evals: [], moves: [] }; render();
    const evals = [];
    for (let i = 0; i < fens.length; i++) {
      const tt = new window.Chess(fens[i]);
      if (tt.in_checkmate()) evals.push({ score: tt.turn() === 'w' ? -30000 : 30000, mate: tt.turn() === 'w' ? -0.5 : 0.5, best: null });
      else if (tt.game_over()) evals.push({ score: 0, mate: null, best: null });
      else evals.push(await Eng.call('analyze', fens[i], 220, fens.slice(Math.max(0, i - 100), i)));
      if (CP.game !== g0) return;
      CP.review.done = i + 1; if (view.name === 'chess' && (i % 3 === 0 || i === fens.length - 1)) render();
    }
    const moves = []; const accSum = { w: 0, b: 0 }, accN = { w: 0, b: 0 }; const count = { mistake: 0, blunder: 0 };
    for (let i = 0; i < sans.length; i++) {
      const color = i % 2 === 0 ? 'w' : 'b'; const sgn = color === 'w' ? 1 : -1;
      const before = winPct(sgn * cpOf(evals[i])), after = winPct(sgn * cpOf(evals[i + 1]));
      const drop = Math.max(0, before - after);
      const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1669));
      accSum[color] += acc; accN[color]++;
      const best = evals[i].best; const tt = new window.Chess(fens[i]); const played = tt.move(sans[i]);
      const isBest = best && played && best.from === played.from && best.to === played.to;
      let cls, mark = '', label;
      if (isBest || drop < 2) { cls = 'best'; label = isBest ? '最善手' : '好手'; }
      else if (drop < 5) { cls = 'good'; label = '悪くない'; }
      else if (drop < 10) { cls = 'inacc'; mark = '?!'; label = '疑問手'; }
      else if (drop < 20) { cls = 'mistake'; mark = '?'; label = '悪手'; }
      else { cls = 'blunder'; mark = '??'; label = '大悪手'; }
      if (color === CP.color && cls === 'mistake') count.mistake++; if (color === CP.color && cls === 'blunder') count.blunder++;
      let bestSan = '';
      if (best) { const t2 = new window.Chess(fens[i]); const r = t2.move({ from: best.from, to: best.to, promotion: best.promotion }); bestSan = r ? r.san : ''; }
      moves.push({ san: sans[i], color, cls, mark, label: `${label}（勝率 ${before.toFixed(0)}% → ${after.toFixed(0)}%）`, best, bestSan });
    }
    CP.review = { running: false, evals, moves, count, acc: { w: Math.round(accSum.w / Math.max(1, accN.w)), b: Math.round(accSum.b / Math.max(1, accN.b)) } };
    CP.viewPly = null; CP.evalOn = true;
    if (view.name === 'chess') render();
  }

  // ---------------- 麻雀 ----------------
  const SEATN = ['あなた', '下家', '対面', '上家'];
  const MP = { g: null, ui: { kind: 'idle' }, length: 'tonpu', hints: true, reveal: false, callPrompt: true, aka: true, quitArmed: false };
  const fmt = (n) => n.toLocaleString('ja-JP');
  const tT = (t, cls = '') => { const el = tileEl(MJ.code(t)); if (cls) el.className += ' ' + cls; return el; };
  function tId(id, cls = '') {
    const t = id >> 2; const red = MP.g ? MP.g.isRed(id) : MJG.RED.has(id);
    return h('span', { class: 'tile' + (red ? ' aka' : '') + (cls ? ' ' + cls : ''), title: MJ.name(t) + (red ? '（赤）' : ''), html: MJ.svg(t, red) });
  }
  function meldEl(m, owner) {
    const box = h('span', { class: 'meld' });
    if (m.kind === 'ankan') { m.ids.forEach((id, i) => box.append(i === 0 || i === 3 ? h('span', { class: 'tile back' }) : tId(id))); return box; }
    const rel = (m.from - owner + 4) % 4;
    const others = m.ids.filter((id) => id !== m.called && id !== m.added);
    const seq = others.map((id) => tId(id));
    const called = tId(m.called, 'side');
    const pos = m.kind === 'chi' || rel === 3 ? 0 : rel === 2 ? 1 : seq.length;
    seq.splice(pos, 0, called);
    if (m.kind === 'kakan') seq.splice(pos + 1, 0, tId(m.added, 'side'));
    seq.forEach((x) => box.append(x));
    return box;
  }
  function mjView() { if (!MP.g) return mjSetup(); mjTable(); }
  function mjSetup() {
    const st = statsOf('mj');
    const root = h('div', { class: 'wrap setup', style: cvars('mj') });
    root.append(h('p', { class: 'note' }, 'CPU3人との4人打ち。一般的なリーチ麻雀のルール：鳴き（チー・ポン・カン）、赤ドラ3枚、槓ドラ・裏ドラ・一発・嶺上・槍槓・海底・河底、喰いタン・後付けあり、喰い替え禁止、ダブロンあり、途中流局（九種九牌・四風連打・四家立直・四槓散了・三家和）、流し満貫、ダブル役満。25000点持ち30000点返し、ウマ10-30。'));
    root.append(h('div', { class: 'sec-title' }, '長さ'));
    const seg = h('div', { class: 'seg wide', role: 'group', 'aria-label': '長さ' });
    for (const [v, t] of [['tonpu', '東風戦'], ['hanchan', '半荘戦'], ['single', '1局だけ']]) seg.append(h('button', { class: MP.length === v ? 'on' : '', onclick: () => { MP.length = v; render(); } }, t));
    root.append(seg);
    const sw = (key, label, sub) => { const b = h('button', { class: 'switch' + (MP[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(MP[key]) }); b.onclick = () => { MP[key] = !MP[key]; render(); }; return h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, label), h('small', {}, sub)), b); };
    root.append(sw('hints', 'ヒントを出す', '何シャンテンか・おすすめの打牌・待ち・フリテン・役なし警告'));
    root.append(sw('callPrompt', '鳴きの確認を出す', 'オフにするとチー・ポンの確認を全部スキップ（ロンは必ず聞く）'));
    root.append(sw('aka', '赤ドラあり', '5萬・5筒・5索に1枚ずつ'));
    root.append(sw('reveal', '相手の手牌を見る', '練習用。CPUの狙いや待ちが分かる'));
    root.append(h('button', { class: 'cta', onclick: startMJ }, '対局をはじめる'));
    if (st.games) {
      const avg = (st.ranks.reduce((a, n, i) => a + n * (i + 1), 0) / st.games).toFixed(2);
      root.append(h('div', { class: 'statline' }, `${st.games}戦　1位${st.ranks[0]}・2位${st.ranks[1]}・3位${st.ranks[2]}・4位${st.ranks[3]}　平均順位 ${avg}　通算 ${st.pt > 0 ? '+' : ''}${(st.pt || 0).toFixed(1)}pt`, h('div', {}, `和了率 ${st.hands ? Math.round(st.agari / st.hands * 100) : 0}%・放銃率 ${st.hands ? Math.round(st.houju / st.hands * 100) : 0}%`), st.best ? h('div', {}, `最高の手：${st.best.name}（${fmt(st.best.total)}点）`) : null));
    }
    app.append(playTopbar('麻雀 フリープレイ', null, () => go({ name: 'home' })), root);
  }
  function mjRefresh() { if (view.name === 'mjplay') { const y = window.scrollY; render(); window.scrollTo(0, y); } }
  function startMJ() {
    const human = {
      onTurn: (g, seat, opts) => new Promise((resolve) => {
        const p = g.players[0];
        if (p.riichi && !opts.tsumo && !opts.ankan.length) { MP.ui = { kind: 'auto' }; mjRefresh(); setTimeout(() => resolve({ type: 'discard', id: p.drawn }), 600); return; }
        MP.ui = { kind: 'turn', opts, resolve, riichiMode: false }; mjRefresh();
      }),
      onRon: (g, seat, id) => new Promise((resolve) => { MP.ui = { kind: 'ron', id, resolve }; sfx('good'); mjRefresh(); }),
      onCall: (g, seat, id, o) => new Promise((resolve) => { if (!MP.callPrompt) return resolve(null); MP.ui = { kind: 'call', id, o, resolve }; mjRefresh(); }),
    };
    const g = new MJG.Game({
      rules: { length: MP.length, aka: MP.aka },
      agents: [human, MJG.cpuAgent(), MJG.cpuAgent(), MJG.cpuAgent()],
      hooks: {
        emit: (ev) => { if (MP.g === g && ev !== 'result') { if (!['turn', 'ron', 'call', 'auto'].includes(MP.ui.kind)) MP.ui = { kind: 'idle' }; mjRefresh(); } },
        sleep: (kind, seat) => wait(kind === 'discard' ? (seat === 0 ? 120 : 520) : kind === 'call' ? 500 : 450),
        pause: (r) => new Promise((resolve) => {
          if (MP.g !== g) return resolve();
          if (r.type === 'end') finishMJ(g, r);
          else if (r.wins) {
            const mine = r.wins.find((w) => w.winner === 0);
            if (mine) { const st = statsOf('mj'); if (!st.best || mine.ev.total > st.best.total) st.best = { total: mine.ev.total, name: mine.ev.yaku.filter((y) => !/ドラ/.test(y[0])).map((y) => y[0]).join('・') }; sfx('done'); }
            else if (r.from === 0) sfx('bad');
          }
          MP.ui = { kind: r.type === 'end' ? 'end' : 'result', r, resolve }; mjRefresh();
        }),
      },
    });
    MP.g = g; MP.ui = { kind: 'idle' }; MP.quitArmed = false;
    g.run(); // 最初の await まで同期で進み、配牌が済んでから画面を出す
    go({ name: 'mjplay' });
  }
  function quitMJ() {
    const g = MP.g; if (g) { g.aborted = true; const r = MP.ui.resolve; MP.ui = { kind: 'idle' }; if (r) r(null); }
    MP.g = null; go({ name: 'home' });
  }
  function finishMJ(g, r) {
    const st = statsOf('mj'); const rank = r.rank.indexOf(0);
    st.games++; st.ranks[rank]++; st.agari += g.stats.agari[0]; st.houju += g.stats.houju[0]; st.hands += g.stats.hands; st.pt = Math.round(((st.pt || 0) + r.pts[0]) * 10) / 10;
    const xp = g.rules.length === 'single' ? [15, 10, 8, 6][rank] : g.rules.length === 'hanchan' ? [50, 35, 25, 15][rank] : [30, 20, 15, 10][rank];
    r.xp = xp; awardXP(xp); save();
  }
  function riverEl(g, s) {
    const box = h('div', { class: 'river' });
    g.players[s].river.forEach((rv, k) => {
      const isLast = g.lastDiscard && g.lastDiscard.seat === s && k === g.players[s].river.length - 1;
      box.append(tId(rv.id, (rv.riichi ? 'rt ' : '') + (isLast ? 'last ' : '') + (rv.called ? 'gone ' : '') + (rv.tsumogiri ? 'tg' : '')));
    });
    return box;
  }
  function seatHead(g, s, cls) {
    const p = g.players[s];
    return h('div', { class: cls + (g.turn === s && !g.result ? ' turn' : '') },
      h('span', { class: 'wind' + (s === g.dealer ? ' dealer' : ''), title: s === g.dealer ? '親' : '子' }, MJG.WIND[g.seatWind(s)]),
      h('span', {}, SEATN[s]), h('span', { class: 'num' }, fmt(g.scores[s])), p.riichi ? h('span', { class: 'rbadge' }, p.dbl ? 'Wリーチ' : 'リーチ') : null);
  }
  function callShanten(g, pat, kind) {
    const p = g.players[0]; const c = MJG.countsId(p.hand); for (const t of pat) c[t]--; const k = p.melds.length + 1;
    if (kind === 'minkan') return MJG.shanten(c, k);
    let best = 9; for (let t = 0; t < 34; t++) if (c[t]) { c[t]--; best = Math.min(best, MJG.shanten(c, k)); c[t]++; } return best;
  }
  const sLabel = (s) => (s === -1 ? 'アガリ' : s === 0 ? 'テンパイ' : `${s}シャンテン`);
  function mjTable() {
    const g = MP.g; const ui = MP.ui; const me = g.players[0];
    const root = h('div', { class: 'wrap mjt', style: cvars('mj') });
    const opps = h('div', { class: 'opps' });
    for (const s of [3, 2, 1]) {
      const p = g.players[s];
      const o = h('div', { class: 'opp' + (g.turn === s && !g.result ? ' turn' : '') }, seatHead(g, s, 'ohead'));
      if (p.melds.length) o.append(h('div', { class: 'omelds' }, ...p.melds.map((m) => meldEl(m, s))));
      o.append(riverEl(g, s));
      if (MP.reveal) { const hd = h('div', { class: 'ohand' }); p.hand.slice().sort((a, b) => a - b).forEach((id) => hd.append(tId(id))); o.append(hd); }
      opps.append(o);
    }
    root.append(opps);
    root.append(h('div', { class: 'mjinfo' },
      h('span', {}, `${g.kyokuName()} ${g.honba}本場`), h('span', {}, `供託 ${g.sticks}`), h('span', { class: 'num' }, `残り ${g.live.length}`),
      h('span', { class: 'dora' }, 'ドラ表示', ...g.doraInd.map((d) => tT(d)))));
    const meBox = h('div', { class: 'mebox' });
    const head = seatHead(g, 0, 'mehead');
    if (me.hand.length % 3 === 1 && MJG.shanten(MJG.countsId(me.hand), me.melds.length) === 0 && g.isFuriten(0)) head.append(h('span', { class: 'rbadge warnb' }, 'フリテン'));
    meBox.append(head, riverEl(g, 0));
    // 手牌
    const turn = ui.kind === 'turn'; const opts = turn ? ui.opts : null;
    let rest = me.hand.slice(), drawn = null;
    if (me.drawn != null && me.hand.includes(me.drawn)) { rest.splice(rest.indexOf(me.drawn), 1); drawn = me.drawn; }
    rest.sort((a, b) => a - b);
    let eff = null; const rec = new Set();
    if (turn && MP.hints && !me.riichi) {
      const pool = me.hand.filter((x) => !opts.forbidden.includes(x >> 2));
      eff = MJG.efficiency(g, 0, me.hand);
      const valid = eff.opts.filter((o) => pool.some((x) => (x >> 2) === o.t));
      const minS = Math.min(...valid.map((o) => o.s)); const top = valid.filter((o) => o.s === minS); const maxU = Math.max(...top.map((o) => o.uke));
      eff = { minS, best: top.filter((o) => o.uke === maxU) };
      if (minS >= 0) eff.best.forEach((o) => rec.add(o.t));
    }
    const handRow = h('div', { class: 'phand' });
    const mkT = (id, isDrawn) => {
      const t = id >> 2;
      const forbidden = turn && opts.forbidden.includes(t);
      const allowed = turn && !me.riichi && !forbidden && (!ui.riichiMode || opts.riichi.includes(id));
      const b = h('button', { class: 'tbtn' + (rec.has(t) ? ' rec' : '') + ((turn && ui.riichiMode && !opts.riichi.includes(id)) || forbidden ? ' dim' : ''), disabled: !allowed, 'aria-label': MJ.name(t) + (isDrawn ? '（ツモ）' : '') + (forbidden ? '（喰い替え禁止）' : '') }, tId(id));
      b.onclick = () => { if (MP.ui !== ui || ui.kind !== 'turn') return; const res = ui.resolve; MP.ui = { kind: 'idle' }; res({ type: 'discard', id, riichi: !!ui.riichiMode }); };
      return b;
    };
    rest.forEach((id) => handRow.append(mkT(id, false)));
    if (drawn != null) { handRow.append(h('span', { class: 'gap' })); handRow.append(mkT(drawn, true)); }
    meBox.append(handRow);
    if (me.melds.length) meBox.append(h('div', { class: 'mymelds' }, ...me.melds.map((m) => meldEl(m, 0))));
    // 操作
    const act = h('div', { class: 'mjact' });
    const done = (v) => () => { const r = ui.resolve; MP.ui = { kind: 'idle' }; r(v); };
    if (turn) {
      if (opts.tsumo) act.append(h('button', { class: 'abtn shu', onclick: done({ type: 'tsumo' }) }, 'ツモ'));
      if (me.riichi && (opts.tsumo || opts.ankan.length)) act.append(h('button', { class: 'abtn ghost', onclick: done({ type: 'discard', id: me.drawn }) }, 'ツモ切り'));
      if (opts.riichi.length && !ui.riichiMode && !me.riichi) act.append(h('button', { class: 'abtn', onclick: () => { ui.riichiMode = true; mjRefresh(); } }, 'リーチ'));
      for (const t of opts.ankan) act.append(h('button', { class: 'abtn', onclick: done({ type: 'ankan', t }) }, '暗槓 ', tT(t)));
      for (const t of opts.kakan) act.append(h('button', { class: 'abtn', onclick: done({ type: 'kakan', t }) }, '加槓 ', tT(t)));
      if (opts.kyuushu) act.append(h('button', { class: 'abtn ghost', onclick: done({ type: 'kyuushu' }) }, '九種九牌で流す'));
      if (ui.riichiMode) act.append(h('span', { class: 'note' }, 'リーチ宣言する牌をタップ'), h('button', { class: 'abtn ghost', onclick: () => { ui.riichiMode = false; mjRefresh(); } }, 'やめる'));
      if (!act.childNodes.length) act.append(h('span', { class: 'note' }, opts.forbidden.length ? '切る牌をタップ（喰い替えになる牌は切れません）' : 'あなたの番：切る牌をタップ'));
    } else if (ui.kind === 'ron') {
      act.append(h('span', { class: 'ronq' }, tId(ui.id), 'でロンできます'),
        h('button', { class: 'abtn shu', onclick: done(true) }, 'ロン'), h('button', { class: 'abtn ghost', onclick: done(false) }, '見送る'));
    } else if (ui.kind === 'call') {
      const o = ui.o; const now = MJG.shanten(MJG.countsId(me.hand), me.melds.length);
      const lab = (pat, kind) => MP.hints ? h('small', { class: 'cs' }, `→${sLabel(callShanten(g, pat, kind))}`) : null;
      act.append(h('span', { class: 'ronq' }, tId(ui.id), MP.hints ? h('small', { class: 'note' }, `（今 ${sLabel(now)}）`) : null));
      const t = ui.id >> 2;
      if (o.pon) act.append(h('button', { class: 'abtn', onclick: done({ type: 'pon' }) }, 'ポン', lab([t, t], 'pon')));
      if (o.minkan) act.append(h('button', { class: 'abtn', onclick: done({ type: 'minkan' }) }, 'カン', lab([t, t, t], 'minkan')));
      for (const pat of o.chi) act.append(h('button', { class: 'abtn chi', onclick: done({ type: 'chi', pat }) }, 'チー', tT(pat[0]), tT(pat[1]), lab(pat, 'chi')));
      act.append(h('button', { class: 'abtn ghost', onclick: done(null) }, 'スキップ'));
    } else if (ui.kind === 'auto') act.append(h('span', { class: 'note' }, 'リーチ中：自動でツモ切り'));
    else act.append(h('span', { class: 'note' }, g.result ? '' : `${SEATN[g.turn]}の番…`));
    meBox.append(act);
    // ヒント
    if (MP.hints) {
      const hb = h('div', { class: 'hintbar' });
      if (eff) {
        if (eff.minS === -1) hb.append('アガリ形だけど役がないのでツモれません');
        else if (eff.minS === 0) hb.append(h('b', {}, 'テンパイ'), 'に取れる：', ...eff.best.slice(0, 4).map((o) => tT(o.t)), `を切ると ${eff.best[0].tiles.map((t) => MJ.name(t)).join('・')}待ち ${eff.best[0].uke}枚`);
        else hb.append(h('b', {}, `${eff.minS}シャンテン`), '　おすすめ：', ...eff.best.slice(0, 4).map((o) => tT(o.t)), `（受け入れ ${eff.best[0].uke}枚）`);
        const threats = MJG.threatsOf(g, 0);
        if (threats.length) hb.append(h('span', { class: 'warn' }, `　${threats.map((s) => SEATN[s]).join('・')}がテンパイ気配。安全牌は`), ...[...new Set(me.hand.map((x) => x >> 2))].filter((t) => MJG.safety(g, 0, t) >= 92).slice(0, 4).map((t) => tT(t)));
      } else if (me.hand.length % 3 === 1) {
        const c = MJG.countsId(me.hand); const s = MJG.shanten(c, me.melds.length);
        if (s === 0) {
          const ws = MJG.waits(c, me.melds.length); const vis = g.visible(0); const left = ws.reduce((a, w) => a + Math.max(0, 4 - c[w] - vis[w]), 0);
          hb.append(h('b', {}, 'テンパイ'), '　待ち：', ...ws.map((w) => tT(w)), `残り${left}枚`);
          if (g.isFuriten(0)) hb.append(h('span', { class: 'warn' }, '　フリテン（ロン不可・ツモのみ）'));
          else if (ws.every((w) => !g.ronResult(0, w * 4 + 1))) hb.append(h('span', { class: 'warn' }, g.closed(0) && !me.riichi ? '　役なし：ロンできない（リーチかツモで役がつく）' : me.riichi ? '' : '　役なし：このままではアガれない'));
        } else hb.append(`${s}シャンテン`);
      }
      meBox.append(hb);
    }
    root.append(meBox);
    if (ui.kind === 'result' || ui.kind === 'end') root.append(mjResultSheet(g, ui));
    const quit = () => { if (!MP.quitArmed && ui.kind !== 'end') { MP.quitArmed = true; mjRefresh(); setTimeout(() => { MP.quitArmed = false; }, 3000); return; } quitMJ(); };
    const tog = (key, label) => h('button', { class: 'chip tog' + (MP[key] ? ' on' : ''), 'aria-pressed': String(MP[key]), onclick: () => { MP[key] = !MP[key]; mjRefresh(); } }, label);
    app.append(playTopbar(MP.quitArmed ? 'もう一度押すとやめます' : '麻雀', null, quit, h('span', { class: 'togs' }, tog('hints', 'ヒント'), tog('callPrompt', '鳴き'), tog('reveal', '手牌'))), root);
  }
  function handWithMelds(hand, melds, owner, winId) {
    const hd = h('div', { class: 'hand small' }); hand.forEach((id) => hd.append(tId(id)));
    if (winId != null) { hd.append(h('span', { class: 'gap' }), tId(winId, 'win')); }
    (melds || []).forEach((m) => hd.append(meldEl(m, owner)));
    return hd;
  }
  function mjResultSheet(g, ui) {
    const r = ui.r;
    const bg = h('div', { class: 'sheet-bg' }); const sh = h('div', { class: 'sheet', role: 'dialog', 'aria-label': '結果' }); bg.append(sh);
    const next = (label) => h('button', { class: 'cta', onclick: () => { const res = ui.resolve; MP.ui = { kind: 'idle' }; mjRefresh(); res(); } }, label);
    const deltas = (d) => h('div', { class: 'deltas' }, ...[0, 1, 2, 3].map((s) => h('div', {}, h('div', { class: 'dn' }, SEATN[s]), h('div', { class: 'num ' + (d[s] > 0 ? 'plus' : d[s] < 0 ? 'minus' : '') }, d[s] > 0 ? '+' + fmt(d[s]) : d[s] ? fmt(d[s]) : '±0'), h('div', { class: 'num dn' }, fmt(g.scores[s])))));
    if (r.type === 'end') {
      sh.append(h('h3', {}, { single: '対局終了', tonpu: '東風戦 終了', hanchan: '半荘戦 終了' }[g.rules.length]));
      const t = h('table', { class: 'dtable rank' });
      r.rank.forEach((s, i) => t.append(h('tr', { class: s === 0 ? 'me' : '' }, h('td', {}, `${i + 1}位`), h('td', {}, SEATN[s]), h('td', { class: 'num' }, fmt(r.scores[s]) + '点'), h('td', { class: 'num' }, `${r.pts[s] > 0 ? '+' : ''}${r.pts[s].toFixed(1)}`))));
      sh.append(t, h('p', { class: 'note' }, `30000点返し・ウマ10-30　+${r.xp || 0} XP`),
        h('div', { class: 'row2' }, h('button', { class: 'cta', onclick: () => { const res = ui.resolve; MP.g = null; if (res) res(); startMJ(); } }, 'もう一回'), h('button', { class: 'cta alt', onclick: () => { const res = ui.resolve; MP.g = null; if (res) res(); go({ name: 'home' }); } }, 'ホーム')));
      return bg;
    }
    if (r.type === 'draw') {
      sh.append(h('h3', {}, `${r.abortive ? '途中流局：' : ''}${r.reason}（${r.kyoku}）`));
      if (!r.abortive) sh.append(h('div', { class: 'yrows' }, ...[0, 1, 2, 3].map((s) => h('div', { class: 'yrow' }, h('span', {}, SEATN[s]), h('b', {}, r.nagashi.includes(s) ? '流し満貫' : r.tenpai[s] ? 'テンパイ' : 'ノーテン')))));
      [0, 1, 2, 3].filter((s) => (r.tenpai[s] || r.abortive) && (s === 0 || MP.reveal)).forEach((s) => sh.append(h('div', { class: 'note' }, SEATN[s]), handWithMelds(r.hands[s], r.melds[s], s)));
      sh.append(deltas(r.delta), next('次の局へ'));
      return bg;
    }
    sh.append(h('h3', {}, r.wins.length > 1 ? 'ダブロン！' : `${SEATN[r.wins[0].winner]}の${r.type === 'ron' ? 'ロン' : 'ツモ'}！`, r.type === 'ron' ? h('small', { class: 'note' }, `　${SEATN[r.from]}から${r.chankan ? '（槍槓）' : ''}`) : null));
    for (const w of r.wins) {
      const ev = w.ev;
      if (r.wins.length > 1) sh.append(h('b', {}, SEATN[w.winner]));
      sh.append(handWithMelds(w.hand, w.melds, w.winner, r.id));
      sh.append(h('div', { class: 'yrows' }, ...ev.yaku.map(([n, hn]) => h('div', { class: 'yrow' }, h('span', {}, n), h('b', { class: 'num' }, ev.yakuman ? (hn === 26 ? 'ダブル役満' : '役満') : `${hn}翻`)))));
      const isDealer = w.winner === r.dealer;
      const ptsText = r.type === 'ron' ? `${fmt(ev.pay.ron)}点` : isDealer ? `${fmt(ev.pay.tsumoDealer)}点オール` : `${fmt(ev.pay.tsumoChild)}・${fmt(ev.pay.tsumoDealer)}点`;
      sh.append(h('div', { class: 'scoreline' }, h('span', {}, ev.yakuman ? ev.pay.limit : `${ev.fu}符 ${ev.han}翻${ev.pay.limit ? '　' + ev.pay.limit : ''}`), h('span', { class: 'points num' }, ptsText)));
      if (w.honba || w.sticks) sh.append(h('div', { class: 'note' }, `${w.honba ? `${w.honba}本場 +${fmt(w.honba * (r.type === 'ron' ? 300 : 300))}　` : ''}${w.sticks ? `供託 +${fmt(w.sticks * 1000)}` : ''}`));
      if (ev.fuParts && !ev.yakuman && ev.han < 5) sh.append(h('details', { class: 'fu' }, h('summary', {}, '符の内訳'), h('div', { class: 'note' }, ev.fuParts.join(' ＋ ') + ` → 切り上げ ${ev.fu}符`)));
    }
    const indic = h('div', { class: 'note dora' }, 'ドラ表示', ...r.doraInd.map((d) => tT(d)));
    if (r.wins.some((w) => w.riichi)) indic.append('　裏ドラ表示', ...r.uraInd.map((d) => tT(d)));
    sh.append(indic, deltas(r.delta), next('次の局へ'));
    return bg;
  }
