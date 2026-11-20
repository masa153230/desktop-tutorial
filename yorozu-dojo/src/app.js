/* よろず道場 — アプリ本体 */
(() => {
  'use strict';
  const COURSES = CONTENT.courses;
  const BY_ID = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const app = document.getElementById('app');

  // ---------- 小道具 ----------
  const rand = Math.random;
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sampleN = (a, n) => shuffle(a).slice(0, n);
  const dstr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => dstr(new Date());
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dstr(d); };
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const ICONS = {
    flame: '<path d="M12 2.5c.8 3.6-2.6 5.2-2.6 8.6a2.6 2.6 0 0 0 5.2 0c0-.9-.3-1.7-.8-2.5 2.3 1.2 4.2 3.8 4.2 6.6A6 6 0 0 1 6 15.2C6 9.6 11.2 7.4 12 2.5z" fill="currentColor"/>',
    bolt: '<path d="M13.5 2 5 13.5h6l-1 8.5 8.5-11.5h-6z" fill="currentColor"/>',
    back: '<path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    gear: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    x: '<path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    loop: '<path d="M6.5 9.5C4.5 9.5 3 11 3 12.5S4.5 15.5 6.5 15.5c3.5 0 7.5-6 11-6 2 0 3.5 1.5 3.5 3s-1.5 3-3.5 3c-3.5 0-7.5-6-11-6z" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    review: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };
  const icon = (n, cls = '') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'ico ' + cls); s.setAttribute('aria-hidden', 'true'); s.innerHTML = ICONS[n]; return s; };
  const ccolor = (cid) => `var(--c-${cid})`;
  const cdeep = (cid) => `var(--d-${cid})`;
  const cvars = (cid) => `--cc:${ccolor(cid)};--cd:${cdeep(cid)}`;

  // ---------- 進捗の保存 ----------
  const LS_KEY = 'yorozu-dojo-v1';
  const blank = () => ({ v: 1, xp: 0, daily: {}, streak: 0, best: 0, last: null, goal: 30, lessons: {}, mistakes: { en: [], mn: [], ch: [], mj: [] }, sound: true, reading: true, autoplay: true, updatedAt: 0 });
  function normalize(p) {
    const b = blank(); const o = Object.assign(b, p || {});
    o.mistakes = Object.assign(blank().mistakes, o.mistakes || {});
    o.daily = o.daily || {}; o.lessons = o.lessons || {};
    o.play = o.play || {}; o.stats = o.stats || {};
    return o;
  }
  function loadLocal() { try { const s = localStorage.getItem(LS_KEY); return s ? normalize(JSON.parse(s)) : null; } catch { return null; } }
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch { /* 保存できない環境 */ } }
  let P = loadLocal() || blank();
  const Sync = { ref: null, state: 'pending', writing: false, dirty: false, retried: false };
  function setSync(state) { Sync.state = state; document.querySelectorAll('[data-sync]').forEach((el) => paintSync(el)); }
  function paintSync(el) {
    const m = { pending: ['', '保存先を確認中…'], cloud: ['ok', 'クラウドに保存済み（どの端末でも続きから）'], local: ['', 'この端末のブラウザに保存中'], slow: ['err', 'クラウドに接続できません。この端末に保存中'], error: ['err', 'クラウド保存に失敗。この端末には保存済み'], readonly: ['err', '閲覧専用のため、この端末にだけ保存中'] }[Sync.state] || ['', ''];
    el.className = 'sync ' + m[0]; el.textContent = m[1];
  }
  async function pushRemote() {
    if (!Sync.ref) return;
    if (Sync.writing) { Sync.dirty = true; return; }
    Sync.writing = true;
    try {
      do { Sync.dirty = false; await Sync.ref.set(JSON.parse(JSON.stringify(P))); } while (Sync.dirty);
      setSync('cloud');
    } catch (e) {
      if (e && e.code === 'invalid_argument') { Sync.ref = null; setSync('readonly'); }
      else if (e && e.code === 'unavailable' && !Sync.retried) { Sync.retried = true; setTimeout(() => { Sync.writing = false; pushRemote(); }, 1200 + rand() * 1500); return; }
      else setSync('error');
    }
    Sync.writing = false;
  }
  function save() { P.updatedAt = Date.now(); saveLocal(); pushRemote(); }
  async function initSync() {
    try {
      if (!window.claude || !window.claude.use) { setSync('local'); return; }
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) { setSync('local'); return; }
      const id = await user.id();
      if (!id) { setSync('local'); return; }
      const ref = db.doc('data/users/' + id + '/progress');
      const slow = setTimeout(() => setSync('slow'), 10000);
      const snap = await ref.get();
      clearTimeout(slow);
      Sync.ref = ref;
      if (snap.exists) {
        const remote = normalize(JSON.parse(JSON.stringify(snap.data())));
        if ((remote.updatedAt || 0) > (P.updatedAt || 0)) { P = remote; saveLocal(); if (view.name !== 'lesson') render(); setSync('cloud'); }
        else if ((P.updatedAt || 0) > (remote.updatedAt || 0)) pushRemote(); else setSync('cloud');
      } else if (P.updatedAt) pushRemote(); else setSync('cloud');
    } catch { setSync('local'); }
  }

  // ---------- 音 ----------
  const Speech = { tts: null, web: false, off: false, mn: false, mnWeb: null, dict: null, noSpeak: false };
  const canSpeak = (lang = 'en') => !Speech.off && (lang === 'mn' ? (Speech.mn || !!Speech.mnWeb) : (!!Speech.tts || Speech.web));
  async function initSpeech() {
    Speech.web = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    const findMn = () => { try { Speech.mnWeb = speechSynthesis.getVoices().find((v) => /^mn/i.test(v.lang)) || null; } catch { /* なし */ } };
    if (Speech.web) { findMn(); try { speechSynthesis.addEventListener('voiceschanged', findMn); } catch { /* なし */ } }
    if (!window.claude || !window.claude.use) return;
    try {
      Speech.tts = await window.claude.use('tts');
      if (Speech.tts && Speech.tts.languages) { const ls = await Speech.tts.languages().catch(() => []); Speech.mn = (ls || []).some((l) => /^mn/i.test(l)); }
    } catch { Speech.tts = null; }
    try { Speech.dict = await window.claude.use('dictation'); } catch { Speech.dict = null; }
  }
  function webSpeak(text, slow, lang = 'en') {
    if (!Speech.web) return;
    try {
      const u = new SpeechSynthesisUtterance(text); u.rate = slow ? 0.7 : 0.95;
      if (lang === 'mn') { if (!Speech.mnWeb) return; u.lang = Speech.mnWeb.lang; u.voice = Speech.mnWeb; }
      else {
        u.lang = 'en-US';
        const v = speechSynthesis.getVoices().find((x) => /^en(-|_)US/i.test(x.lang)) || speechSynthesis.getVoices().find((x) => /^en/i.test(x.lang));
        if (v) u.voice = v;
      }
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch { /* 無音 */ }
  }
  function speak(text, slow = false, lang = 'en') {
    if (Speech.off) return;
    if (lang === 'mn' && !Speech.mn) { webSpeak(text, slow, 'mn'); return; }
    if (Speech.tts) {
      Speech.tts.speak(text, { language: lang, rate: slow ? 0.75 : 1 }).catch((e) => {
        const c = e && e.code;
        if (c === 'not_granted') { Speech.off = true; document.querySelectorAll('.say, .listen-big').forEach((b) => { b.hidden = true; }); }
        else if (c === 'rate_limited' || c === 'unavailable' || c === 'upstream_error') webSpeak(text, slow, lang);
      });
      return;
    }
    webSpeak(text, slow, lang);
  }
  // ---------- 忘却曲線（SRS） ----------
  const dayNo = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); };
  const SRS_INT = [0, 1, 3, 7, 14, 30, 60];
  function srsTouch(key, ok) {
    P.srs = P.srs || {}; const r = P.srs[key] || [0, 0]; const box = ok ? Math.min(6, r[0] + 1) : 0;
    P.srs[key] = [box, dayNo() + (ok ? SRS_INT[box] : 1)];
  }
  function srsDue(cid) { const t = dayNo(); return Object.entries(P.srs || {}).filter(([k, v]) => k.startsWith(cid + '.') && v[1] <= t).sort((a, b) => a[1][1] - b[1][1]).map(([k]) => k); }
  function srsCount(cid) { return Object.keys(P.srs || {}).filter((k) => k.startsWith(cid + '.')).length; }
  let actx = null;
  function sfx(kind) {
    if (!P.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime;
      if (kind === 'tile' || kind === 'piece') {
        const len = 0.06; const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * len), actx.sampleRate); const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === 'tile' ? 6 : 4);
        const src = actx.createBufferSource(); src.buffer = buf; const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = kind === 'tile' ? 2600 : 900; bp.Q.value = 1.2;
        const gn = actx.createGain(); gn.gain.value = kind === 'tile' ? 0.5 : 0.7; src.connect(bp); bp.connect(gn); gn.connect(actx.destination); src.start(t0);
        return;
      }
      const notes = kind === 'good' ? [[659, 0], [988, 0.08]] : kind === 'bad' ? [[196, 0], [165, 0.12]] : [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]];
      for (const [f, dt] of notes) {
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = kind === 'bad' ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + dt); g.gain.exponentialRampToValueAtTime(0.16, t0 + dt + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.22);
        o.connect(g); g.connect(actx.destination); o.start(t0 + dt); o.stop(t0 + dt + 0.25);
      }
    } catch { /* 音なし */ }
  }

  // ---------- チェスライブラリ ----------
  let chessPromise = null;
  function ensureChess() {
    if (window.Chess) return Promise.resolve(true);
    if (chessPromise) return chessPromise;
    const load = (src) => new Promise((res) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(!!window.Chess); s.onerror = () => res(false); document.head.append(s); });
    chessPromise = load('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js')
      .then((ok) => ok || load('https://cdn.jsdelivr.net/npm/chess.js@0.10.3/chess.js'))
      .then((ok) => { if (!ok) chessPromise = null; return ok; });
    return chessPromise;
  }

  // ---------- コース構造 ----------
  function lessonsOf(course, unit) {
    if (unit.lessons) return unit.lessons;
    if (!unit._ls) unit._ls = deriveLessons(unit);
    return unit._ls;
  }
  function deriveLessons(unit) {
    if (unit.curated) { const n = unit.curated.length; const half = Math.ceil(n / 2); return [{ id: 'l1', name: '前半', cur: [0, half] }, { id: 'l2', name: '後半', cur: [half, n] }]; }
    const n = unit.items.length; const half = Math.ceil(n / 2);
    return [{ id: 'l1', name: 'はじめて', lv: 1, range: [0, half] }, { id: 'l2', name: 'つづき', lv: 2, range: [half, n] }, { id: 'l3', name: '仕上げ', lv: 3, range: [0, n] }];
  }
  const keyOf = (c, u, l) => `${c.id}.${u.id}.${l.id}`;
  const timesDone = (k) => (P.lessons[k] && P.lessons[k].n) || 0;
  function courseStats(course) {
    let total = 0, done = 0;
    for (const u of course.units) for (const l of lessonsOf(course, u)) { total++; if (timesDone(keyOf(course, u, l))) done++; }
    return { total, done };
  }
  function nextLesson(course) {
    for (const u of course.units) for (const l of lessonsOf(course, u)) if (!timesDone(keyOf(course, u, l))) return { u, l };
    return null;
  }
  function streakNow() { return (P.last === today() || P.last === daysAgo(1)) ? P.streak : 0; }

  // ---------- 問題づくり ----------
  // mc の choices は「正解が先頭」の文字列 or {text, cls, tile} で書かれている → シャッフルして a を付ける
  function mcFrom(base, correct, wrongs) {
    const all = shuffle([correct, ...wrongs]);
    return Object.assign({ t: 'mc' }, base, { choices: all, a: all.indexOf(correct) });
  }
  function normCurated(e) {
    if (e.t === 'mc') {
      const ch = e.choices.map((c) => (typeof c === 'string' ? { text: c } : c));
      return mcFrom(e, ch[0], ch.slice(1));
    }
    return Object.assign({}, e);
  }
  const distract = (pool, item, f, n = 3) => sampleN(pool.filter((o) => o !== item && o[f] !== item[f]).filter((o, i, arr) => arr.findIndex((x) => x[f] === o[f]) === i), n);
  const tokens = (s) => s.split(/\s+/).map((w) => w.replace(/^[¿¡"“]+|[.,!?;:"”]+$/g, '')).filter(Boolean);

  function langItems(course, unit) {
    return unit.items.map((it, i) => ({ id: unit.id + '.' + i, t: it[0], ja: it[1], rom: it[2] || '', kana: it[3] || '' }));
  }
  function readingOf(o) { return o.rom ? (o.kana ? `${o.rom} ／ ${o.kana}` : o.rom) : ''; }

  function makeLangEx(course, unit, all, o, type) {
    const isEn = course.id === 'en';
    const tcls = isEn ? 'en' : 'cyr';
    const target = (x) => ({ text: x.t, cls: tcls });
    const ja = (x) => ({ text: x.ja });
    if (unit.letters) {
      if (type === 's2l') return mcFrom({ q: 'この音の文字は？', main: o.ja }, { text: o.t, cls: 'cyr big' }, distract(all, o, 't').map((x) => ({ text: x.t, cls: 'cyr big' })));
      return mcFrom({ q: 'この文字の音は？', main: o.t, mainCls: 'big', ex: o.t + ' ＝ ' + o.ja }, ja(o), distract(all, o, 'ja').map(ja));
    }
    if (unit.reading) {
      if (type === 'w2j') return mcFrom({ q: 'この単語の意味は？', main: o.t, mainCls: 'cyr', ex: `${o.t}（${o.rom}）＝ ${o.ja}` }, ja(o), distract(all, o, 'ja').map(ja));
      return mcFrom({ q: 'なんと読む？', main: o.t, mainCls: 'cyr', ex: `${o.t}（${o.rom}）＝ ${o.ja}` }, { text: o.rom }, distract(all, o, 'rom').map((x) => ({ text: x.rom })));
    }
    const words = tokens(o.t);
    if (type === 'order' && words.length < 3) type = 'j2t';
    if (type === 'type' && (!isEn || words.length > 6)) type = 'j2t';
    if (type === 'listen' && !isEn) type = 't2j';
    const exText = readingOf(o) ? `${o.t}（${readingOf(o)}）＝ ${o.ja}` : `${o.t} ＝ ${o.ja}`;
    const lang = isEn ? 'en' : 'mn'; const voice = canSpeak(lang) ? o.t : null;
    if (type === 'speak' && isEn && words.length <= 10) return { t: 'speak', q: '声に出して読んでみよう', main: o.t, ja: o.ja, a: o.t, ex: exText, lang };
    if (type === 'speak') type = 'j2t';
    if (type === 't2j') return mcFrom({ q: 'どういう意味？', main: o.t, mainCls: tcls, reading: readingOf(o), audio: voice, lang, ex: exText }, ja(o), distract(all, o, 'ja').map(ja));
    if (type === 'j2t') return mcFrom({ q: isEn ? '英語で言うと？' : 'モンゴル語で言うと？', main: o.ja, ex: exText, sayAfter: voice, lang }, target(o), distract(all, o, 't').map(target));
    if (type === 'listen') return mcFrom({ q: '聞こえた英語は？', listen: o.t, ex: exText }, target(o), distract(all, o, 't').map(target));
    if (type === 'order') {
      const lower = new Set(words.map((w) => w.toLowerCase()));
      const extra = sampleN([...new Set(all.filter((x) => x !== o).flatMap((x) => tokens(x.t)))].filter((w) => !lower.has(w.toLowerCase())), 2);
      return { t: 'order', q: '並べかえて文を作ろう', main: o.ja, cls: tcls, words: shuffle([...words, ...extra]), a: words.join(' '), ex: exText, sayAfter: voice, lang };
    }
    if (type === 'type') return { t: 'type', q: '英語で書いてみよう', main: o.ja, a: o.t, ex: exText, sayAfter: o.t };
    return null;
  }
  const withItem = (e, course, o) => (e ? Object.assign(e, { _item: `${course.id}.${o.id}` }) : e);
  function pairsEx(course, unit, items) {
    const isEn = course.id === 'en';
    const rightOf = (o) => (unit.letters || unit.reading ? o.rom : o.ja);
    const set = sampleN(items, Math.min(5, items.length));
    return { t: 'pairs', q: 'ペアをそろえよう', cls: isEn ? 'en' : 'cyr', pairs: set.map((o) => [o.t, rightOf(o)]) };
  }
  const LEVEL_TYPES = {
    en: { 1: ['t2j', 'j2t', 'listen'], 2: ['j2t', 'order', 'listen', 't2j', 'speak'], 3: ['order', 'type', 'listen', 'j2t', 'speak'] },
    mn: { 1: ['t2j', 'j2t'], 2: ['j2t', 'order', 't2j'], 3: ['order', 'j2t', 't2j'] },
  };
  function langLesson(course, unit, lesson) {
    const all = langItems(course, unit);
    let items = all.slice(lesson.range[0], lesson.range[1]);
    if (lesson.lv === 3) items = sampleN(items, Math.min(8, items.length)); else items = shuffle(items);
    let types;
    if (unit.letters) types = lesson.lv === 1 ? ['l2s'] : ['l2s', 's2l'];
    else if (unit.reading) types = lesson.lv === 1 ? ['w2r'] : ['w2r', 'w2j'];
    else types = LEVEL_TYPES[course.id][lesson.lv];
    if (!canSpeak()) types = types.filter((t) => t !== 'listen');
    if (!Speech.dict || Speech.noSpeak) types = types.filter((t) => t !== 'speak');
    let tq = shuffle(types);
    const exs = items.map((o, i) => { if (i % tq.length === 0 && i) tq = shuffle(types); return withItem(makeLangEx(course, unit, all, o, tq[i % tq.length]), course, o); }).filter(Boolean);
    if (lesson.lv !== 3) {
      const extra = sampleN(items, 2).map((o) => withItem(makeLangEx(course, unit, all, o, unit.letters ? 's2l' : unit.reading ? 'w2j' : 'j2t'), course, o));
      exs.push(...extra);
    }
    const pairPool = items.length >= 4 ? items : all;
    exs.splice(Math.min(3, exs.length), 0, pairsEx(course, unit, pairPool));
    return exs;
  }

  // 麻雀ドリル
  const mjRand = () => rand();
  function tileNameEx() {
    const i = Math.floor(rand() * 34); const c = MJ.code(i);
    const same = [];
    if (i >= 27) { for (let z = 27; z < 34; z++) if (z !== i) same.push(z); }
    else { const s = Math.floor(i / 9) * 9; for (let k = 0; k < 9; k++) if (s + k !== i) same.push(s + k); }
    const wr = sampleN(same, 3);
    if (rand() < 0.5) return mcFrom({ q: 'この牌の読み方は？', tiles: c, ex: `${MJ.name(i)}＝${MJ.yomi(i)}` }, { text: MJ.yomi(i) }, wr.map((w) => ({ text: MJ.yomi(w) })));
    return mcFrom({ q: `「${MJ.yomi(i)}」はどれ？`, main: MJ.yomi(i), grid: true, ex: `${MJ.name(i)}＝${MJ.yomi(i)}` }, { tile: c }, wr.map((w) => ({ tile: MJ.code(w) })));
  }
  function agariEx() {
    const full = MJ.randomComplete(mjRand, { suits: sampleN(['m', 'p', 's'], 2).join(''), seqRate: 0.7 });
    if (rand() < 0.5) {
      const a = MJ.agari(MJ.counts(full));
      return mcFrom({ q: 'この14枚はアガリ形？', tiles: MJ.toStr(full), ex: 'アガリ：' + MJ.describe(a) }, { text: 'アガリ形' }, [{ text: 'アガリ形ではない' }]);
    }
    for (let k = 0; k < 50; k++) {
      const h2 = [...full]; const at = Math.floor(rand() * 14);
      const c = MJ.counts(h2); const cand = []; for (let t = 0; t < 34; t++) if (c[t] < 4 && MJ.code(t) !== h2[at]) cand.push(t);
      h2[at] = MJ.code(pick(cand));
      if (!MJ.agari(MJ.counts(h2))) {
        const ds = MJ.discards(h2);
        const hint = ds.length ? `${MJ.name(ds[0].tile)}を外すとテンパイ（${ds[0].waits.map((t) => MJ.name(t)).join('・')}待ち）。` : '';
        return mcFrom({ q: 'この14枚はアガリ形？', tiles: MJ.toStr(h2), ex: '4面子1雀頭に分けられない。' + hint }, { text: 'アガリ形ではない' }, [{ text: 'アガリ形' }]);
      }
    }
    return agariEx();
  }
  function waitsEx(chin) {
    const opts = chin ? { suits: pick(['m', 'p', 's']), honors: false, seqRate: 0.75 } : { suits: sampleN(['m', 'p', 's'], 2).join(''), seqRate: 0.65 };
    const full = MJ.randomComplete(mjRand, opts);
    const at = Math.floor(rand() * 14); const h13 = full.filter((_, i) => i !== at);
    return { t: 'waits', q: chin ? '待ちを全部選ぼう（清一色）' : '何待ち？ 待ちを全部選ぼう', hand: MJ.toStr(h13) };
  }
  function discardEx() {
    for (let k = 0; k < 60; k++) {
      const full = MJ.randomComplete(mjRand, { suits: sampleN(['m', 'p', 's'], 2).join(''), seqRate: 0.7 });
      const h2 = [...full]; const at = Math.floor(rand() * 14);
      const c = MJ.counts(h2); const cand = []; for (let t = 0; t < 34; t++) if (c[t] < 4 && MJ.code(t) !== h2[at]) cand.push(t);
      h2[at] = MJ.code(pick(cand));
      if (MJ.agari(MJ.counts(h2))) continue;
      const ds = MJ.discards(h2); if (!ds.length) continue;
      return { t: 'discard', q: 'テンパイに取って、待ち枚数が一番多くなる牌を切ろう', hand: MJ.toStr(h2) };
    }
    return { t: 'discard', q: 'テンパイに取って、待ち枚数が一番多くなる牌を切ろう', hand: '123m456p789s2345s1z' };
  }
  function scoreEx() {
    const cases = [[30, 1], [30, 2], [30, 3], [30, 4], [40, 1], [40, 2], [40, 3], [25, 2], [25, 3], [25, 4], [50, 2], [30, 5], [40, 6], [30, 7], [30, 8], [30, 11]];
    const [fu, han] = pick(cases); const dealer = rand() < 0.35;
    const r = MJ.score(fu, han, dealer);
    const cand = new Set();
    for (const [f2, h2, d2] of [[fu, han + 1, dealer], [fu, Math.max(1, han - 1), dealer], [fu, han, !dealer], [fu + 10, han, dealer], [Math.max(20, fu - 10), han, dealer], [fu, han + 2, dealer]]) {
      const v = MJ.score(f2, h2, d2).pts; if (v !== r.pts) cand.add(v);
    }
    const wrongs = sampleN([...cand], 3).map((v) => ({ text: v.toLocaleString('ja-JP') + '点' }));
    const who = dealer ? '親' : '子';
    const label = han >= 5 ? `${han}翻` : `${fu}符${han}翻`;
    let ex;
    if (r.name && han >= 5) ex = `${han}翻は${r.name}。${who}は${r.pts.toLocaleString('ja-JP')}点。`;
    else {
      const b = fu * 2 ** (han + 2); const raw = b * (dealer ? 6 : 4);
      ex = r.name ? `基本点 ${fu}×2^${han + 2}＝${b} は2000を超えるので満貫。${who}は${r.pts.toLocaleString('ja-JP')}点。`
        : `基本点 ${fu}×2^${han + 2}＝${b}、×${dealer ? 6 : 4}＝${raw} → 100点単位に切り上げて${r.pts.toLocaleString('ja-JP')}点。`;
      if (r.pts === 7700 || r.pts === 11600) ex += '（切り上げ満貫ルールなら満貫扱い）';
    }
    return mcFrom({ q: `${who}が ${label} でロン。何点？`, tag: '点数ドリル', ex }, { text: r.pts.toLocaleString('ja-JP') + '点' }, wrongs);
  }
  function safeEx() {
    const types = Array.from({ length: 34 }, (_, i) => i);
    for (let k = 0; k < 80; k++) {
      const river = sampleN(types, 6 + Math.floor(rand() * 4)); const rs = new Set(river);
      const suji = (t) => { if (t >= 27 || rs.has(t)) return false; const n = t % 9, b = t - n; return (n >= 3 ? rs.has(b + n - 3) : true) && (n <= 5 ? rs.has(b + n + 3) : true); };
      const mode = rand() < 0.5 ? 'genbutsu' : 'suji';
      let answer;
      if (mode === 'genbutsu') answer = pick(river.filter((t) => t < 27) .concat(river.filter((t) => t >= 27)));
      else { const c = types.filter(suji); if (!c.length) continue; answer = pick(c); }
      const others = types.filter((t) => t < 27 && !rs.has(t) && !suji(t) && t !== answer);
      if (others.length < 13) continue;
      const hand = [...sampleN(others, 13), answer].sort((a, b) => a - b);
      let ex;
      if (mode === 'genbutsu') ex = `${MJ.name(answer)}は現物（リーチした人が自分で捨てている牌）。フリテンになるので絶対にロンされない。`;
      else { const n = answer % 9, b = answer - n; const via = [n >= 3 ? b + n - 3 : null, n <= 5 ? b + n + 3 : null].filter((x) => x != null).map((x) => MJ.name(x)); ex = `${MJ.name(answer)}は筋（${via.join('と')}が捨てられている）。両面待ちには当たらない。ほかの牌は両面に当たりうる。`; }
      return { t: 'pick', q: mode === 'genbutsu' ? '対面がリーチ。一番安全な牌を切ろう' : '対面がリーチ。現物がない！一番安全な牌は？', river, hand, answer: [answer], ex };
    }
    return safeEx();
  }
  function fuEx() {
    for (let k = 0; k < 100; k++) {
      const full = MJ.randomComplete(mjRand, { suits: sampleN(['m', 'p', 's'], 2).join(''), seqRate: 0.55 });
      const c = MJ.counts(full); const winT = MJ.idx(pick(full)); const tsumo = rand() < 0.4; const seat = Math.floor(rand() * 4);
      const ev = MJG.evaluateWin(c, [], { win: winT, tsumo, riichi: true, seat, round: 0, dealer: seat === 0, doraInd: [], uraInd: [], aka: 0 });
      if (!ev || ev.yakuman || ev.form !== 'std' || ev.han >= 5) continue;
      const hand = full.slice(); hand.splice(hand.indexOf(MJ.code(winT)), 1);
      const wrong = sampleN([ev.fu - 20, ev.fu - 10, ev.fu + 10, ev.fu + 20].filter((f) => f >= 20 && f !== 25 && f <= 110), 3);
      const sw = ['東', '南', '西', '北'][seat];
      return mcFrom({ q: `何符？（${tsumo ? 'ツモ' : '門前ロン'}・東場・自風${sw}）`, tiles: MJ.toStr(hand), win: MJ.code(winT), tag: '符計算ドリル', ex: ev.fuParts.join(' ＋ ') + ` → ${ev.fu}符（待ち：${{ ryanmen: '両面', kanchan: '嵌張', penchan: '辺張', shanpon: '双碰', tanki: '単騎' }[ev.wait]}）` }, { text: ev.fu + '符' }, wrong.map((f) => ({ text: f + '符' })));
    }
    return scoreEx();
  }
  function drillLesson(course, lesson) {
    const n = lesson.count || 6;
    const gen = {
      tileNames: tileNameEx, agari: agariEx, waits: () => waitsEx(false), chinitsu: () => waitsEx(true), discard: discardEx, score: scoreEx, safe: safeEx, fu: fuEx,
    }[lesson.drill];
    if (lesson.drill === 'mateRandom') return sampleN(course.mates, 6).map(normCurated);
    return Array.from({ length: n }, gen);
  }

  function curatedEx(course, unit, e, i) {
    const x = normCurated(Object.assign({ t: 'mc', cls: 'en' }, e, { choices: e.choices.map((c) => ({ text: c, cls: 'en' })) }));
    if (x.listen && !canSpeak()) { x.main = '（音声が使えない環境です）'; }
    x._item = `${course.id}.${unit.id}.c${i}`; return x;
  }
  // 今日の復習：期限が来た項目から問題を作る
  function srsLesson(course) {
    const keys = srsDue(course.id).slice(0, 12); const exs = [];
    for (const k of shuffle(keys)) {
      const [, uid, idx] = k.split('.'); const unit = course.units.find((u) => u.id === uid); if (!unit) continue;
      if (idx[0] === 'c') { const e = unit.curated && unit.curated[+idx.slice(1)]; if (e) exs.push(curatedEx(course, unit, e, +idx.slice(1))); continue; }
      const all = langItems(course, unit); const o = all[+idx]; if (!o) continue;
      const types = unit.letters ? ['l2s', 's2l'] : unit.reading ? ['w2r', 'w2j'] : (course.id === 'en' ? ['j2t', 't2j', 'order', 'type'].concat(canSpeak() ? ['listen'] : []) : ['j2t', 't2j', 'order']);
      exs.push(withItem(makeLangEx(course, unit, all, o, pick(types)), course, o));
    }
    return exs.filter(Boolean);
  }
  function buildLesson(course, unit, lesson) {
    if (lesson.drill) return drillLesson(course, lesson);
    if (lesson.ex) return lesson.ex.map(normCurated);
    if (lesson.cur) return shuffle(unit.curated.slice(lesson.cur[0], lesson.cur[1]).map((e, i) => curatedEx(course, unit, e, lesson.cur[0] + i)));
    return langLesson(course, unit, lesson);
  }

  // ---------- 苦手リスト ----------
  const exKey = (e) => [e.t, e.q, e.main || '', e.fen || '', e.tiles || '', e.hand || '', e.listen || '', e.a && e.t !== 'mc' ? e.a : ''].join('|');
  function addMistake(cid, e) {
    if (e.t === 'pairs') return;
    const bank = P.mistakes[cid] || (P.mistakes[cid] = []);
    const k = exKey(e); const clean = JSON.parse(JSON.stringify(e)); delete clean._uid; delete clean._tries;
    const i = bank.findIndex((m) => m.k === k);
    if (i >= 0) { bank[i].n++; bank[i].at = Date.now(); }
    else bank.push({ k, e: clean, n: 1, at: Date.now() });
    if (bank.length > 40) bank.splice(0, bank.length - 40);
  }
  function removeMistake(cid, e) { const bank = P.mistakes[cid] || []; const k = exKey(e); const i = bank.findIndex((m) => m.k === k); if (i >= 0) bank.splice(i, 1); }

  // ---------- 画面 ----------
  let view = { name: 'home' };
  function go(v) { view = v; render(); window.scrollTo(0, 0); }
  function render() {
    app.replaceChildren();
    document.onkeydown = null;
    if (view.name === 'home') renderHome();
    else if (view.name === 'course') renderCourse(BY_ID[view.cid]);
    else if (view.name === 'lesson') renderLesson();
    else if (view.name === 'result') renderResult();
    else if (view.name === 'chess') chessView();
    else if (view.name === 'mjplay') mjView();
  }

  function courseIcon(c) {
    const el = h('div', { class: 'cic ' + c.id, style: `background:${cdeep(c.id)}` });
    el.textContent = c.id === 'mn' ? 'Ө' : c.id === 'en' ? 'Aa' : c.short;
    return el;
  }

  function renderHome() {
    const st = streakNow(); const tx = P.daily[today()] || 0; const goalPct = Math.min(100, Math.round((tx / P.goal) * 100));
    const root = h('div', { class: 'wrap' });
    root.append(h('header', { class: 'brand' },
      h('div', { class: 'stamp', 'aria-hidden': 'true' }, '道'),
      h('div', {}, h('h1', {}, 'よろず道場'), h('div', { class: 'tag' }, '英語・モンゴル語・チェス・麻雀')),
      h('div', { class: 'spacer' }),
      h('button', { class: 'icon-btn', 'aria-label': '設定', onclick: openSettings }, icon('gear'))));
    root.append(h('section', { class: 'stats', 'aria-label': '今日の状況' },
      h('div', { class: 'stat streak' + (st ? '' : ' off') }, h('span', { class: 'lbl' }, '連続日数'), h('span', { class: 'val num' }, icon('flame'), st, h('small', {}, '日'))),
      h('div', { class: 'stat' }, h('span', { class: 'lbl' }, '今日のXP'), h('span', { class: 'val num' }, tx, h('small', {}, '/ ' + P.goal)), h('div', { class: 'goalbar' }, h('i', { style: `width:${goalPct}%` }))),
      h('div', { class: 'stat' }, h('span', { class: 'lbl' }, '合計XP'), h('span', { class: 'val num' }, icon('bolt'), P.xp.toLocaleString('ja-JP')))));
    root.append(h('div', { class: 'sec-title' }, 'コース'));
    const grid = h('div', { class: 'courses' });
    for (const c of COURSES) {
      const s = courseStats(c); const nx = nextLesson(c); const pct = Math.round((s.done / s.total) * 100);
      const mistakes = (P.mistakes[c.id] || []).length;
      grid.append(h('button', { class: 'ccard', onclick: () => go({ name: 'course', cid: c.id }) },
        courseIcon(c),
        h('div', { class: 'cbody' },
          h('div', { class: 'cname' }, c.name),
          h('div', { class: 'csub' }, nx ? `次：${nx.u.title} ・ ${nx.l.name}` : '全レッスン修了。復習とドリルで仕上げ'),
          h('div', { class: 'cprog' }, h('div', { class: 'bar' }, h('i', { style: `width:${pct}%;background:${ccolor(c.id)}` })), h('span', { class: 'num' }, `${s.done}/${s.total}`), srsDue(c.id).length ? h('span', { class: 'due' }, `復習 ${srsDue(c.id).length}`) : mistakes ? h('span', {}, `苦手 ${mistakes}`) : null))));
    }
    root.append(grid);
    root.append(h('div', { class: 'sec-title' }, 'フリープレイ'));
    root.append(playCards());
    root.append(h('div', { class: 'sec-title' }, '今週'));
    const wk = h('div', { class: 'week' });
    const vals = Array.from({ length: 7 }, (_, i) => { const d = daysAgo(6 - i); return { d, xp: P.daily[d] || 0 }; });
    const max = Math.max(P.goal, ...vals.map((v) => v.xp));
    const W = ['日', '月', '火', '水', '木', '金', '土'];
    vals.forEach((v, i) => {
      const dd = new Date(); dd.setDate(dd.getDate() - (6 - i));
      wk.append(h('div', { class: 'd' + (i === 6 ? ' today' : '') + (v.xp >= P.goal ? ' hit' : '') },
        h('div', { class: 'col', title: `${v.d}: ${v.xp} XP` }, h('i', { style: `height:${Math.round((v.xp / max) * 100)}%` })),
        h('span', { class: 'num' }, v.xp || '·'), h('span', {}, W[dd.getDay()])));
    });
    root.append(wk);
    const syncEl = h('span', { 'data-sync': '' }); paintSync(syncEl);
    root.append(h('footer', { class: 'foot' }, h('div', {}, 'ハートなし・広告なし・課金なし。間違えたら覚えるまで出ます。'), syncEl));
    app.append(root);
  }

  function renderCourse(c) {
    const s = courseStats(c); const nx = nextLesson(c); const bank = P.mistakes[c.id] || []; const due = srsDue(c.id).length;
    const bar = h('div', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': 'ホームへ戻る', onclick: () => go({ name: 'home' }) }, icon('back')),
      h('h2', {}, c.name), h('span', { class: 'chip num' }, `${s.done}/${s.total}`)));
    const root = h('div', { class: 'wrap', style: cvars(c.id) });
    const hero = h('section', { class: 'hero', style: `background:${cdeep(c.id)}` },
      h('p', {}, c.sub),
      h('div', { class: 'row' },
        nx ? h('button', { class: 'hbtn', onclick: () => startLesson(c, nx.u, nx.l) }, icon('play'), '続きから') : null,
        due ? h('button', { class: 'hbtn ghost', onclick: () => startSrs(c) }, icon('review'), `今日の復習（${Math.min(12, due)}）`) : null,
        bank.length ? h('button', { class: nx ? 'hbtn ghost' : 'hbtn', onclick: () => startReview(c) }, icon('review'), `苦手を復習（${bank.length}）`) : null,
        c.id === 'ch' || c.id === 'mj' ? h('button', { class: 'hbtn ghost', onclick: () => go({ name: c.id === 'ch' ? 'chess' : 'mjplay' }) }, icon('loop'), c.id === 'ch' ? 'CPUと対局' : 'CPUと対局') : null));
    if (!nx && !bank.length) hero.append(h('p', {}, '全部修了。ドリル（∞）は何度でも新しい問題が出ます。'));
    root.append(hero);
    c.units.forEach((u, ui) => {
      const sec = h('section', { class: 'unit' }, h('div', { class: 'unit-h' }, h('span', { class: 'no', style: `color:${ccolor(c.id)}` }, 'UNIT ' + (ui + 1)), h('h3', {}, u.title), h('p', {}, u.desc, u.needsAudio && !canSpeak() ? '（この環境では音声が出ないため、文字での確認になります）' : '')),
        u.tip ? h('details', { class: 'tip' }, h('summary', {}, 'このユニットのポイント'), h('p', {}, u.tip)) : null);
      const path = h('div', { class: 'path' });
      lessonsOf(c, u).forEach((l, li) => {
        const k = keyOf(c, u, l); const n = timesDone(k); const isNext = nx && nx.u === u && nx.l === l;
        const drill = !!l.drill;
        const ball = h('span', { class: 'ball' }, n ? icon('check') : drill ? icon('loop') : String(li + 1), n > 1 ? h('span', { class: 'badge num' }, '×' + n) : null);
        const best = P.lessons[k] && P.lessons[k].best;
        path.append(h('button', { class: 'node' + (n ? ' done' : '') + (isNext ? ' next' : ''), onclick: () => startLesson(c, u, l) },
          ball, h('span', { class: 'nl' }, h('b', {}, isNext ? h('span', { class: 'start-tag' }, 'START') : null, l.name),
            h('span', {}, drill ? '何度でも新しい問題' : n ? `修了・最高正答率 ${best ?? 0}%` : '未修了'))));
      });
      sec.append(path); root.append(sec);
    });
    root.append(h('div', { class: 'foot' }, c.id === 'mn' ? 'カナ読みはあくまで目安。Ө・Ү・Х は日本語にない音です。' : c.id === 'mj' ? 'ルールは一般的なリーチ麻雀（喰いタンあり）。' : c.id === 'ch' ? '答えの判定は合法手チェック付き。詰み問題は詰ませる手ならどれでも正解。' : '音声は端末やブラウザによって出ないことがあります。'));
    app.append(bar, root);
    if (c.id === 'ch') { ensureChess(); if (P.board3d !== false) Chess3D.load(); }
  }

  // ---------- レッスン進行 ----------
  let L = null;
  function startLesson(course, unit, lesson) {
    const exs = buildLesson(course, unit, lesson);
    L = { cid: course.id, key: keyOf(course, unit, lesson), title: lesson.name, unit, lesson, queue: exs.map((e, i) => Object.assign(e, { _uid: i, _tries: 0 })), total: exs.length, cleared: 0, wrong: new Set(), combo: 0, maxCombo: 0, t0: Date.now(), review: false, srsSeen: new Set() };
    go({ name: 'lesson' });
  }
  function startSrs(course) {
    const exs = srsLesson(course); if (!exs.length) return;
    L = { cid: course.id, key: null, title: '今日の復習', queue: exs.map((e, i) => Object.assign(e, { _uid: i, _tries: 0 })), total: exs.length, cleared: 0, wrong: new Set(), combo: 0, maxCombo: 0, t0: Date.now(), review: true, srsSeen: new Set() };
    go({ name: 'lesson' });
  }
  function startReview(course) {
    const bank = P.mistakes[course.id] || [];
    const exs = shuffle(bank.slice(-10)).map((m) => JSON.parse(JSON.stringify(m.e)));
    if (!exs.length) return;
    L = { cid: course.id, key: null, title: '苦手を復習', queue: exs.map((e, i) => Object.assign(e, { _uid: i, _tries: 0 })), total: exs.length, cleared: 0, wrong: new Set(), combo: 0, maxCombo: 0, t0: Date.now(), review: true, srsSeen: new Set() };
    go({ name: 'lesson' });
  }

  function renderLesson() {
    const ex = L.queue[0];
    const pbar = h('i', { style: `width:${(L.cleared / L.total) * 100}%` });
    const combo = h('span', { class: 'combo num' }, L.combo >= 3 ? `${L.combo}連続` : '');
    const top = h('div', { class: 'lbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': 'レッスンをやめる', onclick: () => go({ name: 'course', cid: L.cid }) }, icon('close')),
      h('div', { class: 'pbar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(L.total), 'aria-valuenow': String(L.cleared) }, pbar), combo));
    const body = h('main', { class: 'lbody' });
    const inner = h('div', { class: 'wrap' }); body.append(inner);
    const foot = h('footer', { class: 'lfoot' }); const fwrap = h('div', { class: 'wrap' }); foot.append(fwrap);
    const cta = h('button', { class: 'cta', disabled: true }, 'チェック');
    let phase = 'answer'; let ctrl = null;
    const skip = h('button', { class: 'subtle', onclick: () => grade({ ok: false, answer: ctrl && ctrl.reveal ? ctrl.reveal() : null, ex: ex.ex, skipped: true }) }, 'わからない');
    fwrap.append(cta, skip);
    const ctx = {
      ready: (on) => { if (phase === 'answer') cta.disabled = !on; },
      finish: (res) => grade(res),
    };
    function grade(res) {
      if (phase !== 'answer') return;
      phase = 'feedback';
      if (ctrl && ctrl.lock) ctrl.lock();
      const ok = !!res.ok;
      sfx(ok ? 'good' : 'bad');
      if (ex.sayAfter && ok && canSpeak(ex.lang || 'en')) speak(ex.sayAfter, false, ex.lang || 'en');
      fwrap.replaceChildren();
      foot.className = 'lfoot ' + (ok ? 'good' : 'bad');
      fwrap.append(h('div', { class: 'fb-title' }, icon(ok ? 'check' : 'x'), ok ? pick(['正解！', 'いいね！', 'その通り！', '完璧！']) : res.skipped ? '答えはこちら' : 'おしい！'));
      if (!ok && res.answer) fwrap.append(h('div', { class: 'fb-ans' }, '正解：', res.answer));
      if (res.note) fwrap.append(h('div', { class: 'fb-ans' }, res.note));
      if (res.detail) fwrap.append(res.detail);
      if (res.ex || ex.ex) fwrap.append(h('div', { class: 'fb-ex' }, res.ex || ex.ex));
      const next = h('button', { class: 'cta' }, 'つづける');
      next.onclick = advance; fwrap.append(next); next.focus({ preventScroll: true });
      // 進捗の記録
      const cur = L.queue.shift();
      if (cur._item && !res.neutral && !L.srsSeen.has(cur._item)) { L.srsSeen.add(cur._item); srsTouch(cur._item, ok); }
      if (ok) {
        L.cleared++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo);
        if (L.review) removeMistake(L.cid, cur);
      } else {
        L.combo = 0; L.wrong.add(cur._uid);
        if (!L.review) addMistake(L.cid, cur);
        cur._tries++;
        if (cur._tries < 2) { const re = JSON.parse(JSON.stringify(cur)); if (re.t === 'mc') { const correct = re.choices[re.a]; re.choices = shuffle(re.choices); re.a = re.choices.findIndex((c) => JSON.stringify(c) === JSON.stringify(correct)); } if (re.t === 'order') re.words = shuffle(re.words); L.queue.push(re); }
        else L.cleared++;
      }
      pbar.style.width = `${(L.cleared / L.total) * 100}%`;
      combo.textContent = L.combo >= 3 ? `${L.combo}連続` : '';
    }
    function advance() { if (L.queue.length) render(); else finishLesson(); }
    cta.onclick = () => { if (phase === 'answer' && ctrl && ctrl.check) grade(ctrl.check()); };
    ctrl = mountExercise(ex, ctx, inner);
    if (ctrl && ctrl.auto) { cta.hidden = true; }
    document.onkeydown = (e) => {
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') && e.key !== 'Enter') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'feedback') advance(); else if (!cta.disabled && !cta.hidden) cta.click();
      } else if (phase === 'answer' && ctrl && ctrl.key) ctrl.key(e.key);
    };
    app.append(h('div', { class: 'lesson', style: cvars(L.cid) }, top, body, foot));
  }

  function awardXP(xp) {
    const d = today();
    if (P.last !== d) { P.streak = (P.last === daysAgo(1)) ? P.streak + 1 : 1; P.last = d; }
    P.best = Math.max(P.best, P.streak);
    P.xp += xp; P.daily[d] = (P.daily[d] || 0) + xp;
    for (const k of Object.keys(P.daily)) if (k < daysAgo(60)) delete P.daily[k];
  }

  function finishLesson() {
    const firstTry = L.total - L.wrong.size; const acc = Math.round((firstTry / L.total) * 100);
    const xp = 10 + (L.wrong.size === 0 ? 5 : 0) + (L.review ? 5 : 0);
    awardXP(xp);
    if (L.key) { const r = P.lessons[L.key] || { n: 0, best: 0 }; r.n++; r.best = Math.max(r.best, acc); P.lessons[L.key] = r; }
    save();
    L.result = { xp, acc, secs: Math.round((Date.now() - L.t0) / 1000) };
    sfx('done');
    go({ name: 'result' });
  }

  function renderResult() {
    const r = L.result; const c = BY_ID[L.cid];
    const mm = Math.floor(r.secs / 60), ss = String(r.secs % 60).padStart(2, '0');
    const nx = nextLesson(c);
    const perfect = L.wrong.size === 0;
    const root = h('div', { class: 'wrap result', style: cvars(c.id) },
      h('div', { class: 'seal', 'aria-hidden': 'true' }, ...[...(perfect ? '皆伝' : '修了')].map((ch) => h('span', {}, ch))),
      h('h2', {}, perfect ? 'ノーミス！' : L.review ? '復習おわり' : 'レッスン修了'),
      h('div', { class: 'note' }, `${c.name} ・ ${L.title}${P.streak > 1 ? ` ・ ${P.streak}日連続` : ''}`),
      h('div', { class: 'rstats' },
        h('div', { class: 'rstat' }, h('div', { class: 'lbl' }, '獲得XP'), h('div', { class: 'val num' }, '+' + r.xp)),
        h('div', { class: 'rstat' }, h('div', { class: 'lbl' }, '一発正解'), h('div', { class: 'val num' }, r.acc + '%')),
        h('div', { class: 'rstat' }, h('div', { class: 'lbl' }, 'タイム'), h('div', { class: 'val num' }, `${mm}:${ss}`))),
      h('div', { class: 'rbtns' },
        nx && !L.review ? h('button', { class: 'cta', onclick: () => startLesson(c, nx.u, nx.l) }, '次のレッスンへ') : null,
        h('button', { class: nx && !L.review ? 'cta alt' : 'cta', onclick: () => go({ name: 'course', cid: c.id }) }, 'コースに戻る'),
        h('button', { class: 'cta alt', onclick: () => go({ name: 'home' }) }, 'ホーム')));
    app.append(root);
    document.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); root.querySelector('.cta').click(); } };
  }

  // ---------- 問題の描画 ----------
  function mountExercise(ex, ctx, host) {
    if (ex.tag) host.append(h('div', { class: 'eyebrow' }, ex.tag));
    host.append(h('p', { class: 'q' }, ex.q));
    if (ex.t === 'mc') return rMC(ex, ctx, host);
    if (ex.t === 'order') return rOrder(ex, ctx, host);
    if (ex.t === 'type') return rType(ex, ctx, host);
    if (ex.t === 'pairs') return rPairs(ex, ctx, host);
    if (ex.t === 'chess') return rChess(ex, ctx, host);
    if (ex.t === 'waits') return rWaits(ex, ctx, host);
    if (ex.t === 'discard') return rDiscard(ex, ctx, host);
    if (ex.t === 'pick') return rPick(ex, ctx, host);
    if (ex.t === 'speak') { if (Speech.dict && !Speech.noSpeak) return rSpeak(ex, ctx, host); return rMC(mcFrom({ q: '英語で言うと？', main: ex.ja, ex: ex.ex }, { text: ex.a, cls: 'en' }, [{ text: ex.a.split(' ').reverse().join(' '), cls: 'en' }]), ctx, host); }
    return null;
  }
  function tileEl(c) { return h('span', { class: 'tile', title: MJ.name(c), html: MJ.svg(c) }); }
  function handEl(codes, cls = '') { const el = h('div', { class: 'hand ' + cls, role: 'img', 'aria-label': codes.map((c) => MJ.name(c)).join(' ') }); codes.forEach((c) => el.append(tileEl(c))); return el; }
  function choiceBody(c) {
    if (c.tile) return h('span', { class: 'ct' }, tileEl(c.tile));
    return h('span', { class: 'ct ' + (c.cls || '').replace('big', '') }, c.text);
  }
  const choiceText = (c) => (c.tile ? MJ.name(c.tile) + '（' + MJ.yomi(c.tile) + '）' : c.text);
  function promptEl(ex) {
    const wrap = h('div', { class: 'prompt' });
    if (ex.audio && canSpeak(ex.lang || 'en')) {
      const b = h('button', { class: 'say', 'aria-label': '発音を聞く', onclick: () => speak(ex.audio, false, ex.lang || 'en') }, icon('speaker'));
      wrap.append(b);
      if (P.autoplay) setTimeout(() => speak(ex.audio, false, ex.lang || 'en'), 250);
    }
    wrap.append(h('div', { class: 'bubble' }, h('div', { class: 'main ' + (ex.mainCls || '') }, ex.main), ex.reading && P.reading ? h('div', { class: 'reading' }, ex.reading) : null));
    return wrap;
  }
  function rMC(ex, ctx, host) {
    if (ex.fen) host.append(staticBoard(ex.fen));
    if (ex.tiles) { const codes = MJ.parse(ex.tiles); const hd = handEl(codes, codes.length <= 5 ? 'few' : ''); if (ex.win) { hd.append(h('span', { class: 'gap' })); const w = tileEl(ex.win); w.classList.add('win'); hd.append(w); } host.append(hd); }
    if (ex.listen && canSpeak()) {
      host.append(h('div', { class: 'listen-big' },
        h('button', { class: 'main-say', 'aria-label': 'もう一度聞く', onclick: () => speak(ex.listen) }, icon('speaker')),
        h('button', { class: 'slow', 'aria-label': 'ゆっくり聞く', onclick: () => speak(ex.listen, true) }, 'ゆっくり')));
      setTimeout(() => speak(ex.listen), 250);
      const lb = host.lastChild;
      const noSound = h('button', { class: 'subtle', style: 'display:block;margin:-10px auto 14px' }, '音が出ない？ 文字で見る');
      noSound.onclick = () => { lb.replaceWith(promptEl({ main: ex.listen, mainCls: 'en' })); noSound.remove(); };
      host.append(noSound);
    } else if (ex.listen) {
      host.append(promptEl({ main: ex.listen, mainCls: 'en' }));
    } else if (ex.main) host.append(promptEl(ex));
    const isTileGrid = ex.choices.every((c) => c.tile) || ex.grid;
    const list = h('div', { class: 'choices' + (isTileGrid ? ' grid' : '') });
    let sel = -1;
    ex.choices.forEach((c, i) => {
      list.append(h('button', { class: 'choice', onclick: () => { sel = i; [...list.children].forEach((x, j) => x.classList.toggle('sel', j === i)); ctx.ready(true); } }, h('span', { class: 'kbd' }, i + 1), choiceBody(c)));
    });
    host.append(list);
    return {
      key: (k) => { const n = +k; if (n >= 1 && n <= ex.choices.length) list.children[n - 1].click(); },
      check: () => {
        const ok = sel === ex.a;
        [...list.children].forEach((b, j) => { b.disabled = true; if (j === ex.a) b.classList.add('right'); else if (j === sel) b.classList.add('wrong'); });
        return { ok, answer: choiceText(ex.choices[ex.a]) };
      },
      reveal: () => { [...list.children].forEach((b, j) => { b.disabled = true; if (j === ex.a) b.classList.add('right'); }); return choiceText(ex.choices[ex.a]); },
    };
  }
  const norm = (s) => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:"“”]/g, ' ').replace(/\s+/g, ' ').trim();
  const expand = (s) => s.replace(/\bi'm\b/g, 'i am').replace(/\bcan't\b/g, 'cannot').replace(/\bwon't\b/g, 'will not').replace(/\b(\w+)n't\b/g, '$1 not')
    .replace(/\b(\w+)'re\b/g, '$1 are').replace(/\b(\w+)'ll\b/g, '$1 will').replace(/\b(\w+)'ve\b/g, '$1 have').replace(/\b(\w+)'d\b/g, '$1 would')
    .replace(/\blet's\b/g, 'let us').replace(/\b(it|that|what|how|there|he|she|who|where)'s\b/g, '$1 is').replace(/\bcan not\b/g, 'cannot');
  function lev(a, b) { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  function rOrder(ex, ctx, host) {
    host.append(promptEl({ main: ex.main }));
    const line = h('div', { class: 'answer-line', 'aria-label': '答えの並び' });
    const bank = h('div', { class: 'bank' });
    const placed = [];
    ex.words.forEach((w, i) => {
      const src = h('button', { class: 'wtile ' + ex.cls }, w);
      src.onclick = () => {
        if (src.classList.contains('ghost')) return;
        src.classList.add('ghost');
        const t = h('button', { class: 'wtile ' + ex.cls }, w);
        t.onclick = () => { if (locked) return; t.remove(); placed.splice(placed.indexOf(i), 1); src.classList.remove('ghost'); ctx.ready(placed.length > 0); };
        t.dataset.i = i; line.append(t); placed.push(i); ctx.ready(true);
      };
      bank.append(src);
    });
    let locked = false;
    host.append(line, bank);
    const built = () => [...line.children].map((t) => ex.words[+t.dataset.i]).join(' ');
    return {
      check: () => ({ ok: norm(built()) === norm(ex.a), answer: ex.a }),
      reveal: () => ex.a,
      lock: () => { locked = true; [...bank.children].forEach((b) => { b.disabled = true; }); },
    };
  }
  function rType(ex, ctx, host) {
    host.append(promptEl({ main: ex.main }));
    const ta = h('textarea', { class: 'type-in', id: 'type-answer', placeholder: 'ここに英語で入力', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': '答えを入力' });
    ta.addEventListener('input', () => ctx.ready(ta.value.trim().length > 0));
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); if (ta.value.trim()) ctx.finish(check()); } });
    host.append(ta);
    setTimeout(() => ta.focus({ preventScroll: true }), 50);
    function check() {
      const a = expand(norm(ta.value)), b = expand(norm(ex.a));
      if (a === b) return { ok: true };
      if (b.length > 8 && lev(a, b) <= 1) return { ok: true, note: '小さなタイプミスがあります：' + ex.a };
      return { ok: false, answer: ex.a };
    }
    return { check, reveal: () => ex.a, lock: () => { ta.disabled = true; } };
  }
  function rPairs(ex, ctx, host) {
    const L1 = shuffle(ex.pairs.map((p, i) => ({ i, text: p[0] })));
    const R1 = shuffle(ex.pairs.map((p, i) => ({ i, text: p[1] })));
    const grid = h('div', { class: 'pairs' }); const lc = h('div', { class: 'colp' }); const rc = h('div', { class: 'colp' });
    let selL = null, selR = null, left = ex.pairs.length, mistakes = 0;
    function tryMatch() {
      if (!selL || !selR) return;
      const a = selL, b = selR; selL = selR = null;
      if (a.dataset.i === b.dataset.i) {
        a.classList.remove('sel'); b.classList.remove('sel'); a.classList.add('ok'); b.classList.add('ok'); a.disabled = b.disabled = true; sfx('good');
        if (ex.cls === 'en' && canSpeak()) speak(ex.pairs[+a.dataset.i][0]);
        if (--left === 0) setTimeout(() => ctx.finish({ ok: true, ex: mistakes ? `ミス ${mistakes} 回。もう一息。` : 'ノーミス！' }), 250);
      } else {
        mistakes++; [a, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('ng'); setTimeout(() => x.classList.remove('ng'), 350); });
      }
    }
    const mk = (o, side) => {
      const b = h('button', { class: 'pbtn ' + (side === 'L' ? ex.cls : '') }, o.text); b.dataset.i = o.i;
      b.onclick = () => {
        if (side === 'L') { if (selL) selL.classList.remove('sel'); selL = b; } else { if (selR) selR.classList.remove('sel'); selR = b; }
        b.classList.add('sel');
        if (side === 'L' && ex.cls === 'en' && canSpeak()) speak(o.text);
        tryMatch();
      };
      return b;
    };
    L1.forEach((o) => lc.append(mk(o, 'L'))); R1.forEach((o) => rc.append(mk(o, 'R')));
    grid.append(lc, rc); host.append(grid);
    return { auto: true, reveal: () => ex.pairs.map((p) => p.join(' ＝ ')).join(' ／ ') };
  }

  // チェス
  const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  const FILES = 'abcdefgh';
  function boardEl(game, flip, onTap) {
    const el = h('div', { class: 'board', role: 'grid', 'aria-label': 'チェス盤' });
    const sqs = {};
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const file = flip ? 7 - c : c; const rank = flip ? r + 1 : 8 - r; const name = FILES[file] + rank;
      const b = h('button', { class: 'sq ' + ((file + rank) % 2 === 1 ? 'd' : 'l'), 'aria-label': name, tabindex: onTap ? '0' : '-1' });
      if (c === 0) b.append(h('span', { class: 'co r' }, rank));
      if (r === 7) b.append(h('span', { class: 'co f' }, FILES[file]));
      if (onTap) b.onclick = () => onTap(name); else b.disabled = true;
      sqs[name] = b; el.append(b);
    }
    const paint = () => {
      for (const [name, b] of Object.entries(sqs)) {
        b.querySelectorAll('.pc,.dot').forEach((x) => x.remove());
        const p = game.get(name);
        if (p) { b.append(h('span', { class: 'pc ' + p.color }, GLYPH[p.type] + '︎')); b.setAttribute('aria-label', `${name} ${p.color === 'w' ? '白' : '黒'}${({ k: 'キング', q: 'クイーン', r: 'ルーク', b: 'ビショップ', n: 'ナイト', p: 'ポーン' })[p.type]}`); }
      }
    };
    paint();
    return { el, sqs, paint };
  }
  const use3d = () => P.board3d !== false && window.THREE && Chess3D.ok();
  function board3dAdapter(game, flip, onTap, key, canDrag) {
    const el = h('div', { class: 'board3d', role: 'application', 'aria-label': '3Dチェス盤（ドラッグで視点を回転）' });
    const cls = {}; const dotMap = {}; let pending = false;
    const PRI = ['chk', 'ng', 'ok', 'pick', 'sel', 'from', 'hint', 'last', 'miss'];
    const sync = () => { if (pending) return; pending = true; queueMicrotask(() => { pending = false; const marks = {}; for (const [sq, set] of Object.entries(cls)) { const k = PRI.find((x) => set.has(x)); if (k) marks[sq] = k; } Chess3D.setMarks(marks, Object.entries(dotMap).map(([sq, cap]) => ({ sq, cap }))); }); };
    const sqs = {};
    for (const f of FILES) for (let r = 1; r <= 8; r++) {
      const name = f + r; cls[name] = new Set();
      sqs[name] = {
        classList: { add: (k) => { cls[name].add(k); sync(); }, remove: (...ks) => { ks.forEach((k) => cls[name].delete(k)); sync(); }, contains: (k) => cls[name].has(k), toggle: (k, on) => { if (on ?? !cls[name].has(k)) cls[name].add(k); else cls[name].delete(k); sync(); } },
        append: (node) => { if (node && node.classList && node.classList.contains('dot')) { dotMap[name] = node.classList.contains('cap'); sync(); } },
        querySelectorAll: (q) => (/dot/.test(q) && name in dotMap ? [{ remove: () => { delete dotMap[name]; sync(); } }] : []),
        setAttribute() {},
      };
    }
    return {
      el, sqs, is3d: true,
      paint: () => Chess3D.setPosition(game.board(), flip, true),
      mount: () => { if (!el.isConnected) return; Chess3D.mount(el); Chess3D.onTap = onTap; Chess3D.canDrag = canDrag || null; const same = Chess3D.lastKey === key; Chess3D.lastKey = key; Chess3D.setPosition(game.board(), flip, same); sync(); },
    };
  }
  function turnNote(game, extra) {
    const w = game.turn() === 'w';
    return h('div', { class: 'board-note' }, h('span', { class: 'turn' }, h('i', { class: w ? 'w' : 'b' }), w ? '白の番' : '黒の番'), extra ? ' ・ ' + extra : '');
  }
  function staticBoard(fen) {
    const wrap = h('div', { class: 'board-wrap' });
    const fill = () => { const g = new window.Chess(fen); const b = boardEl(g, g.turn() === 'b', null); wrap.append(b.el, turnNote(g)); };
    if (window.Chess) fill(); else { wrap.append(h('div', { class: 'empty' }, '盤面を読み込み中…')); ensureChess().then((ok) => { wrap.replaceChildren(); if (ok) fill(); else wrap.append(h('div', { class: 'empty' }, 'チェス盤を読み込めませんでした。通信を確認して開き直してください。')); }); }
    return wrap;
  }
  function similarity(a, b) {
    const A = expand(norm(a)).split(' ').filter(Boolean), Bw = expand(norm(b)).split(' ').filter(Boolean);
    if (!Bw.length || !A.length) return 0;
    const dp = Array.from({ length: A.length + 1 }, () => new Array(Bw.length + 1).fill(0));
    for (let i = 1; i <= A.length; i++) for (let j = 1; j <= Bw.length; j++) dp[i][j] = A[i - 1] === Bw[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[A.length][Bw.length] / Math.max(A.length, Bw.length);
  }
  function rSpeak(ex, ctx, host) {
    host.append(promptEl({ main: ex.main, mainCls: 'en', audio: canSpeak() ? ex.main : null, reading: ex.ja, lang: 'en' }));
    const d = Speech.dict; let finalText = '', listening = false; const unsubs = [];
    const live = h('div', { class: 'speak-live', 'aria-live': 'polite' }, 'マイクを押して、上の英文を読み上げてください');
    const mic = h('button', { class: 'mic', 'aria-label': '話す・止める' }, icon('mic'));
    const skip = h('button', { class: 'subtle', style: 'display:block;margin:10px auto 0' }, '今は話せない');
    host.append(h('div', { class: 'speak-box' }, mic, live), skip);
    const cleanup = () => { unsubs.splice(0).forEach((u) => { try { u(); } catch { /* 済み */ } }); if (listening) d.stop().catch(() => {}); };
    try {
      unsubs.push(d.onPartial(({ text }) => { live.textContent = (finalText + ' ' + text).trim(); }));
      unsubs.push(d.onFinal(({ text }) => { finalText = (finalText + ' ' + text).trim(); live.textContent = finalText; ctx.ready(!!finalText); }));
      unsubs.push(d.onState(({ state }) => { listening = state === 'listening'; mic.classList.toggle('on', listening); if (!listening && finalText) ctx.ready(true); }));
    } catch { /* 古い環境 */ }
    mic.onclick = () => {
      if (listening) { d.stop().catch(() => {}); return; }
      finalText = ''; live.textContent = '聞いています…';
      d.start({ language: 'en' }).catch((e) => {
        const c = e && e.code;
        live.textContent = c === 'not_granted' ? 'マイクが使えません。「今は話せない」で次へ進めます。' : '開始できませんでした。もう一度マイクを押してください。';
        if (c === 'not_granted') Speech.noSpeak = true;
      });
    };
    skip.onclick = () => { Speech.noSpeak = true; cleanup(); ctx.finish({ ok: true, neutral: true, note: 'このあとの問題では発話を出しません（設定は次のアプリ起動まで）。' }); };
    return {
      check: () => { cleanup(); const sc = similarity(finalText, ex.a); return { ok: sc >= 0.75, neutral: !finalText, note: `聞き取り：「${finalText || '（なし）'}」　一致度 ${Math.round(sc * 100)}%`, answer: ex.a }; },
      reveal: () => { cleanup(); return ex.a; },
      lock: cleanup,
    };
  }
  function rPick(ex, ctx, host) {
    const rv = h('div', { class: 'pick-river' }, h('div', { class: 'palette-label' }, 'リーチした人の捨て牌（最後がリーチ宣言牌）'));
    const row = h('div', { class: 'river big' }); ex.river.forEach((t, i) => { const el = tileEl(MJ.code(t)); if (i === ex.river.length - 1) el.classList.add('rt'); row.append(el); });
    rv.append(row); host.append(rv);
    const hand = h('div', { class: 'hand' }); let sel = null; const btns = [];
    ex.hand.forEach((t) => { const b = h('button', { class: 'tbtn', 'aria-label': MJ.name(t) + 'を切る' }, tileEl(MJ.code(t))); b.onclick = () => { if (locked) return; btns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = t; ctx.ready(true); }; btns.push(b); hand.append(b); });
    let locked = false;
    host.append(h('div', { class: 'palette-label' }, 'あなたの手牌：切る牌をタップ'), hand);
    const mark = () => btns.forEach((b, i) => { if (ex.answer.includes(ex.hand[i])) b.classList.add('right'); else if (ex.hand[i] === sel) b.classList.add('wrong'); });
    return {
      check: () => { locked = true; mark(); return { ok: ex.answer.includes(sel), answer: ex.answer.map((t) => MJ.name(t)).join('・') }; },
      reveal: () => { locked = true; mark(); return ex.answer.map((t) => MJ.name(t)).join('・'); },
    };
  }
  function rChess(ex, ctx, host) {
    const wrap = h('div', { class: 'board-wrap' }); host.append(wrap);
    const api = { auto: ex.mode === 'move' || ex.mode === 'line' };
    let game, B, sel = null, locked = false, picked = new Set(), target = [], stage = 1, noteEl = null;
    function build() {
      game = new window.Chess(ex.fen);
      const flip = game.turn() === 'b';
      B = use3d() ? board3dAdapter(game, flip, tap, 'lesson:' + ex.fen + ':' + Math.random(), (sq) => ex.mode !== 'squares' && !locked && (game.get(sq) || {}).color === game.turn()) : boardEl(game, flip, tap);
      if (B.mount) requestAnimationFrame(() => B.mount());
      if (ex.mode === 'squares') {
        target = game.moves({ square: ex.from, verbose: true }).map((m) => m.to);
        B.sqs[ex.from].classList.add('from');
        wrap.append(B.el, turnNote(game, `全部で ${new Set(target).size} マス`));
      } else { noteEl = turnNote(game, ex.mode === 'line' ? '王手・取る手から読もう' : ex.goal === 'mate' ? '詰ませる手ならどれでも正解' : '駒をタップ → 行き先をタップ'); wrap.append(B.el, noteEl); }
    }
    function clearDots() { Object.values(B.sqs).forEach((b) => { b.classList.remove('sel'); b.querySelectorAll('.dot').forEach((d) => d.remove()); }); }
    function tap(name) {
      if (locked) return;
      if (ex.mode === 'squares') {
        if (name === ex.from) return;
        if (picked.has(name)) { picked.delete(name); B.sqs[name].classList.remove('pick'); } else { picked.add(name); B.sqs[name].classList.add('pick'); }
        ctx.ready(picked.size > 0); return;
      }
      const p = game.get(name);
      if (sel) {
        const mv = game.moves({ square: sel, verbose: true }).find((m) => m.to === name);
        if (mv) { doMove(sel, name); return; }
      }
      clearDots(); sel = null;
      if (p && p.color === game.turn()) {
        sel = name; B.sqs[name].classList.add('sel');
        const seen = new Set();
        game.moves({ square: name, verbose: true }).forEach((m) => { if (seen.has(m.to)) return; seen.add(m.to); B.sqs[m.to].append(h('span', { class: 'dot' + (m.captured ? ' cap' : '') })); });
      }
    }
    function solutionSan() {
      const g = new window.Chess(ex.fen);
      if (ex.goal === 'mate') { const m = g.moves({ verbose: true }).find((x) => { g.move(x); const r = g.in_checkmate(); g.undo(); return r; }); return m ? m.san : ''; }
      if (ex.mode === 'line' && stage === 2) { const m = game.moves({ verbose: true }).find((x) => { game.move(x); const r = game.in_checkmate(); game.undo(); return r; }); return m ? m.san : ''; }
      const mv = g.move({ from: ex.goal[0].slice(0, 2), to: ex.goal[0].slice(2, 4), promotion: 'q' }); return mv ? mv.san : '';
    }
    function doMove(from, to) {
      const before = game.fen();
      const m = game.move({ from, to, promotion: 'q' });
      clearDots(); locked = true;
      Object.values(B.sqs).forEach((b) => b.classList.remove('last'));
      B.paint(); B.sqs[from].classList.add('last'); B.sqs[to].classList.add('last');
      if (ex.mode === 'line' && stage === 1 && !game.in_checkmate()) {
        if (!ex.goal.includes(from + to)) {
          const ans = (() => { const g = new window.Chess(ex.fen); const mv = g.move({ from: ex.goal[0].slice(0, 2), to: ex.goal[0].slice(2, 4), promotion: 'q' }); return mv ? mv.san : ''; })();
          setTimeout(() => { ctx.finish({ ok: false, answer: ans + ' から', note: `${m.san} では2手で詰まない。` }); setTimeout(() => { game.load(before); B.paint(); }, 900); }, 350);
          return;
        }
        stage = 2; if (noteEl) noteEl.textContent = '相手の受けを考え中…';
        Eng.call('best', game.fen(), 4, []).then((r) => {
          if (r && r.from) { game.move({ from: r.from, to: r.to, promotion: r.promotion }); Object.values(B.sqs).forEach((b) => b.classList.remove('last')); B.paint(); B.sqs[r.from].classList.add('last'); B.sqs[r.to].classList.add('last'); }
          if (noteEl) noteEl.textContent = '最後の一手でチェックメイト！';
          locked = false;
        });
        return;
      }
      let ok;
      if (ex.goal === 'mate' || ex.mode === 'line') ok = game.in_checkmate();
      else ok = ex.goal.includes(from + to);
      const note = ok ? null : (ex.goal === 'mate' || ex.mode === 'line' ? (game.in_check() ? `${m.san} はチェックだけど、逃げられる。` : `${m.san} はチェックになっていない。`) : null);
      setTimeout(() => {
        ctx.finish({ ok, answer: solutionSan(), note: note || (ok ? m.san + (game.in_checkmate() ? '（チェックメイト）' : '') : null) });
        if (!ok) setTimeout(() => { game.load(before); B.paint(); }, 900);
      }, 350);
    }
    api.check = () => {
      locked = true;
      const want = new Set(target);
      let ok = picked.size === want.size && [...picked].every((s) => want.has(s));
      for (const s of picked) B.sqs[s].classList.add(want.has(s) ? 'ok' : 'ng');
      for (const s of want) if (!picked.has(s)) B.sqs[s].classList.add('miss');
      Object.values(B.sqs).forEach((b) => b.classList.remove('pick'));
      const missN = [...want].filter((s) => !picked.has(s)).length; const extraN = [...picked].filter((s) => !want.has(s)).length;
      return { ok, note: ok ? null : `${missN ? `見落とし ${missN} マス（緑枠）` : ''}${missN && extraN ? '・' : ''}${extraN ? `行けないマス ${extraN}（赤）` : ''}` };
    };
    api.reveal = () => {
      locked = true;
      if (ex.mode === 'squares') { for (const s of target) B.sqs[s].classList.add('miss'); return `緑枠の ${new Set(target).size} マス`; }
      return solutionSan();
    };
    api.lock = () => { locked = true; };
    if (window.Chess) build();
    else {
      const ld = h('div', { class: 'empty' }, '盤面を読み込み中…'); wrap.append(ld);
      ensureChess().then((ok) => { ld.remove(); if (ok) build(); else wrap.append(h('div', { class: 'empty' }, 'チェス盤を読み込めませんでした。通信を確認して開き直してください。')); });
    }
    return api;
  }

  // 麻雀：何待ち
  function rWaits(ex, ctx, host) {
    const codes = MJ.parse(ex.hand); const c13 = MJ.counts(codes);
    const ws = MJ.waits(c13);
    host.append(handEl(codes));
    const suits = [...new Set(codes.map((x) => x[1]))].filter((s) => s !== 'z');
    const honors = [...new Set(codes.filter((x) => x[1] === 'z'))];
    const pal = h('div', { class: 'palette' }); const picked = new Set(); const btns = {};
    const mkBtn = (i) => { const b = h('button', { class: 'tbtn', 'aria-label': MJ.name(i), 'aria-pressed': 'false' }, tileEl(MJ.code(i))); b.onclick = () => { if (locked) return; if (picked.has(i)) picked.delete(i); else picked.add(i); b.classList.toggle('sel'); b.setAttribute('aria-pressed', String(picked.has(i))); ctx.ready(picked.size > 0); }; btns[i] = b; return b; };
    for (const s of suits) { const row = h('div', { class: 'prow' }); const base = MJ.SUITS.indexOf(s) * 9; for (let n = 0; n < 9; n++) row.append(mkBtn(base + n)); pal.append(row); }
    if (honors.length) { const row = h('div', { class: 'prow' }); honors.forEach((x) => row.append(mkBtn(MJ.idx(x)))); pal.append(row); }
    let locked = false;
    host.append(h('div', { class: 'palette-label' }, '待ちだと思う牌をすべてタップ'), pal);
    function detail() {
      const box = h('div', { class: 'fb-tiles' }, ...ws.map((t) => tileEl(MJ.code(t))), h('span', { class: 'num', style: 'margin-left:6px' }, `${ws.length}種 ${MJ.remaining(c13, ws)}枚`));
      const lines = ws.slice(0, 4).map((t) => { c13[t]++; const a = MJ.agari(c13); c13[t]--; return `${MJ.name(t)}：${MJ.describe(a)}`; });
      return h('div', {}, box, h('div', { class: 'fb-ex', style: 'margin-top:6px' }, lines.join('　')));
    }
    return {
      check: () => {
        locked = true; const want = new Set(ws);
        const ok = picked.size === want.size && [...picked].every((t) => want.has(t));
        for (const t of picked) btns[t].classList.add(want.has(t) ? 'right' : 'wrong');
        for (const t of want) if (!picked.has(t) && btns[t]) btns[t].classList.add('miss');
        return { ok, detail: detail(), answer: ok ? null : ws.map((t) => MJ.name(t)).join('・') };
      },
      reveal: () => { locked = true; for (const t of ws) if (btns[t]) btns[t].classList.add('miss'); return ws.map((t) => MJ.name(t)).join('・'); },
    };
  }
  // 麻雀：何切る
  function rDiscard(ex, ctx, host) {
    const codes = MJ.parse(ex.hand);
    const ds = MJ.discards(codes); const best = Math.max(...ds.map((d) => d.count));
    const bestSet = new Set(ds.filter((d) => d.count === best).map((d) => d.tile));
    const row = h('div', { class: 'hand' }); let sel = null; const btns = [];
    codes.forEach((c, k) => {
      const b = h('button', { class: 'tbtn', 'aria-label': MJ.name(c) + 'を切る' }, tileEl(c));
      b.onclick = () => { if (locked) return; btns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = MJ.idx(c); ctx.ready(true); };
      btns.push(b); row.append(b);
    });
    let locked = false;
    host.append(row, h('div', { class: 'palette-label' }, '切る牌をタップ（待ち枚数＝自分の手牌以外に残っている枚数）'));
    function table() {
      const t = h('table', { class: 'dtable' });
      [...ds].sort((a, b) => b.count - a.count).forEach((d) => {
        t.append(h('tr', {}, h('td', {}, '打 ', h('span', { class: 'mini' }, tileEl(MJ.code(d.tile)))), h('td', {}, h('span', { class: 'mini' }, ...d.waits.map((w) => tileEl(MJ.code(w))))), h('td', { class: 'num' }, `${d.count}枚${d.count === best ? ' ◎' : ''}`)));
      });
      return t;
    }
    return {
      check: () => {
        locked = true; const ok = bestSet.has(sel);
        btns.forEach((b, k) => { const i = MJ.idx(codes[k]); if (bestSet.has(i)) b.classList.add('right'); else if (i === sel) b.classList.add('wrong'); });
        const d = ds.find((x) => x.tile === sel);
        return { ok, note: d ? `選んだ打牌は ${d.waits.map((w) => MJ.name(w)).join('・')} 待ち ${d.count}枚` : 'その牌を切るとテンパイしない', answer: [...bestSet].map((i) => '打' + MJ.name(i)).join(' / '), detail: table() };
      },
      reveal: () => { locked = true; return [...bestSet].map((i) => '打' + MJ.name(i)).join(' / '); },
    };
  }

  // ---------- 設定 ----------
  function openSettings() {
    const bg = h('div', { class: 'sheet-bg', onclick: (e) => { if (e.target === bg) close(); } });
    const close = () => { bg.remove(); render(); };
    const sw = (key) => { const b = h('button', { class: 'switch' + (P[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(!!P[key]) }); b.onclick = () => { P[key] = !P[key]; b.classList.toggle('on', P[key]); b.setAttribute('aria-checked', String(P[key])); save(); }; return b; };
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': '1日の目標XP' });
    [10, 20, 30, 50].forEach((v) => { const b = h('button', { class: P.goal === v ? 'on' : '' }, v); b.onclick = () => { P.goal = v; [...seg.children].forEach((x) => x.classList.toggle('on', x === b)); save(); }; seg.append(b); });
    let armed = false;
    const reset = h('button', { class: 'danger' }, '進捗をリセット');
    reset.onclick = () => { if (!armed) { armed = true; reset.textContent = 'もう一度押すと全部消えます'; return; } const keep = { goal: P.goal, sound: P.sound, reading: P.reading, autoplay: P.autoplay }; P = Object.assign(blank(), keep); save(); close(); };
    const syncEl = h('span', { 'data-sync': '' }); paintSync(syncEl);
    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-label': '設定' },
      h('div', { class: 'srow' }, h('h3', {}, '設定'), h('button', { class: 'icon-btn', 'aria-label': '閉じる', onclick: close }, icon('close'))),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '1日の目標'), h('small', {}, 'レッスン1回で10〜20XP')), seg),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '効果音'), h('small', {}, '正解・不正解の音')), sw('sound')),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '英語の自動読み上げ'), h('small', {}, canSpeak() ? '問題が出たら発音を流す' : 'この環境では音声が使えません')), sw('autoplay')),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, 'モンゴル語の読みを表示'), h('small', {}, 'ローマ字とカナ（目安）')), sw('reading')),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '麻雀の卓を3Dで表示'), h('small', {}, '牌・山・河を立体で。重い端末ではオフに')), (() => { const b = h('button', { class: 'switch' + (P.mj3d !== false ? ' on' : ''), role: 'switch', 'aria-checked': String(P.mj3d !== false) }); b.onclick = () => { P.mj3d = P.mj3d === false; b.classList.toggle('on', P.mj3d !== false); b.setAttribute('aria-checked', String(P.mj3d !== false)); if (P.mj3d) Mahjong3D.prepare(); save(); }; return b; })()),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, 'チェス盤を3Dで表示'), h('small', {}, '立体の駒と盤。重い端末ではオフに')), (() => { const b = h('button', { class: 'switch' + (P.board3d !== false ? ' on' : ''), role: 'switch', 'aria-checked': String(P.board3d !== false) }); b.onclick = () => { P.board3d = P.board3d === false; b.classList.toggle('on', P.board3d !== false); b.setAttribute('aria-checked', String(P.board3d !== false)); if (P.board3d) Chess3D.load(); save(); }; return b; })()),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '保存先'), syncEl)),
      h('div', { class: 'srow' }, h('div', { class: 'sl' }, h('b', {}, '最長連続'), h('small', { class: 'num' }, `${P.best}日`)), reset));
    bg.append(sheet); document.body.append(bg);
    document.onkeydown = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  }

  /*__PLAY__*/

  // ---------- 起動 ----------
  render();
  initSpeech();
  initSync();
  setTimeout(ensureChess, 1500);
})();
