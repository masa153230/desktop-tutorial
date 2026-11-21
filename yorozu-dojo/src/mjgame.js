/* 麻雀フリープレイ v2：一般的なリーチ麻雀（雀魂・天鳳に近いルール）
 * 鳴き（チー・ポン・明槓・暗槓・加槓）、赤ドラ3枚、槓ドラ・槓裏、嶺上開花、槍槓、喰いタン・後付けあり、喰い替え禁止、
 * ダブロンあり（三家和は流局）、九種九牌・四風連打・四家立直・四槓散了、流し満貫、ダブル役満（四暗刻単騎・国士13面・純正九蓮・大四喜）、
 * 東風戦／半荘戦（25000持ち30000返し、ウマ10-30、トビあり、オーラス親の上がり止め・聴牌止めあり）
 * 牌は 0..135 のID（種類 = id>>2）。赤は 16(5萬) 52(5筒) 88(5索)。
 */
const MJG = (() => {
  const YAO = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
  const isYao = (i) => i >= 27 || i % 9 === 0 || i % 9 === 8;
  const WIND = ['東', '南', '西', '北'];
  const GREEN = new Set([19, 20, 21, 23, 25, 32]);
  const RED = new Set([16, 52, 88]);
  const T = (id) => id >> 2;
  const counts = (types) => { const c = new Array(34).fill(0); for (const t of types) c[t]++; return c; };
  const countsId = (ids) => { const c = new Array(34).fill(0); for (const id of ids) c[id >> 2]++; return c; };

  // ---------- 向聴数 ----------
  const memo = new Map();
  function pareto(list) {
    const out = [];
    for (const [m, t] of list) {
      if (out.some(([m2, t2]) => m2 >= m && t2 >= t)) continue;
      for (let k = out.length - 1; k >= 0; k--) if (m >= out[k][0] && t >= out[k][1]) out.splice(k, 1);
      out.push([m, t]);
    }
    return out;
  }
  function suitF(a) {
    const key = a.join(''); const hit = memo.get(key); if (hit) return hit;
    let i = 0; while (i < 9 && a[i] === 0) i++;
    let out;
    if (i === 9) out = [[0, 0]];
    else {
      const cand = [];
      const sub = (dm, dt) => { for (const [m, t] of suitF(a)) cand.push([m + dm, t + dt]); };
      if (a[i] >= 3) { a[i] -= 3; sub(1, 0); a[i] += 3; }
      if (i <= 6 && a[i + 1] && a[i + 2]) { a[i]--; a[i + 1]--; a[i + 2]--; sub(1, 0); a[i]++; a[i + 1]++; a[i + 2]++; }
      if (a[i] >= 2) { a[i] -= 2; sub(0, 1); a[i] += 2; }
      if (i <= 7 && a[i + 1]) { a[i]--; a[i + 1]--; sub(0, 1); a[i]++; a[i + 1]++; }
      if (i <= 6 && a[i + 2]) { a[i]--; a[i + 2]--; sub(0, 1); a[i]++; a[i + 2]++; }
      a[i]--; sub(0, 0); a[i]++;
      out = pareto(cand);
    }
    memo.set(key, out); return out;
  }
  function shantenStd(c, k) {
    let best = 8;
    const calc = (head) => {
      const L0 = suitF(c.slice(0, 9)), L1 = suitF(c.slice(9, 18)), L2 = suitF(c.slice(18, 27));
      let hm = 0, ht = 0;
      for (let z = 27; z < 34; z++) { if (c[z] >= 3) hm++; else if (c[z] === 2) ht++; }
      for (const [m1, t1] of L0) for (const [m2, t2] of L1) for (const [m3, t3] of L2) {
        const m = Math.min(4 - k, m1 + m2 + m3 + hm), t = t1 + t2 + t3 + ht;
        const s = 8 - 2 * (m + k) - Math.min(t, 4 - m - k) - head;
        if (s < best) best = s;
      }
    };
    calc(0);
    for (let i = 0; i < 34; i++) if (c[i] >= 2) { c[i] -= 2; calc(1); c[i] += 2; }
    return best;
  }
  function shanten(c, k = 0) {
    let s = shantenStd(c, k);
    if (k === 0) {
      let pairs = 0, kinds = 0;
      for (let i = 0; i < 34; i++) { if (c[i] >= 1) kinds++; if (c[i] >= 2) pairs++; }
      s = Math.min(s, 6 - pairs + Math.max(0, 7 - kinds));
      let yk = 0, yp = 0; for (const i of YAO) { if (c[i]) yk++; if (c[i] >= 2) yp = 1; }
      s = Math.min(s, 13 - yk - yp);
    }
    return s;
  }
  function waits(c, k = 0) {
    const out = [];
    for (let t = 0; t < 34; t++) { if (c[t] >= 4) continue; c[t]++; if (shanten(c, k) === -1) out.push(t); c[t]--; }
    return out;
  }

  // ---------- 役・符・点数 ----------
  function doraOf(ind) { if (ind < 27) return Math.floor(ind / 9) * 9 + (ind % 9 + 1) % 9; if (ind < 31) return 27 + (ind - 27 + 1) % 4; return 31 + (ind - 31 + 1) % 3; }
  function decomps(c) {
    const out = [];
    const rec = (i, melds, p) => {
      while (i < 34 && c[i] === 0) i++;
      if (i === 34) { out.push({ pair: p, melds: melds.slice() }); return; }
      if (c[i] >= 3) { c[i] -= 3; melds.push({ t: 'k', i }); rec(i, melds, p); melds.pop(); c[i] += 3; }
      if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2]) { c[i]--; c[i + 1]--; c[i + 2]--; melds.push({ t: 's', i }); rec(i, melds, p); melds.pop(); c[i]++; c[i + 1]++; c[i + 2]++; }
    };
    for (let p = 0; p < 34; p++) if (c[p] >= 2) { c[p] -= 2; rec(0, [], p); c[p] += 2; }
    return out;
  }
  function placements(d, win) {
    const out = []; const seen = new Set();
    const push = (o) => { const k = o.wait + o.at; if (!seen.has(k)) { seen.add(k); out.push(o); } };
    if (d.pair === win) push({ wait: 'tanki', at: win });
    for (const m of d.melds) {
      if (m.t === 'k' && m.i === win) push({ wait: 'shanpon', at: win });
      if (m.t === 's' && win >= m.i && win <= m.i + 2) {
        const pos = win - m.i, n = m.i % 9;
        push({ wait: pos === 1 ? 'kanchan' : pos === 0 ? (n === 6 ? 'penchan' : 'ryanmen') : (n === 0 ? 'penchan' : 'ryanmen'), at: m.i });
      }
    }
    return out;
  }
  const ceil100 = (x) => Math.ceil(x / 100) * 100;
  function payment(han, fu, yakuman, dealer) {
    let base, limit = '';
    if (yakuman) { base = 8000 * yakuman; limit = yakuman > 1 ? (yakuman === 2 ? 'ダブル役満' : `${yakuman}倍役満`) : '役満'; }
    else if (han >= 13) { base = 8000; limit = '数え役満'; }
    else if (han >= 11) { base = 6000; limit = '三倍満'; }
    else if (han >= 8) { base = 4000; limit = '倍満'; }
    else if (han >= 6) { base = 3000; limit = '跳満'; }
    else if (han >= 5) { base = 2000; limit = '満貫'; }
    else { base = fu * 2 ** (han + 2); if (base >= 2000) { base = 2000; limit = '満貫'; } }
    const ron = ceil100(base * (dealer ? 6 : 4));
    const tsumoDealer = ceil100(base * 2), tsumoChild = ceil100(base);
    return { base, limit, ron, tsumoDealer, tsumoChild, tsumoTotal: dealer ? tsumoDealer * 3 : tsumoDealer + tsumoChild * 2 };
  }
  function allOf(c, f) { for (let i = 0; i < 34; i++) if (c[i] && !f(i)) return false; return true; }

  // c: 手の中の牌（和了牌込み）の種類カウント。melds: [{kind, t}]（t = 最小の種類）。ctx: 状況
  function evaluateWin(c, melds, ctx) {
    melds = melds || [];
    const full = c.slice();
    for (const m of melds) { if (m.kind === 'chi') { full[m.t]++; full[m.t + 1]++; full[m.t + 2]++; } else full[m.t] += m.kind === 'pon' ? 3 : 4; }
    const open = melds.some((m) => m.kind !== 'ankan');
    const res = [];
    if (!melds.length) {
      if (YAO.every((i) => c[i] >= 1) && YAO.some((i) => c[i] === 2)) {
        const thirteen = c[ctx.win] === 2; // 13面待ち
        res.push(finish([[thirteen ? '国士無双十三面待ち' : '国士無双', 13]], thirteen && ctx.dbl !== false ? 2 : 1, 0, full, ctx, { form: 'kokushi' }));
      }
      if (c.filter((x) => x === 2).length === 7) {
        const y = situational(ctx, false);
        if (allOf(c, (i) => i >= 27)) res.push(finish([['字一色', 13], ...y.filter((x) => x[1] === 13)], 1 + y.filter((x) => x[1] === 13).length, 25, full, ctx, { form: 'chiitoi' }));
        const yy = y.filter((x) => x[1] < 13); yy.push(['七対子', 2]);
        if (allOf(c, (i) => !isYao(i))) yy.push(['断幺九', 1]);
        if (allOf(c, isYao)) yy.push(['混老頭', 2]);
        colorYaku(full, yy, false);
        res.push(finish(yy, 0, 25, full, ctx, { form: 'chiitoi' }));
      }
    }
    for (const d of decomps(c)) for (const pl of placements(d, ctx.win)) res.push(scoreStd(c, full, d, pl, melds, open, ctx));
    const ok = res.filter(Boolean);
    if (!ok.length) return null;
    ok.sort((a, b) => b.total - a.total || b.han - a.han || b.fu - a.fu);
    return ok[0];
  }
  function situational(ctx, open) {
    const y = [];
    if (ctx.tenhou) y.push(['天和', 13]);
    if (ctx.chiihou) y.push(['地和', 13]);
    if (!open) {
      if (ctx.doubleRiichi) y.push(['ダブル立直', 2]); else if (ctx.riichi) y.push(['立直', 1]);
      if (ctx.ippatsu) y.push(['一発', 1]);
      if (ctx.tsumo) y.push(['門前清自摸和', 1]);
    }
    if (ctx.rinshan) y.push(['嶺上開花', 1]);
    if (ctx.chankan) y.push(['槍槓', 1]);
    if (ctx.haitei) y.push(['海底摸月', 1]);
    if (ctx.houtei) y.push(['河底撈魚', 1]);
    return y;
  }
  function colorYaku(full, y, open) {
    const suits = new Set(); let honors = 0;
    for (let i = 0; i < 34; i++) if (full[i]) { if (i >= 27) honors++; else suits.add(Math.floor(i / 9)); }
    if (suits.size === 1 && !honors) y.push(['清一色', open ? 5 : 6]);
    else if (suits.size === 1 && honors) y.push(['混一色', open ? 2 : 3]);
  }
  function finish(y, yakuman, fu, full, ctx, extra) {
    const yakuHan = y.reduce((a, [, h]) => a + h, 0);
    if (!yakuman && yakuHan === 0) return null;
    let dora = 0, ura = 0;
    if (!yakuman) {
      for (const ind of ctx.doraInd || []) dora += full[doraOf(ind)];
      if (ctx.riichi) for (const ind of ctx.uraInd || []) ura += full[doraOf(ind)];
    }
    const aka = yakuman ? 0 : (ctx.aka || 0);
    const han = yakuman ? 13 * yakuman : yakuHan + dora + ura + aka;
    const pay = payment(han, fu, yakuman, ctx.dealer);
    const yaku = y.slice();
    if (dora) yaku.push(['ドラ', dora]);
    if (aka) yaku.push(['赤ドラ', aka]);
    if (ura) yaku.push(['裏ドラ', ura]);
    return Object.assign({ yaku, yakuman, han, fu, dora, ura, aka, pay, total: ctx.tsumo ? pay.tsumoTotal : pay.ron }, extra);
  }
  function scoreStd(c, full, d, pl, melds, open, ctx) {
    const isYakuhai = (z) => z >= 31 || z === 27 + ctx.seat || z === 27 + ctx.round;
    const handSeqs = d.melds.filter((m) => m.t === 's').map((m) => m.i);
    const handTrips = d.melds.filter((m) => m.t === 'k').map((m) => m.i);
    const seqs = [...handSeqs, ...melds.filter((m) => m.kind === 'chi').map((m) => m.t)];
    const trips = [...handTrips, ...melds.filter((m) => m.kind !== 'chi').map((m) => m.t)];
    const kans = melds.filter((m) => m.kind === 'minkan' || m.kind === 'ankan' || m.kind === 'kakan').length;
    const ronTrip = !ctx.tsumo && pl.wait === 'shanpon';
    const ankou = handTrips.length - (ronTrip ? 1 : 0) + melds.filter((m) => m.kind === 'ankan').length;
    const pair = d.pair, wait = pl.wait;
    const dbl = ctx.dbl !== false;
    // 役満
    const ym = []; let mult = 0;
    const addY = (n, x) => { ym.push([n, 13]); mult += x; };
    for (const [n, h] of situational(ctx, open)) if (h === 13) addY(n, 1);
    if (ankou === 4) addY(wait === 'tanki' ? '四暗刻単騎' : '四暗刻', wait === 'tanki' && dbl ? 2 : 1);
    if ([31, 32, 33].every((z) => trips.includes(z))) addY('大三元', 1);
    if (allOf(full, (i) => i >= 27)) addY('字一色', 1);
    if (allOf(full, (i) => GREEN.has(i))) addY('緑一色', 1);
    if (allOf(full, (i) => i < 27 && isYao(i))) addY('清老頭', 1);
    const windTrips = trips.filter((z) => z >= 27 && z <= 30).length;
    if (windTrips === 4) addY('大四喜', dbl ? 2 : 1); else if (windTrips === 3 && pair >= 27 && pair <= 30) addY('小四喜', 1);
    if (kans === 4) addY('四槓子', 1);
    if (!melds.length) for (const s of [0, 9, 18]) {
      if (!allOf(full, (i) => i >= s && i < s + 9)) continue;
      if (c[s] >= 3 && c[s + 8] >= 3 && [1, 2, 3, 4, 5, 6, 7].every((k) => c[s + k] >= 1)) {
        const pre = c.slice(); pre[ctx.win]--;
        const pure = pre[s] === 3 && pre[s + 8] === 3 && [1, 2, 3, 4, 5, 6, 7].every((k) => pre[s + k] === 1);
        addY(pure ? '純正九蓮宝燈' : '九蓮宝燈', pure && dbl ? 2 : 1);
      }
    }
    if (ym.length) return finish(ym, mult, 0, full, ctx, { form: 'std', wait, decomp: d });
    // 通常役
    const y = situational(ctx, open).filter((x) => x[1] < 13);
    if (allOf(full, (i) => !isYao(i)) && (ctx.kuitan !== false || !open)) y.push(['断幺九', 1]);
    const pinfu = !melds.length && seqs.length === 4 && !isYakuhai(pair) && wait === 'ryanmen';
    if (pinfu) y.push(['平和', 1]);
    if (!open) {
      const sc = {}; handSeqs.forEach((s) => { sc[s] = (sc[s] || 0) + 1; });
      const peiko = Object.values(sc).reduce((a, n) => a + Math.floor(n / 2), 0);
      if (peiko === 2) y.push(['二盃口', 3]); else if (peiko === 1) y.push(['一盃口', 1]);
    }
    for (const z of trips) {
      if (z === 31) y.push(['役牌 白', 1]); if (z === 32) y.push(['役牌 發', 1]); if (z === 33) y.push(['役牌 中', 1]);
      if (z === 27 + ctx.round) y.push(['場風 ' + WIND[ctx.round], 1]);
      if (z === 27 + ctx.seat) y.push(['自風 ' + WIND[ctx.seat], 1]);
    }
    for (let n = 0; n < 7; n++) if (seqs.includes(n) && seqs.includes(n + 9) && seqs.includes(n + 18)) { y.push(['三色同順', open ? 1 : 2]); break; }
    for (const s of [0, 9, 18]) if (seqs.includes(s) && seqs.includes(s + 3) && seqs.includes(s + 6)) { y.push(['一気通貫', open ? 1 : 2]); break; }
    const sets = [...seqs.map((s) => [s, s + 2]), ...trips.map((z) => [z]), [pair]];
    const honorsIn = full.slice(27).some((x) => x > 0);
    if (seqs.length && sets.every((st) => st.some(isYao))) y.push(honorsIn ? ['混全帯幺九', open ? 1 : 2] : ['純全帯幺九', open ? 2 : 3]);
    if (trips.length === 4) y.push(['対々和', 2]);
    if (ankou === 3) y.push(['三暗刻', 2]);
    if (kans === 3) y.push(['三槓子', 2]);
    for (let n = 0; n < 9; n++) if (trips.includes(n) && trips.includes(n + 9) && trips.includes(n + 18)) y.push(['三色同刻', 2]);
    if (trips.filter((z) => z >= 31).length === 2 && pair >= 31) y.push(['小三元', 2]);
    if (allOf(full, isYao) && honorsIn && !allOf(full, (i) => i >= 27)) y.push(['混老頭', 2]);
    colorYaku(full, y, open);
    // 符
    let fu; const fuParts = [];
    if (pinfu) { fu = ctx.tsumo ? 20 : 30; fuParts.push(ctx.tsumo ? '平和ツモ 20符' : '平和ロン 30符'); }
    else {
      fu = 20; fuParts.push('副底 20');
      if (ctx.tsumo) { fu += 2; fuParts.push('ツモ 2'); } else if (!open) { fu += 10; fuParts.push('門前ロン 10'); }
      for (const z of handTrips) {
        const mk = ronTrip && z === pl.at; const v = (isYao(z) ? 4 : 2) * (mk ? 1 : 2); fu += v;
        fuParts.push(`${mk ? '明刻' : '暗刻'}${isYao(z) ? '（么九）' : ''} ${v}`);
      }
      for (const m of melds) {
        if (m.kind === 'chi') continue;
        const base = isYao(m.t) ? 4 : 2; const mul = m.kind === 'pon' ? 1 : m.kind === 'ankan' ? 8 : 4; const v = base * mul; fu += v;
        fuParts.push(`${{ pon: '明刻', minkan: '明槓', kakan: '明槓', ankan: '暗槓' }[m.kind]}${isYao(m.t) ? '（么九）' : ''} ${v}`);
      }
      let pf = 0; if (pair >= 31) pf += 2; if (pair === 27 + ctx.seat) pf += 2; if (pair === 27 + ctx.round) pf += 2;
      if (pf) { fu += pf; fuParts.push('役牌の雀頭 ' + pf); }
      if (wait === 'kanchan' || wait === 'penchan' || wait === 'tanki') { fu += 2; fuParts.push({ kanchan: '嵌張待ち', penchan: '辺張待ち', tanki: '単騎待ち' }[wait] + ' 2'); }
      fu = Math.ceil(fu / 10) * 10;
      if (open && fu === 20) { fu = 30; fuParts.push('鳴きの平和形 → 30符'); }
    }
    return finish(y, 0, fu, full, ctx, { form: 'std', wait, decomp: d, fuParts });
  }

  // ---------- 対局 ----------
  const sortIds = (a) => a.sort((x, y) => x - y);
  const LEN = { single: 1, tonpu: 4, hanchan: 8 };
  class Game {
    constructor(o) {
      this.rules = Object.assign({ length: 'tonpu', aka: true, dbl: true, kuitan: true, uma: [30, 10, -10, -30], start: 25000, back: 30000 }, o.rules || {});
      this.rand = o.rand || Math.random;
      this.agents = o.agents;
      this.hooks = Object.assign({ emit() {}, sleep: () => Promise.resolve(), pause: () => Promise.resolve() }, o.hooks || {});
      this.scores = [0, 1, 2, 3].map(() => this.rules.start);
      this.honba = 0; this.sticks = 0;
      this.dealer = Math.floor(this.rand() * 4); this.startDealer = this.dealer;
      this.rotations = 0; this.handNo = 0; this.over = false; this.aborted = false;
      this.stats = { agari: [0, 0, 0, 0], houju: [0, 0, 0, 0], riichi: [0, 0, 0, 0], calls: [0, 0, 0, 0], hands: 0, aborts: 0 };
      if (o.resume) { const r = o.resume; Object.assign(this, { scores: r.scores.slice(), honba: r.honba, sticks: r.sticks, dealer: r.dealer, startDealer: r.startDealer, rotations: r.rotations, handNo: r.handNo, stats: JSON.parse(JSON.stringify(r.stats)) }); }
    }
    // 局の始まりの状態（この局から再開できる）
    snapshot() {
      const st = JSON.parse(JSON.stringify(this.stats)); st.hands = Math.max(0, st.hands - 1);
      return { rules: this.rules, scores: this.scores.slice(), honba: this.honba, sticks: this.sticks, dealer: this.dealer, startDealer: this.startDealer, rotations: this.rotations, handNo: this.handNo - 1, stats: st, kyoku: this.kyokuName() };
    }
    get round() { return Math.min(3, Math.floor(this.rotations / 4)); }
    seatWind(s) { return (s - this.dealer + 4) % 4; }
    kyokuName() { return `${WIND[this.round]}${(this.dealer - this.startDealer + 4) % 4 + 1}局`; }
    isRed(id) { return this.rules.aka && RED.has(id); }
    async run() {
      while (!this.over && !this.aborted) await this.playHand();
      if (this.aborted) return null;
      const order = [0, 1, 2, 3].map((k) => (this.startDealer + k) % 4);
      const rank = order.slice().sort((a, b) => this.scores[b] - this.scores[a] || order.indexOf(a) - order.indexOf(b));
      if (this.sticks) { this.scores[rank[0]] += this.sticks * 1000; this.sticks = 0; }
      const R = this.rules; const oka = (R.back - R.start) * 4 / 1000;
      const pts = [0, 0, 0, 0];
      rank.forEach((s, i) => { pts[s] = Math.round(((this.scores[s] - R.back) / 1000 + R.uma[i] + (i === 0 ? oka : 0)) * 10) / 10; });
      this.final = { type: 'end', rank, scores: this.scores.slice(), pts };
      await this.hooks.pause(this.final);
      return this.final;
    }
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    // 手牌（副露を除いた）カウント
    hc(seat) { return countsId(this.players[seat].hand); }
    akaOf(seat, extraId) {
      const p = this.players[seat]; let n = 0;
      for (const id of p.hand) if (this.isRed(id)) n++;
      for (const m of p.melds) for (const id of m.ids) if (this.isRed(id)) n++;
      if (extraId != null && this.isRed(extraId)) n++;
      return n;
    }
    meldInfo(seat) { return this.players[seat].melds.map((m) => ({ kind: m.kind, t: m.t })); }
    closed(seat) { return this.players[seat].melds.every((m) => m.kind === 'ankan'); }
    async playHand() {
      const all = []; for (let id = 0; id < 136; id++) all.push(id);
      this.shuffle(all);
      // サイコロは山を割る位置を決めるだけ（牌はシャッフル済み）。対局の乱数は使わない
      this.dice = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
      this.dead = all.slice(122); this.live = all.slice(0, 122);
      this.doraInd = [T(this.dead[4])]; this.uraInd = [T(this.dead[5])];
      this.rinshanIdx = 0; this.kanCount = 0; this.kanBy = [0, 0, 0, 0];
      this.players = [0, 1, 2, 3].map(() => ({ hand: [], melds: [], river: [], riichi: false, dbl: false, ippatsu: false, furitenTemp: false, furitenRiichi: false, drawn: null, safe: null, kuikae: [], firstTurn: true, nagashi: true }));
      for (let k = 0; k < 4; k++) { const p = this.players[(this.dealer + k) % 4]; p.hand = sortIds(this.live.splice(0, 13)); }
      this.noCalls = true; this.discards = 0; this.lastDiscard = null; this.result = null; this.handNo++; this.stats.hands++;
      this.turn = this.dealer;
      this.hooks.emit('start');
      await this.hooks.sleep('start');
      let seat = this.dealer, mode = 'normal';
      while (!this.aborted) {
        const p = this.players[seat]; this.turn = seat;
        if (mode === 'normal') { if (!this.live.length) return this.exhaustive(); p.drawn = this.live.shift(); p.hand.push(p.drawn); }
        else if (mode === 'rinshan') { p.drawn = this.dead[this.rinshanIdx++]; p.hand.push(p.drawn); }
        else p.drawn = null;
        this.rinshanNow = mode === 'rinshan';
        this.hooks.emit('draw', seat);
        // 自分の番の行動（カンは繰り返しうる）
        let act;
        for (;;) {
          const opts = this.turnOptions(seat, mode);
          act = await this.agents[seat].onTurn(this, seat, opts);
          if (this.aborted) return;
          if (act && act.type === 'tsumo' && opts.tsumo) return this.settleWin([seat], null, p.drawn, true);
          if (act && act.type === 'kyuushu' && opts.kyuushu) return this.abortive('九種九牌');
          if (act && (act.type === 'ankan' || act.type === 'kakan') && opts[act.type].includes(act.t)) {
            const robbed = await this.kan(seat, act.type, act.t);
            if (robbed) return;
            if (this.aborted) return;
            p.drawn = this.dead[this.rinshanIdx++]; p.hand.push(p.drawn); mode = 'rinshan'; this.rinshanNow = true;
            this.hooks.emit('draw', seat);
            continue;
          }
          break;
        }
        // 打牌
        const opts = this.turnOptions(seat, mode);
        let id = act && act.type === 'discard' ? act.id : null;
        if (p.riichi) id = p.drawn;
        if (id == null || !p.hand.includes(id) || (opts.forbidden.includes(T(id)) && p.hand.some((x) => !opts.forbidden.includes(T(x))))) id = this.fallbackDiscard(seat, opts);
        const declaring = !!(act && act.riichi) && opts.riichi.includes(id);
        const tsumogiri = id === p.drawn;
        p.hand.splice(p.hand.indexOf(id), 1); sortIds(p.hand); p.drawn = null; this.rinshanNow = false;
        if (p.riichi) p.ippatsu = false;
        p.river.push({ id, riichi: declaring, tsumogiri, called: false });
        if (!isYao(T(id))) p.nagashi = false;
        if (declaring) { p.riichi = true; p.dbl = this.noCalls && p.firstTurn; p.ippatsu = true; p.safe = new Set(p.river.map((r) => T(r.id))); this.stats.riichi[seat]++; }
        p.firstTurn = false; p.kuikae = [];
        if (!p.furitenRiichi) p.furitenTemp = false;
        this.lastDiscard = { seat, id };
        for (const q of this.players) if (q.riichi && q.safe) q.safe.add(T(id));
        this.discards++;
        this.hooks.emit('discard', seat);
        await this.hooks.sleep('discard', seat);
        if (this.aborted) return;
        // ロン
        const ronners = [];
        for (let k = 1; k <= 3; k++) {
          const q = (seat + k) % 4;
          if (!this.canRon(q, id)) continue;
          const yes = await this.agents[q].onRon(this, q, id);
          if (this.aborted) return;
          if (yes) ronners.push(q); else { const qq = this.players[q]; if (qq.riichi) qq.furitenRiichi = true; else qq.furitenTemp = true; }
        }
        if (ronners.length === 3) { if (declaring) p.riichi = false; return this.abortive('三家和'); }
        if (ronners.length) { if (declaring) p.riichi = false; return this.settleWin(ronners, seat, id, false); }
        if (declaring) { this.scores[seat] -= 1000; this.sticks++; this.hooks.emit('riichi', seat); }
        if (this.players.every((q) => q.riichi)) return this.abortive('四家立直');
        if (this.noCalls && this.discards === 4) {
          const firsts = this.players.map((q) => T(q.river[0].id));
          if (firsts[0] >= 27 && firsts[0] <= 30 && firsts.every((x) => x === firsts[0])) return this.abortive('四風連打');
        }
        if (this.kanCount === 4 && this.kanBy.filter(Boolean).length > 1) return this.abortive('四槓散了');
        // 鳴き
        if (this.live.length) {
          const call = await this.collectCalls(seat, id);
          if (this.aborted) return;
          if (call) { seat = call.seat; mode = call.kind === 'minkan' ? 'rinshan' : 'none'; continue; }
        }
        seat = (seat + 1) % 4; mode = 'normal';
      }
    }
    fallbackDiscard(seat, opts) {
      const p = this.players[seat];
      const ok = p.hand.filter((x) => !opts.forbidden.includes(T(x)));
      return p.drawn != null && ok.includes(p.drawn) ? p.drawn : (ok[ok.length - 1] ?? p.hand[p.hand.length - 1]);
    }
    turnOptions(seat, mode) {
      const p = this.players[seat]; const c = this.hc(seat); const k = p.melds.length;
      const o = { tsumo: false, riichi: [], ankan: [], kakan: [], kyuushu: false, forbidden: p.kuikae.slice(), canDiscard: true };
      if (mode === 'none') return o;
      o.tsumo = this.canTsumo(seat);
      if (!p.riichi && this.closed(seat) && this.scores[seat] >= 1000 && this.live.length >= 4) {
        for (const id of p.hand) { const t = T(id); c[t]--; if (shanten(c, k) === 0) o.riichi.push(id); c[t]++; }
      }
      if (this.kanCount < 4 && this.live.length > 0) {
        for (let t = 0; t < 34; t++) if (c[t] === 4) {
          if (p.riichi) {
            if (T(p.drawn) !== t) continue;
            const before = waits(this.hcMinus(seat, p.drawn), k).join(',');
            const c2 = c.slice(); c2[t] = 0;
            if (!this.ankanKeepsShape(c2, k + 1, before)) continue;
          }
          o.ankan.push(t);
        }
        if (!p.riichi) for (const m of p.melds) if (m.kind === 'pon' && c[m.t] >= 1) o.kakan.push(m.t);
      }
      if (p.firstTurn && this.noCalls) { const kinds = YAO.filter((i) => c[i] > 0).length; o.kyuushu = kinds >= 9; }
      return o;
    }
    hcMinus(seat, id) { const c = this.hc(seat); c[T(id)]--; return c; }
    ankanKeepsShape(c2, k2, beforeWaits) {
      // 暗槓後も待ちが同じで、かつ全ての和了形でその牌が刻子（送り槓・待ち変化の禁止）
      return waits(c2, k2).join(',') === beforeWaits;
    }
    canTsumo(seat) {
      const p = this.players[seat]; if (p.drawn == null) return false;
      const c = this.hc(seat); if (shanten(c, p.melds.length) !== -1) return false;
      return !!evaluateWin(c, this.meldInfo(seat), this.ctxFor(seat, p.drawn, true));
    }
    ctxFor(seat, id, tsumo, extra = {}) {
      const p = this.players[seat];
      const first = this.noCalls && p.firstTurn;
      return Object.assign({
        win: T(id), tsumo, riichi: p.riichi, doubleRiichi: p.riichi && p.dbl, ippatsu: p.riichi && p.ippatsu,
        haitei: tsumo && !this.rinshanNow && this.live.length === 0, houtei: !tsumo && this.live.length === 0,
        rinshan: tsumo && this.rinshanNow, tenhou: tsumo && first && seat === this.dealer && !this.rinshanNow, chiihou: tsumo && first && seat !== this.dealer && !this.rinshanNow,
        seat: this.seatWind(seat), round: this.round, dealer: seat === this.dealer, doraInd: this.doraInd, uraInd: this.uraInd,
        aka: this.akaOf(seat, tsumo ? null : id), dbl: this.rules.dbl, kuitan: this.rules.kuitan,
      }, extra);
    }
    isFuriten(seat) {
      const p = this.players[seat]; if (p.furitenTemp || p.furitenRiichi) return true;
      const c = this.hc(seat); if (p.hand.length % 3 === 2 && p.drawn != null) c[T(p.drawn)]--;
      const ws = waits(c, p.melds.length);
      return ws.some((w) => p.river.some((r) => T(r.id) === w));
    }
    canRon(seat, id, extra = {}) {
      const p = this.players[seat]; if (p.hand.length % 3 !== 1) return false;
      const c = this.hc(seat); const t = T(id); c[t]++;
      if (shanten(c, p.melds.length) !== -1) return false;
      if (this.isFuriten(seat)) return false;
      const ev = evaluateWin(c, this.meldInfo(seat), this.ctxFor(seat, id, false, extra));
      if (!ev) return false;
      if (extra.ankanRob && ev.form !== 'kokushi') return false;
      return true;
    }
    ronResult(seat, id) { const c = this.hc(seat); c[T(id)]++; if (shanten(c, this.players[seat].melds.length) !== -1) return null; return evaluateWin(c, this.meldInfo(seat), this.ctxFor(seat, id, false)); }
    revealKanDora() { const n = this.doraInd.length; if (n < 5) { this.doraInd.push(T(this.dead[4 + n * 2])); this.uraInd.push(T(this.dead[5 + n * 2])); } }
    breakFirst() { this.noCalls = false; for (const q of this.players) q.ippatsu = false; }
    async kan(seat, kind, t) {
      const p = this.players[seat];
      if (kind === 'ankan') {
        const ids = p.hand.filter((x) => T(x) === t);
        // 国士無双のみ暗槓を搶槓できる
        const robbers = [];
        for (let k = 1; k <= 3; k++) { const q = (seat + k) % 4; if (this.canRon(q, ids[0], { ankanRob: true, chankan: false })) { if (await this.agents[q].onRon(this, q, ids[0])) robbers.push(q); } }
        if (robbers.length) { await this.settleWin(robbers, seat, ids[0], false, {}); return true; }
        p.hand = p.hand.filter((x) => T(x) !== t);
        p.melds.push({ kind: 'ankan', t, ids, from: seat, called: null });
      } else {
        const id = p.hand.find((x) => T(x) === t);
        const robbers = [];
        for (let k = 1; k <= 3; k++) { const q = (seat + k) % 4; if (this.canRon(q, id, { chankan: true })) { if (await this.agents[q].onRon(this, q, id)) robbers.push(q); } }
        if (this.aborted) return true;
        if (robbers.length) { await this.settleWin(robbers, seat, id, false, { chankan: true }); return true; }
        p.hand.splice(p.hand.indexOf(id), 1);
        const m = p.melds.find((x) => x.kind === 'pon' && x.t === t); m.kind = 'kakan'; m.ids.push(id); m.added = id;
      }
      sortIds(p.hand); p.drawn = null;
      this.kanCount++; this.kanBy[seat]++; this.live.pop(); this.breakFirst(); this.revealKanDora();
      this.hooks.emit('kan', seat);
      await this.hooks.sleep('call', seat);
      return false;
    }
    callOptions(q, id, from) {
      const p = this.players[q]; const t = T(id); const c = this.hc(q);
      const o = { pon: false, minkan: false, chi: [] };
      if (p.riichi) return o;
      if (c[t] >= 2) o.pon = true;
      if (c[t] >= 3 && this.kanCount < 4) o.minkan = true;
      if (q === (from + 1) % 4 && t < 27) {
        const n = t % 9;
        for (const [a, b] of [[-2, -1], [-1, 1], [1, 2]]) {
          if (n + a < 0 || n + b > 8) continue;
          if (c[t + a] && c[t + b]) o.chi.push([t + a, t + b]);
        }
      }
      // 鳴いた後に打牌できる牌が残ること（喰い替えで全部禁止にならない）
      return o;
    }
    async collectCalls(from, id) {
      const cands = [];
      for (let k = 1; k <= 3; k++) { const q = (from + k) % 4; const o = this.callOptions(q, id, from); if (o.pon || o.minkan || o.chi.length) cands.push([q, o]); }
      if (!cands.length) return null;
      const answers = [];
      for (const [q, o] of cands) { const a = await this.agents[q].onCall(this, q, id, o); if (this.aborted) return null; if (a) answers.push([q, a, o]); }
      const valid = answers.filter(([, a, o]) => (a.type === 'pon' && o.pon) || (a.type === 'minkan' && o.minkan) || (a.type === 'chi' && o.chi.some((pt) => pt.join() === (a.pat || []).join())));
      const pick = valid.find(([, a]) => a.type !== 'chi') || valid.find(([, a]) => a.type === 'chi');
      if (!pick) return null;
      const [q, a] = pick; return this.doCall(q, from, id, a);
    }
    doCall(q, from, id, a) {
      const p = this.players[q]; const t = T(id); const take = [];
      const grab = (tt) => { const cands = p.hand.filter((x) => T(x) === tt && !take.includes(x)); const pickId = cands.find((x) => !this.isRed(x)) ?? cands[0]; take.push(pickId); };
      if (a.type === 'chi') { grab(a.pat[0]); grab(a.pat[1]); }
      else if (a.type === 'pon') { grab(t); grab(t); }
      else { grab(t); grab(t); grab(t); }
      p.hand = p.hand.filter((x) => !take.includes(x));
      const ids = [...take, id].sort((x, y) => x - y);
      const kind = a.type;
      const lowT = kind === 'chi' ? Math.min(t, a.pat[0]) : t;
      p.melds.push({ kind, t: lowT, ids, from, called: id });
      const src = this.players[from]; src.river[src.river.length - 1].called = true; src.nagashi = false;
      this.breakFirst(); this.stats.calls[q]++;
      // 喰い替え禁止
      if (kind === 'pon') p.kuikae = [t];
      else if (kind === 'chi') {
        const lo = Math.min(t, ...a.pat), hi = Math.max(t, ...a.pat); const f = [t];
        if (t === lo && hi % 9 !== 8 && t + 3 < Math.floor(t / 9) * 9 + 9) f.push(t + 3);
        if (t === hi && t % 9 >= 3) f.push(t - 3);
        p.kuikae = f;
      } else { this.kanCount++; this.kanBy[q]++; this.live.pop(); this.revealKanDora(); p.kuikae = []; }
      this.hooks.emit('call', q);
      return { seat: q, kind };
    }
    visible(seat) {
      const v = new Array(34).fill(0);
      for (const q of this.players) { for (const r of q.river) if (!r.called) v[T(r.id)]++; for (const m of q.melds) for (const id of m.ids) v[T(id)]++; }
      for (const d of this.doraInd) v[d]++;
      return v;
    }
    async settleWin(winners, from, id, tsumo, extra = {}) {
      const wins = []; const delta = [0, 0, 0, 0];
      winners.forEach((w, k) => {
        const p = this.players[w];
        const c = this.hc(w); if (!tsumo) c[T(id)]++;
        const ev = evaluateWin(c, this.meldInfo(w), this.ctxFor(w, id, tsumo, extra));
        const honba = k === 0 ? this.honba : 0; const d = [0, 0, 0, 0];
        if (tsumo) {
          for (let s = 0; s < 4; s++) if (s !== w) { const pay = (w === this.dealer || s === this.dealer ? ev.pay.tsumoDealer : ev.pay.tsumoChild) + honba * 100; d[s] -= pay; d[w] += pay; }
        } else { const pay = ev.pay.ron + honba * 300; d[from] -= pay; d[w] += pay; this.stats.houju[from] += k === 0 ? 1 : 0; }
        if (k === 0) { d[w] += this.sticks * 1000; }
        this.stats.agari[w]++;
        const hand = p.hand.slice(); if (tsumo) hand.splice(hand.indexOf(id), 1);
        wins.push({ winner: w, ev, delta: d, hand: sortIds(hand), melds: p.melds.map((m) => Object.assign({}, m)), honba, sticks: k === 0 ? this.sticks : 0, riichi: p.riichi });
        for (let s = 0; s < 4; s++) delta[s] += d[s];
      });
      this.sticks = 0;
      for (let s = 0; s < 4; s++) this.scores[s] += delta[s];
      const res = { type: tsumo ? 'tsumo' : 'ron', from, id, tile: T(id), wins, delta, dealer: this.dealer, kyoku: this.kyokuName(), honba: this.honba, doraInd: this.doraInd.slice(), uraInd: this.uraInd.slice(), chankan: !!extra.chankan };
      this.result = res; this.hooks.emit('result', res);
      await this.hooks.pause(res);
      this.after(winners.includes(this.dealer), false);
    }
    async exhaustive() {
      const tenpai = this.players.map((p) => shanten(countsId(p.hand), p.melds.length) === 0);
      const delta = [0, 0, 0, 0]; const nagashi = [];
      this.players.forEach((p, s) => { if (p.nagashi && p.river.length) nagashi.push(s); });
      if (nagashi.length) {
        for (const w of nagashi) for (let s = 0; s < 4; s++) if (s !== w) { const pay = (w === this.dealer || s === this.dealer) ? 4000 : 2000; delta[s] -= pay; delta[w] += pay; }
      } else {
        const n = tenpai.filter(Boolean).length;
        if (n > 0 && n < 4) for (let s = 0; s < 4; s++) delta[s] = tenpai[s] ? 3000 / n : -3000 / (4 - n);
      }
      for (let s = 0; s < 4; s++) this.scores[s] += delta[s];
      const res = { type: 'draw', reason: nagashi.length ? '流し満貫' : '荒牌流局', nagashi, tenpai, delta, kyoku: this.kyokuName(), hands: this.players.map((p) => sortIds(p.hand.slice())), melds: this.players.map((p) => p.melds) };
      this.result = res; this.hooks.emit('result', res);
      await this.hooks.pause(res);
      this.after(tenpai[this.dealer] || nagashi.includes(this.dealer), true);
    }
    async abortive(reason) {
      this.stats.aborts++;
      const res = { type: 'draw', reason, abortive: true, tenpai: [false, false, false, false], delta: [0, 0, 0, 0], kyoku: this.kyokuName(), hands: this.players.map((p) => sortIds(p.hand.slice())), melds: this.players.map((p) => p.melds) };
      this.result = res; this.hooks.emit('result', res);
      await this.hooks.pause(res);
      this.after(true, true);
    }
    after(dealerKeeps, draw) {
      const total = LEN[this.rules.length] || 4;
      const isLast = this.rotations === total - 1;
      if (dealerKeeps || draw) this.honba++; else this.honba = 0;
      if (this.scores.some((s) => s < 0) || this.handNo >= 40) { this.over = true; return; }
      if (!dealerKeeps) { this.dealer = (this.dealer + 1) % 4; this.rotations++; if (this.rotations >= total) this.over = true; return; }
      // オーラスで親がトップならアガリ止め・聴牌止め
      if (isLast && this.rules.length !== 'single') {
        const d = this.dealer; if (this.scores.every((s, i) => i === d || this.scores[d] > s)) this.over = true;
      }
      if (this.rules.length === 'single') this.over = true;
    }
  }

  // ---------- CPU ----------
  function handYaochuRoute(g, seat) {
    const p = g.players[seat]; const ms = p.melds;
    const yakuhai = (z) => z >= 31 || z === 27 + g.seatWind(seat) || z === 27 + g.round;
    const c = g.hc(seat);
    const hasYakuhai = ms.some((m) => m.kind !== 'chi' && yakuhai(m.t)) || [27, 28, 29, 30, 31, 32, 33].some((z) => yakuhai(z) && c[z] >= 3);
    const yakuhaiPair = [27, 28, 29, 30, 31, 32, 33].some((z) => yakuhai(z) && c[z] === 2);
    const meldSimple = ms.every((m) => m.kind === 'chi' ? (m.t % 9 !== 0 && m.t % 9 !== 6) : !isYao(m.t));
    const suitCount = [0, 0, 0]; let honors = 0;
    const full = c.slice(); for (const m of ms) for (const id of m.ids) full[T(id)]++;
    for (let i = 0; i < 34; i++) { if (i >= 27) honors += full[i]; else suitCount[Math.floor(i / 9)] += full[i]; }
    const main = suitCount.indexOf(Math.max(...suitCount));
    const meldInMain = ms.every((m) => m.t >= 27 || Math.floor(m.t / 9) === main);
    return { hasYakuhai, yakuhaiPair, tanyao: meldSimple, honitsu: meldInMain && suitCount[main] + honors >= 10, main, yakuhai };
  }
  function efficiency(g, seat, ids, kMelds) {
    const k = kMelds ?? g.players[seat].melds.length;
    const c = countsId(ids); const vis = g.visible(seat);
    const opts = [];
    const seen = new Set();
    for (const id of ids) {
      const t = T(id); if (seen.has(t)) continue; seen.add(t);
      c[t]--; const s = shanten(c, k); let uke = 0; const tiles = [];
      for (let u = 0; u < 34; u++) {
        const r = Math.max(0, 4 - c[u] - vis[u] - (u === t ? 1 : 0)); if (!r) continue;
        c[u]++; if (shanten(c, k) < s) { uke += r; tiles.push(u); } c[u]--;
      }
      c[t]++;
      opts.push({ t, s, uke, tiles });
    }
    const minS = Math.min(...opts.map((o) => o.s));
    const top = opts.filter((o) => o.s === minS);
    const maxU = Math.max(...top.map((o) => o.uke));
    return { opts, minS, best: top.filter((o) => o.uke === maxU) };
  }
  function threatsOf(g, seat) { return g.players.map((q, i) => (i !== seat && (q.riichi || q.melds.filter((m) => m.kind !== 'ankan').length >= 3)) ? i : -1).filter((i) => i >= 0); }
  function safety(g, seat, t) {
    let worst = 100; const vis = g.visible(seat); const myC = g.hc(seat);
    for (const i of threatsOf(g, seat)) {
      const q = g.players[i]; let s;
      const genbutsu = q.river.some((r) => T(r.id) === t) || (q.safe && q.safe.has(t));
      if (genbutsu) s = 100;
      else if (t >= 27) { const seen = vis[t] + myC[t]; s = seen >= 4 ? 100 : seen === 3 ? 92 : seen === 2 ? 78 : 55; }
      else {
        const n = t % 9; const base = t - n; const has = (k) => q.river.some((r) => T(r.id) === base + k);
        const low = n >= 3 ? has(n - 3) : true, high = n <= 5 ? has(n + 3) : true;
        // 壁：隣の牌が4枚見えていれば両面に当たらない
        const wallL = n >= 2 ? (vis[t - 1] + myC[t - 1] >= 4) : true, wallR = n <= 6 ? (vis[t + 1] + myC[t + 1] >= 4) : true;
        s = (low && high) || (wallL && wallR) ? 66 : (low || high || wallL || wallR) ? 42 : (n === 0 || n === 8) ? 34 : (n === 1 || n === 7) ? 24 : 14;
      }
      if (!q.riichi) s = Math.min(100, s + 15);
      worst = Math.min(worst, s);
    }
    return worst;
  }
  function handValue(g, seat) {
    const p = g.players[seat]; const full = g.hc(seat); for (const m of p.melds) for (const id of m.ids) full[T(id)]++;
    let v = 0; for (const ind of g.doraInd) v += full[doraOf(ind)];
    v += g.akaOf(seat);
    const r = handYaochuRoute(g, seat); if (r.hasYakuhai) v += 1;
    if (g.closed(seat)) v += 1;
    return v;
  }
  function cpuDiscard(g, seat, opts) {
    const p = g.players[seat];
    const choices = p.hand.filter((x) => !opts.forbidden.includes(T(x)));
    const pool = choices.length ? choices : p.hand;
    const e = efficiency(g, seat, pool.concat(p.hand.filter((x) => !pool.includes(x))));
    const valid = e.opts.filter((o) => pool.some((x) => T(x) === o.t));
    const minS = Math.min(...valid.map((o) => o.s));
    const threats = threatsOf(g, seat).length > 0;
    const val = handValue(g, seat);
    const route = handYaochuRoute(g, seat); const open = !g.closed(seat);
    const c = g.hc(seat);
    const full = c.slice(); for (const m of p.melds) for (const id of m.ids) full[T(id)]++;
    const doraSet = new Set(g.doraInd.map(doraOf));
    const keepVal = (t) => {
      let k = 0;
      if (doraSet.has(t)) k += 6;
      if (route.yakuhai(t) && c[t] >= 2) k += 8;
      if (t >= 27 && c[t] === 1 && !route.yakuhai(t)) k -= 3;
      if (t >= 27 && c[t] === 1 && route.yakuhai(t)) k -= 1;
      if (open && !route.hasYakuhai) {
        if (route.tanyao && isYao(t)) k -= 10;
        else if (route.honitsu && t < 27 && Math.floor(t / 9) !== route.main) k -= 10;
      }
      if (t < 27 && (t % 9 === 0 || t % 9 === 8) && c[t] === 1) k -= 1;
      return k;
    };
    let fold = false;
    if (threats) {
      if (minS >= 2) fold = true;
      else if (minS === 1) fold = val < 3 || g.rand() < 0.4;
    }
    let best;
    if (fold) best = valid.map((o) => ({ o, v: safety(g, seat, o.t) * 10 - o.s * 20 + o.uke * 0.1 })).sort((a, b) => b.v - a.v)[0].o;
    else {
      const scored = valid.map((o) => {
        let v = -o.s * 1000 + o.uke * 4 - keepVal(o.t) * 4;
        if (threats) v += safety(g, seat, o.t) * (minS === 0 ? 1.5 : 3);
        return { o, v };
      }).sort((a, b) => b.v - a.v);
      best = scored[0].o;
      // テンパイでも危険牌×安い手なら回し打ち
      if (threats && minS === 0 && safety(g, seat, best.t) < 30 && val < 2) {
        const alt = valid.filter((o) => safety(g, seat, o.t) >= 66).sort((a, b) => a.s - b.s || b.uke - a.uke)[0];
        if (alt) best = alt;
      }
    }
    // 打牌する実物（赤は残す）
    const ids = pool.filter((x) => T(x) === best.t);
    const id = ids.find((x) => !g.isRed(x)) ?? ids[0];
    let riichi = false;
    if (opts.riichi.includes(id)) {
      // 役ありで高い手はダマ、それ以外はリーチ
      const c2 = g.hc(seat); c2[best.t]--;
      const ws = waits(c2, p.melds.length);
      const damaVal = ws.length ? Math.max(...ws.map((w) => { const ev = g.ronResultAfter(seat, id, w); return ev ? ev.han : 0; })) : 0;
      riichi = !(damaVal >= 4 && !threats) && !(threats && safety(g, seat, best.t) < 30 && val < 2);
    }
    return { type: 'discard', id, riichi };
  }
  Game.prototype.ronResultAfter = function (seat, discardId, winT) {
    const p = this.players[seat];
    const c = this.hc(seat); c[T(discardId)]--; c[winT]++;
    if (shanten(c, p.melds.length) !== -1) return null;
    const ctx = this.ctxFor(seat, winT * 4, false); ctx.aka = this.akaOf(seat) - (this.isRed(discardId) ? 1 : 0);
    return evaluateWin(c, this.meldInfo(seat), ctx);
  };
  function shantenAfterCall(g, seat, takeTypes, kind) {
    const p = g.players[seat]; const c = g.hc(seat);
    for (const t of takeTypes) c[t]--;
    const k = p.melds.length + 1;
    if (kind === 'minkan') return shanten(c, k);
    let best = 9; for (let t = 0; t < 34; t++) if (c[t]) { c[t]--; best = Math.min(best, shanten(c, k)); c[t]++; }
    return best;
  }
  const cpuAgent = () => ({
    async onTurn(g, seat, opts) {
      const p = g.players[seat];
      if (opts.tsumo) return { type: 'tsumo' };
      if (opts.kyuushu) { const kinds = YAO.filter((i) => g.hc(seat)[i] > 0).length; if (kinds <= 10) return { type: 'kyuushu' }; }
      const k = p.melds.length; const c = g.hc(seat);
      const nowS = p.drawn != null ? Math.min(...efficiency(g, seat, p.hand).opts.map((o) => o.s)) : shanten(c, k);
      for (const t of opts.ankan) { const c2 = c.slice(); c2[t] = 0; if (p.riichi || shanten(c2, k + 1) <= nowS) return { type: 'ankan', t }; }
      for (const t of opts.kakan) { if (threatsOf(g, seat).length) break; const c2 = c.slice(); c2[t]--; if (shanten(c2, k) <= nowS) return { type: 'kakan', t }; }
      if (p.riichi) return { type: 'discard', id: p.drawn };
      return cpuDiscard(g, seat, opts);
    },
    async onRon() { return true; },
    async onCall(g, seat, id, o) {
      const p = g.players[seat]; const t = T(id);
      if (threatsOf(g, seat).length && handValue(g, seat) < 3) return null;
      const before = shanten(g.hc(seat), p.melds.length);
      const r = handYaochuRoute(g, seat);
      if (o.pon && r.yakuhai(t)) { if (shantenAfterCall(g, seat, [t, t], 'pon') <= before) return { type: 'pon' }; }
      const open = !g.closed(seat);
      const routeOK = (types) => r.hasYakuhai || r.yakuhaiPair || (r.tanyao && types.every((x) => !isYao(x)) && g.hc(seat).reduce((a, n, i) => a + (isYao(i) ? n : 0), 0) <= 2) || (r.honitsu && types.every((x) => x >= 27 || Math.floor(x / 9) === r.main));
      if (!open && before <= 1 && handValue(g, seat) <= 2 && !r.hasYakuhai && !r.yakuhaiPair) {
        // 門前で1シャンテン以内の安手は基本鳴かない（リーチを目指す）
        if (!(r.tanyao && before === 1)) return null;
      }
      if (o.pon && routeOK([t]) && shantenAfterCall(g, seat, [t, t], 'pon') < before) return { type: 'pon' };
      for (const pat of o.chi) if (routeOK([t, ...pat]) && shantenAfterCall(g, seat, pat, 'chi') < before) return { type: 'chi', pat };
      return null;
    },
  });

  return { shanten, waits, evaluateWin, payment, doraOf, Game, cpuAgent, efficiency, counts, countsId, WIND, isYao, T, RED, safety, threatsOf };
})();
if (typeof module !== 'undefined') module.exports = MJG;
