  // ================= モンゴル語の物語「ノミンの手紙」（はじめてのモンゴル語より。app.js の中に組み込まれる） =================
  const MS = typeof MN_STORY !== 'undefined' ? MN_STORY : null;
  const MA = typeof MN_ART !== 'undefined' ? MN_ART : null;

  // ---- 名前をキリル文字に（日本人名のモンゴル語表記にならい、長音は落とす） ----
  const KANA = {
    あ: 'а', い: 'и', う: 'у', え: 'э', お: 'о', か: 'ка', き: 'ки', く: 'ку', け: 'кэ', こ: 'ко',
    さ: 'са', し: 'ши', す: 'су', せ: 'сэ', そ: 'со', た: 'та', ち: 'чи', つ: 'цу', て: 'тэ', と: 'то',
    な: 'на', に: 'ни', ぬ: 'ну', ね: 'нэ', の: 'но', は: 'ха', ひ: 'хи', ふ: 'фу', へ: 'хэ', ほ: 'хо',
    ま: 'ма', み: 'ми', む: 'му', め: 'мэ', も: 'мо', や: 'я', ゆ: 'ю', よ: 'ё',
    ら: 'ра', り: 'ри', る: 'ру', れ: 'рэ', ろ: 'ро', わ: 'ва', を: 'о', ん: 'н',
    が: 'га', ぎ: 'ги', ぐ: 'гу', げ: 'гэ', ご: 'го', ざ: 'за', じ: 'жи', ず: 'зу', ぜ: 'зэ', ぞ: 'зо',
    だ: 'да', ぢ: 'жи', づ: 'зу', で: 'дэ', ど: 'до', ば: 'ба', び: 'би', ぶ: 'бу', べ: 'бэ', ぼ: 'бо',
    ぱ: 'па', ぴ: 'пи', ぷ: 'пу', ぺ: 'пэ', ぽ: 'по', ゔ: 'ву',
  };
  const SMALL_Y = { ゃ: ['а', 'я'], ゅ: ['у', 'ю'], ょ: ['о', 'ё'] };
  const SMALL_V = { ぁ: 'а', ぃ: 'и', ぅ: 'у', ぇ: 'э', ぉ: 'о' };
  function kana2cyr(src) {
    const s = String(src || '').trim().replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[\s　]+/g, ' ');
    if (!s) return null;
    const out = []; let gem = false;
    for (const ch of s) {
      if (ch === ' ') { out.push(' '); continue; }
      if (ch === 'ー') continue;
      if (ch === 'っ') { gem = true; continue; }
      if (SMALL_Y[ch] && out.length) { const prev = out.pop().replace(/и$/, ''); out.push(prev + (/[шчж]$/.test(prev) ? SMALL_Y[ch][0] : SMALL_Y[ch][1])); continue; }
      if (SMALL_V[ch] && out.length) { out.push(out.pop().replace(/[аиуэо]$/, '') + SMALL_V[ch]); continue; }
      const c = KANA[ch]; if (!c) return null;
      out.push(gem ? c[0] + c : c); gem = false;
    }
    return out.join('')
      .replace(/([оё])у/g, '$1').replace(/юу/g, 'ю').replace(/(.)\1/g, (m, v) => ('аиуэо'.includes(v) ? v : m))
      .replace(/([аоуэяюё])и/g, '$1й')
      .split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  const mnProf = () => ({ name: P.mnName || 'あなた', cyr: P.mnCyr || 'Найз' });
  const fillName = (s) => (typeof s === 'string' ? s.replaceAll('{name}', mnProf().name).replaceAll('{cyr}', mnProf().cyr) : s);
  function setMnName(kana) {
    const cyr = kana2cyr(kana); if (!cyr) return false;
    P.mnName = kana.trim(); P.mnCyr = cyr; P.mnNameAsked = 1; save(); return true;
  }

  // ---- 章 → モンゴル語コースの先頭のユニット ----
  (function addStoryUnits() {
    const mn = BY_ID.mn; if (!mn || !MS) return;
    const units = MS.CHAPTERS.map((ch, ci) => {
      const letters = ch.kind === 'letter';
      const items = ch.items.map((it) => (letters
        ? [it.mn, `${it.kana}（${it.rom}）`, it.rom, it.kana, `例：${it.ex}（${it.exRom}）＝${it.exJa}。${it.note}`]
        : [it.mn, it.ja, it.rom, it.kana, it.note || '']));
      const n = items.length, half = Math.ceil(n / 2);
      const lessons = [{ id: 'st', name: '物語', story: 'intro' }, { id: 'l1', name: 'はじめて', lv: 1, range: [0, half] }, { id: 'l2', name: 'つづき', lv: 2, range: [half, n] }, { id: 'l3', name: '仕上げ', lv: 3, range: [0, n] }];
      if (ch.replies) lessons.push({ id: 'rp', name: '受け答え', replies: true });
      lessons.push({ id: 'end', name: '章のおわり', story: 'clear' });
      return { id: 's' + ci, title: `${ci + 1}. ${ch.title}`, desc: `${ch.place}（${ch.placeMn}）`, level: '物語', letters, tpl: true, tip: ch.tip ? `【${ch.tip[0]}】${ch.tip[1]}` : null, items, lessons, chapter: ch, ci };
    });
    mn.units = units.concat(mn.units);
    mn.levels = Object.assign({ 物語: '旅の物語「ノミンの手紙」：空港から草原のゲルへ。文字・あいさつ・家畜・数字・自己紹介' }, mn.levels);
  })();

  // 受け答え：相手のことばに合う返事を選ぶ
  function repliesLesson(unit) {
    const ch = unit.chapter; const audio = canSpeak('mn');
    return shuffle(ch.replies).map((r) => {
      const [q, qja, a, aja, wrong] = r.map((x) => (Array.isArray(x) ? x.map(fillName) : fillName(x)));
      return mcFrom({ q: '返事として合うのは？', main: q, mainCls: 'cyr', reading: qja, showReading: true, audio: audio ? q : null, lang: 'mn', ex: `${q}（${qja}）→ ${a}（${aja}）`, sayAfter: audio ? a : null },
        { text: a, cls: 'cyrs' }, wrong.map((w) => ({ text: w, cls: 'cyrs' })));
    });
  }

  // ---- 物語の画面 ----
  let ST = null, stRaf = 0;
  const STORY_PLACE = { title: ['旅のはじまり', 'Аяллын эхлэл'] };
  function openStory(course, unit, lesson) {
    const ch = unit.chapter; const ci = unit.ci; const lines = [];
    if (lesson.story === 'intro') {
      if (ci === 0) for (const l of MS.PROLOGUE) lines.push({ l, scene: 'title' });
      for (const l of ch.intro) lines.push({ l, scene: ch.scene });
    } else for (const l of ch.clear) lines.push({ l, scene: ch.scene, readable: true });
    ST = { course, unit, lesson, ch, ci, lines, i: 0, phase: lesson.story === 'intro' && ci === 0 && !P.mnNameAsked ? 'name' : 'lines', marked: false };
    go({ name: 'story' });
  }
  function storyMark() {
    if (ST.marked) return; ST.marked = true;
    const k = keyOf(ST.course, ST.unit, ST.lesson); const r = P.lessons[k] || { n: 0, best: 0 }; r.n++; r.best = 100; P.lessons[k] = r;
    awardXP(5); save();
  }
  function fitCv(cv) { const r = cv.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)); }
  function storyLoop(sceneCv) {
    cancelAnimationFrame(stRaf); stRaf = 0;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    fitCv(sceneCv); const c = sceneCv.getContext('2d'); let last = 0;
    const draw = (t) => {
      const cur = ST && ST.lines[Math.min(ST.i, ST.lines.length - 1)];
      try { MA.drawScene(c, sceneCv.width, sceneCv.height, (ST && ST.phase === 'lines' && cur ? cur.scene : ST && ST.ch.scene) || 'title', t); } catch { /* 絵が描けなくても会話は続ける */ }
      const b = ST && ST.bust;
      if (b && b.cv.isConnected) { try { const bc = b.cv.getContext('2d'); bc.clearRect(0, 0, b.cv.width, b.cv.height); MA.drawBust(bc, b.cv.width, b.look, t, performance.now() < b.until); } catch { /* なし */ } }
    };
    draw(2.5); if (ST) ST.redraw = draw;
    if (reduce) return;
    const tick = (ms) => { if (!sceneCv.isConnected) { stRaf = 0; return; } if (ms - last > 33) { last = ms; draw(ms / 1000); } stRaf = requestAnimationFrame(tick); };
    stRaf = requestAnimationFrame(tick);
  }
  function letterEl(readable) {
    const L0 = MS.LETTER; const say = fillName(L0.mn).replace(/\n/g, ' ');
    return h('div', { class: 'st-letter', 'aria-label': 'ノミンからの手紙' }, h('div', { class: 'cyr' }, fillName(L0.mn)),
      readable ? [h('div', { class: 'kana' }, fillName(L0.kana)), h('div', { class: 'ja' }, fillName(L0.ja)),
        canSpeak('mn') ? h('button', { class: 'chip', onclick: (e) => { e.stopPropagation(); speak(say, false, 'mn'); } }, icon('speaker'), '手紙を聞く') : null]
        : h('div', { class: 'ja' }, '（……まだ読めない）'));
  }
  function storyView() {
    if (!ST || !MS) { go({ name: 'course', cid: 'mn' }, 'replace'); return; }
    const ch = ST.ch;
    const toCourse = () => { cancelAnimationFrame(stRaf); go({ name: 'course', cid: 'mn' }); };
    const skip = h('button', { class: 'chip tog', onclick: () => { if (ST.phase === 'lines' || ST.phase === 'name') { ST.phase = 'end'; paint(); } } }, 'スキップ');
    const bar = h('div', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('button', { class: 'icon-btn', 'aria-label': 'コースに戻る', onclick: toCourse }, icon('close')),
      h('h2', {}, `${ST.ci + 1}. ${ch.title}${ST.lesson.story === 'clear' ? '（章のおわり）' : ''}`), skip));
    const sceneCv = h('canvas', { role: 'img', 'aria-label': ch.place + 'の景色' });
    const placeB = h('b'), placeS = h('span', { class: 'cyr' });
    const box = h('div', { class: 'st-box', 'aria-live': 'polite' });
    const root = h('div', { class: 'wrap st-wrap', style: cvars('mn') },
      h('div', { class: 'st-scene' }, sceneCv, h('div', { class: 'st-place' }, placeB, placeS)), box);
    app.append(bar, root);
    const next = () => { if (ST.phase !== 'lines') return; if (ST.i < ST.lines.length - 1) ST.i++; else ST.phase = 'end'; paint(); };
    function setPlace() {
      const cur = ST.phase === 'lines' ? ST.lines[ST.i] : null;
      const [a, b] = cur && STORY_PLACE[cur.scene] ? STORY_PLACE[cur.scene] : [ch.place, ch.placeMn];
      placeB.textContent = a; placeS.textContent = b;
    }
    function paint() {
      setPlace(); box.replaceChildren(); ST.bust = null; skip.hidden = ST.phase === 'end';
      if (ST.redraw) setTimeout(() => ST && ST.redraw && ST.redraw(performance.now() / 1000), 0);
      if (ST.phase === 'name') {
        const inp = h('input', { class: 'tin st-name', type: 'text', placeholder: '例：たろう', autocomplete: 'off', 'aria-label': 'あなたの名前（ひらがな・カタカナ）' });
        const pv = h('div', { class: 'st-cyr cyr' }, '　'); const msg = h('small', { class: 'mmsg' });
        inp.addEventListener('input', () => { pv.textContent = kana2cyr(inp.value) || '　'; msg.textContent = ''; });
        const ok = h('button', { class: 'cta' }, 'この名前で旅に出る');
        ok.onclick = () => { if (setMnName(inp.value)) { ST.phase = 'lines'; paint(); } else msg.textContent = 'ひらがなかカタカナで入れてください'; };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click(); });
        const later = h('button', { class: 'cta alt' }, 'あとで（「あなた」で進む）');
        later.onclick = () => { P.mnNameAsked = 1; save(); ST.phase = 'lines'; paint(); };
        box.append(h('div', { class: 'st-card' }, h('b', {}, 'あなたの名前を教えてください'), h('small', { class: 'note' }, 'キリル文字にして、物語と自己紹介の問題で使います（設定で変えられます）。'), inp, pv, msg, ok, later));
        setTimeout(() => inp.focus(), 60);
        return;
      }
      if (ST.phase === 'lines') {
        const cur = ST.lines[ST.i]; const [sp, mnRaw, jaRaw] = cur.l; const last = ST.i === ST.lines.length - 1;
        const dlg = h('div', { class: 'st-dlg' + (sp === 'narr' ? ' narr' : ''), role: 'button', tabindex: '0', 'aria-label': '次へ', onclick: next });
        if (sp === 'letter') dlg.append(letterEl(!!cur.readable));
        else {
          const who = MS.PEOPLE[sp] || {}; const name = sp === 'me' ? mnProf().name : fillName(who.name || '');
          const m = fillName(mnRaw), j = fillName(jaRaw);
          if (name) {
            const bc = who.look && MA ? h('canvas', { width: '112', height: '112', 'aria-hidden': 'true' }) : null;
            dlg.append(h('div', { class: 'st-who' }, bc, h('div', {}, h('b', {}, name), h('small', {}, who.role || (sp === 'me' ? 'あなた' : '')))));
            if (bc) ST.bust = { cv: bc, look: who.look, until: performance.now() + (m ? 1600 : 900) };
          }
          if (m) {
            const say = canSpeak('mn') ? h('button', { class: 'mini-say', 'aria-label': 'モンゴル語を聞く', onclick: (e) => { e.stopPropagation(); speak(m, false, 'mn'); if (ST.bust) ST.bust.until = performance.now() + 1600; } }, icon('speaker')) : null;
            dlg.append(h('div', { class: 'st-mn cyr', lang: 'mn' }, m, say));
            if (P.autoplay && canSpeak('mn')) setTimeout(() => speak(m, false, 'mn'), 200);
          }
          if (j) dlg.append(h('p', { class: 'st-ja' }, j));
        }
        dlg.append(h('span', { class: 'st-next' }, last ? '▶ 先へ' : '▼ タップで次へ'));
        dlg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
        box.append(dlg);
        dlg.focus({ preventScroll: true });
        return;
      }
      // おわり：章のはじめはポイントと文化、章のおわりはごほうび
      const units = ST.course.units; const ui = units.indexOf(ST.unit);
      const nextUnit = units[ui + 1] && units[ui + 1].chapter ? units[ui + 1] : null;
      if (ST.lesson.story === 'intro') {
        if (ch.tip) box.append(h('div', { class: 'st-card tip' }, h('b', {}, ch.tip[0]), h('p', {}, ch.tip[1])));
        if (ch.culture) box.append(h('div', { class: 'st-card' }, h('small', { class: 'note' }, 'モンゴルのこと'), h('p', {}, ch.culture)));
        const l1 = ST.unit.lessons.find((l) => !l.story);
        box.append(h('div', { class: 'rbtns' },
          h('button', { class: 'cta', onclick: () => { storyMark(); startLesson(ST.course, ST.unit, l1); } }, 'この章の練習をはじめる'),
          h('button', { class: 'cta alt', onclick: () => { storyMark(); toCourse(); } }, 'コースに戻る')));
      } else {
        if (ch.reward) box.append(h('div', { class: 'st-card reward' }, h('span', { class: 'gift' }, icon('check')), h('div', {}, h('small', { class: 'note' }, '手に入れた'), h('b', {}, ch.reward[0]), h('p', {}, ch.reward[1]))));
        if (!nextUnit) box.append(h('div', { class: 'st-card tip' }, h('b', {}, `${mnProf().name}さん、旅をやりとげました`), h('p', {}, 'Монгол хэлний аялал дууслаа.（モンゴル語の旅が終わりました）この先はコースの「入門」「基礎」「応用」で、格や動詞の時制に進めます。')));
        box.append(h('div', { class: 'rbtns' },
          nextUnit ? h('button', { class: 'cta', onclick: () => { storyMark(); openStory(ST.course, nextUnit, nextUnit.lessons[0]); } }, '次の章へ') : null,
          h('button', { class: nextUnit ? 'cta alt' : 'cta', onclick: () => { storyMark(); toCourse(); } }, 'コースに戻る')));
      }
    }
    paint();
    storyLoop(sceneCv);
    document.onkeydown = (e) => { if (e.target && e.target.tagName === 'INPUT') return; if ((e.key === 'Enter' || e.key === ' ') && ST.phase === 'lines') { e.preventDefault(); next(); } };
  }
  window.addEventListener('resize', () => { const cv = document.querySelector('.st-scene canvas'); if (cv) fitCv(cv); });
