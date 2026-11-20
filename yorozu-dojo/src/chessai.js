/* チェスCPU：0x88盤の独自探索（ルール判定と棋譜はchess.js、ここは指し手を考えるだけ） */
const ChessAI = (() => {
  const P = 1, N = 2, BI = 3, R = 4, Q = 5, K = 6;
  const VAL = [0, 100, 320, 330, 500, 900, 0];
  const PST = [null,
    [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
  ];
  const KING_END = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];
  const KN = [33, 31, 18, 14, -33, -31, -18, -14];
  const DIAG = [15, 17, -15, -17], ORTH = [1, -1, 16, -16], ALL8 = [1, -1, 16, -16, 15, 17, -15, -17];
  const MATE = 100000, INF = 1e9;

  const B = new Int8Array(128);
  let side = 1, castle = 0, ep = -1, half = 0;
  const king = [0, 0]; // [白, 黒]
  const hist = [];

  function load(fen) {
    B.fill(0); const [pos, s, c, e, h] = fen.split(/\s+/);
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
    half = +h || 0; hist.length = 0;
  }

  function attacked(sq, by) {
    // ポーン
    const pd = by === 1 ? -16 : 16;
    for (const d of [pd - 1, pd + 1]) { const s = sq + d; if (!(s & 0x88) && B[s] === P * by) return true; }
    for (const d of KN) { const s = sq + d; if (!(s & 0x88) && B[s] === N * by) return true; }
    for (const d of ALL8) { const s = sq + d; if (!(s & 0x88) && B[s] === K * by) return true; }
    for (const d of DIAG) { let s = sq + d; while (!(s & 0x88)) { const p = B[s]; if (p) { if (p === BI * by || p === Q * by) return true; break; } s += d; } }
    for (const d of ORTH) { let s = sq + d; while (!(s & 0x88)) { const p = B[s]; if (p) { if (p === R * by || p === Q * by) return true; break; } s += d; } }
    return false;
  }
  const inCheck = () => attacked(king[side === 1 ? 0 : 1], -side);

  // 手: {f, t, pc, cap, promo, fl}  fl: 1=ep 2=castle 4=double
  function gen(capsOnly) {
    const out = []; const s = side;
    const add = (f, t, pc, cap, promo, fl) => out.push({ f, t, pc, cap, promo: promo || 0, fl: fl || 0 });
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p || Math.sign(p) !== s) continue;
      const t = Math.abs(p);
      if (t === P) {
        const fwd = sq + 16 * s; const last = s === 1 ? 7 : 0; const start = s === 1 ? 1 : 6;
        const promoRank = (x) => (x >> 4) === last;
        if (!(fwd & 0x88) && !B[fwd]) {
          if (promoRank(fwd)) { for (const pr of [Q, N, R, BI]) add(sq, fwd, p, 0, pr); }
          else if (!capsOnly) {
            add(sq, fwd, p, 0);
            const f2 = fwd + 16 * s; if ((sq >> 4) === start && !B[f2]) add(sq, f2, p, 0, 0, 4);
          }
        }
        for (const d of [15 * s, 17 * s]) {
          const c = sq + d; if (c & 0x88) continue;
          if (B[c] && Math.sign(B[c]) === -s) { if (promoRank(c)) { for (const pr of [Q, N, R, BI]) add(sq, c, p, B[c], pr); } else add(sq, c, p, B[c]); }
          else if (c === ep) add(sq, c, p, -s * P, 0, 1);
        }
      } else if (t === N || t === K) {
        for (const d of (t === N ? KN : ALL8)) {
          const c = sq + d; if (c & 0x88) continue;
          if (!B[c]) { if (!capsOnly) add(sq, c, p, 0); } else if (Math.sign(B[c]) === -s) add(sq, c, p, B[c]);
        }
        if (t === K && !capsOnly) {
          if (s === 1 && sq === 4) {
            if ((castle & 1) && !B[5] && !B[6] && B[7] === R && !attacked(4, -1) && !attacked(5, -1) && !attacked(6, -1)) add(4, 6, p, 0, 0, 2);
            if ((castle & 2) && !B[3] && !B[2] && !B[1] && B[0] === R && !attacked(4, -1) && !attacked(3, -1) && !attacked(2, -1)) add(4, 2, p, 0, 0, 2);
          } else if (s === -1 && sq === 116) {
            if ((castle & 4) && !B[117] && !B[118] && B[119] === -R && !attacked(116, 1) && !attacked(117, 1) && !attacked(118, 1)) add(116, 118, p, 0, 0, 2);
            if ((castle & 8) && !B[115] && !B[114] && !B[113] && B[112] === -R && !attacked(116, 1) && !attacked(115, 1) && !attacked(114, 1)) add(116, 114, p, 0, 0, 2);
          }
        }
      } else {
        const dirs = t === BI ? DIAG : t === R ? ORTH : ALL8;
        for (const d of dirs) {
          let c = sq + d;
          while (!(c & 0x88)) {
            if (!B[c]) { if (!capsOnly) add(sq, c, p, 0); }
            else { if (Math.sign(B[c]) === -s) add(sq, c, p, B[c]); break; }
            c += d;
          }
        }
      }
    }
    return out;
  }
  const CASTLE_MASK = new Map([[0, ~2], [7, ~1], [4, ~3], [112, ~8], [119, ~4], [116, ~12]]);
  function make(m) {
    hist.push([castle, ep, half, king[0], king[1]]);
    B[m.f] = 0;
    if (m.fl & 1) B[m.t - 16 * side] = 0;
    B[m.t] = m.promo ? m.promo * side : m.pc;
    if (m.fl & 2) {
      if (m.t === 6) { B[7] = 0; B[5] = R; } else if (m.t === 2) { B[0] = 0; B[3] = R; }
      else if (m.t === 118) { B[119] = 0; B[117] = -R; } else if (m.t === 114) { B[112] = 0; B[115] = -R; }
    }
    if (Math.abs(m.pc) === K) king[side === 1 ? 0 : 1] = m.t;
    if (CASTLE_MASK.has(m.f)) castle &= CASTLE_MASK.get(m.f);
    if (CASTLE_MASK.has(m.t)) castle &= CASTLE_MASK.get(m.t);
    ep = (m.fl & 4) ? m.f + 16 * side : -1;
    half = (Math.abs(m.pc) === P || m.cap) ? 0 : half + 1;
    side = -side;
  }
  function unmake(m) {
    side = -side;
    const h = hist.pop(); castle = h[0]; ep = h[1]; half = h[2]; king[0] = h[3]; king[1] = h[4];
    B[m.f] = m.pc;
    if (m.fl & 1) { B[m.t] = 0; B[m.t - 16 * side] = -side * P; }
    else B[m.t] = m.cap;
    if (m.fl & 2) {
      if (m.t === 6) { B[5] = 0; B[7] = R; } else if (m.t === 2) { B[3] = 0; B[0] = R; }
      else if (m.t === 118) { B[117] = 0; B[119] = -R; } else if (m.t === 114) { B[115] = 0; B[112] = -R; }
    }
  }
  function legalMoves() {
    const res = []; const me = side === 1 ? 0 : 1;
    for (const m of gen(false)) { make(m); if (!attacked(king[me], side)) res.push(m); unmake(m); }
    return res;
  }
  function perft(d) {
    if (d === 0) return 1; let n = 0; const me = side === 1 ? 0 : 1;
    for (const m of gen(false)) { make(m); if (!attacked(king[me], side)) n += perft(d - 1); unmake(m); }
    return n;
  }

  function evaluate() {
    let score = 0, mat = [0, 0], nonPawn = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p) continue;
      const t = Math.abs(p); if (t !== P && t !== K) nonPawn += VAL[t];
      if (t !== K) mat[p > 0 ? 0 : 1] += VAL[t];
    }
    const endgame = nonPawn <= 2600;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = B[sq]; if (!p) continue;
      const t = Math.abs(p); const rank = sq >> 4, file = sq & 7;
      const idx = p > 0 ? (7 - rank) * 8 + file : rank * 8 + file;
      const ps = t === K && endgame ? KING_END[idx] : PST[t][idx];
      score += (p > 0 ? 1 : -1) * (VAL[t] + ps);
    }
    // 大差の終盤：負けている側のキングを端へ追い込む
    const diff = mat[0] - mat[1];
    if (endgame && Math.abs(diff) >= 300) {
      const win = diff > 0 ? 0 : 1; const lk = king[1 - win], wk = king[win];
      const cd = Math.max(3 - (lk & 7), (lk & 7) - 4) + Math.max(3 - (lk >> 4), (lk >> 4) - 4);
      const kd = Math.abs((lk & 7) - (wk & 7)) + Math.abs((lk >> 4) - (wk >> 4));
      score += (win === 0 ? 1 : -1) * (cd * 12 + (14 - kd) * 5);
    }
    return score * side;
  }

  let nodes = 0, deadline = 0, stopped = false;
  const mvvlva = (m) => (m.cap ? VAL[Math.abs(m.cap)] * 10 - VAL[Math.abs(m.pc)] : 0) + (m.promo ? 800 : 0);
  function quiesce(alpha, beta, qd) {
    nodes++;
    const stand = evaluate();
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (qd >= 6) return alpha;
    const me = side === 1 ? 0 : 1;
    const ms = gen(true).sort((a, b) => mvvlva(b) - mvvlva(a));
    for (const m of ms) {
      make(m); if (attacked(king[me], side)) { unmake(m); continue; }
      const s = -quiesce(-beta, -alpha, qd + 1); unmake(m);
      if (s >= beta) return beta;
      if (s > alpha) alpha = s;
    }
    return alpha;
  }
  function search(depth, alpha, beta, ply) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) stopped = true;
    if (stopped) return 0;
    const chk = inCheck();
    if (chk) depth++;
    if (depth <= 0) return quiesce(alpha, beta, 0);
    if (half >= 100) return 0;
    const me = side === 1 ? 0 : 1;
    const ms = gen(false).sort((a, b) => mvvlva(b) - mvvlva(a));
    let legal = 0, best = -INF;
    for (const m of ms) {
      make(m); if (attacked(king[me], side)) { unmake(m); continue; }
      legal++;
      const s = -search(depth - 1, -beta, -alpha, ply + 1); unmake(m);
      if (stopped) return 0;
      if (s > best) best = s;
      if (s > alpha) { alpha = s; if (alpha >= beta) break; }
    }
    if (!legal) return chk ? -MATE + ply : 0;
    return best;
  }

  const SQN = (sq) => 'abcdefgh'[sq & 7] + ((sq >> 4) + 1);
  const toUci = (m) => ({ from: SQN(m.f), to: SQN(m.t), promotion: m.promo ? ' pnbrqk'[m.promo] : undefined });

  // level: 1 入門 / 2 初級 / 3 中級 / 4 ヒント用
  function best(fen, level = 2, rand = Math.random) {
    load(fen);
    const root = legalMoves();
    if (!root.length) return null;
    if (level === 1 && rand() < 0.15) return toUci(root[Math.floor(rand() * root.length)]);
    nodes = 0; stopped = false;
    const cfg = { 1: { depth: 1, noise: 140, ms: 400 }, 2: { depth: 2, noise: 35, ms: 800 }, 3: { depth: 5, noise: 6, ms: 1200 }, 4: { depth: 5, noise: 0, ms: 1000 } }[level] || { depth: 2, noise: 30, ms: 800 };
    deadline = Date.now() + cfg.ms;
    let order = root.slice().sort((a, b) => mvvlva(b) - mvvlva(a));
    let bestMove = order[0], scored = order.map((m) => ({ m, s: 0 }));
    for (let d = 1; d <= cfg.depth; d++) {
      const res = []; let alpha = -INF;
      for (const m of order) {
        make(m);
        // ノイズを公平に効かせるため、根では窓を少し広めにとる
        const s = -search(d - 1, -INF, -(alpha - cfg.noise * 2), 1);
        unmake(m);
        if (stopped) break;
        res.push({ m, s });
        if (s > alpha) alpha = s;
      }
      if (stopped) { if (d === 1 && res.length) { res.sort((a, b) => b.s - a.s); scored = res; bestMove = res[0].m; } break; }
      res.sort((a, b) => b.s - a.s); scored = res; order = res.map((x) => x.m); bestMove = order[0];
      if (Math.abs(res[0].s) > MATE - 100) break;
    }
    if (cfg.noise) {
      const noisy = scored.map((x) => ({ m: x.m, s: x.s + (rand() * 2 - 1) * cfg.noise }));
      // 詰みは逃さない・詰まされる手は避ける
      const mateWin = scored.find((x) => x.s > MATE - 100); if (mateWin) return toUci(mateWin.m);
      noisy.sort((a, b) => b.s - a.s);
      const pickM = noisy.find((x) => (scored.find((y) => y.m === x.m).s > -MATE + 100)) || noisy[0];
      return toUci(pickM.m);
    }
    return toUci(bestMove);
  }
  function evalFen(fen) { load(fen); return evaluate() * side; }

  return { best, perft: (fen, d) => { load(fen); return perft(d); }, evalFen, legalCount: (fen) => { load(fen); return legalMoves().length; } };
})();
if (typeof module !== 'undefined') module.exports = ChessAI;
