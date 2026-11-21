/* 麻雀の3D卓（Three.js r128）。牌は厚みのある直方体（表＝牌の絵、背＝緑、側面＝象牙と緑の2層）。
 * 山（壁牌）・ドラ表示牌・河・立てた手牌・副露・点数パネル・リーチ棒を卓の上に置く。自分の手牌は画面下のボタンで操作する。
 * 座標：牌の幅 1。各家は「自分が +z 側にいる」ローカル座標で並べ、y 軸まわりに回して卓に置く。
 */
const Mahjong3D = (() => {
  let T = null, renderer = null, scene, camera, canvas, host = null, ro = null, broken = false, preparing = null;
  const W = 1, D = 1.36, H = 0.78;
  const SEAT_A = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const meshes = new Map(); const faceMats = {}; const faceCv = {}; let sideMat, backMat, tileGeo, wall, indicators = [], centerCv, centerTex, centerKey = '', sticks = [], lastMark, glowMark;
  const anims = []; let raf = 0, dirty = true, view = 0;
  const VIEWS = [{ polar: 0.6, look: 0.9 }, { polar: 0.25, look: 0.3 }, { polar: 0.85, look: 2.2 }];
  const api = {};

  function faceCanvas(t, red) {
    return new Promise((res) => {
      const cv = document.createElement('canvas'); cv.width = 120; cv.height = 164; const x = cv.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 164); g.addColorStop(0, '#fffdf4'); g.addColorStop(1, '#f1e8d2'); x.fillStyle = g; x.fillRect(0, 0, 120, 164);
      const svg = MJ.svg(t, red).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" ').replace(/<text /g, '<text font-family="Hiragino Mincho ProN, Yu Mincho, serif" ');
      const img = new Image();
      img.onload = () => { x.drawImage(img, 6, 8, 108, 148); res(cv); };
      img.onerror = () => { x.fillStyle = '#333'; x.font = 'bold 60px serif'; x.textAlign = 'center'; x.fillText(MJ.name(t)[0], 60, 100); res(cv); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  function prepare() {
    if (preparing) return preparing;
    preparing = Chess3D.load().then(async (ok) => {
      if (!ok || !window.THREE) return false;
      T = window.THREE;
      const keys = []; for (let t = 0; t < 34; t++) keys.push([t, false]); keys.push([4, true], [13, true], [22, true]);
      const cvs = await Promise.all(keys.map(([t, r]) => faceCanvas(t, r)));
      keys.forEach(([t, r], i) => { faceCv[(r ? 'r' : '') + t] = cvs[i]; const tex = new T.CanvasTexture(cvs[i]); tex.anisotropy = 4; if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding; faceMats[(r ? 'r' : '') + t] = new T.MeshStandardMaterial({ map: tex, roughness: 0.42 }); });
      return init();
    });
    return preparing;
  }
  function sideTexture() {
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 64; const x = cv.getContext('2d');
    x.fillStyle = '#f3ebd6'; x.fillRect(0, 0, 8, 38); x.fillStyle = '#cfc4a6'; x.fillRect(0, 36, 8, 3); x.fillStyle = '#1f7a58'; x.fillRect(0, 39, 8, 25);
    const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t;
  }
  function tileGeometry() {
    const g = new T.BoxGeometry(W * 0.97, H, D * 0.98);
    const idx = Array.from(g.index.array); const f = (k) => idx.slice(k * 6, k * 6 + 6);
    g.setIndex([...f(2), ...f(3), ...f(0), ...f(1), ...f(4), ...f(5)]); g.clearGroups(); g.addGroup(0, 6, 0); g.addGroup(6, 6, 1); g.addGroup(12, 24, 2);
    return g;
  }
  function init() {
    if (renderer) return true; if (broken) return false;
    try { canvas = document.createElement('canvas'); canvas.className = 'mj3d-canvas'; renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch { broken = true; renderer = null; return false; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); broken = true; if (api.onBroken) api.onBroken(); });
    scene = new T.Scene(); camera = new T.PerspectiveCamera(34, 1, 0.5, 200);
    scene.add(new T.HemisphereLight(0xfffaf0, 0x30403a, 0.7));
    const sun = new T.DirectionalLight(0xffffff, 0.85); sun.position.set(-6, 26, 12); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 }); sun.shadow.bias = -0.0005; scene.add(sun);
    // 卓
    const fcv = document.createElement('canvas'); fcv.width = fcv.height = 512; const fx = fcv.getContext('2d');
    const rg = fx.createRadialGradient(256, 256, 40, 256, 256, 360); rg.addColorStop(0, '#2c9466'); rg.addColorStop(1, '#165c40'); fx.fillStyle = rg; fx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { fx.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.05})`; fx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5); }
    const ftex = new T.CanvasTexture(fcv); if (T.sRGBEncoding) ftex.encoding = T.sRGBEncoding;
    const felt = new T.Mesh(new T.PlaneGeometry(27, 27), new T.MeshStandardMaterial({ map: ftex, roughness: 0.95 })); felt.rotation.x = -Math.PI / 2; felt.receiveShadow = true; scene.add(felt);
    const woodM = new T.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.55 });
    for (const [x, z, w, d] of [[0, 13.9, 29, 1.8], [0, -13.9, 29, 1.8], [13.9, 0, 1.8, 26], [-13.9, 0, 1.8, 26]]) { const b = new T.Mesh(new T.BoxGeometry(w, 1.1, d), woodM); b.position.set(x, 0.35, z); b.receiveShadow = true; scene.add(b); }
    // 点数パネル
    centerCv = document.createElement('canvas'); centerCv.width = centerCv.height = 512; centerTex = new T.CanvasTexture(centerCv); if (T.sRGBEncoding) centerTex.encoding = T.sRGBEncoding;
    const cbox = new T.Mesh(new T.BoxGeometry(5.6, 0.36, 5.6), [0, 0, 0, 0, 0, 0].map((_, i) => (i === 2 ? new T.MeshStandardMaterial({ map: centerTex, roughness: 0.3, metalness: 0.1 }) : new T.MeshStandardMaterial({ color: 0x141b22, roughness: 0.4 }))));
    cbox.position.y = 0.18; cbox.castShadow = true; scene.add(cbox);
    // 牌
    sideMat = new T.MeshStandardMaterial({ map: sideTexture(), roughness: 0.4 });
    backMat = new T.MeshStandardMaterial({ color: 0x1f7a58, roughness: 0.35 });
    tileGeo = tileGeometry();
    for (let id = 0; id < 136; id++) { const m = new T.Mesh(tileGeo, [faceMats[0], backMat, sideMat]); m.castShadow = true; m.receiveShadow = true; m.visible = false; m.userData.id = id; m.rotation.order = 'YXZ'; scene.add(m); meshes.set(id, m); }
    wall = new T.InstancedMesh(tileGeo, [backMat, backMat, sideMat], 136); wall.castShadow = true; wall.receiveShadow = true; scene.add(wall);
    for (let k = 0; k < 5; k++) { const m = new T.Mesh(tileGeo, [faceMats[0], backMat, sideMat]); m.visible = false; m.castShadow = true; m.rotation.order = 'YXZ'; scene.add(m); indicators.push(m); }
    const stickM = [new T.MeshStandardMaterial({ color: 0xf6f4ee, roughness: 0.3 })];
    for (let s = 0; s < 4; s++) { const st = new T.Mesh(new T.BoxGeometry(3.4, 0.12, 0.32), stickM[0]); const dot = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.13, 16), new T.MeshStandardMaterial({ color: 0xc8312f })); st.add(dot); st.visible = false; scene.add(st); sticks.push(st); }
    lastMark = new T.Mesh(new T.PlaneGeometry(W * 1.2, D * 1.16), new T.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.85 })); lastMark.rotation.x = -Math.PI / 2; lastMark.visible = false; scene.add(lastMark);
    return true;
  }
  // ローカル座標（自分＝+z）→ 卓の座標
  function toWorld(s, x, y, z) { const a = SEAT_A[s]; return new T.Vector3(x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)); }
  // 置き方：flat（表向きに寝かせる）、side（横向きに寝かせる）、stand（立てて持ち主に表を向ける）、down（伏せる）
  function pose(s, x, z, kind, lift = 0) {
    const a = SEAT_A[s]; let rx = 0, ry = a, rz = 0, y = H / 2 + lift;
    if (kind === 'side') ry = a + Math.PI / 2;
    if (kind === 'stand') { rx = Math.PI / 2; y = D / 2 + lift; }
    if (kind === 'down') rz = Math.PI;
    if (kind === 'standback') { rx = Math.PI / 2; y = D / 2 + lift; }
    const p = toWorld(s, x, 0, z); return { x: p.x, y, z: p.z, rx, ry, rz };
  }
  function faceOf(game, id) { const t = id >> 2; return game.isRed(id) ? faceMats['r' + t] : faceMats[t]; }
  function animateTo(m, tg, fresh) {
    const from = { x: m.position.x, y: m.position.y, z: m.position.z, rx: m.rotation.x, ry: m.rotation.y, rz: m.rotation.z };
    const same = Math.abs(from.x - tg.x) + Math.abs(from.y - tg.y) + Math.abs(from.z - tg.z) < 0.01 && Math.abs(from.rx - tg.rx) + Math.abs(from.rz - tg.rz) < 0.01 && Math.abs(Math.atan2(Math.sin(from.ry - tg.ry), Math.cos(from.ry - tg.ry))) < 0.01;
    if (same && !fresh) return;
    if (fresh) { m.position.set(tg.x, tg.y, tg.z); m.rotation.set(tg.rx, tg.ry, tg.rz); return; }
    const dry = Math.atan2(Math.sin(tg.ry - from.ry), Math.cos(tg.ry - from.ry));
    const old = anims.findIndex((a) => a.m === m); if (old >= 0) anims.splice(old, 1);
    const far = Math.hypot(tg.x - from.x, tg.z - from.z) > 2;
    anims.push({ m, t0: performance.now(), dur: far ? 340 : 220, step: (e) => {
      m.position.set(from.x + (tg.x - from.x) * e, from.y + (tg.y - from.y) * e + (far ? Math.sin(Math.PI * e) * 1.2 : 0), from.z + (tg.z - from.z) * e);
      m.rotation.set(from.rx + (tg.rx - from.rx) * e, from.ry + dry * e, from.rz + (tg.rz - from.rz) * e);
    } });
  }
  function kick() { dirty = true; if (!raf) raf = requestAnimationFrame(loop); }
  function loop() {
    raf = 0; let active = false; const now = performance.now();
    // 動いている間のフレーム時間を見て、重ければ影を切り解像度を下げる（1回だけ）
    if (api._lt && now - api._lt < 250) { (api._fs = api._fs || []).push(now - api._lt); if (api._fs.length > 24) api._fs.shift(); if (!api._low && api._fs.length >= 12 && api._fs.reduce((a, b) => a + b, 0) / api._fs.length > 45) { api._low = true; renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); }); setTimeout(place, 0); } }
    api._lt = 0;
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i]; const k = Math.min(1, (now - a.t0) / a.dur); const e = 1 - (1 - k) ** 3; a.step(e); if (k >= 1) anims.splice(i, 1); else active = true; }
    if (dirty || active) { renderer.render(scene, camera); dirty = false; }
    if (active) { api._lt = now; raf = requestAnimationFrame(loop); }
  }
  function place() {
    if (!renderer || !host) return;
    const w = host.clientWidth, hh = host.clientHeight; if (!w || !hh) return;
    renderer.setSize(w, hh, false); camera.aspect = w / hh; camera.updateProjectionMatrix();
    const v = VIEWS[view];
    // 卓の四隅（手牌の外側まで）が画面に収まる最小の距離を二分探索
    const pts = (view === 1 ? [[-12, 0.5, -12], [12, 0.5, -12], [-12, 0, 12], [12, 0, 12]] : [[-12.2, 0.6, 0], [12.2, 0.6, 0], [-9.6, 1.0, -10.6], [9.6, 1.0, -10.6], [0, 1.4, -11.9], [-9.5, 0, 9.4], [9.5, 0, 9.4]]).map((q) => new T.Vector3(...q));
    const fits = (d) => { camera.position.set(0, Math.cos(v.polar) * d, Math.sin(v.polar) * d + v.look); camera.lookAt(0, 0, v.look); camera.updateMatrixWorld(); return pts.every((q) => { const p = q.clone().project(camera); return Math.abs(p.x) <= 0.99 && Math.abs(p.y) <= 0.97 && p.z < 1; }); };
    let lo = 5, hi = 120; for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
    fits(hi);
    kick();
  }
  function drawCenter(g) {
    const key = JSON.stringify([g.scores, g.dealer, g.turn, g.honba, g.sticks, g.live.length, g.kyokuName(), g.players.map((p) => p.riichi), !!g.result, g.startDealer, g.doraInd, g.dice]);
    if (key === centerKey) return; centerKey = key;
    const x = centerCv.getContext('2d'); const N = 512;
    const bg = x.createLinearGradient(0, 0, N, N); bg.addColorStop(0, '#1d2835'); bg.addColorStop(1, '#0d1218'); x.fillStyle = bg; x.fillRect(0, 0, N, N);
    x.strokeStyle = '#3c4a58'; x.lineWidth = 8; x.strokeRect(10, 10, N - 20, N - 20);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const ROT = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
    for (let s = 0; s < 4; s++) {
      x.save(); x.translate(N / 2, N / 2); x.rotate(ROT[s]);
      const turn = g.turn === s && !g.result;
      x.fillStyle = s === g.dealer ? '#ff8f80' : '#9fb3c8'; x.font = '900 60px "Zen Maru Gothic", "Hiragino Sans", sans-serif';
      x.fillText(MJG.WIND[g.seatWind(s)], -112, 196);
      x.fillStyle = turn ? '#ffd34d' : '#f2f5f8'; x.font = '900 58px "Nunito", system-ui, sans-serif';
      x.fillText(g.scores[s].toLocaleString('ja-JP'), 34, 198);
      if (turn) { x.fillStyle = '#ffd34d'; x.fillRect(-140, 232, 280, 8); }
      x.restore();
    }
    x.fillStyle = '#f2f5f8'; x.font = '900 62px "Zen Maru Gothic", "Hiragino Sans", sans-serif'; x.fillText(g.kyokuName(), N / 2, N / 2 - 78);
    x.fillStyle = '#b8c7d6'; x.font = '800 36px "Nunito", "Hiragino Sans", sans-serif';
    x.fillText(`${g.honba}本場 供託${g.sticks} 残${g.live.length}`, N / 2, N / 2 - 22);
    const n = g.doraInd.length, tw = 50, th = 68, gap = 6; let x0 = N / 2 - (n * tw + (n - 1) * gap) / 2 + 30;
    x.fillStyle = '#9fb3c8'; x.font = '800 28px "Zen Maru Gothic", "Hiragino Sans", sans-serif'; x.textAlign = 'right'; x.fillText('ドラ', x0 - 10, N / 2 + 46); x.textAlign = 'center';
    g.doraInd.forEach((t) => { const cv = faceCv[t]; if (cv) { x.fillStyle = '#d9cfb5'; x.fillRect(x0 - 2, N / 2 + 10, tw + 4, th + 6); x.drawImage(cv, x0, N / 2 + 12, tw, th); } x0 += tw + gap; });
    if (g.dice) { x.fillStyle = '#7f93a8'; x.font = '800 26px "Zen Maru Gothic", "Hiragino Sans", sans-serif'; x.fillText(`サイ ${g.dice[0]}・${g.dice[1]}`, N / 2, N / 2 + 118); }
    centerTex.needsUpdate = true;
  }
  // 山：68 山（各家 17 山 × 2 段）を、割れ目から時計回りにつながる輪として扱う。
  // サイコロの合計 S：親を1として反時計回りに S 番目の家の山を、その家から見て右端から S 山数え、その左で割る。
  // ツモは割れ目から時計回り（各家の山を右→左、取り切ったら上家の山の右端へ）。
  // 輪の最後の 7 山（割れ目のすぐ右）が王牌。嶺上牌は割れ目側の端から取り、ドラ表示牌はそこから 3 山目の上段、カンドラはその隣へ。
  const RINSHAN_K = [134, 135, 132, 133];
  const indK = (n) => 130 - 2 * n;
  function wallRing(g) {
    const S = (g.dice || [3, 4])[0] + (g.dice || [3, 4])[1];
    const owner = (g.dealer + S - 1) % 4;
    return (k) => {
      const r = Math.floor(k / 2), top = k % 2 === 0, tot = S + r;
      const s = (((owner - Math.floor(tot / 17)) % 4) + 4) % 4, j = tot % 17;
      return { s, x: 8 - j * W, z: r >= 61 ? 8.35 : 8.7, y: top ? H * 1.5 : H / 2 };
    };
  }
  function layoutWall(g) {
    const dummy = new T.Object3D(); dummy.rotation.order = 'YXZ'; const ring = wallRing(g);
    // 割れ目から取った枚数（配牌＋ツモ）。カンで海底が1枚早まっても、その牌は王牌に回るだけで動かない
    const front = 122 - g.live.length - (g.kanCount || 0);
    const gone = new Set(RINSHAN_K.slice(0, g.rinshanIdx || 0));
    const indicatorPos = new Set(g.doraInd.map((_, n) => indK(n)));
    let n = 0;
    for (let k = 0; k < 136; k++) {
      const removed = k < front || gone.has(k) || indicatorPos.has(k);
      const p = ring(k); const w = toWorld(p.s, p.x, p.y, p.z);
      dummy.position.copy(w); dummy.rotation.set(0, SEAT_A[p.s], Math.PI); dummy.scale.setScalar(removed ? 0.0001 : 1); dummy.updateMatrix();
      wall.setMatrixAt(n++, dummy.matrix);
    }
    wall.instanceMatrix.needsUpdate = true;
    indicators.forEach((m, k) => {
      const t = g.doraInd[k]; if (t == null) { m.visible = false; return; }
      const p = ring(indK(k)); const w = toWorld(p.s, p.x, p.y, p.z);
      m.material = [faceMats[t], backMat, sideMat]; m.visible = true; m.position.copy(w); m.rotation.set(0, SEAT_A[p.s], 0);
    });
  }
  // game の状態から全ての牌の置き場所を決める。reveal: 手牌を倒して見せる家の集合
  function update(g, opts = {}) {
    if (!renderer) return;
    const reveal = opts.reveal || new Set(); const placed = new Set(); let lastTg = null;
    const set = (id, tg, face) => { const m = meshes.get(id); placed.add(id); const fresh = !m.visible; m.visible = true; if (face) m.material = [faceOf(g, id), backMat, sideMat]; animateTo(m, tg, fresh); };
    for (let s = 0; s < 4; s++) {
      const p = g.players[s];
      // 河
      let row = 0, col = 0, xoff = 0;
      const shown = p.river.filter((rv) => !rv.called);
      shown.forEach((rv, k) => {
        if (k > 0 && k % 6 === 0 && row < 3) { row++; col = 0; xoff = 0; }
        const sideways = rv.riichi || (p.riichi && !p.river.some((x) => x.riichi && !x.called) && false); const wdt = sideways ? D : W;
        const x = -2.7 + xoff + wdt / 2; const z = 3.25 + row * D + D / 2;
        const tg = pose(s, x, z, sideways ? 'side' : 'flat');
        set(rv.id, tg, true);
        if (g.lastDiscard && g.lastDiscard.id === rv.id) lastTg = tg;
        xoff += wdt + 0.02; col++;
      });
      // 手牌
      const hand = p.hand.slice(); let drawn = null;
      if (p.drawn != null && hand.includes(p.drawn) && !reveal.has(s)) { hand.splice(hand.indexOf(p.drawn), 1); drawn = p.drawn; }
      hand.sort((a, b) => a - b); if (drawn != null) hand.push(drawn);
      const n = hand.length; const startX = -((n - 1) * W) / 2 - (drawn != null ? 0.25 : 0) - 1.2;
      hand.forEach((id, i) => {
        const x = startX + i * W + (drawn != null && i === n - 1 ? 0.5 : 0);
        if (reveal.has(s)) set(id, pose(s, x, 11.0, 'flat'), true);
        else if (s === 0) set(id, Object.assign(pose(0, x, 12.4, 'stand'), { y: -2 }), true); // 自分の手牌は画面下で操作（卓の下に隠す）
        else set(id, pose(s, x, 11.2, 'standback'), true);
      });
      // 副露（右手前から左へ）
      let mx = 12.6;
      p.melds.forEach((m) => {
        const rel = (m.from - s + 4) % 4; const order = [];
        const others = m.ids.filter((id) => id !== m.called && id !== m.added);
        if (m.kind === 'ankan') { m.ids.forEach((id, i) => order.push({ id, kind: i === 0 || i === 3 ? 'down' : 'flat' })); }
        else {
          const seq = others.map((id) => ({ id, kind: 'flat' }));
          const pos = m.kind === 'chi' || rel === 3 ? 0 : rel === 2 ? 1 : seq.length;
          seq.splice(pos, 0, { id: m.called, kind: 'side' });
          if (m.kind === 'kakan') seq.splice(pos + 1, 0, { id: m.added, kind: 'side' });
          order.push(...seq);
        }
        for (let i = order.length - 1; i >= 0; i--) { const o = order[i]; const wdt = o.kind === 'side' ? D : W; mx -= wdt / 2; set(o.id, pose(s, mx, 12.5 - (o.kind === 'side' ? (D - W) / 2 : 0), o.kind), true); mx -= wdt / 2 + 0.02; }
        mx -= 0.35;
      });
      // リーチ棒
      const st = sticks[s]; st.visible = !!p.riichi; if (p.riichi) { const w = toWorld(s, 0, 0.42, 2.25); st.position.copy(w); st.rotation.set(0, SEAT_A[s], 0); }
    }
    // 置き場所がない牌（山・王牌）は隠す
    meshes.forEach((m, id) => { if (!placed.has(id)) { m.visible = false; } });
    layoutWall(g); drawCenter(g);
    // 最後の打牌
    clearTimeout(api._lm); lastMark.visible = false;
    if (lastTg && !g.result) { lastMark.position.set(lastTg.x, 0.012, lastTg.z); lastMark.rotation.set(-Math.PI / 2, lastTg.ry, 0, 'YXZ'); api._lm = setTimeout(() => { lastMark.visible = true; kick(); }, 360); }
    kick();
  }
  function mount(el) {
    if (!renderer && !init()) return false;
    host = el; el.prepend(canvas);
    if (ro) ro.disconnect(); ro = new ResizeObserver(() => place()); ro.observe(el);
    place(); return true;
  }
  // 卓上のある点（各家のローカル座標）が画面のどこに来るか（発声の表示位置）
  function screenPos(s, x, z) {
    if (!renderer || !host) return null;
    const v = toWorld(s, x, 1, z).project(camera); const w = host.clientWidth, hh = host.clientHeight;
    return { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * hh };
  }
  function toggleView() { view = (view + 1) % VIEWS.length; place(); }
  return Object.assign(api, { prepare, mount, update, screenPos, toggleView, ok: () => !!renderer && !broken, ready: () => !!renderer && !broken, isBroken: () => broken });
})();
