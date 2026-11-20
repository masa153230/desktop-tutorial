/* 麻雀フリープレイ：向聴数・役と符と点数・4人対局の進行・CPUの打ち方
 * ルール：一般的なリーチ麻雀を「門前のみ（チー・ポン・カンなし）」で。赤ドラなし、喰いタン関係なし。
 */
const MJG = (() => {
  const YAO = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
  const isYao = (i) => i >= 27 || i % 9 === 0 || i % 9 === 8;
  const WIND = ['東', '南', '西', '北'];
  const GREEN = new Set([19, 20, 21, 23, 25, 32]);

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
  function shantenStd(c) {
    let best = 8;
    const calc = (head) => {
      const L0 = suitF(c.slice(0, 9)), L1 = suitF(c.slice(9, 18)), L2 = suitF(c.slice(18, 27));
      let hm = 0, ht = 0;
      for (let z = 27; z < 34; z++) { if (c[z] >= 3) hm++; else if (c[z] === 2) ht++; }
      for (const [m1, t1] of L0) for (const [m2, t2] of L1) for (const [m3, t3] of L2) {
        const m = Math.min(4, m1 + m2 + m3 + hm), t = t1 + t2 + t3 + ht;
        const s = 8 - 2 * m - Math.min(t, 4 - m) - head;
        if (s < best) best = s;
      }
    };
    calc(0);
    for (let i = 0; i < 34; i++) if (c[i] >= 2) { c[i] -= 2; calc(1); c[i] += 2; }
    return best;
  }
  function shanten(c) {
    let pairs = 0, kinds = 0;
    for (let i = 0; i < 34; i++) { if (c[i] >= 1) kinds++; if (c[i] >= 2) pairs++; }
    const chiitoi = 6 - pairs + Math.max(0, 7 - kinds);
    let yk = 0, yp = 0; for (const i of YAO) { if (c[i]) yk++; if (c[i] >= 2) yp = 1; }
    const kokushi = 13 - yk - yp;
    return Math.min(shantenStd(c), chiitoi, kokushi);
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
        const w = pos === 1 ? 'kanchan' : pos === 0 ? (n === 6 ? 'penchan' : 'ryanmen') : (n === 0 ? 'penchan' : 'ryanmen');
        push({ wait: w, at: m.i });
      }
    }
    return out;
  }
  const ceil100 = (x) => Math.ceil(x / 100) * 100;
  function payment(han, fu, yakuman, dealer) {
    let base, limit = '';
    if (yakuman) { base = 8000 * yakuman; limit = yakuman > 1 ? `${yakuman}倍役満` : '役満'; }
    else if (han >= 13) { base = 8000; limit = '数え役満'; }
    else if (han >= 11) { base = 6000; limit = '三倍満'; }
    else if (han >= 8) { base = 4000; limit = '倍満'; }
    else if (han >= 6) { base = 3000; limit = '跳満'; }
    else if (han >= 5) { base = 2000; limit = '満貫'; }
    else { base = fu * 2 ** (han + 2); if (base >= 2000) { base = 2000; limit = '満貫'; } }
    const ron = ceil100(base * (dealer ? 6 : 4));
    const tsumoDealer = ceil100(base * 2), tsumoChild = ceil100(base);
    const tsumoTotal = dealer ? tsumoDealer * 3 : tsumoDealer + tsumoChild * 2;
    return { base, limit, ron, tsumoDealer, tsumoChild, tsumoTotal };
  }
  const common = (ctx) => {
    const y = [];
    if (ctx.riichi) y.push(['立直', 1]);
    if (ctx.ippatsu) y.push(['一発', 1]);
    if (ctx.tsumo) y.push(['門前清自摸和', 1]);
    if (ctx.haitei) y.push(['海底摸月', 1]);
    if (ctx.houtei) y.push(['河底撈魚', 1]);
    return y;
  };
  function colorYaku(c, y) {
    let suits = new Set(), honors = 0;
    for (let i = 0; i < 34; i++) if (c[i]) { if (i >= 27) honors++; else suits.add(Math.floor(i / 9)); }
    if (suits.size === 1 && !honors) y.push(['清一色', 6]);
    else if (suits.size === 1 && honors) y.push(['混一色', 3]);
  }
  function allOf(c, f) { for (let i = 0; i < 34; i++) if (c[i] && !f(i)) return false; return true; }
  function isChuuren(c) {
    for (const s of [0, 9, 18]) {
      if (!allOf(c, (i) => i >= s && i < s + 9)) continue;
      if (c[s] >= 3 && c[s + 8] >= 3 && [1, 2, 3, 4, 5, 6, 7].every((k) => c[s + k] >= 1)) return true;
    }
    return false;
  }
  function finalize(y, yakuman, fu, c, ctx, extra) {
    const yakuHan = y.reduce((a, [, h]) => a + h, 0);
    if (!yakuman && yakuHan === 0) return null;
    let dora = 0, ura = 0;
    if (!yakuman) {
      for (const ind of ctx.doraInd || []) dora += c[doraOf(ind)];
      if (ctx.riichi) for (const ind of ctx.uraInd || []) ura += c[doraOf(ind)];
    }
    const han = yakuman ? 13 * yakuman : yakuHan + dora + ura;
    const pay = payment(han, fu, yakuman, ctx.dealer);
    const yaku = y.slice();
    if (dora) yaku.push(['ドラ', dora]);
    if (ura) yaku.push(['裏ドラ', ura]);
    return Object.assign({ yaku, yakuman, han, fu, dora, ura, pay, total: ctx.tsumo ? pay.tsumoTotal : pay.ron }, extra);
  }
  function evaluateWin(c, ctx) {
    const res = [];
    // 国士無双
    if (YAO.every((i) => c[i] >= 1) && YAO.some((i) => c[i] === 2)) res.push(finalize([['国士無双', 13]], 1, 0, c, ctx, { form: 'kokushi' }));
    // 七対子
    if (c.filter((x) => x === 2).length === 7) {
      if (allOf(c, (i) => i >= 27)) res.push(finalize([['字一色', 13]], 1, 25, c, ctx, { form: 'chiitoi' }));
      const y = common(ctx); y.push(['七対子', 2]);
      if (allOf(c, (i) => !isYao(i))) y.push(['断幺九', 1]);
      if (allOf(c, isYao)) y.push(['混老頭', 2]);
      colorYaku(c, y);
      res.push(finalize(y, 0, 25, c, ctx, { form: 'chiitoi' }));
    }
    for (const d of decomps(c)) for (const pl of placements(d, ctx.win)) res.push(scoreStd(c, d, pl, ctx));
    const ok = res.filter(Boolean);
    if (!ok.length) return null;
    ok.sort((a, b) => b.total - a.total || b.han - a.han || b.fu - a.fu);
    return ok[0];
  }
  function scoreStd(c, d, pl, ctx) {
    const seqs = d.melds.filter((m) => m.t === 's').map((m) => m.i);
    const trips = d.melds.filter((m) => m.t === 'k').map((m) => m.i);
    const pair = d.pair; const wait = pl.wait;
    const ankou = trips.length - (!ctx.tsumo && wait === 'shanpon' ? 1 : 0);
    const isYakuhai = (z) => z >= 31 || z === 27 + ctx.seat || z === 27 + ctx.round;
    // 役満
    const ym = [];
    if (ankou === 4) ym.push(['四暗刻', 13]);
    if ([31, 32, 33].every((z) => trips.includes(z))) ym.push(['大三元', 13]);
    if (allOf(c, (i) => i >= 27)) ym.push(['字一色', 13]);
    if (allOf(c, (i) => GREEN.has(i))) ym.push(['緑一色', 13]);
    if (allOf(c, (i) => i < 27 && isYao(i))) ym.push(['清老頭', 13]);
    const windTrips = trips.filter((z) => z >= 27 && z <= 30).length;
    if (windTrips === 4) ym.push(['大四喜', 13]); else if (windTrips === 3 && pair >= 27 && pair <= 30) ym.push(['小四喜', 13]);
    if (isChuuren(c)) ym.push(['九蓮宝燈', 13]);
    if (ym.length) return finalize(ym, ym.length, 0, c, ctx, { form: 'std', wait, decomp: d });
    // 通常役
    const y = common(ctx);
    if (allOf(c, (i) => !isYao(i))) y.push(['断幺九', 1]);
    const pinfu = seqs.length === 4 && !isYakuhai(pair) && wait === 'ryanmen';
    if (pinfu) y.push(['平和', 1]);
    const sc = {}; seqs.forEach((s) => { sc[s] = (sc[s] || 0) + 1; });
    const peiko = Object.values(sc).reduce((a, n) => a + Math.floor(n / 2), 0);
    if (peiko === 2) y.push(['二盃口', 3]); else if (peiko === 1) y.push(['一盃口', 1]);
    for (const z of trips) {
      if (z === 31) y.push(['役牌 白', 1]); if (z === 32) y.push(['役牌 發', 1]); if (z === 33) y.push(['役牌 中', 1]);
      if (z === 27 + ctx.round) y.push(['場風 ' + WIND[ctx.round], 1]);
      if (z === 27 + ctx.seat) y.push(['自風 ' + WIND[ctx.seat], 1]);
    }
    for (let n = 0; n < 7; n++) if (seqs.includes(n) && seqs.includes(n + 9) && seqs.includes(n + 18)) { y.push(['三色同順', 2]); break; }
    for (const s of [0, 9, 18]) if (seqs.includes(s) && seqs.includes(s + 3) && seqs.includes(s + 6)) { y.push(['一気通貫', 2]); break; }
    const sets = [...d.melds.map((m) => (m.t === 's' ? [m.i, m.i + 2] : [m.i])), [pair]];
    const honorsIn = c.slice(27).some((x) => x > 0);
    if (seqs.length && sets.every((st) => st.some(isYao))) y.push(honorsIn ? ['混全帯幺九', 2] : ['純全帯幺九', 3]);
    if (trips.length === 4) y.push(['対々和', 2]);
    if (ankou === 3) y.push(['三暗刻', 2]);
    for (let n = 0; n < 9; n++) if (trips.includes(n) && trips.includes(n + 9) && trips.includes(n + 18)) y.push(['三色同刻', 2]);
    if (trips.filter((z) => z >= 31).length === 2 && pair >= 31) y.push(['小三元', 2]);
    if (allOf(c, isYao) && honorsIn && !allOf(c, (i) => i >= 27)) y.push(['混老頭', 2]);
    colorYaku(c, y);
    // 符
    let fu;
    const fuParts = [];
    if (pinfu) { fu = ctx.tsumo ? 20 : 30; fuParts.push(ctx.tsumo ? '平和ツモ 20符' : '平和ロン 30符'); }
    else {
      fu = 20; fuParts.push('副底 20');
      if (ctx.tsumo) { fu += 2; fuParts.push('ツモ 2'); } else { fu += 10; fuParts.push('門前ロン 10'); }
      for (const z of trips) {
        const open = !ctx.tsumo && wait === 'shanpon' && z === pl.at;
        const v = (isYao(z) ? 4 : 2) * (open ? 1 : 2); fu += v;
        fuParts.push(`${open ? '明刻' : '暗刻'}${isYao(z) ? '（么九）' : ''} ${v}`);
      }
      let pf = 0; if (pair >= 31) pf += 2; if (pair === 27 + ctx.seat) pf += 2; if (pair === 27 + ctx.round) pf += 2;
      if (pf) { fu += pf; fuParts.push('役牌の雀頭 ' + pf); }
      if (wait === 'kanchan' || wait === 'penchan' || wait === 'tanki') { fu += 2; fuParts.push({ kanchan: '嵌張待ち', penchan: '辺張待ち', tanki: '単騎待ち' }[wait] + ' 2'); }
      fu = Math.ceil(fu / 10) * 10;
    }
    return finalize(y, 0, fu, c, ctx, { form: 'std', wait, decomp: d, fuParts });
  }

  // ---------- 対局 ----------
  const counts = (arr) => { const c = new Array(34).fill(0); for (const t of arr) c[t]++; return c; };
  const sortTiles = (a) => a.sort((x, y) => x - y);

  class Game {
    constructor(o) {
      this.mode = o.mode || 'tonpu';
      this.rand = o.rand || Math.random;
      this.agents = o.agents;
      this.hooks = Object.assign({ emit() {}, sleep: () => Promise.resolve(), pause: () => Promise.resolve() }, o.hooks || {});
      this.names = o.names || ['あなた', '下家', '対面', '上家'];
      this.scores = [25000, 25000, 25000, 25000];
      this.honba = 0; this.sticks = 0;
      this.dealer = Math.floor(this.rand() * 4); this.startDealer = this.dealer;
      this.rotations = 0; this.handNo = 0; this.over = false; this.aborted = false; this.round = 0;
      this.stats = { agari: [0, 0, 0, 0], houju: [0, 0, 0, 0], riichi: [0, 0, 0, 0], hands: 0 };
    }
    seatWind(s) { return (s - this.dealer + 4) % 4; }
    kyokuName() { return `${WIND[this.round]}${(this.dealer - this.startDealer + 4) % 4 + 1}局`; }
    async run() {
      while (!this.over && !this.aborted) await this.playHand();
      if (this.aborted) return null;
      const order = [0, 1, 2, 3].map((k) => (this.startDealer + k) % 4);
      const rank = order.slice().sort((a, b) => this.scores[b] - this.scores[a] || order.indexOf(a) - order.indexOf(b));
      if (this.sticks) { this.scores[rank[0]] += this.sticks * 1000; this.sticks = 0; }
      this.final = { type: 'end', rank, scores: this.scores.slice() };
      await this.hooks.pause(this.final);
      return this.final;
    }
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    async playHand() {
      const all = []; for (let t = 0; t < 34; t++) for (let k = 0; k < 4; k++) all.push(t);
      this.shuffle(all);
      this.dead = all.slice(122); this.live = all.slice(0, 122);
      this.doraInd = [this.dead[4]]; this.uraInd = [this.dead[5]];
      this.players = [0, 1, 2, 3].map(() => ({ hand: [], river: [], riichi: false, ippatsu: false, furitenTemp: false, furitenRiichi: false, drawn: null, safe: null }));
      for (let k = 0; k < 4; k++) { const p = this.players[(this.dealer + k) % 4]; p.hand = sortTiles(this.live.splice(0, 13)); }
      this.turn = this.dealer; this.lastDiscard = null; this.result = null; this.handNo++; this.stats.hands++;
      this.hooks.emit('start');
      await this.hooks.sleep('start');
      while (!this.aborted) {
        if (!this.live.length) { await this.ryuukyoku(); break; }
        const seat = this.turn; const p = this.players[seat];
        const tile = this.live.shift(); p.hand.push(tile); p.drawn = tile;
        this.hooks.emit('draw', seat);
        let act = await this.agents[seat].onDraw(this, seat);
        if (this.aborted) return;
        if (act && act.type === 'tsumo' && this.canTsumo(seat)) { await this.settle(seat, null, tile, true); break; }
        if (!act || act.type !== 'discard' || !p.hand.includes(act.tile)) act = { type: 'discard', tile: p.drawn };
        if (p.riichi) act = { type: 'discard', tile: p.drawn };
        const declaring = !!act.riichi && !p.riichi && this.riichiOptions(seat).includes(act.tile);
        if (p.riichi && !declaring) p.ippatsu = false;
        p.hand.splice(p.hand.indexOf(act.tile), 1); sortTiles(p.hand); p.drawn = null;
        p.river.push({ t: act.tile, riichi: declaring });
        if (declaring) { p.riichi = true; p.ippatsu = true; p.safe = new Set(p.river.map((r) => r.t)); this.stats.riichi[seat]++; }
        if (!p.furitenRiichi) p.furitenTemp = false;
        this.lastDiscard = { seat, tile: act.tile };
        for (const q of this.players) if (q.riichi && q.safe) q.safe.add(act.tile);
        this.hooks.emit('discard', seat);
        await this.hooks.sleep('discard', seat);
        if (this.aborted) return;
        let won = false;
        for (let k = 1; k <= 3 && !won; k++) {
          const q = (seat + k) % 4;
          if (!this.canRon(q, act.tile)) continue;
          const yes = await this.agents[q].onRon(this, q, act.tile);
          if (this.aborted) return;
          if (yes) { if (declaring) { p.riichi = false; } await this.settle(q, seat, act.tile, false); won = true; }
          else { const qq = this.players[q]; if (qq.riichi) qq.furitenRiichi = true; else qq.furitenTemp = true; }
        }
        if (won) break;
        if (declaring) { this.scores[seat] -= 1000; this.sticks++; this.hooks.emit('riichi', seat); }
        this.turn = (seat + 1) % 4;
      }
    }
    ctxFor(seat, win, tsumo) {
      const p = this.players[seat];
      return { win, tsumo, riichi: p.riichi, ippatsu: p.riichi && p.ippatsu, haitei: tsumo && this.live.length === 0, houtei: !tsumo && this.live.length === 0,
        seat: this.seatWind(seat), round: this.round, dealer: seat === this.dealer, doraInd: this.doraInd, uraInd: this.uraInd };
    }
    canTsumo(seat) {
      const p = this.players[seat]; if (p.hand.length !== 14) return false;
      const c = counts(p.hand); if (shanten(c) !== -1) return false;
      return !!evaluateWin(c, this.ctxFor(seat, p.drawn, true));
    }
    waitsOf(seat) { const c = counts(this.players[seat].hand.length === 13 ? this.players[seat].hand : []); return c.some(Boolean) ? MJ.waits(c) : []; }
    isFuriten(seat) {
      const p = this.players[seat]; if (p.furitenTemp || p.furitenRiichi) return true;
      const ws = MJ.waits(counts(p.hand.length === 14 ? p.hand.filter((_, i) => i !== p.hand.indexOf(p.drawn)) : p.hand));
      return ws.some((w) => p.river.some((r) => r.t === w));
    }
    canRon(seat, tile) {
      const p = this.players[seat]; if (p.hand.length !== 13) return false;
      const c = counts(p.hand); c[tile]++;
      if (c[tile] > 4 || shanten(c) !== -1) return false;
      if (this.isFuriten(seat)) return false;
      return !!evaluateWin(c, this.ctxFor(seat, tile, false));
    }
    ronResult(seat, tile) { const c = counts(this.players[seat].hand); c[tile]++; return evaluateWin(c, this.ctxFor(seat, tile, false)); }
    riichiOptions(seat) {
      const p = this.players[seat];
      if (p.riichi || this.scores[seat] < 1000 || this.live.length < 4 || p.hand.length !== 14) return [];
      const c = counts(p.hand); const out = [];
      for (let t = 0; t < 34; t++) if (c[t]) { c[t]--; if (shanten(c) === 0) out.push(t); c[t]++; }
      return out;
    }
    visible(seat) {
      const v = new Array(34).fill(0);
      for (const q of this.players) for (const r of q.river) v[r.t]++;
      for (const d of this.doraInd) v[d]++;
      return v;
    }
    async settle(winner, from, tile, tsumo) {
      const p = this.players[winner];
      const c = counts(tsumo ? p.hand : [...p.hand, tile]);
      const ev = evaluateWin(c, this.ctxFor(winner, tile, tsumo));
      const delta = [0, 0, 0, 0];
      if (tsumo) {
        for (let s = 0; s < 4; s++) if (s !== winner) {
          const pay = (winner === this.dealer ? ev.pay.tsumoDealer : (s === this.dealer ? ev.pay.tsumoDealer : ev.pay.tsumoChild)) + this.honba * 100;
          delta[s] -= pay; delta[winner] += pay;
        }
      } else { const pay = ev.pay.ron + this.honba * 300; delta[from] -= pay; delta[winner] += pay; this.stats.houju[from]++; }
      delta[winner] += this.sticks * 1000;
      this.stats.agari[winner]++;
      const res = { type: tsumo ? 'tsumo' : 'ron', winner, from, tile, ev, delta, hand: (tsumo ? p.hand.filter((_, i) => i !== p.hand.indexOf(tile)) : p.hand.slice()), honba: this.honba, sticks: this.sticks, ura: this.uraInd, dealer: this.dealer, kyoku: this.kyokuName() };
      this.sticks = 0;
      for (let s = 0; s < 4; s++) this.scores[s] += delta[s];
      this.result = res;
      this.hooks.emit('result', res);
      await this.hooks.pause(res);
      this.after(winner === this.dealer);
    }
    async ryuukyoku() {
      const tenpai = this.players.map((p) => shanten(counts(p.hand)) === 0);
      const n = tenpai.filter(Boolean).length; const delta = [0, 0, 0, 0];
      if (n > 0 && n < 4) for (let s = 0; s < 4; s++) delta[s] = tenpai[s] ? 3000 / n : -3000 / (4 - n);
      for (let s = 0; s < 4; s++) this.scores[s] += delta[s];
      const res = { type: 'draw', tenpai, delta, kyoku: this.kyokuName(), hands: this.players.map((p) => p.hand.slice()) };
      this.result = res;
      this.hooks.emit('result', res);
      await this.hooks.pause(res);
      this.after(tenpai[this.dealer], true);
    }
    after(dealerKeeps, draw) {
      if (dealerKeeps || draw) this.honba++; else this.honba = 0;
      if (!dealerKeeps) { this.dealer = (this.dealer + 1) % 4; this.rotations++; }
      if (this.mode === 'single' || this.rotations >= 4 || this.scores.some((s) => s < 0) || this.handNo >= 24) this.over = true;
    }
  }

  // ---------- CPU ----------
  function efficiency(g, seat, handArr) {
    const c = counts(handArr); const vis = g.visible(seat);
    const rem = (t) => Math.max(0, 4 - c[t] - vis[t]);
    const opts = [];
    for (let t = 0; t < 34; t++) {
      if (!c[t]) continue;
      c[t]--; const s = shanten(c); let uke = 0; const tiles = [];
      for (let u = 0; u < 34; u++) {
        const r = Math.max(0, 4 - c[u] - vis[u] - (u === t ? 1 : 0)); if (!r) continue;
        c[u]++; if (shanten(c) < s) { uke += r; tiles.push(u); } c[u]--;
      }
      c[t]++;
      opts.push({ t, s, uke, tiles });
    }
    const minS = Math.min(...opts.map((o) => o.s));
    const top = opts.filter((o) => o.s === minS);
    const maxU = Math.max(...top.map((o) => o.uke));
    return { opts, minS, best: top.filter((o) => o.uke === maxU), rem };
  }
  function safety(g, seat, t) {
    let worst = 100;
    g.players.forEach((q, i) => {
      if (i === seat || !q.riichi) return;
      let s;
      if (q.safe && q.safe.has(t)) s = 100;
      else if (t >= 27) { const seen = g.visible(seat)[t]; s = seen >= 3 ? 95 : seen === 2 ? 80 : 55; }
      else {
        const n = t % 9; const has = (k) => q.river.some((r) => r.t === t - n + k);
        const low = n >= 3 ? has(n - 3) : true, high = n <= 5 ? has(n + 3) : true;
        s = low && high ? 65 : (low || high) ? 40 : (n === 0 || n === 8) ? 35 : (n === 1 || n === 7) ? 25 : 15;
      }
      worst = Math.min(worst, s);
    });
    return worst;
  }
  function cpuChoose(g, seat) {
    const p = g.players[seat];
    const e = efficiency(g, seat, p.hand);
    const threats = g.players.some((q, i) => i !== seat && q.riichi);
    let pickT;
    if (threats && e.minS >= 1 && (e.minS >= 2 || g.rand() < 0.6)) {
      const scored = e.opts.map((o) => ({ o, v: safety(g, seat, o.t) * 10 - o.s * 3 + o.uke * 0.05 }));
      scored.sort((a, b) => b.v - a.v); pickT = scored[0].o.t;
    } else {
      const c = counts(p.hand);
      const val = (t) => (t >= 27 ? (c[t] === 1 ? ((t >= 31 || t === 27 + g.seatWind(seat) || t === 27 + g.round) ? 2 : 3) : 0) : (t % 9 === 0 || t % 9 === 8 ? 1 : 0));
      const best = e.best.slice().sort((a, b) => val(b.t) - val(a.t));
      pickT = best[0].t;
    }
    const riichi = g.riichiOptions(seat).includes(pickT);
    return { type: 'discard', tile: pickT, riichi };
  }
  const cpuAgent = () => ({
    async onDraw(g, seat) { if (g.canTsumo(seat)) return { type: 'tsumo' }; const p = g.players[seat]; if (p.riichi) return { type: 'discard', tile: p.drawn }; return cpuChoose(g, seat); },
    async onRon() { return true; },
  });

  return { shanten, evaluateWin, payment, doraOf, Game, cpuAgent, efficiency, counts, WIND, isYao };
})();
if (typeof module !== 'undefined') module.exports = MJG;
