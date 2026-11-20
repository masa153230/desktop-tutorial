/* チェスCPU v2：0x88盤・Zobrist置換表・PVS・ヌルムーブ・LMR・キラー/ヒストリー・静止探索・テーパード評価
 * makeChessEngine() は自己完結（Web Worker にそのまま渡せる）。ルール判定と棋譜は chess.js 側。
 */
function makeChessEngine() {
  const P = 1, N = 2, BI = 3, R = 4, Q = 5, K = 6;
  const MG = [0, 82, 337, 365, 477, 1025, 0], EG = [0, 94, 281, 297, 512, 936, 0];
  const PHASE = [0, 0, 1, 1, 2, 4, 0];
  const PST = [null,
    [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
  ];
  const KING_EG = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];
  const PASSED = [0, 5, 10, 18, 32, 55, 90, 0];
  const KN = [33, 31, 18, 14, -33, -31, -18, -14];
  const DIAG = [15, 17, -15, -17], ORTH = [1, -1, 16, -16], ALL8 = [1, -1, 16, -16, 15, 17, -15, -17];
  const MATE = 30000, INF = 32000;

  // --- Zobrist ---
  let seed = 0x9e3779b9 | 0;
  const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed | 0; };
  const ZL = new Int32Array(13 * 128), ZH = new Int32Array(13 * 128);
  for (let i = 0; i < ZL.length; i++) { ZL[i] = rnd(); ZH[i] = rnd(); }
  const ZSL = rnd(), ZSH = rnd();
  const ZCL = new Int32Array(16), ZCH = new Int32Array(16); for (let i = 0; i < 16; i++) { ZCL[i] = rnd(); ZCH[i] = rnd(); }
  const ZEL = new Int32Array(128), ZEH = new Int32Array(128); for (let i = 0; i < 128; i++) { ZEL[i] = rnd(); ZEH[i] = rnd(); }

  // --- 盤 ---
  const B = new Int8Array(128);
  let side = 1, castle = 0, ep = -1, half = 0, hl = 0, hh = 0;
  const king = [0, 0];
  const stack = []; // 戻し用
  const hashHist = []; // [lo, hi] の履歴（千日手検出）

  function fullHash() {
    let l = 0, h = 0;
    for (let sq = 0; sq < 128; sq++) { if (sq & 0x88) { sq += 7; continue; } const p = B[sq]; if (p) { l ^= ZL[(p + 6) * 128 + sq]; h ^= ZH[(p + 6) * 128 + sq]; } }
    if (side === -1) { l ^= ZSL; h ^= ZSH; }
    l ^= ZCL[castle]; h ^= ZCH[castle];
    if (ep >= 0) { l ^= ZEL[ep]; h ^= ZEH[ep]; }
    hl = l; hh = h;
  }
  function loadFen(fen) {
    B.fill(0); const [pos, s, c, e, hm] = fen.trim().split(/\s+/);
    let rank = 7, file = 0;
    for (const ch of pos) {
      if (ch === '/') { rank--; file = 0; continue; }
      if (/\d/.test(ch)) { file += +ch; continue; }
      const t = 'pnbrqk'.indexOf(ch.toLowerCase()) + 1; const col = ch === ch.toUpperCase() ? 1 : -1;
      const sq = rank * 16 + file; B[sq] = t * col; if (t === K) king[col === 1 ? 0 : 1] = sq; file++;
    }
    side = s === 'b' ? -1 : 1;
    castle = (c.includes('K') ? 1 : 0) | (c.includes('Q') ? 2 : 0) | (c.includes('k') ? 4 : 0) | (c.includes('q') ? 8 : 0);
    ep = e && e !== '-' ? (e.charCodeAt(0) - 97) + (+e[1] - 1) * 16 : -1;
    half = +hm || 0; stack.length = 0; fullHash();
  }
  function setPosition(fen, prevFens) {
    hashHist.length = 0;
    for (const f of prevFens || []) { loadFen(f); hashHist.push(hl, hh); }
    loadFen(fen);
  }

  function attacked(sq, by) {
    const pd = by === 1 ? -16 : 16;
    let s = sq + pd - 1; if (!(s & 0x88) && B[s] === P * by) return true;
    s = sq + pd + 1; if (!(s & 0x88) && B[s] === P * by) return true;
    for (let i = 0; i < 8; i++) { s = sq + KN[i]; if (!(s & 0x88) && B[s] === N * by) return true; }
    for (let i = 0; i < 8; i++) { s = sq + ALL8[i]; if (!(s & 0x88) && B[s] === K * by) return true; }
    for (let i = 0; i < 4; i++) { const d = DIAG[i]; s = sq + d; while (!(s & 0x88)) { const p = B[s]; if (p) { if (p === BI * by || p === Q * by) return true; break; } s += d; } }
    for (let i = 0; i < 4; i++) { const d = ORTH[i]; s = sq + d; while (!(s & 0x88)) { const p = B[s]; if (p) { if (p === R * by || p === Q * by) return true; break; } s += d; } }
    return false;
  }
  const inCheck = () => attacked(king[side === 1 ? 0 : 1], -side);

  // 手は整数： from | to<<7 | promo<<14 | flag<<17 (1:ep 2:castle 4:double)
  const mv = (f, t, pr, fl) => f | (t << 7) | (pr << 14) | (fl << 17);
  const mFrom = (m) => m & 127, mTo = (m) => (m >> 7) & 127, mPromo = (m) => (m >> 14) & 7, mFlag = (m) => (m >> 17) & 7;

  function gen(out, capsOnly) {
    let n = 0; const s = side;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p || (p > 0) !== (s > 0)) continue;
      const t = p > 0 ? p : -p;
      if (t === P) {
        const fwd = sq + 16 * s; const last = s === 1 ? 7 : 0; const start = s === 1 ? 1 : 6;
        if (!(fwd & 0x88) && !B[fwd]) {
          if ((fwd >> 4) === last) { out[n++] = mv(sq, fwd, Q, 0); if (!capsOnly) { out[n++] = mv(sq, fwd, N, 0); out[n++] = mv(sq, fwd, R, 0); out[n++] = mv(sq, fwd, BI, 0); } }
          else if (!capsOnly) { out[n++] = mv(sq, fwd, 0, 0); const f2 = fwd + 16 * s; if ((sq >> 4) === start && !B[f2]) out[n++] = mv(sq, f2, 0, 4); }
        }
        for (const d of [15 * s, 17 * s]) {
          const c = sq + d; if (c & 0x88) continue;
          if (B[c] && (B[c] > 0) !== (s > 0)) { if ((c >> 4) === last) { out[n++] = mv(sq, c, Q, 0); if (!capsOnly) { out[n++] = mv(sq, c, N, 0); out[n++] = mv(sq, c, R, 0); out[n++] = mv(sq, c, BI, 0); } } else out[n++] = mv(sq, c, 0, 0); }
          else if (c === ep) out[n++] = mv(sq, c, 0, 1);
        }
      } else if (t === N || t === K) {
        const ds = t === N ? KN : ALL8;
        for (let i = 0; i < 8; i++) {
          const c = sq + ds[i]; if (c & 0x88) continue;
          if (!B[c]) { if (!capsOnly) out[n++] = mv(sq, c, 0, 0); } else if ((B[c] > 0) !== (s > 0)) out[n++] = mv(sq, c, 0, 0);
        }
        if (t === K && !capsOnly) {
          if (s === 1 && sq === 4) {
            if ((castle & 1) && !B[5] && !B[6] && B[7] === R && !attacked(4, -1) && !attacked(5, -1) && !attacked(6, -1)) out[n++] = mv(4, 6, 0, 2);
            if ((castle & 2) && !B[3] && !B[2] && !B[1] && B[0] === R && !attacked(4, -1) && !attacked(3, -1) && !attacked(2, -1)) out[n++] = mv(4, 2, 0, 2);
          } else if (s === -1 && sq === 116) {
            if ((castle & 4) && !B[117] && !B[118] && B[119] === -R && !attacked(116, 1) && !attacked(117, 1) && !attacked(118, 1)) out[n++] = mv(116, 118, 0, 2);
            if ((castle & 8) && !B[115] && !B[114] && !B[113] && B[112] === -R && !attacked(116, 1) && !attacked(115, 1) && !attacked(114, 1)) out[n++] = mv(116, 114, 0, 2);
          }
        }
      } else {
        const ds = t === BI ? DIAG : t === R ? ORTH : ALL8;
        for (let i = 0; i < ds.length; i++) {
          const d = ds[i]; let c = sq + d;
          while (!(c & 0x88)) {
            if (!B[c]) { if (!capsOnly) out[n++] = mv(sq, c, 0, 0); }
            else { if ((B[c] > 0) !== (s > 0)) out[n++] = mv(sq, c, 0, 0); break; }
            c += d;
          }
        }
      }
    }
    return n;
  }
  const CMASK = new Int8Array(128).fill(15); CMASK[0] = 13; CMASK[7] = 14; CMASK[4] = 12; CMASK[112] = 7; CMASK[119] = 11; CMASK[116] = 3;
  const zp = (p, sq) => { hl ^= ZL[(p + 6) * 128 + sq]; hh ^= ZH[(p + 6) * 128 + sq]; };
  function make(m) {
    const f = mFrom(m), t = mTo(m), pr = mPromo(m), fl = mFlag(m);
    const pc = B[f]; let cap = B[t]; let capSq = t;
    if (fl & 1) { capSq = t - 16 * side; cap = B[capSq]; }
    stack.push(castle, ep, half, king[0], king[1], cap, hl, hh);
    hashHist.push(hl, hh);
    zp(pc, f); if (cap) zp(cap, capSq);
    B[f] = 0; B[capSq] = 0;
    const np = pr ? pr * side : pc; B[t] = np; zp(np, t);
    if (fl & 2) {
      let rf, rt; if (t === 6) { rf = 7; rt = 5; } else if (t === 2) { rf = 0; rt = 3; } else if (t === 118) { rf = 119; rt = 117; } else { rf = 112; rt = 115; }
      const rk = B[rf]; B[rf] = 0; B[rt] = rk; zp(rk, rf); zp(rk, rt);
    }
    if (pc === K * side) king[side === 1 ? 0 : 1] = t;
    hl ^= ZCL[castle]; hh ^= ZCH[castle];
    castle &= CMASK[f] & CMASK[t];
    hl ^= ZCL[castle]; hh ^= ZCH[castle];
    if (ep >= 0) { hl ^= ZEL[ep]; hh ^= ZEH[ep]; }
    ep = (fl & 4) ? f + 16 * side : -1;
    if (ep >= 0) { hl ^= ZEL[ep]; hh ^= ZEH[ep]; }
    half = (pc === P * side || cap) ? 0 : half + 1;
    side = -side; hl ^= ZSL; hh ^= ZSH;
  }
  function unmake(m) {
    const f = mFrom(m), t = mTo(m), pr = mPromo(m), fl = mFlag(m);
    side = -side;
    const k = stack.length - 8;
    castle = stack[k]; ep = stack[k + 1]; half = stack[k + 2]; king[0] = stack[k + 3]; king[1] = stack[k + 4]; const cap = stack[k + 5]; hl = stack[k + 6]; hh = stack[k + 7];
    stack.length = k; hashHist.length -= 2;
    const np = B[t]; B[f] = pr ? P * side : np; B[t] = 0;
    if (fl & 1) B[t - 16 * side] = cap; else B[t] = cap;
    if (fl & 2) {
      let rf, rt; if (t === 6) { rf = 7; rt = 5; } else if (t === 2) { rf = 0; rt = 3; } else if (t === 118) { rf = 119; rt = 117; } else { rf = 112; rt = 115; }
      B[rf] = B[rt]; B[rt] = 0;
    }
  }
  function makeNull() { stack.push(castle, ep, half, king[0], king[1], 0, hl, hh); hashHist.push(hl, hh); if (ep >= 0) { hl ^= ZEL[ep]; hh ^= ZEH[ep]; } ep = -1; side = -side; hl ^= ZSL; hh ^= ZSH; half++; }
  function unmakeNull() { side = -side; const k = stack.length - 8; castle = stack[k]; ep = stack[k + 1]; half = stack[k + 2]; hl = stack[k + 6]; hh = stack[k + 7]; stack.length = k; hashHist.length -= 2; }
  function isRepetition() {
    const n = hashHist.length; const lim = Math.max(0, n - half * 2);
    for (let i = n - 4; i >= lim; i -= 4) if (hashHist[i] === hl && hashHist[i + 1] === hh) return true;
    return false;
  }

  // --- 評価 ---
  function evaluate() {
    let mg = 0, eg = 0, phase = 0;
    const pawnsW = new Int8Array(8), pawnsB = new Int8Array(8);
    const minRankW = new Int8Array(8).fill(8), maxRankB = new Int8Array(8).fill(-1);
    let bishopsW = 0, bishopsB = 0, matW = 0, matB = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p) continue;
      const t = p > 0 ? p : -p, file = sq & 7, rank = sq >> 4;
      phase += PHASE[t];
      if (t === P) { if (p > 0) { pawnsW[file]++; if (rank < minRankW[file]) minRankW[file] = rank; } else { pawnsB[file]++; if (rank > maxRankB[file]) maxRankB[file] = rank; } }
      if (t === BI) { if (p > 0) bishopsW++; else bishopsB++; }
      if (t !== K && t !== P) { if (p > 0) matW += MG[t]; else matB += MG[t]; }
    }
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p) continue;
      const t = p > 0 ? p : -p, file = sq & 7, rank = sq >> 4, w = p > 0;
      const idx = w ? (7 - rank) * 8 + file : rank * 8 + file;
      let m = MG[t] + (t === K ? PST[K][idx] : PST[t][idx]);
      let e = EG[t] + (t === K ? KING_EG[idx] : t === P ? PST[P][idx] * 0.5 : PST[t][idx] * 0.6);
      if (t === P) {
        const own = w ? pawnsW : pawnsB, opp = w ? pawnsB : pawnsW;
        if (own[file] > 1) { m -= 10; e -= 18; }
        if ((file === 0 || !own[file - 1]) && (file === 7 || !own[file + 1])) { m -= 10; e -= 12; }
        let passed = true;
        for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1) && passed; f++) {
          if (w) { if (maxRankB[f] > rank) passed = false; } else { if (minRankW[f] < rank && minRankW[f] !== 8) passed = false; }
        }
        if (passed) { const r = w ? rank : 7 - rank; m += PASSED[r] * 0.5; e += PASSED[r] * 1.4; }
      } else if (t === R) {
        const own = w ? pawnsW : pawnsB, opp = w ? pawnsB : pawnsW;
        if (!own[file]) { m += opp[file] ? 10 : 22; e += opp[file] ? 6 : 12; }
        if ((w && rank === 6) || (!w && rank === 1)) { m += 12; e += 18; }
      } else if (t === N || t === BI || t === Q) {
        // 機動力（擬似合法手の数）
        let mob = 0; const ds = t === N ? KN : t === BI ? DIAG : ALL8;
        for (const d of ds) { let c = sq + d; while (!(c & 0x88)) { if (B[c] && (B[c] > 0) === w) break; mob++; if (B[c] || t === N) break; c += d; } }
        const wgt = t === N ? 4 : t === BI ? 5 : 1;
        m += (mob - (t === N ? 4 : t === BI ? 6 : 12)) * wgt; e += (mob - (t === N ? 4 : t === BI ? 6 : 12)) * wgt;
      } else if (t === K) {
        // 序中盤のポーンの盾
        const dir = w ? 16 : -16; let shield = 0;
        for (const df of [-1, 0, 1]) { const s1 = sq + dir + df, s2 = sq + 2 * dir + df; if (!(s1 & 0x88) && B[s1] === (w ? P : -P)) shield += 2; else if (!(s2 & 0x88) && B[s2] === (w ? P : -P)) shield += 1; }
        m += shield * 8;
      }
      if (w) { mg += m; eg += e; } else { mg -= m; eg -= e; }
    }
    if (bishopsW >= 2) { mg += 25; eg += 45; } if (bishopsB >= 2) { mg -= 25; eg -= 45; }
    if (phase > 24) phase = 24;
    let score = (mg * phase + eg * (24 - phase)) / 24;
    // 大差の終盤：相手キングを端へ
    const diff = matW - matB;
    if (phase <= 8 && Math.abs(diff) >= 400) {
      const win = diff > 0 ? 0 : 1; const lk = king[1 - win], wk = king[win];
      const cd = Math.max(3 - (lk & 7), (lk & 7) - 4) + Math.max(3 - (lk >> 4), (lk >> 4) - 4);
      const kd = Math.abs((lk & 7) - (wk & 7)) + Math.abs((lk >> 4) - (wk >> 4));
      score += (win === 0 ? 1 : -1) * (cd * 14 + (14 - kd) * 6);
    }
    // 駒不足
    if (!pawnsW.some(Boolean) && !pawnsB.some(Boolean) && matW <= 365 && matB <= 365) score = 0;
    return (score | 0) * side + 10;
  }
  function hasPieces() { const s = side; for (let sq = 0; sq < 128; sq++) { if (sq & 0x88) { sq += 7; continue; } const p = B[sq]; if (p && (p > 0) === (s > 0)) { const t = p > 0 ? p : -p; if (t !== P && t !== K) return true; } } return false; }

  // --- 置換表 ---
  const TT_BITS = 19, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
  const ttKey = new Int32Array(TT_SIZE), ttMove = new Int32Array(TT_SIZE), ttScore = new Int32Array(TT_SIZE);
  const ttDepth = new Int8Array(TT_SIZE), ttFlag = new Int8Array(TT_SIZE); // flag 1 exact 2 lower 3 upper
  const MAXPLY = 64;
  const moveBuf = Array.from({ length: MAXPLY + 8 }, () => new Int32Array(256));
  const scoreBuf = Array.from({ length: MAXPLY + 8 }, () => new Int32Array(256));
  const killers = new Int32Array((MAXPLY + 8) * 2);
  const history = new Int32Array(2 * 128 * 128);
  const VALS = [0, 100, 320, 330, 500, 900, 2000];

  let nodes = 0, deadline = 0, stopped = false, nodeLimit = Infinity;
  function scoreMoves(ply, n, ttm) {
    const mvs = moveBuf[ply], sc = scoreBuf[ply];
    for (let i = 0; i < n; i++) {
      const m = mvs[i];
      if (m === ttm) { sc[i] = 1e7; continue; }
      const to = mTo(m), cap = B[to] || ((mFlag(m) & 1) ? 1 : 0), pr = mPromo(m);
      if (cap || pr) sc[i] = 1e6 + (cap ? VALS[cap > 0 ? cap : -cap] * 10 : 0) - VALS[Math.abs(B[mFrom(m)])] + (pr === Q ? 9000 : 0);
      else if (m === killers[ply * 2]) sc[i] = 9e5;
      else if (m === killers[ply * 2 + 1]) sc[i] = 8e5;
      else sc[i] = history[(side === 1 ? 0 : 1) * 16384 + mFrom(m) * 128 + to];
    }
  }
  function pickNext(ply, n, i) {
    const mvs = moveBuf[ply], sc = scoreBuf[ply]; let bi = i;
    for (let j = i + 1; j < n; j++) if (sc[j] > sc[bi]) bi = j;
    if (bi !== i) { let t = mvs[i]; mvs[i] = mvs[bi]; mvs[bi] = t; t = sc[i]; sc[i] = sc[bi]; sc[bi] = t; }
    return mvs[i];
  }
  function quiesce(alpha, beta, ply) {
    nodes++;
    if ((nodes & 2047) === 0 && (Date.now() > deadline || nodes > nodeLimit)) stopped = true;
    if (stopped) return 0;
    const chk = inCheck();
    if (!chk) {
      const stand = evaluate();
      if (stand >= beta) return stand;
      if (stand + 1000 < alpha) return alpha;
      if (stand > alpha) alpha = stand;
    }
    if (ply >= MAXPLY) return evaluate();
    const n = gen(moveBuf[ply], !chk); scoreMoves(ply, n, 0);
    const me = side === 1 ? 0 : 1; let legal = 0; let best = chk ? -INF : alpha;
    for (let i = 0; i < n; i++) {
      const m = pickNext(ply, n, i);
      make(m); if (attacked(king[me], side)) { unmake(m); continue; }
      legal++;
      const s = -quiesce(-beta, -alpha, ply + 1); unmake(m);
      if (stopped) return 0;
      if (s > best) best = s;
      if (s > alpha) { alpha = s; if (alpha >= beta) break; }
    }
    if (chk && !legal) return -MATE + ply;
    return chk ? best : alpha;
  }
  function search(depth, alpha, beta, ply, allowNull) {
    if ((++nodes & 2047) === 0 && (Date.now() > deadline || nodes > nodeLimit)) stopped = true;
    if (stopped) return 0;
    if (ply > 0 && (half >= 100 || isRepetition())) return 0;
    const chk = inCheck();
    if (chk) depth++;
    if (depth <= 0) return quiesce(alpha, beta, ply);
    if (ply >= MAXPLY) return evaluate();
    // 詰みの距離で窓を絞る
    alpha = Math.max(alpha, -MATE + ply); beta = Math.min(beta, MATE - ply - 1); if (alpha >= beta) return alpha;
    const ti = hl & TT_MASK; let ttm = 0;
    if (ttKey[ti] === hh) {
      ttm = ttMove[ti];
      if (ply > 0 && ttDepth[ti] >= depth) {
        let s = ttScore[ti]; if (s > MATE - 500) s -= ply; else if (s < -MATE + 500) s += ply;
        const f = ttFlag[ti];
        if (f === 1 || (f === 2 && s >= beta) || (f === 3 && s <= alpha)) return s;
      }
    }
    const pv = beta - alpha > 1;
    if (allowNull && !chk && !pv && depth >= 3 && ply > 0 && hasPieces() && evaluate() >= beta) {
      makeNull(); const s = -search(depth - 3, -beta, -beta + 1, ply + 1, false); unmakeNull();
      if (stopped) return 0;
      if (s >= beta) return beta;
    }
    const n = gen(moveBuf[ply], false); scoreMoves(ply, n, ttm);
    const me = side === 1 ? 0 : 1; const a0 = alpha;
    let legal = 0, best = -INF, bestM = 0;
    for (let i = 0; i < n; i++) {
      const m = pickNext(ply, n, i);
      const quiet = !B[mTo(m)] && !mPromo(m) && !(mFlag(m) & 1);
      make(m); if (attacked(king[me], side)) { unmake(m); continue; }
      legal++;
      let s;
      if (legal === 1) s = -search(depth - 1, -beta, -alpha, ply + 1, true);
      else {
        let r = 0;
        if (depth >= 3 && quiet && !chk && legal > 3 && !inCheck()) r = legal > 8 ? 2 : 1;
        s = -search(depth - 1 - r, -alpha - 1, -alpha, ply + 1, true);
        if (s > alpha && r) s = -search(depth - 1, -alpha - 1, -alpha, ply + 1, true);
        if (s > alpha && s < beta) s = -search(depth - 1, -beta, -alpha, ply + 1, true);
      }
      unmake(m);
      if (stopped) return 0;
      if (s > best) { best = s; bestM = m; }
      if (s > alpha) {
        alpha = s;
        if (alpha >= beta) {
          if (quiet) { if (killers[ply * 2] !== m) { killers[ply * 2 + 1] = killers[ply * 2]; killers[ply * 2] = m; } history[(side === 1 ? 0 : 1) * 16384 + mFrom(m) * 128 + mTo(m)] += depth * depth; }
          break;
        }
      }
    }
    if (!legal) return chk ? -MATE + ply : 0;
    let st = best; if (st > MATE - 500) st += ply; else if (st < -MATE + 500) st -= ply;
    ttKey[ti] = hh; ttMove[ti] = bestM; ttScore[ti] = st; ttDepth[ti] = depth; ttFlag[ti] = best >= beta ? 2 : best > a0 ? 1 : 3;
    return best;
  }

  const SQN = (sq) => 'abcdefgh'[sq & 7] + ((sq >> 4) + 1);
  const toUci = (m) => ({ from: SQN(mFrom(m)), to: SQN(mTo(m)), promotion: mPromo(m) ? ' pnbrqk'[mPromo(m)] : undefined });
  function rootMoves() {
    const out = []; const buf = new Int32Array(256); const n = gen(buf, false); const me = side === 1 ? 0 : 1;
    for (let i = 0; i < n; i++) { make(buf[i]); if (!attacked(king[me], side)) out.push(buf[i]); unmake(buf[i]); }
    return out;
  }
  // 反復深化。noise>0 のとき根の各手を（狭めの窓で）評価してばらつかせる
  function think(opts) {
    const { maxDepth = 64, ms = 1000, noise = 0, rand = Math.random, nodeCap = Infinity } = opts;
    const root = rootMoves();
    if (!root.length) return { move: null, score: inCheck() ? -MATE : 0, depth: 0 };
    nodes = 0; stopped = false; deadline = Date.now() + ms; nodeLimit = nodeCap; killers.fill(0); history.fill(0);
    let order = root.slice(); let best = order[0], bestScore = 0, done = 0; let scored = order.map((m) => ({ m, s: 0 }));
    const me = side === 1 ? 0 : 1;
    for (let d = 1; d <= maxDepth; d++) {
      const res = []; let alpha = -INF;
      for (const m of order) {
        make(m);
        let s;
        if (noise) s = -search(d - 1, -INF, -(alpha - noise * 2), 1, true);
        else if (alpha === -INF) s = -search(d - 1, -INF, INF, 1, true);
        else { s = -search(d - 1, -alpha - 1, -alpha, 1, true); if (s > alpha && !stopped) s = -search(d - 1, -INF, -alpha, 1, true); }
        unmake(m);
        if (stopped) break;
        res.push({ m, s }); if (s > alpha) alpha = s;
      }
      if (stopped) {
        if (res.length) { const top = res.reduce((a, b) => (b.s > a.s ? b : a)); if (top.s > bestScore || d === 1) { best = top.m; bestScore = top.s; } }
        break;
      }
      res.sort((a, b) => b.s - a.s); scored = res; order = res.map((x) => x.m); best = order[0]; bestScore = res[0].s; done = d;
      if (Math.abs(bestScore) > MATE - 200 && d >= 2) break;
      if (Date.now() > deadline - ms * 0.45 && d >= 3) break; // 次の深さは間に合わない
    }
    if (noise) {
      const mateWin = scored.find((x) => x.s > MATE - 200); if (mateWin) return { move: mateWin.m, score: mateWin.s, depth: done };
      const noisy = scored.filter((x) => x.s > -MATE + 200).map((x) => ({ m: x.m, s: x.s + (rand() * 2 - 1) * noise })).sort((a, b) => b.s - a.s);
      const pickM = noisy[0] || scored[0];
      return { move: pickM.m, score: scored.find((x) => x.m === pickM.m).s, depth: done };
    }
    return { move: best, score: bestScore, depth: done };
  }
  const LEVELS = {
    1: { maxDepth: 1, ms: 300, noise: 160, blunder: 0.15 },
    2: { maxDepth: 2, ms: 600, noise: 45 },
    3: { maxDepth: 4, ms: 900, noise: 12 },
    4: { maxDepth: 64, ms: 1500 },
    5: { maxDepth: 64, ms: 3500 },
    hint: { maxDepth: 64, ms: 1200 },
  };
  function best(fen, level = 3, prev, rand = Math.random) {
    setPosition(fen, prev);
    const cfg = LEVELS[level] || LEVELS[3];
    if (cfg.blunder && rand() < cfg.blunder) { const r = rootMoves(); if (r.length) return Object.assign(toUci(r[Math.floor(rand() * r.length)]), { score: 0 }); }
    const r = think(Object.assign({ rand }, cfg));
    return r.move ? Object.assign(toUci(r.move), { score: r.score * side, depth: r.depth }) : null;
  }
  // 解析：白から見た評価値（cp）と最善手
  function analyze(fen, ms = 300, prev) {
    setPosition(fen, prev);
    const r = think({ maxDepth: 64, ms });
    const whiteScore = r.score * side;
    return { best: r.move ? toUci(r.move) : null, score: whiteScore, mate: Math.abs(r.score) > MATE - 200 ? Math.sign(whiteScore) * Math.ceil((MATE - Math.abs(r.score)) / 2) : null, depth: r.depth };
  }
  // 詰み探索（n手詰め：攻め方の手数）。最初の手で詰ませられる手の一覧を返す
  function mateIn(fen, n) {
    setPosition(fen, []);
    const out = []; const root = rootMoves();
    for (const m of root) {
      make(m);
      nodes = 0; stopped = false; deadline = Date.now() + 20000; nodeLimit = Infinity;
      const s = -search(2 * n - 1, -INF, INF, 1, false);
      unmake(m);
      if (s >= MATE - 2 * n) out.push(toUci(m));
    }
    return out;
  }
  function perft(fen, d) {
    setPosition(fen, []);
    const rec = (dd, ply) => { if (dd === 0) return 1; let c = 0; const n = gen(moveBuf[ply], false); const me = side === 1 ? 0 : 1; for (let i = 0; i < n; i++) { const m = moveBuf[ply][i]; make(m); if (!attacked(king[me], side)) c += rec(dd - 1, ply + 1); unmake(m); } return c; };
    return rec(d, 0);
  }
  return { best, analyze, mateIn, perft, evalFen: (fen) => { setPosition(fen, []); return evaluate() * side; } };
}
const ChessAI = makeChessEngine();
if (typeof module !== 'undefined') module.exports = { ChessAI, makeChessEngine };
