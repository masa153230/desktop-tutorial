  // ================= フリープレイ（app.js の中に組み込まれる） =================
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function statsOf(k) {
    P.stats = P.stats || {};
    if (k === 'chess') return P.stats.chess || (P.stats.chess = { 1: { w: 0, d: 0, l: 0 }, 2: { w: 0, d: 0, l: 0 }, 3: { w: 0, d: 0, l: 0 } });
    return P.stats.mj || (P.stats.mj = { games: 0, ranks: [0, 0, 0, 0], agari: 0, houju: 0, hands: 0, best: null });
  }
  function playCards() {
    const cs = statsOf('chess'); const ms = statsOf('mj');
    const w = [1, 2, 3].reduce((a, l) => a + cs[l].w, 0), all = [1, 2, 3].reduce((a, l) => a + cs[l].w + cs[l].d + cs[l].l, 0);
    const resume = P.play && P.play.chess;
    return h('div', { class: 'playcards' },
      h('button', { class: 'pcard', style: `background:${cdeep('ch')}`, onclick: () => go({ name: 'chess' }) },
        h('span', { class: 'big' }, '♞︎'), h('b', {}, 'チェス対局'),
        h('span', {}, resume ? `対局の途中（${LEVELS[resume.level - 1].name}）` : all ? `${all}局 ${w}勝` : 'CPUと1局指す')),
      h('button', { class: 'pcard', style: `background:${cdeep('mj')}`, onclick: () => go({ name: 'mjplay' }) },
        h('span', { class: 'big mjbig' }, '中'), h('b', {}, '麻雀 東風戦'),
        h('span', {}, ms.games ? `${ms.games}戦 トップ${ms.ranks[0]}回` : 'CPU3人と打つ')));
  }
  function playTopbar(title, chipText, onBack, extra) {
    return h('div', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': '戻る', onclick: onBack }, icon('back')),
      h('h2', {}, title), extra || null, chipText ? h('span', { class: 'chip' }, chipText) : null));
  }

  // ---------------- チェス ----------------
  const LEVELS = [{ v: 1, name: '入門', note: 'ときどき大きなミスをする' }, { v: 2, name: '初級', note: '駒をタダではくれない' }, { v: 3, name: '中級', note: '5手先まで読む' }];
  const CP = { game: null, color: 'w', level: 2, sel: null, hint: null, thinking: false, promo: null, resignArmed: false, over: null, pickColor: 'w', pickLevel: 2 };
  const PIECE_JA = { k: 'キング', q: 'クイーン', r: 'ルーク', b: 'ビショップ', n: 'ナイト', p: 'ポーン' };

  function chessView() {
    if (!window.Chess) {
      app.append(playTopbar('チェス対局', null, () => go({ name: 'home' })), h('div', { class: 'wrap empty' }, '盤面を読み込み中…'));
      ensureChess().then((ok) => { if (view.name !== 'chess') return; if (ok) render(); else { app.querySelector('.empty').textContent = 'チェス盤を読み込めませんでした。通信を確認して開き直してください。'; } });
      return;
    }
    if (!CP.game && P.play && P.play.chess) resumeChess();
    if (!CP.game) return chessSetup();
    chessGame();
  }
  function resumeChess() {
    const s = P.play.chess; const g = new window.Chess();
    for (const m of s.moves || []) if (!g.move(m)) break;
    Object.assign(CP, { game: g, color: s.color, level: s.level, sel: null, hint: null, thinking: false, promo: null, over: null, resignArmed: false });
  }
  function chessSetup() {
    const st = statsOf('chess');
    const root = h('div', { class: 'wrap setup', style: cvars('ch') });
    root.append(h('p', { class: 'note' }, '駒をタップ→行き先をタップで指します。待った・ヒントあり。'));
    root.append(h('div', { class: 'sec-title' }, '相手の強さ'));
    const lv = h('div', { class: 'opt-list', role: 'radiogroup', 'aria-label': '相手の強さ' });
    for (const L2 of LEVELS) {
      const s = st[L2.v];
      lv.append(h('button', { class: 'opt' + (CP.pickLevel === L2.v ? ' on' : ''), role: 'radio', 'aria-checked': String(CP.pickLevel === L2.v), onclick: () => { CP.pickLevel = L2.v; render(); } },
        h('span', { class: 'sl' }, h('b', {}, L2.name), h('small', {}, L2.note)),
        h('small', { class: 'num' }, `${s.w}勝 ${s.d}分 ${s.l}敗`)));
    }
    root.append(lv);
    root.append(h('div', { class: 'sec-title' }, 'あなたの色'));
    const seg = h('div', { class: 'seg wide', role: 'group', 'aria-label': 'あなたの色' });
    for (const [v, t] of [['w', '白（先手）'], ['b', '黒（後手）'], ['r', 'おまかせ']]) seg.append(h('button', { class: CP.pickColor === v ? 'on' : '', onclick: () => { CP.pickColor = v; render(); } }, t));
    root.append(seg);
    root.append(h('button', { class: 'cta', onclick: startChess }, '対局をはじめる'));
    app.append(playTopbar('チェス対局', null, () => go({ name: 'home' })), root);
  }
  function startChess() {
    const color = CP.pickColor === 'r' ? (rand() < 0.5 ? 'w' : 'b') : CP.pickColor;
    Object.assign(CP, { game: new window.Chess(), color, level: CP.pickLevel, sel: null, hint: null, thinking: false, promo: null, over: null, resignArmed: false });
    persistChess(); render();
  }
  function persistChess() {
    P.play = P.play || {};
    P.play.chess = CP.game && !CP.over ? { moves: CP.game.history(), color: CP.color, level: CP.level } : null;
    save();
  }
  function aiMove() {
    if (CP.thinking || !CP.game || CP.over) return;
    CP.thinking = true;
    const g = CP.game;
    setTimeout(() => {
      if (view.name !== 'chess' || CP.game !== g) { CP.thinking = false; return; }
      const mv = ChessAI.best(g.fen(), CP.level);
      if (mv) g.move(mv);
      CP.thinking = false; sfx('good');
      afterMove();
    }, 300);
  }
  function afterMove() {
    CP.hint = null; CP.sel = null; CP.resignArmed = false;
    if (CP.game.game_over()) return finishChess(null);
    persistChess(); render();
  }
  function finishChess(resigned) {
    const g = CP.game; let res, why;
    if (resigned) { res = 'l'; why = '投了'; }
    else if (g.in_checkmate()) { res = g.turn() === CP.color ? 'l' : 'w'; why = 'チェックメイト'; }
    else { res = 'd'; why = g.in_stalemate() ? 'ステイルメイト' : g.in_threefold_repetition() ? '同じ局面が3回' : g.insufficient_material() ? '詰ませる駒が足りない' : '50手ルール'; }
    const xp = res === 'w' ? 15 + CP.level * 5 : res === 'd' ? 10 : 5;
    const st = statsOf('chess')[CP.level]; st[res]++;
    CP.over = { res, why, xp };
    awardXP(xp); persistChess(); sfx(res === 'w' ? 'done' : 'bad'); render();
  }
  function chessTap(sq) {
    const g = CP.game;
    if (CP.over || CP.thinking || g.turn() !== CP.color || CP.promo) return;
    if (CP.sel) {
      const mv = g.moves({ square: CP.sel, verbose: true }).filter((m) => m.to === sq);
      if (mv.length) {
        if (mv.some((m) => m.promotion)) { CP.promo = { from: CP.sel, to: sq }; render(); return; }
        g.move({ from: CP.sel, to: sq }); afterMove(); return;
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
    for (const t of ['q', 'r', 'b', 'n', 'p']) { const n = Math.max(0, start[t] - now[t]); s += GLYPH[t].repeat(n); val += n * V[t]; }
    return { s, val };
  }
  function chessGame() {
    const g = CP.game; const flip = CP.color === 'b'; const myTurn = g.turn() === CP.color && !CP.over;
    const B = boardEl(g, flip, chessTap);
    const hist = g.history({ verbose: true }); const last = hist[hist.length - 1];
    if (last) { B.sqs[last.from].classList.add('last'); B.sqs[last.to].classList.add('last'); }
    if (g.in_check()) { for (const [n, b] of Object.entries(B.sqs)) { const p = g.get(n); if (p && p.type === 'k' && p.color === g.turn()) b.classList.add('chk'); } }
    if (CP.hint) { B.sqs[CP.hint.from].classList.add('hint'); B.sqs[CP.hint.to].classList.add('hint'); }
    if (CP.sel) {
      B.sqs[CP.sel].classList.add('sel');
      const seen = new Set();
      g.moves({ square: CP.sel, verbose: true }).forEach((m) => { if (seen.has(m.to)) return; seen.add(m.to); B.sqs[m.to].append(h('span', { class: 'dot' + (m.captured ? ' cap' : '') })); });
    }
    const mine = capturedBy(g, CP.color), theirs = capturedBy(g, CP.color === 'w' ? 'b' : 'w');
    const diff = mine.val - theirs.val;
    const lvName = LEVELS[CP.level - 1].name;
    const strip = (name, cap, d, dot) => h('div', { class: 'cplayer' }, h('span', { class: 'nm' }, h('span', { class: 'turn' }, h('i', { class: dot })), name), h('span', { class: 'caps' }, cap.s, d > 0 ? h('small', { class: 'num' }, ' +' + d) : null));
    const status = CP.over ? '' : CP.thinking || g.turn() !== CP.color ? 'CPUが考え中…' : g.in_check() ? 'チェックされています！' : 'あなたの番';
    const root = h('div', { class: 'wrap cplay', style: cvars('ch') });
    root.append(strip(`CPU（${lvName}）`, theirs, -diff, CP.color === 'w' ? 'b' : 'w'));
    root.append(h('div', { class: 'board-wrap' }, B.el));
    root.append(strip('あなた', mine, diff, CP.color));
    if (CP.promo) {
      const row = h('div', { class: 'promo', role: 'group', 'aria-label': '昇格する駒' });
      for (const t of ['q', 'r', 'b', 'n']) row.append(h('button', { class: 'pc-btn', 'aria-label': PIECE_JA[t], onclick: () => { const pr = CP.promo; CP.promo = null; g.move({ from: pr.from, to: pr.to, promotion: t }); afterMove(); } }, h('span', { class: 'pc ' + CP.color }, GLYPH[t] + '︎')));
      row.append(h('button', { class: 'sbtn', onclick: () => { CP.promo = null; render(); } }, 'やめる'));
      root.append(h('div', { class: 'cstatus' }, '昇格する駒を選んでください'), row);
    } else root.append(h('div', { class: 'cstatus' + (g.in_check() && myTurn ? ' warn' : '') }, status, CP.hint ? h('span', { class: 'hinttext' }, `　ヒント：${CP.hint.san}`) : null));
    if (CP.over) {
      const t = { w: 'あなたの勝ち！', l: 'CPUの勝ち', d: '引き分け' }[CP.over.res];
      root.append(h('div', { class: 'cover' }, h('h3', {}, t), h('p', {}, `${CP.over.why} ・ +${CP.over.xp} XP`),
        h('div', { class: 'row2' }, h('button', { class: 'cta', onclick: () => { CP.game = null; CP.over = null; render(); } }, 'もう1局'), h('button', { class: 'cta alt', onclick: () => go({ name: 'home' }) }, 'ホーム'))));
    } else {
      const canUndo = !CP.thinking && hist.length >= (CP.color === 'w' ? 1 : 2);
      const resign = h('button', { class: 'sbtn' + (CP.resignArmed ? ' warn' : ''), onclick: () => { if (!CP.resignArmed) { CP.resignArmed = true; render(); return; } finishChess(true); } }, CP.resignArmed ? '本当に投了' : '投了');
      root.append(h('div', { class: 'cbtns' },
        h('button', { class: 'sbtn', disabled: !canUndo, onclick: () => { g.undo(); if (g.turn() !== CP.color) g.undo(); CP.sel = null; CP.hint = null; persistChess(); render(); } }, '待った'),
        h('button', { class: 'sbtn', disabled: !myTurn, onclick: () => { const m = ChessAI.best(g.fen(), 4); if (m) { const t2 = new window.Chess(g.fen()); const mv = t2.move(m); CP.hint = { from: m.from, to: m.to, san: mv ? mv.san : '' }; render(); } } }, 'ヒント'),
        h('button', { class: 'sbtn', onclick: () => { CP.game = null; CP.over = null; persistChess(); render(); } }, '新しく'),
        resign));
    }
    const ml = []; const sans = g.history();
    for (let i = 0; i < sans.length; i += 2) ml.push(`${i / 2 + 1}. ${sans[i]}${sans[i + 1] ? ' ' + sans[i + 1] : ''}`);
    root.append(h('div', { class: 'movelist', 'aria-label': '棋譜' }, ml.length ? ml.join('　') : '棋譜はここに出ます'));
    app.append(playTopbar('チェス対局', lvName, () => { CP.sel = null; go({ name: 'home' }); }), root);
    const ml2 = root.querySelector('.movelist'); ml2.scrollTop = ml2.scrollHeight;
    if (!CP.over && g.turn() !== CP.color && !CP.thinking) aiMove();
  }

  // ---------------- 麻雀 ----------------
  const SEATN = ['あなた', '下家', '対面', '上家'];
  const MP = { g: null, ui: { kind: 'idle' }, mode: 'tonpu', hints: true, reveal: false, quitArmed: false };
  const tileI = (i, cls = '') => { const el = tileEl(MJ.code(i)); if (cls) el.className += ' ' + cls; return el; };
  const fmt = (n) => n.toLocaleString('ja-JP');
  function mjView() { if (!MP.g) return mjSetup(); mjTable(); }
  function mjSetup() {
    const st = statsOf('mj');
    const root = h('div', { class: 'wrap setup', style: cvars('mj') });
    root.append(h('p', { class: 'note' }, 'CPU3人との4人打ち。ルールは門前のみ（チー・ポン・カンなし）、リーチ・ツモ・ロン・ドラ・裏ドラ・一発あり。役と符と点数は自動で計算します。'));
    root.append(h('div', { class: 'sec-title' }, '長さ'));
    const seg = h('div', { class: 'seg wide', role: 'group', 'aria-label': '長さ' });
    for (const [v, t] of [['tonpu', '東風戦（4局〜）'], ['single', '1局だけ']]) seg.append(h('button', { class: MP.mode === v ? 'on' : '', onclick: () => { MP.mode = v; render(); } }, t));
    root.append(seg);
    const sw = (key, label, sub) => { const b = h('button', { class: 'switch' + (MP[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(MP[key]) }); b.onclick = () => { MP[key] = !MP[key]; render(); }; return h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, label), h('small', {}, sub)), b); };
    root.append(sw('hints', 'ヒントを出す', '何シャンテンか・おすすめの打牌・待ち・役なし警告'));
    root.append(sw('reveal', '相手の手牌を見る', '練習用。CPUがなぜその牌を切ったか分かる'));
    root.append(h('button', { class: 'cta', onclick: startMJ }, '対局をはじめる'));
    if (st.games) {
      const avg = (st.ranks.reduce((a, n, i) => a + n * (i + 1), 0) / st.games).toFixed(2);
      root.append(h('div', { class: 'statline' }, `${st.games}戦　1位${st.ranks[0]}・2位${st.ranks[1]}・3位${st.ranks[2]}・4位${st.ranks[3]}　平均順位 ${avg}　和了${st.agari}・放銃${st.houju}`, st.best ? h('div', {}, `最高の手：${st.best.name}（${fmt(st.best.total)}点）`) : null));
    }
    app.append(playTopbar('麻雀 フリープレイ', null, () => go({ name: 'home' })), root);
  }
  function mjRefresh() { if (view.name === 'mjplay') { const y = window.scrollY; render(); window.scrollTo(0, y); } }
  function startMJ() {
    const human = {
      onDraw: (g) => new Promise((resolve) => {
        const p = g.players[0];
        if (p.riichi && !g.canTsumo(0)) { MP.ui = { kind: 'auto' }; mjRefresh(); setTimeout(() => resolve({ type: 'discard', tile: p.drawn }), 650); return; }
        MP.ui = { kind: 'draw', resolve, riichiMode: false }; mjRefresh();
      }),
      onRon: (g, seat, tile) => new Promise((resolve) => { MP.ui = { kind: 'ron', resolve, tile }; sfx('good'); mjRefresh(); }),
    };
    const g = new MJG.Game({
      mode: MP.mode, names: SEATN,
      agents: [human, MJG.cpuAgent(), MJG.cpuAgent(), MJG.cpuAgent()],
      hooks: {
        emit: (ev) => { if (MP.g === g && ev !== 'result') { if (MP.ui.kind !== 'draw' && MP.ui.kind !== 'ron') MP.ui = { kind: 'idle' }; mjRefresh(); } },
        sleep: (kind, seat) => wait(kind === 'discard' ? (seat === 0 ? 120 : 480) : 400),
        pause: (r) => new Promise((resolve) => {
          if (MP.g !== g) return resolve();
          if (r.type === 'end') finishMJ(g, r);
          else if ((r.type === 'ron' || r.type === 'tsumo') && r.winner === 0) { const st = statsOf('mj'); if (!st.best || r.ev.total > st.best.total) st.best = { total: r.ev.total, name: r.ev.yakuman ? r.ev.yaku.map((y) => y[0]).join('・') : `${r.ev.yaku.filter((y) => !/ドラ/.test(y[0])).map((y) => y[0]).join('・')}` }; sfx('done'); }
          else if (r.type === 'ron' && r.from === 0) sfx('bad');
          MP.ui = { kind: r.type === 'end' ? 'end' : 'result', r, resolve }; mjRefresh();
        }),
      },
    });
    MP.g = g; MP.ui = { kind: 'idle' }; MP.quitArmed = false;
    g.run(); // 最初の await まで同期で進み、配牌が済んでから画面を出す
    go({ name: 'mjplay' });
  }
  function quitMJ() {
    const g = MP.g; if (g) { g.aborted = true; const r = MP.ui.resolve; MP.ui = { kind: 'idle' }; if (r) r(false); }
    MP.g = null; go({ name: 'home' });
  }
  function finishMJ(g, r) {
    const st = statsOf('mj'); const rank = r.rank.indexOf(0);
    st.games++; st.ranks[rank]++; st.agari += g.stats.agari[0]; st.houju += g.stats.houju[0]; st.hands += g.stats.hands;
    const xp = g.mode === 'single' ? [15, 10, 8, 6][rank] : [30, 20, 15, 10][rank];
    r.xp = xp; awardXP(xp); save();
  }
  function riverEl(g, s) {
    const box = h('div', { class: 'river' });
    g.players[s].river.forEach((rv, k) => {
      const isLast = g.lastDiscard && g.lastDiscard.seat === s && k === g.players[s].river.length - 1;
      box.append(tileI(rv.t, (rv.riichi ? 'rt ' : '') + (isLast ? 'last' : '')));
    });
    return box;
  }
  function seatHead(g, s, cls) {
    const p = g.players[s];
    return h('div', { class: cls + (g.turn === s && !g.result ? ' turn' : '') },
      h('span', { class: 'wind' + (s === g.dealer ? ' dealer' : ''), title: s === g.dealer ? '親' : '子' }, MJG.WIND[g.seatWind(s)]),
      h('span', {}, SEATN[s]), h('span', { class: 'num' }, fmt(g.scores[s])), p.riichi ? h('span', { class: 'rbadge' }, 'リーチ') : null);
  }
  function mjTable() {
    const g = MP.g; const ui = MP.ui; const me = g.players[0];
    const root = h('div', { class: 'wrap mjt', style: cvars('mj') });
    const opps = h('div', { class: 'opps' });
    for (const s of [3, 2, 1]) {
      const o = h('div', { class: 'opp' + (g.turn === s && !g.result ? ' turn' : '') }, seatHead(g, s, 'ohead'), riverEl(g, s));
      if (MP.reveal) { const hd = h('div', { class: 'ohand' }); MJ.sortCodes(g.players[s].hand.map(MJ.code)).forEach((c) => hd.append(tileEl(c))); o.append(hd); }
      opps.append(o);
    }
    root.append(opps);
    root.append(h('div', { class: 'mjinfo' },
      h('span', {}, `${g.kyokuName()} ${g.honba}本場`), h('span', {}, `供託 ${g.sticks}`), h('span', { class: 'num' }, `残り ${g.live.length}`),
      h('span', { class: 'dora' }, 'ドラ表示', ...g.doraInd.map((d) => tileI(d)))));
    const meBox = h('div', { class: 'mebox' });
    const head = seatHead(g, 0, 'mehead');
    if (me.hand.length && MJG.shanten(MJG.counts(me.hand.length === 14 ? me.hand.filter((_, i) => i !== me.hand.indexOf(me.drawn)) : me.hand)) === 0 && g.isFuriten(0)) head.append(h('span', { class: 'rbadge warnb' }, 'フリテン'));
    meBox.append(head, riverEl(g, 0));
    // 手牌
    const drawing = ui.kind === 'draw';
    let rest = me.hand.slice(), drawn = null;
    if (me.hand.length === 14 && me.drawn != null) { rest.splice(rest.indexOf(me.drawn), 1); drawn = me.drawn; }
    rest.sort((a, b) => a - b);
    let eff = null, rec = new Set();
    if (drawing && MP.hints && !me.riichi) { eff = MJG.efficiency(g, 0, me.hand); if (eff.minS >= 0) eff.best.forEach((o) => rec.add(o.t)); }
    const rOpts = drawing ? g.riichiOptions(0) : [];
    const handRow = h('div', { class: 'phand' });
    const mkT = (t, isDrawn) => {
      const allowed = drawing && !me.riichi && (!ui.riichiMode || rOpts.includes(t));
      const b = h('button', { class: 'tbtn' + (rec.has(t) ? ' rec' : '') + (drawing && ui.riichiMode && !rOpts.includes(t) ? ' dim' : ''), disabled: !allowed, 'aria-label': MJ.name(t) + (isDrawn ? '（ツモ）' : '') }, tileI(t));
      b.onclick = () => { if (MP.ui !== ui || ui.kind !== 'draw') return; const res = ui.resolve; MP.ui = { kind: 'idle' }; res({ type: 'discard', tile: t, riichi: !!ui.riichiMode }); };
      return b;
    };
    rest.forEach((t) => handRow.append(mkT(t, false)));
    if (drawn != null) { handRow.append(h('span', { class: 'gap' })); handRow.append(mkT(drawn, true)); }
    meBox.append(handRow);
    // 操作
    const act = h('div', { class: 'mjact' });
    if (drawing) {
      if (g.canTsumo(0)) act.append(h('button', { class: 'abtn shu', onclick: () => { const r = ui.resolve; MP.ui = { kind: 'idle' }; r({ type: 'tsumo' }); } }, 'ツモ'));
      if (me.riichi && g.canTsumo(0)) act.append(h('button', { class: 'abtn ghost', onclick: () => { const r = ui.resolve; MP.ui = { kind: 'idle' }; r({ type: 'discard', tile: me.drawn }); } }, 'ツモ切り'));
      if (rOpts.length && !ui.riichiMode) act.append(h('button', { class: 'abtn', onclick: () => { ui.riichiMode = true; mjRefresh(); } }, 'リーチ'));
      if (ui.riichiMode) act.append(h('span', { class: 'note' }, 'リーチ宣言する牌をタップ'), h('button', { class: 'abtn ghost', onclick: () => { ui.riichiMode = false; mjRefresh(); } }, 'やめる'));
      if (!act.childNodes.length) act.append(h('span', { class: 'note' }, 'あなたの番：切る牌をタップ'));
    } else if (ui.kind === 'ron') {
      act.append(h('span', { class: 'ronq' }, tileI(ui.tile), 'でロンできます'),
        h('button', { class: 'abtn shu', onclick: () => { const r = ui.resolve; MP.ui = { kind: 'idle' }; r(true); } }, 'ロン'),
        h('button', { class: 'abtn ghost', onclick: () => { const r = ui.resolve; MP.ui = { kind: 'idle' }; r(false); } }, '見送る'));
    } else if (ui.kind === 'auto') act.append(h('span', { class: 'note' }, 'リーチ中：自動でツモ切り'));
    else act.append(h('span', { class: 'note' }, g.result ? '' : `${SEATN[g.turn]}の番…`));
    meBox.append(act);
    // ヒント
    if (MP.hints) {
      const hb = h('div', { class: 'hintbar' });
      if (eff) {
        if (eff.minS === -1) hb.append('アガリ形。でも役がないのでツモれません');
        else if (eff.minS === 0) hb.append(h('b', {}, 'テンパイ'), 'に取れる：', ...eff.best.slice(0, 4).map((o) => tileI(o.t)), `を切ると ${o2w(eff.best[0])}`);
        else hb.append(h('b', {}, `${eff.minS}シャンテン`), '　おすすめ：', ...eff.best.slice(0, 4).map((o) => tileI(o.t)), `（受け入れ ${eff.best[0].uke}枚）`);
      } else if (me.hand.length === 13) {
        const c = MJG.counts(me.hand); const s = MJG.shanten(c);
        if (s === 0) {
          const ws = MJ.waits(c); const vis = g.visible(0); const left = ws.reduce((a, w) => a + Math.max(0, 4 - c[w] - vis[w]), 0);
          hb.append(h('b', {}, 'テンパイ'), '　待ち：', ...ws.map((w) => tileI(w)), `残り${left}枚`);
          if (g.isFuriten(0)) hb.append(h('span', { class: 'warn' }, '　フリテン（ロン不可・ツモのみ）'));
          else if (!me.riichi && ws.every((w) => !g.ronResult(0, w))) hb.append(h('span', { class: 'warn' }, '　役なし：ロンできない（リーチかツモで役がつく）'));
        } else hb.append(`${s}シャンテン`);
      }
      meBox.append(hb);
    }
    root.append(meBox);
    // 局の結果
    if (ui.kind === 'result' || ui.kind === 'end') root.append(mjResultSheet(g, ui));
    const quit = () => { if (!MP.quitArmed && !(ui.kind === 'end')) { MP.quitArmed = true; mjRefresh(); setTimeout(() => { MP.quitArmed = false; }, 3000); return; } quitMJ(); };
    const tog = (key, label) => h('button', { class: 'chip tog' + (MP[key] ? ' on' : ''), 'aria-pressed': String(MP[key]), onclick: () => { MP[key] = !MP[key]; mjRefresh(); } }, label);
    app.append(playTopbar(MP.quitArmed ? 'もう一度押すとやめます' : '麻雀', null, quit, h('span', { class: 'togs' }, tog('hints', 'ヒント'), tog('reveal', '手牌公開'))), root);
  }
  function o2w(o) { return `${o.tiles.map((t) => MJ.name(t)).join('・')}待ち ${o.uke}枚`; }
  function mjResultSheet(g, ui) {
    const r = ui.r;
    const bg = h('div', { class: 'sheet-bg' }); const sh = h('div', { class: 'sheet', role: 'dialog', 'aria-label': '結果' }); bg.append(sh);
    const next = (label) => h('button', { class: 'cta', onclick: () => { const res = ui.resolve; MP.ui = { kind: 'idle' }; mjRefresh(); res(); } }, label);
    const deltas = (d) => h('div', { class: 'deltas' }, ...[0, 1, 2, 3].map((s) => h('div', {}, h('div', { class: 'dn' }, SEATN[s]), h('div', { class: 'num ' + (d[s] > 0 ? 'plus' : d[s] < 0 ? 'minus' : '') }, d[s] > 0 ? '+' + fmt(d[s]) : d[s] ? fmt(d[s]) : '±0'), h('div', { class: 'num dn' }, fmt(g.scores[s])))));
    if (r.type === 'end') {
      sh.append(h('h3', {}, g.mode === 'single' ? '対局終了' : '東風戦 終了'));
      const t = h('table', { class: 'dtable rank' });
      r.rank.forEach((s, i) => t.append(h('tr', { class: s === 0 ? 'me' : '' }, h('td', {}, `${i + 1}位`), h('td', {}, SEATN[s]), h('td', { class: 'num' }, fmt(r.scores[s]) + '点'))));
      sh.append(t, h('p', { class: 'note' }, `+${r.xp || 0} XP`),
        h('div', { class: 'row2' }, h('button', { class: 'cta', onclick: () => { const res = ui.resolve; MP.g = null; if (res) res(); startMJ(); } }, 'もう一回'), h('button', { class: 'cta alt', onclick: () => { const res = ui.resolve; MP.g = null; if (res) res(); go({ name: 'home' }); } }, 'ホーム')));
      return bg;
    }
    if (r.type === 'draw') {
      sh.append(h('h3', {}, `流局（${r.kyoku}）`));
      sh.append(h('div', { class: 'yrows' }, ...[0, 1, 2, 3].map((s) => h('div', { class: 'yrow' }, h('span', {}, SEATN[s]), h('b', {}, r.tenpai[s] ? 'テンパイ' : 'ノーテン')))));
      if (r.tenpai[0] || MP.reveal) {
        [0, 1, 2, 3].filter((s) => r.tenpai[s] && (s === 0 || MP.reveal)).forEach((s) => sh.append(h('div', { class: 'note' }, SEATN[s]), h('div', { class: 'hand small' }, ...MJ.sortCodes(r.hands[s].map(MJ.code)).map(tileEl))));
      }
      sh.append(deltas(r.delta), next('次の局へ'));
      return bg;
    }
    const ev = r.ev; const who = SEATN[r.winner];
    sh.append(h('h3', {}, `${who}の${r.type === 'ron' ? 'ロン' : 'ツモ'}！`, r.type === 'ron' ? h('small', { class: 'note' }, `　${SEATN[r.from]}から`) : null));
    const hd = h('div', { class: 'hand small' }); MJ.sortCodes(r.hand.map(MJ.code)).forEach((c) => hd.append(tileEl(c))); hd.append(h('span', { class: 'gap' }), tileI(r.tile, 'win'));
    sh.append(hd);
    sh.append(h('div', { class: 'yrows' }, ...ev.yaku.map(([n, hn]) => h('div', { class: 'yrow' }, h('span', {}, n), h('b', { class: 'num' }, ev.yakuman ? '役満' : `${hn}翻`)))));
    const isDealer = r.winner === r.dealer;
    const ptsText = r.type === 'ron' ? `${fmt(ev.pay.ron)}点` : isDealer ? `${fmt(ev.pay.tsumoDealer)}点オール` : `${fmt(ev.pay.tsumoChild)}・${fmt(ev.pay.tsumoDealer)}点`;
    sh.append(h('div', { class: 'scoreline' }, h('span', {}, ev.yakuman ? ev.pay.limit : `${ev.fu}符 ${ev.han}翻${ev.pay.limit ? '　' + ev.pay.limit : ''}`), h('span', { class: 'points num' }, ptsText)));
    if (r.honba || r.sticks) sh.append(h('div', { class: 'note' }, `${r.honba ? `${r.honba}本場 +${fmt(r.honba * 300)}　` : ''}${r.sticks ? `供託 +${fmt(r.sticks * 1000)}` : ''}`));
    if (ev.fuParts && !ev.yakuman && ev.han < 5) sh.append(h('details', { class: 'fu' }, h('summary', {}, '符の内訳'), h('div', { class: 'note' }, ev.fuParts.join(' ＋ ') + ` → 切り上げ ${ev.fu}符`)));
    const indic = h('div', { class: 'note dora' }, 'ドラ表示', ...g.doraInd.map((d) => tileI(d)));
    if (g.players[r.winner].riichi) indic.append('　裏ドラ表示', ...g.uraInd.map((d) => tileI(d)));
    sh.append(indic, deltas(r.delta), next('次の局へ'));
    return bg;
  }
