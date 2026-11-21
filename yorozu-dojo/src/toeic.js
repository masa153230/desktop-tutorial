  // ================= TOEIC 900（app.js の中に組み込まれる） =================
  const TD = TOEIC_DATA;
  const WBY = Object.fromEntries(TD.words.map((w) => [w.id, w]));
  const BANDS = [300, 450, 600, 730, 860, 990];
  const CAT_JA = { pos: '品詞', verb: '動詞の形', prep: '前置詞・接続詞', pron: '代名詞', rel: '関係詞', vocab: '語彙', comp: '比較・その他' };
  const PART_JA = { p2: 'Part 2 応答問題', p34: 'Part 3・4 会話・説明文', p5: 'Part 5 文法・語彙', p7: 'Part 7 読解', dict: 'ディクテーション', words: '単語' };
  const POS_JA = { 名: '名詞', 動: '動詞', 形: '形容詞', 副: '副詞', 前: '前置詞', 接: '接続詞', 句: '熟語' };
  const VOICE_OF = { M: 'rounded', W: 'airy', W2: 'glassy', N: 'buttery' };
  const VOICES = ['buttery', 'airy', 'glassy', 'rounded'];
  const AI_KEY = 'yorozu-toeic-ai-v1';
  let AI = { p5: [], p7: [], p34: [] };
  try { const s = localStorage.getItem(AI_KEY); if (s) AI = Object.assign(AI, JSON.parse(s)); } catch { /* 保存できない環境 */ }
  const saveAI = () => { try { localStorage.setItem(AI_KEY, JSON.stringify(AI)); } catch { /* 保存できない環境 */ } };

  function TS() {
    const t = P.toeic || (P.toeic = {});
    if (t.start == null) t.start = 300;
    if (!t.target) t.target = 900;
    t.scores = t.scores || []; t.hist = t.hist || {}; t.study = t.study || {}; t.last = t.last || {}; t.days = t.days || {};
    t.studyTotal = t.studyTotal || 0;
    if (!t.newPerDay) t.newPerDay = 10;
    if (!t.rate) t.rate = 1;
    return t;
  }
  const curScore = () => { const t = TS(); return t.cur ?? t.start; };
  const PHASES = [
    { to: 450, name: '土台', hours: '300〜400時間', lv: 1, menu: ['words', 'course', 'p2', 'dict', 'p5'],
      focus: '中学英語の文法（英語コースの入門・基礎と、下の文法レッスン）、300〜600点レベルの単語、英語の音を聞き取る耳（ディクテーション・Part 2）。この段階で Part 7 の長文に手を出しても伸びない。' },
    { to: 600, name: '型', hours: '約300時間', lv: 2, menu: ['words', 'p5', 'p2', 'p34', 'dict'],
      focus: 'Part 5 の頻出パターン（品詞・動詞の形・前置詞と接続詞）、730点レベルの単語、Part 3・4 で話の流れを追う。' },
    { to: 750, name: '速さ', hours: '300〜400時間', lv: 2, menu: ['words', 'p5', 'p34', 'p7', 'p2'],
      focus: 'Part 7 を1問1分で解く、Part 3・4 は設問を先に読んでから聞く、860点レベルの単語。' },
    { to: 991, name: '精度', hours: '400〜600時間', lv: 3, menu: ['words', 'p5', 'p34', 'p7', 'mock'],
      focus: 'Part 5 を1問15秒、990点レベルの単語、模試で自分のミスの型（ひっかけ・時間切れ）をつぶす。' },
  ];
  const phaseIdx = (s) => { const i = PHASES.findIndex((p) => s < p.to); return i < 0 ? PHASES.length - 1 : i; };
  const phaseNow = () => PHASES[phaseIdx(curScore())];
  const phaseFrom = (i) => (i === 0 ? 10 : PHASES[i - 1].to);

  // ---------- 記録 ----------
  function histPush(cat, ok) { const t = TS(); t.hist[cat] = ((t.hist[cat] || '') + (ok ? '1' : '0')).slice(-30); }
  function accOf(cat) { const s = TS().hist[cat] || ''; return s.length ? { n: s.length, p: [...s].filter((c) => c === '1').length / s.length } : null; }
  function qRecord(id, ok, cat, sec) {
    const t = TS(); delete t.last[id]; t.last[id] = ok ? 1 : 0;
    const ks = Object.keys(t.last); if (ks.length > 600) for (const k of ks.slice(0, ks.length - 600)) delete t.last[k];
    if (cat) histPush(cat, ok);
    if (L && L.mock && sec) { L.mock[sec][1]++; if (ok) L.mock[sec][0]++; }
  }
  function studyTick() {
    if (!L || (L.cid !== 'toeic' && L.cid !== 'en')) return;
    const now = Date.now(); const dt = Math.min(240, Math.max(0, (now - (L.tick || L.t0)) / 1000)); L.tick = now;
    const t = TS(); const d = today(); t.study[d] = Math.round((t.study[d] || 0) + dt); t.studyTotal = Math.round(t.studyTotal + dt);
    for (const k of Object.keys(t.study)) if (k < daysAgo(60)) delete t.study[k];
  }
  function menuDone(key) {
    if (!key) return; const t = TS(); const d = today();
    t.days[d] = t.days[d] || {}; t.days[d][key] = 1;
    for (const k of Object.keys(t.days)) if (k < daysAgo(14)) delete t.days[k];
  }
  // 2台の端末の TOEIC 記録を合わせる（どちらかで進んだものは残す）
  function mergeToeic(n, o) {
    if (!n) return o ? JSON.parse(JSON.stringify(o)) : undefined;
    const t = JSON.parse(JSON.stringify(n)); if (!o) return t;
    const sk = (s) => [s.d, s.kind, s.s || s.mid].join('|'); const have = new Set((t.scores || []).map(sk));
    t.scores = (t.scores || []).concat((o.scores || []).filter((s) => !have.has(sk(s)))).sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)).slice(-40);
    t.hist = t.hist || {}; for (const [k, v] of Object.entries(o.hist || {})) if (!t.hist[k] || v.length > t.hist[k].length) t.hist[k] = v;
    t.last = Object.assign({}, o.last || {}, t.last || {});
    t.study = t.study || {}; for (const [d, v] of Object.entries(o.study || {})) t.study[d] = Math.max(t.study[d] || 0, v);
    t.studyTotal = Math.max(t.studyTotal || 0, o.studyTotal || 0);
    t.days = t.days || {}; for (const [d, v] of Object.entries(o.days || {})) t.days[d] = Object.assign({}, v, t.days[d] || {});
    return t;
  }

  // ---------- 音声（複数の声で読む） ----------
  function webLines(lines, rate) {
    return new Promise((res) => {
      if (!Speech.web) { res(false); return; }
      try {
        speechSynthesis.cancel();
        const vs = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
        let left = lines.length;
        for (const ln of lines) {
          const u = new SpeechSynthesisUtterance(ln.text); u.lang = 'en-US';
          const v = vs.length ? vs[Math.max(0, VOICES.indexOf(ln.voice)) % vs.length] : null;
          if (v) { u.voice = v; u.lang = v.lang; }
          u.rate = 0.95 * rate;
          u.onend = u.onerror = () => { if (--left === 0) res(true); };
          speechSynthesis.speak(u);
        }
      } catch { res(false); }
    });
  }
  async function sayLines(lines, rate = TS().rate) {
    if (Speech.off) return false;
    if (Speech.tts) {
      try { await Speech.tts.speak(lines.map((l) => ({ text: l.text, voice: l.voice, rate, language: 'en' }))); return true; }
      catch (e) {
        const c = e && e.code;
        if (c === 'not_granted') { Speech.off = true; return false; }
        if (c === 'rate_limited' || c === 'unavailable' || c === 'upstream_error' || c === 'no_gesture') return webLines(lines, rate);
        return false;
      }
    }
    return webLines(lines, rate);
  }
  function playBtn(lines, label = '再生') {
    let plays = 0;
    const b = h('button', { class: 'tplay' }, icon('speaker'), h('span', {}, label));
    b.onclick = async () => {
      if (b.classList.contains('on')) return;
      plays++; b.classList.add('on'); b.lastChild.textContent = '再生中…';
      await sayLines(lines);
      b.classList.remove('on'); b.lastChild.textContent = 'もう一度';
    };
    return { el: b, plays: () => plays };
  }

  // ---------- 単語の問題 ----------
  const posGroup = (p) => (p === '前' || p === '接' ? '前接' : p);
  // 「取る・（時間が）かかる」→ [取る, かかる]。意味が1つでも重なる語は誤答に使わない（正解が2つになるのを防ぐ）
  const senses = (ja) => ja.replace(/（[^）]*）/g, '').split(/[・、,／]/).map((x) => x.trim()).filter(Boolean);
  const overlap = (a, b) => { const sa = new Set(senses(a)); return senses(b).some((x) => sa.has(x)); };
  function wordDistract(w, n, key) {
    const same = TD.words.filter((x) => x !== w && posGroup(x.pos) === posGroup(w.pos) && x[key] !== w[key] && x.w.toLowerCase() !== w.w.toLowerCase() && !overlap(x.ja, w.ja));
    const near = same.filter((x) => Math.abs(BANDS.indexOf(x.band) - BANDS.indexOf(w.band)) <= 1);
    const pool = near.length >= n ? near : same;
    const out = []; for (const x of shuffle(pool)) { if (out.length >= n) break; if (!out.some((y) => y[key] === x[key])) out.push(x); }
    return out;
  }
  const IRREG = { put: 'put', set: 'set', run: 'ran', take: 'took', get: 'got', deal: 'dealt', pay: 'paid', meet: 'met', hold: 'held', undergo: 'underwent', oversee: 'oversaw' };
  function sufS(w) { return /(s|sh|ch|x|z)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'; }
  const DBL = new Set(['submit', 'admit', 'commit', 'permit', 'occur', 'prefer', 'refer', 'transfer', 'control', 'regret', 'equip', 'omit']);
  function sufEd(w) { if (IRREG[w]) return IRREG[w]; if (DBL.has(w)) return w + w.slice(-1) + 'ed'; if (/e$/.test(w)) return w + 'd'; if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied'; if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(w)) return w + w.slice(-1) + 'ed'; return w + 'ed'; }
  function sufIng(w) { if (DBL.has(w)) return w + w.slice(-1) + 'ing'; if (/ie$/.test(w)) return w.slice(0, -2) + 'ying'; if (/[^e]e$/.test(w)) return w.slice(0, -1) + 'ing'; if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(w)) return w + w.slice(-1) + 'ing'; return w + 'ing'; }
  // 例文の形（allocated / Passengers など）に合わせて、ほかの語を同じ形にする
  function inflectLike(base, form, other) {
    const cap = form[0] !== form[0].toLowerCase();
    const b0 = base.split(' ')[0].toLowerCase(), f0 = form.split(' ')[0].toLowerCase();
    const parts = other.split(' '); let o0 = parts[0];
    if (f0 !== b0) {
      if (f0 === sufS(b0) || f0 === b0 + 's') o0 = sufS(o0);
      else if (f0.endsWith('ing')) o0 = sufIng(o0);
      else if (f0 === sufEd(b0) || /ed$/.test(f0) || f0 === IRREG[b0]) o0 = sufEd(o0);
    }
    parts[0] = o0; let r = parts.join(' ');
    if (cap) r = r[0].toUpperCase() + r.slice(1);
    return r;
  }
  function wordEx(w, type) {
    const tag = `単語 ・ ${w.band}点レベル ・ ${POS_JA[w.pos] || ''}`;
    const exLine = `${w.w}＝${w.ja}。` + (w.ex ? (w.exJa ? `${w.ex}（${w.exJa}）` : `例：${w.ex}`) : '');
    const base = { _item: 'tw.' + w.id, _cat: 'words' };
    if (type === 'card') return { t: 'card', q: '新しい単語', tag: `新出 ・ ${w.band}点レベル`, w };
    if (type === 'listen' && canSpeak()) return Object.assign(mcFrom({ q: '聞こえた単語の意味は？', tag, listen: w.w, ex: exLine }, { text: w.ja }, wordDistract(w, 3, 'ja').map((x) => ({ text: x.ja }))), base);
    if (type === 'm2w') return Object.assign(mcFrom({ q: '英語では？', tag, main: w.ja, ex: exLine, sayAfter: canSpeak() ? w.w : null, lang: 'en' }, { text: w.w, cls: 'en' }, wordDistract(w, 3, 'w').map((x) => ({ text: x.w, cls: 'en' }))), base);
    if (type === 'cloze' && w.form && w.exJa && w.ex.includes(w.form)) {
      const ds = wordDistract(w, 6, 'w').map((x) => inflectLike(w.w, w.form, x.w)).filter((x, i, a) => x.toLowerCase() !== w.form.toLowerCase() && a.indexOf(x) === i).slice(0, 3);
      if (ds.length === 3) return Object.assign(mcFrom({ q: '空所に入る語は？', tag, main: w.ex.replace(w.form, '_____'), mainCls: 'en', reading: w.exJa, ex: exLine, sayAfter: canSpeak() ? w.ex : null, lang: 'en', showReading: true }, { text: w.form, cls: 'en' }, ds.map((x) => ({ text: x, cls: 'en' }))), base);
    }
    return Object.assign(mcFrom({ q: 'この単語の意味は？', tag, main: w.w, mainCls: 'en', audio: canSpeak() ? w.w : null, lang: 'en', ex: exLine }, { text: w.ja }, wordDistract(w, 3, 'ja').map((x) => ({ text: x.ja }))), base);
  }
  const wordBox = (w) => { const r = (P.srs || {})['tw.' + w.id]; return r ? r[0] : -1; };
  function wordCounts(band) {
    let learned = 0, learning = 0, total = 0;
    for (const w of TD.words) { if (band && w.band !== band) continue; total++; const b = wordBox(w); if (b >= 3) learned++; else if (b >= 0) learning++; }
    return { learned, learning, total, fresh: total - learned - learning };
  }
  function wordSession() {
    const t = TS();
    const due = srsDue('tw').map((k) => WBY[k.slice(3)]).filter(Boolean).slice(0, 20);
    const fresh = TD.words.filter((w) => wordBox(w) < 0).slice(0, t.newPerDay);
    const exs = [];
    for (let i = 0; i < fresh.length; i += 5) {
      const chunk = fresh.slice(i, i + 5);
      exs.push(...chunk.map((w) => wordEx(w, 'card')));
      exs.push(...shuffle(chunk).map((w) => wordEx(w, 'w2m')));
    }
    for (const w of shuffle(due)) {
      const b = wordBox(w);
      exs.push(wordEx(w, pick(b <= 1 ? ['w2m', 'listen', 'm2w'] : b <= 3 ? ['m2w', 'cloze', 'listen'] : ['cloze', 'cloze', 'm2w'])));
    }
    return exs;
  }

  // ---------- 問題の選び方 ----------
  const poolOf = (part) => ({ p5: TD.p5.concat(AI.p5), p2: TD.p2, p34: TD.p34.concat(AI.p34), p7: TD.p7.concat(AI.p7) })[part];
  function pickQs(part, n, opts = {}) {
    const t = TS(); const lvMax = opts.lv || phaseNow().lv;
    let pool = poolOf(part).filter((q) => (!opts.cat || q.cat === opts.cat) && (!opts.kind || q.kind === opts.kind));
    const rank = (q) => { const r = t.last[q.id]; return (r === undefined ? 0 : r === 0 ? 1 : 2) + (q.lv > lvMax ? 3 : 0) + rand() * 0.9; };
    pool = pool.map((q) => [rank(q), q]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    return pool.slice(0, n);
  }
  const GLV = { 1: '〜300', 2: '〜450', 3: '〜600', 4: '〜730', 5: '〜860', 6: '〜950' };
  const grammarQs = (g) => poolOf('p5').filter((q) => q.tag === g.tag || (g.cat && !q.tag && q.cat === g.cat));
  function weakCats() {
    return Object.keys(CAT_JA).map((c) => [c, accOf('p5:' + c)]).filter(([, a]) => a && a.n >= 3).sort((a, b) => a[1].p - b[1].p).slice(0, 2).map(([c]) => c);
  }
  function p5Ex(q) {
    const e = mcFrom({ q: '空所に入る最も適切なものは？', tag: `Part 5 ・ ${CAT_JA[q.cat] || '文法'}${q.ai ? ' ・ AI作成' : ''}`, main: q.q.replace('-------', '_______'), mainCls: 'en p5s', ex: q.ex, letters: true, timer: 20 },
      { text: q.choices[0], cls: 'en' }, q.choices.slice(1).map((c) => ({ text: c, cls: 'en' })));
    return Object.assign(e, { _q: q.id, _cat: 'p5:' + q.cat, _sec: 'R', _p5: 1 });
  }
  function p2Ex(q) {
    const order = shuffle([0, 1, 2]); const v = sampleN(VOICES, 2);
    return { t: 'p2', q: '最も適切な応答を選ぼう', tag: 'Part 2 ・ 応答問題', qtext: q.q, choices: order.map((i) => q.choices[i]), a: order.indexOf(0), ex: q.ex, voices: v, _q: q.id, _cat: 'p2', _sec: 'L' };
  }
  function setEx(s, part) {
    const qs = s.qs.map((q) => { const order = shuffle([0, 1, 2, 3]); return { q: q.q, choices: order.map((i) => q.choices[i]), a: order.indexOf(0) }; });
    const tag = part === 'p7' ? `Part 7 ・ ${s.label || (s.docs.length > 1 ? '複数の文書' : '1つの文書')}${s.ai ? ' ・ AI作成' : ''}` : `${s.kind === 'talk' ? 'Part 4 ・ 説明文' : 'Part 3 ・ 会話'}${s.ai ? ' ・ AI作成' : ''}`;
    return { t: 'set', part, q: part === 'p7' ? '文書を読んで設問に答えよう' : '設問を先に読んでから再生しよう', tag, set: Object.assign({}, s, { qs }), _q: s.id, _sec: part === 'p7' ? 'R' : 'L' };
  }
  function dictPool() {
    const lv = phaseNow().lv; const seen = TD.words.filter((w) => wordBox(w) >= 0);
    const words = (seen.length >= 5 ? seen : TD.words.filter((w) => w.band <= 450)).filter((w) => w.ex && w.ex.split(' ').length >= 3).map((w) => ({ text: w.ex, ja: w.exJa }));
    const talk = TD.p2.filter((q) => q.lv <= lv).map((q) => ({ text: q.q, ja: '' }));
    return { words, talk };
  }
  function dictEx(o) { return { t: 'dict', q: '聞こえた英文を書き取ろう', tag: 'ディクテーション', text: o.text, ja: o.ja, _cat: 'dict' }; }

  // ---------- セッション開始 ----------
  function startToeic(exs, title, menuKey, extra) {
    if (!exs.length) return false;
    L = Object.assign({ cid: 'toeic', key: null, title, queue: exs.map((e, i) => Object.assign(e, { _uid: i, _tries: 0 })), total: exs.length, cleared: 0, wrong: new Set(), combo: 0, maxCombo: 0, t0: Date.now(), review: false, srsSeen: new Set(), back: { name: 'toeic' }, menuKey }, extra || {});
    go({ name: 'lesson' });
    return true;
  }
  const SIZES = { p5: [10, 10, 15, 20], p2: [10, 10, 10, 10], p34: [1, 1, 2, 2], p7: [1, 1, 1, 2] };
  function startPart(part, opts = {}) {
    const pi = phaseIdx(curScore()); const n = opts.n || SIZES[part][pi];
    if (part === 'p5') return startToeic(pickQs('p5', n, opts).map(p5Ex), opts.cat ? `Part 5：${CAT_JA[opts.cat]}` : 'Part 5 文法・語彙', opts.menu ? 'p5' : null);
    if (part === 'p2') return startToeic(pickQs('p2', n).map(p2Ex), 'Part 2 応答問題', opts.menu ? 'p2' : null);
    if (part === 'p34') { const qs = n > 1 ? [...pickQs('p34', 1, { kind: 'conv' }), ...pickQs('p34', n - 1, { kind: 'talk' })] : pickQs('p34', 1); return startToeic(qs.map((s) => setEx(s, 'p34')), 'Part 3・4', opts.menu ? 'p34' : null); }
    if (part === 'p7') return startToeic(pickQs('p7', n).map((s) => setEx(s, 'p7')), 'Part 7 読解', opts.menu ? 'p7' : null);
    return false;
  }
  function startWords(menu) { return startToeic(wordSession(), '単語', menu ? 'words' : null); }
  function startDict(menu) {
    const p = dictPool(); const items = [...sampleN(p.words, 3), ...sampleN(p.talk, 2)];
    return startToeic(shuffle(items).map(dictEx), 'ディクテーション', menu ? 'dict' : null);
  }
  function startMock() {
    const exs = [
      ...pickQs('p2', 8, { lv: 3 }).map(p2Ex),
      ...pickQs('p34', 1, { kind: 'conv', lv: 3 }).map((s) => setEx(s, 'p34')),
      ...pickQs('p34', 1, { kind: 'talk', lv: 3 }).map((s) => setEx(s, 'p34')),
      ...pickQs('p5', 12, { lv: 3 }).map(p5Ex),
      ...pickQs('p7', 2, { lv: 3 }).map((s) => setEx(s, 'p7')),
    ];
    for (const e of exs) { e._noRetry = true; if (e.t === 'mc') e.timer = 20; }
    return startToeic(exs, 'ミニ模試', 'mock', { mock: { L: [0, 0], R: [0, 0] } });
  }
  function startToeicReview() {
    const bank = P.mistakes.toeic || [];
    return startToeic(shuffle(bank.slice(-12)).map((m) => JSON.parse(JSON.stringify(m.e))), '間違えた問題', null, { review: true });
  }
  function startCourseLesson() {
    const c = BY_ID.en; const nx = nextLesson(c); if (!nx) return false;
    startLesson(c, nx.u, nx.l); L.back = { name: 'toeic' }; L.menuKey = 'course'; return true;
  }
  const MENU = {
    words: { name: '単語', sub: () => { const due = srsDue('tw').length; const fresh = Math.min(TS().newPerDay, wordCounts().fresh); return `新しい単語 ${fresh} ＋ 復習 ${Math.min(20, due)}`; }, start: () => startWords(true) },
    course: { name: '英語コース 1レッスン', sub: () => { const nx = nextLesson(BY_ID.en); return nx ? `${nx.u.title}・${nx.l.name}` : '全部修了'; }, start: startCourseLesson },
    p2: { name: 'Part 2 応答問題', sub: () => '10問・聞いて選ぶ', start: () => startPart('p2', { menu: true }), audio: true },
    dict: { name: 'ディクテーション', sub: () => '5文・聞いて書く', start: () => startDict(true), audio: true, hard: true },
    p5: { name: 'Part 5 文法・語彙', sub: () => `${SIZES.p5[phaseIdx(curScore())]}問・1問20秒が目安`, start: () => startPart('p5', { menu: true }) },
    p34: { name: 'Part 3・4 会話・説明文', sub: () => `${SIZES.p34[phaseIdx(curScore())]}セット・先読みしてから聞く`, start: () => startPart('p34', { menu: true }), audio: true },
    p7: { name: 'Part 7 読解', sub: () => `${SIZES.p7[phaseIdx(curScore())]}文書・1問1分が目安`, start: () => startPart('p7', { menu: true }) },
    mock: { name: 'ミニ模試', sub: () => '約20分・推定スコアが出る', start: startMock },
  };
  function todayMenu() {
    const ph = phaseNow(); const keys = [];
    for (const k of ph.menu) {
      if (k === 'course' && !nextLesson(BY_ID.en)) { keys.push('p5'); continue; }
      if (MENU[k].hard && !canSpeak()) { keys.push(ph.lv >= 2 ? 'p7' : 'p5'); continue; }
      if (!keys.includes(k)) keys.push(k);
    }
    return [...new Set(keys)];
  }
  const menuState = () => (TS().days[today()] || {});

  // ---------- 問題の描画（TOEIC 用） ----------
  function rCard(ex, ctx, host) {
    const w = ex.w; const audio = canSpeak();
    const i = w.form ? w.ex.indexOf(w.form) : -1;
    const exEl = w.ex ? h('div', { class: 'wex en' }, i >= 0 ? w.ex.slice(0, i) : w.ex, i >= 0 ? h('b', {}, w.form) : null, i >= 0 ? w.ex.slice(i + w.form.length) : null) : null;
    if (exEl && audio) exEl.append(h('button', { class: 'mini-say', 'aria-label': '例文を聞く', onclick: () => speak(w.ex) }, icon('speaker')));
    host.append(h('div', { class: 'wcard' },
      h('div', { class: 'wtop' }, audio ? h('button', { class: 'say', 'aria-label': '発音を聞く', onclick: () => speak(w.w) }, icon('speaker')) : null,
        h('div', {}, h('div', { class: 'ww en' }, w.w), h('div', { class: 'wpos' }, POS_JA[w.pos] || ''))),
      h('div', { class: 'wja' }, w.ja), exEl, w.exJa ? h('div', { class: 'wexja' }, w.exJa) : null));
    if (audio && P.autoplay) setTimeout(() => speak(w.w), 250);
    ctx.ready(true);
    return { ctaLabel: '覚えた・次へ', noSkip: true, check: () => ({ ok: true, neutral: true, instant: true }) };
  }
  function scriptEl(rows) { return h('div', { class: 'script' }, ...rows); }
  function rP2(ex, ctx, host) {
    const audio = canSpeak();
    const lines = [{ text: ex.qtext, voice: ex.voices[0] }, ...ex.choices.map((c, i) => ({ text: 'ABC'[i] + '. ' + c, voice: ex.voices[1] }))];
    const pb = playBtn(lines);
    if (audio) { host.append(h('div', { class: 'tplay-row' }, pb.el)); if (P.autoplay) setTimeout(() => pb.el.click(), 300); }
    else host.append(h('div', { class: 'tnote' }, 'この環境では音声が出ないので、文字で読んで答えます（耳の練習にはなりません）。'), scriptEl([h('div', { class: 'sc-q en' }, ex.qtext), ...ex.choices.map((c, i) => h('div', { class: 'sc-a en' }, `(${'ABC'[i]}) ${c}`))]));
    host.append(h('p', { class: 'mark en' }, 'Mark your answer.'));
    const row = h('div', { class: 'abc' }); let sel = -1, locked = false;
    ['A', 'B', 'C'].forEach((x, i) => row.append(h('button', { class: 'choice', onclick: () => { if (locked) return; sel = i; [...row.children].forEach((b, j) => b.classList.toggle('sel', j === i)); ctx.ready(true); } }, x)));
    host.append(row);
    const finish = (ok) => {
      locked = true; qRecord(ex._q, ok, ex._cat, ex._sec);
      [...row.children].forEach((b, j) => { b.disabled = true; if (j === ex.a) b.classList.add('right'); else if (j === sel) b.classList.add('wrong'); });
      host.append(scriptEl([h('div', { class: 'sc-h' }, 'スクリプト'), h('div', { class: 'sc-q en' }, ex.qtext), ...ex.choices.map((c, i) => h('div', { class: 'sc-a en' + (i === ex.a ? ' right' : i === sel ? ' wrong' : '') }, `(${'ABC'[i]}) ${c}`))]));
      return `(${'ABC'[ex.a]}) ${ex.choices[ex.a]}`;
    };
    return {
      key: (k) => { const i = 'abc'.indexOf(String(k).toLowerCase()); const n = i >= 0 ? i : +k - 1; if (n >= 0 && n < 3) row.children[n].click(); },
      check: () => { const ok = sel === ex.a; const ans = finish(ok); return { ok, answer: ans, note: pb.plays() > 1 ? `再生 ${pb.plays()}回（本番は1回だけ）` : '', noRetry: ex._noRetry }; },
      reveal: () => finish(false),
    };
  }
  function docEl(d) {
    if (d.kind === 'chat') return h('div', { class: 'doc chat' }, ...d.lines.map(([who, time, text]) => h('div', { class: 'cmsg' }, h('div', { class: 'cwho' }, who, ' ', h('span', {}, time)), h('div', { class: 'ctext en' }, text))));
    return h('div', { class: 'doc ' + (d.kind || 'notice') },
      d.head && d.head.length ? h('div', { class: 'dhead en' }, ...d.head.map((x) => h('div', {}, x))) : null,
      d.title ? h('div', { class: 'dtitle en' }, d.title) : null,
      ...(d.pre ? [h('div', { class: 'dpre en' }, String(d.body || ''))] : String(d.body || '').split('\n').filter(Boolean).map((p) => h('p', { class: 'en' }, p))));
  }
  function rSet(ex, ctx, host) {
    const s = ex.set; const isL = ex.part === 'p34'; const t0 = Date.now(); let pb = null;
    const transcript = () => scriptEl([h('div', { class: 'sc-h' }, 'スクリプト'), ...s.lines.map(([sp, text]) => h('div', { class: 'sc-l en' }, h('b', {}, sp === 'N' ? '' : (sp === 'W2' ? 'W2' : sp) + ': '), text))]);
    if (isL) {
      if (canSpeak()) { pb = playBtn(s.lines.map(([sp, text]) => ({ text, voice: VOICE_OF[sp] || 'buttery' }))); host.append(h('div', { class: 'tplay-row' }, pb.el, h('span', { class: 'tnote' }, '本番では1回しか流れません'))); }
      else host.append(h('div', { class: 'tnote' }, 'この環境では音声が出ないので、スクリプトを読んで答えます。'), transcript());
    } else host.append(h('div', { class: 'docs' }, ...s.docs.map(docEl)));
    const sel = s.qs.map(() => -1); let locked = false; const lists = [];
    const qwrap = h('div', { class: 'mqs' });
    s.qs.forEach((q, qi) => {
      const list = h('div', { class: 'choices' });
      q.choices.forEach((c, i) => list.append(h('button', { class: 'choice', onclick: () => { if (locked) return; sel[qi] = i; [...list.children].forEach((x, j) => x.classList.toggle('sel', j === i)); ctx.ready(sel.every((v) => v >= 0)); } }, h('span', { class: 'kbd' }, 'ABCD'[i]), h('span', { class: 'ct en' }, c))));
      lists.push(list); qwrap.append(h('div', { class: 'mq' }, h('div', { class: 'mqq en' }, `${qi + 1}. ${q.q}`), list));
    });
    host.append(qwrap);
    const finish = () => {
      locked = true; let right = 0;
      s.qs.forEach((q, qi) => {
        const ok = sel[qi] === q.a; if (ok) right++;
        qRecord(`${s.id}#${qi}`, ok, ex.part, ex._sec);
        [...lists[qi].children].forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (j === sel[qi]) b.classList.add('wrong'); });
      });
      const t = TS(); t.last[s.id] = right === s.qs.length ? 1 : 0;
      const secs = Math.round((Date.now() - t0) / 1000);
      const box = h('div', { class: 'review-box' });
      if (isL && canSpeak()) box.append(transcript());
      if (s.ja) box.append(h('details', { class: 'tip', open: true }, h('summary', {}, isL && s.lines.length && s.ja.length < 80 ? '内容' : '日本語訳'), h('p', {}, s.ja)));
      if (!s.ja || (isL && s.ja.length < 80)) box.append(explainEl('ja:' + s.id, '全文の日本語訳（Claude）', () => `次の英文${isL ? '（TOEIC Part 3/4 の音声スクリプト）' : '（TOEIC Part 7 の文書）'}を、自然な日本語に全文訳してください。訳だけを書き、解説や書式記号（**や#）は付けないこと。\n\n${isL ? s.lines.map(([sp, t]) => (sp === 'N' ? '' : sp + ': ') + t).join('\n') : s.docs.map((d) => d.body || (d.lines || []).map((l) => l.join(' ')).join('\n')).join('\n\n')}`));
      box.append(h('div', { class: 'sx pre' }, s.ex));
      host.append(box);
      return { right, secs };
    };
    return {
      check: () => {
        const { right, secs } = finish(); const n = s.qs.length;
        const pace = !isL ? `・1問あたり ${Math.round(secs / n)}秒（目安60秒）` : pb && pb.plays() > 1 ? `・再生 ${pb.plays()}回（本番は1回）` : '';
        return { ok: right === n, noRetry: true, noBank: true, note: `${n}問中 ${right}問正解${pace}`, ex: '画面の下に訳と解説があります。', answer: null };
      },
      reveal: () => { finish(); return null; },
    };
  }
  const dwords = (s) => expand(norm(s)).split(' ').filter(Boolean);
  function dictDiff(ans, ref) {
    const a = dwords(ans), b = dwords(ref);
    const same = (x, y) => x === y || (y.length > 4 && lev(x, y) <= 1);
    const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) d[i][j] = same(a[i], b[j]) ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    const hit = new Set(); let i = 0, j = 0;
    while (i < m && j < n) { if (same(a[i], b[j])) { hit.add(j); i++; j++; } else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++; }
    return { hit, n, words: ref.split(/\s+/) };
  }
  function rDict(ex, ctx, host) {
    const rate = TS().rate;
    host.append(h('div', { class: 'listen-big' },
      h('button', { class: 'main-say', 'aria-label': 'もう一度聞く', onclick: () => sayLines([{ text: ex.text, voice: 'buttery' }], rate) }, icon('speaker')),
      h('button', { class: 'slow', 'aria-label': 'ゆっくり聞く', onclick: () => sayLines([{ text: ex.text, voice: 'buttery' }], 0.75) }, 'ゆっくり')));
    if (canSpeak()) setTimeout(() => sayLines([{ text: ex.text, voice: 'buttery' }], rate), 300);
    else host.append(h('div', { class: 'tnote' }, '音声が使えない環境です。この問題は「わからない」で飛ばしてください。'));
    const ta = h('textarea', { class: 'type-in', placeholder: '聞こえたとおりに英語で入力', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': '書き取り' });
    ta.addEventListener('input', () => ctx.ready(ta.value.trim().length > 0));
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); if (ta.value.trim()) ctx.finish(check()); } });
    host.append(ta);
    const show = (diff) => {
      const line = h('div', { class: 'ddiff en' });
      const ws = ex.text.split(/\s+/); let k = 0;
      ws.forEach((w) => { const parts = dwords(w).length; const ok = parts && [...Array(parts).keys()].every((x) => diff.hit.has(k + x)); k += parts; line.append(h('span', { class: ok ? 'ok' : 'miss' }, w), ' '); });
      host.append(h('div', { class: 'review-box' }, h('div', { class: 'sc-h' }, '正解（赤＝聞き取れなかった語）'), line, ex.ja ? h('div', { class: 'wexja' }, ex.ja) : null));
    };
    function check() {
      ta.disabled = true;
      const diff = dictDiff(ta.value, ex.text); const right = diff.hit.size;
      show(diff); histPush('dict', right === diff.n);
      return { ok: right === diff.n, note: `${diff.n}語中 ${right}語 聞き取れた`, answer: right === diff.n ? null : ex.text };
    }
    return { check, reveal: () => { ta.disabled = true; show({ hit: new Set(), n: 0 }); histPush('dict', false); return ex.text; }, lock: () => { ta.disabled = true; } };
  }
  // 1問ものの記録・タイマー・解説ボタン（rMC を包む）
  function toeicWrap(ex, ctrl, host) {
    if (!ctrl || ex.t !== 'mc' || !ex._cat) return ctrl;
    const t0 = Date.now(); let iv = null; let timerEl = null;
    if (ex.timer) {
      timerEl = h('span', { class: 'qtimer num' }, '0秒');
      const eb = host.querySelector('.eyebrow'); if (eb) eb.append(timerEl);
      iv = setInterval(() => { if (!timerEl.isConnected) { clearInterval(iv); return; } const s = Math.round((Date.now() - t0) / 1000); timerEl.textContent = s + '秒'; timerEl.classList.toggle('over', s > ex.timer); }, 500);
    }
    const done = (ok) => { clearInterval(iv); if (ex._q) qRecord(ex._q, ok, ex._cat, ex._sec); else histPush(ex._cat, ok); return Math.round((Date.now() - t0) / 1000); };
    const addExplain = () => {
      if (!ex._p5) return;
      const mine = (host.querySelector('.choice.wrong .ct') || {}).textContent || '（わからない）';
      host.append(explainEl(`p5:${ex._q}:${mine}`, 'なぜ？（Claude が解説）', () => promptP5(ex, mine)));
    };
    const c0 = ctrl.check, r0 = ctrl.reveal;
    ctrl.check = () => { const r = c0(); const secs = done(r.ok); if (ex.timer) r.note = `回答 ${secs}秒（目安 ${ex.timer}秒）`; if (ex._noRetry) r.noRetry = true; if (!r.ok) addExplain(); return r; };
    ctrl.reveal = () => { const a = r0(); done(false); addExplain(); return a; };
    return ctrl;
  }
  function promptP5(ex, mine) {
    const ch = ex.choices.map((c, i) => `(${'ABCD'[i]}) ${c.text}`).join('  ');
    return `あなたは TOEIC 講師です。日本人の学習者（いまのスコアの目安 ${curScore()}点、目標 ${TS().target}点）が次の Part 5 の問題を間違えました。\n\n問題文: ${ex.main.replace('_______', '-------')}\n選択肢: ${ch}\n正解: ${ex.choices[ex.a].text}\n学習者の答え: ${mine}\n教材の解説: ${ex.ex}\n\n日本語で、中学生にも分かる言葉で次の3つを書いてください。\n1. 正解になる理由（空所の前後の語の働きを示して）\n2. 学習者の答えがだめな理由\n3. 本番で同じ型を見抜くコツ（1行）\n全体で250字以内。文法用語には短い説明をつけること。書式記号（**や#）は使わないこと。`;
  }

  // ---------- 推定スコア ----------
  const CONV = { L: [[0, 5], [20, 60], [30, 110], [40, 170], [50, 230], [60, 290], [70, 350], [80, 405], [90, 460], [96, 495], [100, 495]], R: [[0, 5], [20, 40], [30, 90], [40, 140], [50, 195], [60, 255], [70, 315], [80, 375], [90, 440], [97, 495], [100, 495]] };
  function conv(sec, pct) { const t = CONV[sec]; const x = Math.max(0, Math.min(100, pct)); for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } return 495; }
  const r5 = (x) => Math.max(5, Math.min(495, Math.round(x / 5) * 5));
  function estimate([right, n], sec) {
    if (!n) return { mid: 5, lo: 5, hi: 5, pct: 0 };
    const p = right / n; const q = Math.max(0.1, Math.min(0.9, p));
    const se = Math.sqrt((q * (1 - q)) / n) * 100 + 5; const pct = p * 100;
    return { mid: r5(conv(sec, pct)), lo: r5(conv(sec, pct - se)), hi: r5(conv(sec, pct + se)), pct: Math.round(pct) };
  }
  function renderMockResult() {
    const m = L.mock; const t = TS();
    const eL = estimate(m.L, 'L'), eR = estimate(m.R, 'R');
    const lo = eL.lo + eR.lo, hi = eL.hi + eR.hi, mid = Math.round((eL.mid + eR.mid) / 5) * 5;
    if (!L.mockSaved) { L.mockSaved = true; t.scores.push({ d: today(), kind: 'mock', mid, lo, hi, l: m.L, r: m.R }); t.scores = t.scores.slice(-40); save(); }
    const row = (name, mm, e) => h('div', { class: 'mres' }, h('b', {}, name), h('span', { class: 'num' }, `${mm[0]}/${mm[1]}問（${e.pct}%）`), h('span', { class: 'num' }, `${e.lo}〜${e.hi}`));
    const use = h('button', { class: 'cta alt' }, `${mid}点を「いまのスコア」にする`);
    use.onclick = () => { t.cur = mid; save(); use.textContent = '更新しました'; use.disabled = true; };
    app.append(h('div', { class: 'wrap result', style: cvars('toeic') },
      h('div', { class: 'seal', 'aria-hidden': 'true' }, h('span', {}, '模'), h('span', {}, '試')),
      h('h2', {}, '推定スコア'),
      h('div', { class: 'mbig num' }, `${lo}〜${hi}`),
      h('div', { class: 'note' }, `真ん中の値 ${mid}点 ・ 目標 ${t.target}点まで ${Math.max(0, t.target - mid)}点`),
      h('div', { class: 'mtable' }, row('リスニング', m.L, eL), row('リーディング', m.R, eR)),
      h('p', { class: 'tnote left' }, `問題数が${m.L[1] + m.R[1]}問と少ないので、幅は広めに出しています。このアプリの問題は本番より短く、音声も本番の4か国の発音とは違うので、本番より高めに出やすいはずです。実力は本番か公式問題集で確かめてください。`),
      h('div', { class: 'rbtns' }, use, h('button', { class: 'cta', onclick: () => go({ name: 'toeic' }) }, 'TOEIC のページへ'))));
  }

  // ---------- AI で問題を増やす ----------
  const clean1 = (s, max = 400) => (typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : '').slice(0, max);
  function aiPrompt(kind) {
    const cur = curScore(), tgt = TS().target; const ph = phaseNow();
    const lvTxt = ph.lv === 1 ? 'easy (TOEIC 400-550 level)' : ph.lv === 2 ? 'intermediate (TOEIC 600-750 level)' : 'advanced (TOEIC 800-900 level)';
    const weak = weakCats().map((c) => c).join(', ') || 'pos, verb, prep';
    const common = `You write ORIGINAL practice items in the style of the TOEIC Listening & Reading test (do not copy real test items). The learner is Japanese, currently about ${cur} points, aiming for ${tgt}. Difficulty: ${lvTxt}. Every item must have exactly one correct answer; avoid items where a second choice could also be defended. Use natural business English. Japanese text must be natural Japanese. Reply with JSON only, no comments.`;
    if (kind === 'p5') return `${common}\n\nCreate 5 Part 5 (incomplete sentence) questions. Focus mostly on these categories: ${weak}. Category codes: pos (word form), verb (tense/voice/agreement/verb form), prep (preposition vs conjunction), pron (pronoun), rel (relative), vocab (word choice), comp (comparison/other). Each sentence has exactly one blank written as ------- (seven hyphens). For word-form questions, the four choices should be forms of the same word.\nJSON shape: {"items":[{"cat":"pos","q":"Please read the instructions -------.","answer":"carefully","wrong":["careful","care","cared"],"ex":"日本語の解説（正解の理由と、迷いやすい誤答がだめな理由を1〜2文）"}]}`;
    if (kind === 'p7') return `${common}\n\nCreate 1 Part 7 reading set: one document (choose one kind: email, notice, ad, article) of 120-200 words, and 3 questions with 4 choices each. Include at least one inference or "NOT true" question when the difficulty is intermediate or above. For an email, put To/From/Date/Subject lines in "head".\nJSON shape: {"kind":"email","title":"","head":["To: ...","From: ...","Date: ...","Subject: ..."],"body":"paragraphs separated by \\n","ja":"文書全体の日本語訳","qs":[{"q":"What is the purpose of the e-mail?","answer":"...","wrong":["...","...","..."]}],"ex":"日本語の解説（各設問の根拠がどこにあるか）"}`;
    return `${common}\n\nCreate 1 Part 3 conversation set: a conversation of 5-7 turns between a man (M) and a woman (W) in a workplace or shop situation, and 3 questions with 4 choices each (purpose / detail / what will happen next). Paraphrase between the conversation and the correct choices, as the real test does.\nJSON shape: {"lines":[["M","..."],["W","..."]],"ja":"会話の日本語訳","qs":[{"q":"What is the woman's problem?","answer":"...","wrong":["...","...","..."]}],"ex":"日本語の解説"}`;
  }
  function aiQs(arr) {
    if (!Array.isArray(arr)) return null;
    const out = [];
    for (const q of arr.slice(0, 4)) {
      const a = clean1(q && q.answer, 160); const w = Array.isArray(q && q.wrong) ? q.wrong.map((x) => clean1(x, 160)).filter(Boolean) : [];
      const all = [a, ...w.slice(0, 3)];
      if (!clean1(q.q) || !a || all.length !== 4 || new Set(all.map((x) => x.toLowerCase())).size !== 4) return null;
      out.push({ q: clean1(q.q, 240), choices: all });
    }
    return out.length >= 2 ? out : null;
  }
  function aiParse(kind, data) {
    const id = () => 'ai.' + Date.now().toString(36) + Math.floor(rand() * 1e4).toString(36);
    const lv = phaseNow().lv;
    if (kind === 'p5') {
      const out = [];
      for (const it of (data && Array.isArray(data.items) ? data.items : []).slice(0, 8)) {
        const q = clean1(it && it.q, 260).replace(/-{3,}|_{3,}/g, '-------');
        const a = clean1(it && it.answer, 80); const w = Array.isArray(it && it.wrong) ? it.wrong.map((x) => clean1(x, 80)).filter(Boolean).slice(0, 3) : [];
        const all = [a, ...w];
        if ((q.match(/-------/g) || []).length !== 1 || all.length !== 4 || new Set(all.map((x) => x.toLowerCase())).size !== 4) continue;
        out.push({ id: id() + out.length, lv, cat: CAT_JA[it.cat] ? it.cat : 'vocab', q, choices: all, ex: clean1(it.ex, 300) || '（解説なし）', ai: true });
      }
      return out;
    }
    const qs = aiQs(data && data.qs); if (!qs) return [];
    if (kind === 'p7') {
      const body = typeof data.body === 'string' ? data.body.trim().slice(0, 2500) : '';
      if (body.length < 200) return [];
      const head = Array.isArray(data.head) ? data.head.map((x) => clean1(x, 120)).filter(Boolean).slice(0, 5) : [];
      const kd = ['email', 'notice', 'ad', 'article'].includes(data.kind) ? data.kind : 'notice';
      return [{ id: id(), lv, docs: [{ kind: kd, title: clean1(data.title, 120), head, body }], ja: clean1(data.ja, 2000) || '（訳なし）', qs, ex: clean1(data.ex, 800) || '', ai: true }];
    }
    const lines = Array.isArray(data.lines) ? data.lines.filter((l) => Array.isArray(l) && VOICE_OF[l[0]] && clean1(l[1])).map((l) => [l[0], clean1(l[1], 400)]).slice(0, 10) : [];
    if (lines.length < 3) return [];
    return [{ id: id(), lv, kind: 'conv', title: 'AI作成の会話', lines, ja: clean1(data.ja, 2000) || '（訳なし）', qs, ex: clean1(data.ex, 800) || '', ai: true }];
  }
  async function aiMake(kind, btn, status) {
    const s = await getSampler();
    if (!s || !s.json) { status.textContent = 'この環境では使えません（claude.ai で開いたときに使えます）。'; return; }
    btn.disabled = true; status.textContent = 'Claude が問題を作っています…（30秒〜1分ほど）';
    try {
      const data = await s.json(aiPrompt(kind), { modelTier: 'default', cache: false });
      const items = aiParse(kind, data);
      if (!items.length) { status.textContent = '形式の合わない問題が返ってきました。もう一度押してください。'; return; }
      AI[kind] = AI[kind].concat(items).slice(-60); saveAI();
      status.textContent = '';
      if (kind === 'p5') startToeic(items.map(p5Ex), 'AI作成：Part 5');
      else startToeic(items.map((x) => setEx(x, kind)), kind === 'p7' ? 'AI作成：Part 7' : 'AI作成：Part 3');
    } catch (e) {
      const c = e && e.code;
      status.textContent = c === 'not_granted' ? 'Claude の利用が許可されていません（アーティファクトの「権限」メニューで許可できます）。' : c === 'rate_limited' ? '混み合っています。少し待ってからもう一度。' : c === 'invalid_json' ? '形式の合わない答えが返ってきました。もう一度押してください。' : '作れませんでした。もう一度押してください。';
    } finally { btn.disabled = false; }
  }

  // ---------- 画面：ホームのカード ----------
  function toeicCard() {
    const t = TS(); const cur = curScore(); const keys = todayMenu(); const st = menuState(); const done = keys.filter((k) => st[k]).length;
    const days = t.exam ? Math.ceil((new Date(t.exam + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5) : null;
    const wc = wordCounts();
    return h('button', { class: 'tcard', onclick: () => go({ name: 'toeic' }) },
      h('div', { class: 'tc-top' }, h('b', {}, `TOEIC ${t.target}`), h('span', { class: 'num' }, `いま ${cur}点`)),
      scoreBar(cur, t.target),
      h('div', { class: 'tc-sub' }, `今日のメニュー ${done}/${keys.length}`, ' ・ ', `覚えた単語 ${wc.learned}`, days != null && days >= 0 ? ` ・ 本番まで ${days}日` : ''));
  }
  function scoreBar(cur, target) {
    const pc = (v) => `${Math.max(0, Math.min(100, ((v - 10) / 980) * 100))}%`;
    return h('div', { class: 'sbar', role: 'img', 'aria-label': `いま ${cur}点、目標 ${target}点` },
      h('i', { style: `width:${pc(cur)}` }), h('span', { class: 'tgt', style: `left:${pc(target)}` }));
  }

  // ---------- 画面：TOEIC ページ ----------
  function toeicView() {
    const t = TS(); const cur = curScore(); const pi = phaseIdx(cur); const ph = PHASES[pi];
    const bar = h('div', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': 'ホームへ戻る', onclick: () => go({ name: 'home' }) }, icon('back')),
      h('h2', {}, `TOEIC ${t.target}`),
      h('button', { class: 'icon-btn', 'aria-label': 'TOEIC の設定', onclick: toeicSettings }, icon('gear'))));
    const root = h('div', { class: 'wrap tpage', style: cvars('toeic') });
    const days = t.exam ? Math.ceil((new Date(t.exam + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5) : null;
    const hrs = (t.studyTotal / 3600);
    root.append(h('section', { class: 'hero thero', style: `background:${cdeep('en')}` },
      h('div', { class: 'th-row' }, h('div', {}, h('div', { class: 'th-l' }, 'いまのスコア'), h('div', { class: 'th-big num' }, cur)), h('div', { class: 'th-arrow', 'aria-hidden': 'true' }, '→'), h('div', {}, h('div', { class: 'th-l' }, '目標'), h('div', { class: 'th-big num' }, t.target))),
      scoreBar(cur, t.target),
      h('p', {}, `段階 ${pi + 1}「${ph.name}」（${phaseFrom(pi)}→${ph.to > 990 ? t.target : ph.to}）`, days != null ? (days >= 0 ? ` ・ 本番まで ${days}日` : ' ・ 受験日が過ぎています（設定で更新）') : ''),
      h('p', { class: 'small' }, `このアプリでの英語の学習 ${hrs < 10 ? hrs.toFixed(1) : Math.round(hrs)}時間 ・ 今日 ${Math.round((t.study[today()] || 0) / 60)}分`)));

    // 今日のメニュー
    root.append(h('div', { class: 'sec-title' }, '今日のメニュー'));
    const st = menuState(); const keys = todayMenu();
    const ml = h('div', { class: 'mlist' });
    for (const k of keys) {
      const m = MENU[k]; const done = !!st[k];
      const msg = h('small', { class: 'mmsg' });
      ml.append(h('button', { class: 'mrow' + (done ? ' done' : ''), onclick: () => { if (m.start() === false) msg.textContent = k === 'words' ? '今日の単語はおしまい（新しい単語も復習もなし）' : 'いまは出せる問題がありません'; } },
        h('span', { class: 'mchk' }, done ? icon('check') : ''),
        h('span', { class: 'mtx' }, h('b', {}, m.name), h('small', {}, m.sub()), msg),
        m.audio && !canSpeak() ? h('span', { class: 'mtag' }, '文字のみ') : icon('play')));
    }
    root.append(ml);
    if (keys.every((k) => st[k])) root.append(h('p', { class: 'tnote' }, '今日のメニューは全部終わり。下の「練習」で好きなだけ追加できます。'));

    // 練習
    root.append(h('div', { class: 'sec-title' }, '練習'));
    const wc = wordCounts();
    const grid = h('div', { class: 'pgrid' });
    const tile = (name, sub, fn, extra) => { const b = h('button', { class: 'ptile' }, h('b', {}, name), h('small', {}, sub), extra || null); b.onclick = () => { if (fn() === false) b.querySelector('small').textContent = 'いまは出せる問題がありません'; }; return b; };
    grid.append(
      tile('単語', `覚えた ${wc.learned} ・ 学習中 ${wc.learning} ・ 未学習 ${wc.fresh}`, () => startWords(false)),
      tile('Part 2', '応答問題 10問', () => startPart('p2')),
      tile('Part 3・4', '会話・説明文', () => startPart('p34', { n: 2 })),
      tile('Part 5', `文法・語彙 ${SIZES.p5[pi]}問`, () => startPart('p5')),
      tile('Part 7', '読解 2文書', () => startPart('p7', { n: 2 })),
      canSpeak() ? tile('ディクテーション', '聞いて書く 5文', () => startDict(false)) : null,
      tile('ミニ模試', '約20分・推定スコア', startMock));
    root.append(grid);
    const chips = h('div', { class: 'catchips' }, h('span', {}, 'Part 5 を分野別に：'));
    for (const [c, name] of Object.entries(CAT_JA)) chips.append(h('button', { class: 'chip tog', onclick: () => startPart('p5', { cat: c, n: 8 }) }, name));
    const wk = weakCats(); if (wk.length) chips.append(h('button', { class: 'chip tog on', onclick: () => startToeic(TD.p5.concat(AI.p5).filter((q) => wk.includes(q.cat)).sort(() => rand() - 0.5).slice(0, 10).map(p5Ex), 'Part 5：苦手分野') }, '苦手分野'));
    root.append(chips);
    const bank = P.mistakes.toeic || [];
    if (bank.length) root.append(h('button', { class: 'cta alt tmiss', onclick: startToeicReview }, `間違えた問題をやり直す（${bank.length}）`));

    // 文法レッスン（読んで、その文法の Part 5 を解く）
    if (TD.grammar.length) {
      root.append(h('div', { class: 'sec-title' }, `文法レッスン（${TD.grammar.length}）`));
      const read = t.gread || (t.gread = {}); const gl = h('div', { class: 'glist' });
      for (const g of TD.grammar) {
        const qs = grammarQs(g);
        const det = h('details', { class: 'gles' + (read[g.tag] ? ' read' : '') },
          h('summary', {}, h('span', { class: 'glv num' }, GLV[g.lv] || ''), h('b', {}, g.title), read[g.tag] ? icon('check') : null),
          ...g.body.map((x) => h('p', {}, x)),
          g.ex && g.ex.length ? h('div', { class: 'gex' }, ...g.ex.map(([en, ja]) => h('div', { class: 'gexr' }, h('div', { class: 'en' }, en, canSpeak() ? h('button', { class: 'mini-say', 'aria-label': '例文を聞く', onclick: () => speak(en) }, icon('speaker')) : null), h('small', {}, ja)))) : null,
          qs.length ? h('button', { class: 'cta alt', onclick: () => startToeic(sampleN(qs, Math.min(8, qs.length)).map(p5Ex), `文法：${g.tag}`) }, `この文法の Part 5 を解く（${qs.length}問から）`) : null);
        det.addEventListener('toggle', () => { if (det.open && !read[g.tag]) { read[g.tag] = 1; save(); } });
        gl.append(det);
      }
      root.append(gl);
    }

    // 単語の帯
    root.append(h('div', { class: 'sec-title' }, '単語（スコアの目安ごと）'));
    const bands = h('div', { class: 'bands' });
    for (const b of BANDS) { const c = wordCounts(b); bands.append(h('div', { class: 'band' }, h('span', { class: 'num' }, b + '点'), h('div', { class: 'bbar' }, h('i', { class: 'l', style: `width:${(c.learned / c.total) * 100}%` }), h('i', { class: 'm', style: `width:${(c.learning / c.total) * 100}%` })), h('span', { class: 'num' }, `${c.learned}/${c.total}`))); }
    root.append(bands, h('p', { class: 'tnote left' }, `「覚えた」＝7日あけても正解できた語。全${TD.words.length}語。900点には1万語近い語彙が要ると言われるので、ここにあるのは頻出の芯です。`));

    // 正答率
    root.append(h('div', { class: 'sec-title' }, '正答率（最近30問）'));
    const rows = [['words', '単語'], ['p2', 'Part 2'], ['p34', 'Part 3・4'], ['dict', 'ディクテーション'], ['p7', 'Part 7'], ...Object.entries(CAT_JA).map(([c, n]) => ['p5:' + c, 'Part 5 ' + n])];
    const acc = h('div', { class: 'acc-list' }); let any = false;
    for (const [k, name] of rows) { const a = accOf(k); if (!a) continue; any = true; const pc = Math.round(a.p * 100); acc.append(h('div', { class: 'arow' + (a.n >= 3 && pc < 60 ? ' weak' : '') }, h('span', {}, name), h('div', { class: 'abar' }, h('i', { style: `width:${pc}%` })), h('span', { class: 'num' }, `${pc}%`), h('small', { class: 'num' }, `${a.n}問`))); }
    root.append(any ? acc : h('p', { class: 'tnote left' }, 'まだ記録がありません。問題を解くとここに出ます。'));

    // スコア
    root.append(h('div', { class: 'sec-title' }, 'スコアの記録'));
    const sl = h('div', { class: 'slist' });
    for (const s of t.scores.slice().reverse().slice(0, 8)) sl.append(h('div', { class: 'srec' }, h('span', { class: 'num' }, s.d), h('span', {}, s.kind === 'real' ? '本番' : 'ミニ模試（推定）'), h('b', { class: 'num' }, s.kind === 'real' ? `${s.s}点` : `${s.lo}〜${s.hi}点`)));
    if (!t.scores.length) sl.append(h('p', { class: 'tnote left' }, `まだありません（スタート時点 ${t.start}点）。`));
    root.append(sl, h('button', { class: 'cta alt', onclick: scoreSheet }, '本番のスコアを記録する'));

    // AI
    const aiSec = h('div', { class: 'aisec', hidden: true },
      h('div', { class: 'sec-title' }, 'Claude に新しい問題を作ってもらう'),
      h('p', { class: 'tnote left' }, 'いまのレベルと苦手分野に合わせて作ります。AI作成の問題はまれに答えが2つ成り立つなどの誤りがあるので、変だと思ったら疑ってください。'));
    const aiStatus = h('div', { class: 'tnote left', 'aria-live': 'polite' });
    const aiRow = h('div', { class: 'airow' });
    for (const [k, name] of [['p5', 'Part 5 ×5問'], ['p7', 'Part 7 ×1文書'], ['p34', 'Part 3 ×1会話']]) { const b = h('button', { class: 'explain-btn' }, icon('spark'), name); b.onclick = () => aiMake(k, b, aiStatus); aiRow.append(b); }
    aiSec.append(aiRow, aiStatus); root.append(aiSec);
    getSampler().then((s) => { if (s && aiSec.isConnected) aiSec.hidden = false; });

    // ロードマップ
    root.append(h('div', { class: 'sec-title' }, `${t.start}点から${t.target}点までの道のり`));
    const rm = h('div', { class: 'roadmap' });
    PHASES.forEach((p, i) => rm.append(h('div', { class: 'ph' + (i === pi ? ' now' : i < pi ? ' past' : '') },
      h('div', { class: 'ph-h' }, h('b', {}, `${i + 1}. ${p.name}`), h('span', { class: 'num' }, `${phaseFrom(i)}→${p.to > 990 ? t.target : p.to}点`), h('small', {}, p.hours)),
      h('p', {}, p.focus))));
    root.append(rm);
    root.append(h('div', { class: 'honest' },
      h('b', {}, '正直なところ'),
      h('p', {}, '300点から900点は、よく言われる目安で合計1,300〜1,700時間（1日2時間で2年前後）。この数字自体の根拠は粗いけれど、桁は合っているはず。'),
      h('p', {}, 'このアプリで鍛えられるのは単語・文法・聞き取りの基礎体力まで。本番の音声（アメリカ・イギリス・カナダ・オーストラリアの発音）と2時間通しの集中力は、公式問題集を時間を計って解かないと身につかない。'),
      h('p', {}, '推定スコアは目安。2〜3か月に1回は本番を受けて、実際の点数をここに記録しよう。')));
    root.append(h('div', { class: 'foot' }, '問題はすべてこのアプリのオリジナルです（本番の問題の転載ではありません）。'));
    app.append(bar, root);
  }

  function toeicSettings() {
    const t = TS();
    const bg = h('div', { class: 'sheet-bg', onclick: (e) => { if (e.target === bg) close(); } });
    const close = () => { bg.remove(); render(); };
    const seg = (vals, get, set, fmt = (v) => v) => { const s = h('div', { class: 'seg' }); vals.forEach((v) => { const b = h('button', { class: get() === v ? 'on' : '' }, fmt(v)); b.onclick = () => { set(v); [...s.children].forEach((x) => x.classList.toggle('on', x === b)); save(); }; s.append(b); }); return s; };
    const curIn = h('input', { class: 'tin num', type: 'number', min: '10', max: '990', step: '5', value: String(curScore()), 'aria-label': 'いまのスコア' });
    curIn.onchange = () => { const v = Math.round(+curIn.value / 5) * 5; if (v >= 10 && v <= 990) { t.cur = v; save(); } };
    const exam = h('input', { class: 'tin', type: 'date', value: t.exam || '', 'aria-label': '受験日' });
    exam.onchange = () => { t.exam = exam.value || null; save(); };
    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-label': 'TOEIC の設定' },
      h('div', { class: 'srow' }, h('h3', {}, 'TOEIC の設定'), h('button', { class: 'icon-btn', 'aria-label': '閉じる', onclick: close }, icon('close'))),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, 'いまのスコア'), h('small', {}, '今日のメニューの中身がこれで決まる')), curIn),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '目標'), h('small', {}, '')), seg([730, 800, 860, 900, 990], () => t.target, (v) => { t.target = v; })),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '受験日'), h('small', {}, '残り日数を表示')), exam),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '1日の新しい単語'), h('small', {}, '復習が増えすぎたら減らす')), seg([5, 10, 15, 20], () => t.newPerDay, (v) => { t.newPerDay = v; })),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '音声の速さ'), h('small', {}, '1.0が普通。本番はやや速め')), seg([0.9, 1, 1.1, 1.25], () => t.rate, (v) => { t.rate = v; }, (v) => v.toFixed(v === 1.25 ? 2 : 1))));
    bg.append(sheet); document.body.append(bg);
    document.onkeydown = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  }
  function scoreSheet() {
    const t = TS();
    const bg = h('div', { class: 'sheet-bg', onclick: (e) => { if (e.target === bg) close(); } });
    const close = () => { bg.remove(); render(); };
    const sIn = h('input', { class: 'tin num', type: 'number', min: '10', max: '990', step: '5', placeholder: '例 450', 'aria-label': '本番のスコア' });
    const dIn = h('input', { class: 'tin', type: 'date', value: today(), 'aria-label': '受験日' });
    const msg = h('small', { class: 'mmsg' });
    const ok = h('button', { class: 'cta' }, '記録する');
    ok.onclick = () => { const v = Math.round(+sIn.value / 5) * 5; if (!(v >= 10 && v <= 990)) { msg.textContent = '10〜990の数字を入れてください'; return; } t.scores.push({ d: dIn.value || today(), kind: 'real', s: v }); t.scores.sort((a, b) => (a.d < b.d ? -1 : 1)); t.cur = v; save(); close(); };
    bg.append(h('div', { class: 'sheet', role: 'dialog', 'aria-label': '本番のスコアを記録' },
      h('div', { class: 'srow' }, h('h3', {}, '本番のスコアを記録'), h('button', { class: 'icon-btn', 'aria-label': '閉じる', onclick: close }, icon('close'))),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '合計スコア')), sIn),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '受験日')), dIn), msg, ok));
    document.body.append(bg); setTimeout(() => sIn.focus(), 50);
    document.onkeydown = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  }
