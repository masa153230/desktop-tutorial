/* 麻雀エンジン：アガリ判定・待ち計算・打牌候補・点数・牌の絵 */
const MJ = (() => {
  const SUITS = 'mpsz';
  const idx = (c) => SUITS.indexOf(c[1]) * 9 + (+c[0]) - 1;
  const code = (i) => (i % 9 + 1) + SUITS[Math.floor(i / 9)];
  const isHonor = (i) => i >= 27;
  const YAO = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

  function parse(str) {
    const out = []; let nums = [];
    for (const ch of String(str).replace(/\s/g, '')) {
      if (/[0-9]/.test(ch)) nums.push(ch);
      else if (SUITS.includes(ch)) { nums.forEach((n) => out.push(n + ch)); nums = []; }
    }
    return out;
  }
  function counts(codes) { const c = new Array(34).fill(0); codes.forEach((x) => c[idx(x)]++); return c; }
  function sortCodes(codes) { return [...codes].sort((a, b) => idx(a) - idx(b)); }
  function toStr(codes) {
    let s = '', cur = '', nums = '';
    for (const c of sortCodes(codes)) {
      if (c[1] !== cur) { if (cur) s += nums + cur; cur = c[1]; nums = ''; }
      nums += c[0];
    }
    return cur ? s + nums + cur : s;
  }

  // c を全部面子に分けられるなら面子の配列、だめなら null（c は呼び出し後に元に戻る）
  function meldsOf(c) {
    let i = 0; while (i < 34 && c[i] === 0) i++;
    if (i === 34) return [];
    if (c[i] >= 3) {
      c[i] -= 3; const r = meldsOf(c); c[i] += 3;
      if (r) return [[i, i, i], ...r];
    }
    if (!isHonor(i) && i % 9 <= 6 && c[i + 1] > 0 && c[i + 2] > 0) {
      c[i]--; c[i + 1]--; c[i + 2]--; const r = meldsOf(c); c[i]++; c[i + 1]++; c[i + 2]++;
      if (r) return [[i, i + 1, i + 2], ...r];
    }
    return null;
  }

  // 14枚のカウント → {kind, pair, melds} or null
  function agari(c) {
    const total = c.reduce((a, b) => a + b, 0);
    if (total !== 14) return null;
    for (let i = 0; i < 34; i++) {
      if (c[i] >= 2) {
        c[i] -= 2; const m = meldsOf(c); c[i] += 2;
        if (m) return { kind: 'std', pair: i, melds: m };
      }
    }
    if (c.filter((x) => x === 2).length === 7) return { kind: 'chiitoi' };
    if (YAO.every((i) => c[i] >= 1) && YAO.some((i) => c[i] === 2)) return { kind: 'kokushi' };
    return null;
  }

  // 13枚 → 待ち牌のインデックス配列
  function waits(c13) {
    const out = [];
    for (let t = 0; t < 34; t++) {
      if (c13[t] >= 4) continue;
      c13[t]++; if (agari(c13)) out.push(t); c13[t]--;
    }
    return out;
  }
  const remaining = (c13, ws) => ws.reduce((a, t) => a + (4 - c13[t]), 0);

  // 14枚 → テンパイになる打牌ごとの待ち
  function discards(codes14) {
    const c = counts(codes14); const res = [];
    for (let i = 0; i < 34; i++) {
      if (!c[i]) continue;
      c[i]--; const ws = waits(c); if (ws.length) res.push({ tile: i, waits: ws, count: remaining(c, ws) }); c[i]++;
    }
    return res;
  }

  function describe(a) {
    if (!a) return '';
    if (a.kind === 'chiitoi') return '七対子';
    if (a.kind === 'kokushi') return '国士無双';
    const meld = (m) => toStr(m.map(code));
    return [...a.melds.map(meld), toStr([code(a.pair), code(a.pair)])].join(' ／ ');
  }

  // --- ランダムな手 ---
  function randomComplete(rand, opts = {}) {
    const suits = opts.suits || 'mps';
    const honors = opts.honors !== false;
    const seqRate = opts.seqRate ?? 0.7;
    for (let tries = 0; tries < 200; tries++) {
      const c = new Array(34).fill(0); let ok = true;
      for (let m = 0; m < 4 && ok; m++) {
        let placed = false;
        for (let k = 0; k < 30 && !placed; k++) {
          if (rand() < seqRate) {
            const s = SUITS.indexOf(suits[Math.floor(rand() * suits.length)]);
            const st = s * 9 + Math.floor(rand() * 7);
            if (c[st] < 4 && c[st + 1] < 4 && c[st + 2] < 4) { c[st]++; c[st + 1]++; c[st + 2]++; placed = true; }
          } else {
            const pool = [];
            for (const ch of suits) { const s = SUITS.indexOf(ch); for (let n = 0; n < 9; n++) pool.push(s * 9 + n); }
            if (honors) for (let z = 27; z < 34; z++) pool.push(z);
            const t = pool[Math.floor(rand() * pool.length)];
            if (c[t] <= 1) { c[t] += 3; placed = true; }
          }
        }
        if (!placed) ok = false;
      }
      if (!ok) continue;
      const pool = [];
      for (const ch of suits) { const s = SUITS.indexOf(ch); for (let n = 0; n < 9; n++) pool.push(s * 9 + n); }
      if (honors) for (let z = 27; z < 34; z++) pool.push(z);
      const cand = pool.filter((t) => c[t] <= 2);
      const p = cand[Math.floor(rand() * cand.length)]; c[p] += 2;
      const out = []; c.forEach((n, i) => { for (let k = 0; k < n; k++) out.push(code(i)); });
      return out;
    }
    return parse('123m456p789s234s55z');
  }

  // --- 点数（ロン） ---
  function score(fu, han, dealer) {
    let base, name = '';
    if (han >= 13) { base = 8000; name = '役満'; }
    else if (han >= 11) { base = 6000; name = '三倍満'; }
    else if (han >= 8) { base = 4000; name = '倍満'; }
    else if (han >= 6) { base = 3000; name = '跳満'; }
    else if (han >= 5) { base = 2000; name = '満貫'; }
    else { base = fu * 2 ** (han + 2); if (base >= 2000) { base = 2000; name = '満貫'; } }
    const pts = Math.ceil(base * (dealer ? 6 : 4) / 100) * 100;
    return { pts, base, name };
  }

  // --- 牌の名前 ---
  const KAN = '一二三四五六七八九';
  const YOMI = ['イー', 'リャン', 'サン', 'スー', 'ウー', 'ロー', 'チー', 'パー', 'キュー'];
  const HON = ['東', '南', '西', '北', '白', '發', '中'];
  const HON_YOMI = ['トン', 'ナン', 'シャー', 'ペー', 'ハク', 'ハツ', 'チュン'];
  function name(c) {
    const i = typeof c === 'number' ? c : idx(c); const n = i % 9;
    if (i >= 27) return HON[i - 27];
    return (n + 1) + ['萬', '筒', '索'][Math.floor(i / 9)];
  }
  function yomi(c) {
    const i = typeof c === 'number' ? c : idx(c); const n = i % 9;
    if (i >= 27) return HON_YOMI[i - 27];
    return YOMI[n] + ['ワン', 'ピン', 'ソー'][Math.floor(i / 9)];
  }

  // --- 牌の絵（SVG）---
  const COL = { b: '#1d5fb4', r: '#c8312f', g: '#1f8a4c', k: '#1d1d1f' };
  const PIN = {
    1: [[15, 20, 9.5, 'r']],
    2: [[15, 11, 5, 'g'], [15, 29, 5, 'b']],
    3: [[8, 9, 4.2, 'b'], [15, 20, 4.2, 'r'], [22, 31, 4.2, 'g']],
    4: [[9, 11, 4.4, 'b'], [21, 11, 4.4, 'g'], [9, 29, 4.4, 'g'], [21, 29, 4.4, 'b']],
    5: [[8.5, 10, 4, 'b'], [21.5, 10, 4, 'g'], [15, 20, 4, 'r'], [8.5, 30, 4, 'g'], [21.5, 30, 4, 'b']],
    6: [[10, 8, 3.6, 'g'], [20, 8, 3.6, 'g'], [10, 20, 3.6, 'r'], [20, 20, 3.6, 'r'], [10, 31, 3.6, 'r'], [20, 31, 3.6, 'r']],
    7: [[7.5, 6.5, 3.1, 'g'], [15, 10, 3.1, 'g'], [22.5, 13.5, 3.1, 'g'], [10, 23, 3.4, 'r'], [20, 23, 3.4, 'r'], [10, 32, 3.4, 'r'], [20, 32, 3.4, 'r']],
    8: [[10, 6.5, 3.2, 'b'], [20, 6.5, 3.2, 'b'], [10, 15.5, 3.2, 'b'], [20, 15.5, 3.2, 'b'], [10, 24.5, 3.2, 'b'], [20, 24.5, 3.2, 'b'], [10, 33.5, 3.2, 'b'], [20, 33.5, 3.2, 'b']],
    9: [[7.5, 8, 3.2, 'b'], [15, 8, 3.2, 'b'], [22.5, 8, 3.2, 'b'], [7.5, 20, 3.2, 'r'], [15, 20, 3.2, 'r'], [22.5, 20, 3.2, 'r'], [7.5, 32, 3.2, 'g'], [15, 32, 3.2, 'g'], [22.5, 32, 3.2, 'g']],
  };
  // 索子: [x, y, 長さ, 色]
  const SOU = {
    2: [[15, 11, 13, 'g'], [15, 29, 13, 'g']],
    3: [[15, 11, 13, 'g'], [9, 29, 13, 'g'], [21, 29, 13, 'g']],
    4: [[9, 11, 13, 'g'], [21, 11, 13, 'g'], [9, 29, 13, 'g'], [21, 29, 13, 'g']],
    5: [[8, 11, 13, 'g'], [22, 11, 13, 'g'], [15, 20, 13, 'r'], [8, 29, 13, 'g'], [22, 29, 13, 'g']],
    6: [[7, 11, 13, 'g'], [15, 11, 13, 'g'], [23, 11, 13, 'g'], [7, 29, 13, 'g'], [15, 29, 13, 'g'], [23, 29, 13, 'g']],
    7: [[15, 6.5, 8, 'r'], [7, 18, 9, 'g'], [15, 18, 9, 'g'], [23, 18, 9, 'g'], [7, 31, 9, 'g'], [15, 31, 9, 'g'], [23, 31, 9, 'g']],
    8: [[5.5, 11, 13, 'g'], [12, 11, 13, 'g'], [18, 11, 13, 'g'], [24.5, 11, 13, 'g'], [5.5, 29, 13, 'g'], [12, 29, 13, 'g'], [18, 29, 13, 'g'], [24.5, 29, 13, 'g']],
    9: [[7, 7.5, 9, 'g'], [15, 7.5, 9, 'r'], [23, 7.5, 9, 'g'], [7, 20, 9, 'g'], [15, 20, 9, 'r'], [23, 20, 9, 'g'], [7, 32.5, 9, 'g'], [15, 32.5, 9, 'r'], [23, 32.5, 9, 'g']],
  };
  function svg(c) {
    const i = typeof c === 'number' ? c : idx(c); const n = i % 9 + 1; const s = Math.floor(i / 9);
    let body = '';
    if (s === 0) {
      body = `<text x="15" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="${COL.k}">${KAN[n - 1]}</text>` +
        `<text x="15" y="35" text-anchor="middle" font-size="15" font-weight="700" fill="${COL.r}">萬</text>`;
    } else if (s === 1) {
      body = PIN[n].map(([x, y, r, k]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${COL[k]}" stroke-width="${(r * 0.38).toFixed(2)}"/>` +
        `<circle cx="${x}" cy="${y}" r="${(r * 0.35).toFixed(2)}" fill="${COL[k]}"/>`).join('');
      if (n === 1) body += `<circle cx="15" cy="20" r="5.2" fill="none" stroke="${COL.g}" stroke-width="1.4"/>`;
    } else if (s === 2) {
      if (n === 1) {
        body = `<ellipse cx="15" cy="23" rx="7" ry="9" fill="${COL.g}"/>` +
          `<circle cx="15" cy="11" r="4.5" fill="${COL.g}"/><circle cx="16.5" cy="10" r="1.2" fill="#fff"/>` +
          `<path d="M19 11 l4 -1 l-4 2.5z" fill="${COL.r}"/><path d="M10 29 q5 6 10 0" stroke="${COL.r}" stroke-width="2" fill="none"/>` +
          `<path d="M11 20 q4 3 8 0" stroke="#fff" stroke-width="1.2" fill="none"/>`;
      } else {
        body = SOU[n].map(([x, y, l, k]) => {
          const w = n === 8 ? 3.4 : 4;
          return `<rect x="${x - w / 2}" y="${y - l / 2}" width="${w}" height="${l}" rx="${w / 2}" fill="${COL[k]}"/>` +
            `<rect x="${x - w / 2 - 0.4}" y="${y - 0.5}" width="${w + 0.8}" height="1" fill="#fbf8ef"/>`;
        }).join('');
      }
    } else {
      const z = n - 1;
      if (z === 4) body = `<rect x="6" y="8" width="18" height="24" rx="2" fill="none" stroke="${COL.b}" stroke-width="1.6"/>`;
      else {
        const col = z === 5 ? COL.g : z === 6 ? COL.r : COL.k;
        body = `<text x="15" y="27" text-anchor="middle" font-size="19" font-weight="800" fill="${col}">${HON[z]}</text>`;
      }
    }
    return `<svg viewBox="0 0 30 40" aria-hidden="true">${body}</svg>`;
  }

  return { SUITS, idx, code, parse, counts, sortCodes, toStr, agari, waits, remaining, discards, describe, randomComplete, score, name, yomi, svg, isHonor };
})();
if (typeof module !== 'undefined') module.exports = MJ;
