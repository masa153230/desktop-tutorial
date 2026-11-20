/* チェスの3D盤（Three.js r128）。1つのキャンバスを使い回し、画面の描き直しのたびに新しい入れ物へ付け替える。
 * 使い方: Chess3D.ready() → true なら Chess3D.mount(el), Chess3D.setPosition(board, flip), Chess3D.setMarks(marks), Chess3D.onTap = fn(sq)
 */
const Chess3D = (() => {
  let T = null, renderer = null, scene, camera, canvas, boardTop, boardTexW, boardTexB, frame;
  let broken = false, flip = false, raf = 0, dirty = true, host = null, ro = null;
  let az = 0, polar = 0.6; const AZ_LIM = 1.1;
  const pieces = []; // {mesh, type, color, sq}
  const anims = [];
  const geo = {}; let matW, matB, markMats, overlays = [], dots = [], rings = [];
  const api = { onTap: null };
  const FILES = 'abcdefgh';

  function load() {
    if (window.THREE) return Promise.resolve(true);
    if (api._loading) return api._loading;
    const add = (src) => new Promise((res) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(!!window.THREE); s.onerror = () => res(false); document.head.append(s); });
    api._loading = add('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then((ok) => ok || add('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'));
    return api._loading;
  }
  const sqPos = (sq) => ({ x: sq.charCodeAt(0) - 97 - 3.5, z: 3.5 - (+sq[1] - 1) });
  function lathe(pts, segs = 40) { return new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), segs); }
  function merge(parts) { const g = new T.Group(); parts.forEach((p) => g.add(p)); return g; }
  function buildGeometries() {
    geo.p = [lathe([[0, 0], [0.32, 0], [0.33, 0.04], [0.3, 0.08], [0.24, 0.12], [0.2, 0.16], [0.13, 0.22], [0.1, 0.38], [0.17, 0.42], [0.17, 0.45], [0.09, 0.47], [0, 0.47]])];
    geo.p.push(Object.assign(new T.SphereGeometry(0.135, 28, 20), { _y: 0.57 }));
    geo.r = [lathe([[0, 0], [0.36, 0], [0.37, 0.05], [0.33, 0.09], [0.26, 0.14], [0.22, 0.2], [0.2, 0.56], [0.27, 0.6], [0.28, 0.76], [0.2, 0.76], [0.2, 0.7], [0, 0.7]])];
    for (let k = 0; k < 6; k++) { const b = new T.BoxGeometry(0.11, 0.12, 0.09); b.translate(0, 0.79, 0.235); b.rotateY(k * Math.PI / 3); geo.r.push(b); }
    geo.b = [lathe([[0, 0], [0.34, 0], [0.35, 0.05], [0.3, 0.09], [0.24, 0.13], [0.2, 0.18], [0.12, 0.52], [0.2, 0.56], [0.2, 0.59], [0.11, 0.61], [0.16, 0.7], [0.18, 0.79], [0.15, 0.88], [0.09, 0.95], [0.03, 0.99], [0, 1.0]])];
    geo.b.push(Object.assign(new T.SphereGeometry(0.05, 16, 12), { _y: 1.03 }));
    geo.q = [lathe([[0, 0], [0.37, 0], [0.38, 0.05], [0.33, 0.1], [0.26, 0.15], [0.22, 0.2], [0.13, 0.62], [0.22, 0.66], [0.22, 0.69], [0.14, 0.72], [0.19, 0.88], [0.25, 0.99], [0.18, 1.0], [0.1, 1.03], [0, 1.04]])];
    for (let k = 0; k < 8; k++) { const s = new T.SphereGeometry(0.045, 12, 10); s.translate(0.21 * Math.cos(k * Math.PI / 4), 1.01, 0.21 * Math.sin(k * Math.PI / 4)); geo.q.push(s); }
    geo.q.push(Object.assign(new T.SphereGeometry(0.075, 16, 12), { _y: 1.1 }));
    geo.k = [lathe([[0, 0], [0.38, 0], [0.39, 0.05], [0.34, 0.1], [0.27, 0.15], [0.23, 0.21], [0.14, 0.68], [0.23, 0.72], [0.23, 0.75], [0.15, 0.78], [0.2, 0.97], [0.14, 1.03], [0, 1.05]])];
    const c1 = new T.BoxGeometry(0.075, 0.26, 0.075); c1.translate(0, 1.18, 0); const c2 = new T.BoxGeometry(0.2, 0.07, 0.075); c2.translate(0, 1.2, 0); geo.k.push(c1, c2);
    // ナイト：台座＋押し出した馬の頭（+x が前）
    geo.n = [lathe([[0, 0], [0.35, 0], [0.36, 0.05], [0.31, 0.09], [0.26, 0.13], [0.24, 0.18], [0, 0.18]])];
    const sh = new T.Shape();
    const P = [[-0.22, 0.16], [0.2, 0.16], [0.17, 0.34], [0.1, 0.44], [0.27, 0.53], [0.36, 0.64], [0.33, 0.74], [0.12, 0.72], [0.06, 0.84], [0.0, 0.93], [-0.06, 0.86], [-0.13, 0.9], [-0.2, 0.8], [-0.27, 0.6], [-0.25, 0.36]];
    sh.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) sh.lineTo(P[i][0], P[i][1]); sh.lineTo(P[0][0], P[0][1]);
    const ex = new T.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 6 });
    ex.translate(0, 0, -0.1); geo.n.push(ex);
  }
  function pieceMesh(type, color) {
    const g = new T.Group(); const inner = new T.Group(); inner.scale.setScalar(1.28); g.add(inner); const mat = color === 'w' ? matW : matB;
    for (const part of geo[type]) { const m = new T.Mesh(part, mat); if (part._y) m.position.y = part._y; m.castShadow = true; m.receiveShadow = true; inner.add(m); }
    if (type === 'n') inner.children[1].rotation.y = color === 'w' ? Math.PI / 2 : -Math.PI / 2;
    if (type === 'b') { // ミトラの切れ込み
      const cut = new T.Mesh(new T.BoxGeometry(0.03, 0.14, 0.32), color === 'w' ? matB : matW); cut.position.set(0, 0.86, 0); cut.rotation.z = 0.55; inner.add(cut);
    }
    g.userData = { type, color };
    return g;
  }
  function boardTexture(flipped) {
    const N = 1024, cv = document.createElement('canvas'); cv.width = cv.height = N; const x = cv.getContext('2d');
    const cell = N / 9, o = cell / 2;
    // 外枠（濃い木）
    const g = x.createLinearGradient(0, 0, N, N); g.addColorStop(0, '#5a3a22'); g.addColorStop(1, '#3d2716'); x.fillStyle = g; x.fillRect(0, 0, N, N);
    for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * N; x.moveTo(0, y); x.bezierCurveTo(N / 3, y + Math.random() * 20 - 10, 2 * N / 3, y + Math.random() * 20 - 10, N, y + Math.random() * 10 - 5); x.stroke(); }
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const light = (f + r) % 2 === 0; // a8（左上）は明るいマス
      x.fillStyle = light ? '#ecd6ad' : '#a8754b'; x.fillRect(o + f * cell, o + r * cell, cell, cell);
      for (let k = 0; k < 7; k++) { x.strokeStyle = light ? 'rgba(150,100,50,.10)' : 'rgba(60,30,10,.16)'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const yy = o + r * cell + Math.random() * cell; x.moveTo(o + f * cell, yy); x.quadraticCurveTo(o + f * cell + cell / 2, yy + Math.random() * 10 - 5, o + (f + 1) * cell, yy + Math.random() * 6 - 3); x.stroke(); }
    }
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 4; x.strokeRect(o, o, cell * 8, cell * 8);
    x.fillStyle = '#e9d6b4'; x.font = `600 ${Math.round(cell * 0.32)}px system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const txt = (s, cx, cy) => { x.save(); x.translate(cx, cy); if (flipped) x.rotate(Math.PI); x.fillText(s, 0, 0); x.restore(); };
    for (let f = 0; f < 8; f++) { txt(FILES[f], o + (f + 0.5) * cell, N - o / 2); txt(FILES[f], o + (f + 0.5) * cell, o / 2); }
    for (let r = 0; r < 8; r++) { txt(String(8 - r), o / 2, o + (r + 0.5) * cell); txt(String(8 - r), N - o / 2, o + (r + 0.5) * cell); }
    const t = new T.CanvasTexture(cv); t.anisotropy = 4; if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t;
  }
  function init() {
    if (renderer || broken) return !!renderer;
    if (!window.THREE) return false;
    T = window.THREE;
    try {
      canvas = document.createElement('canvas'); canvas.className = 'board3d-canvas';
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch { broken = true; renderer = null; return false; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); broken = true; if (api.onBroken) api.onBroken(); });
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(36, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xfff6e8, 0x2a2420, 0.55));
    const sun = new T.DirectionalLight(0xffffff, 1.25); sun.position.set(-4, 11, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); sun.shadow.bias = -0.0008; sun.shadow.radius = 3;
    scene.add(sun);
    const fill = new T.DirectionalLight(0xbfd4ff, 0.25); fill.position.set(6, 5, -6); scene.add(fill);
    matW = new T.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.42, metalness: 0.02 });
    matB = new T.MeshStandardMaterial({ color: 0x15110f, roughness: 0.26, metalness: 0.18 });
    buildGeometries();
    boardTexW = boardTexture(false); boardTexB = boardTexture(true);
    frame = new T.Mesh(new T.BoxGeometry(9, 0.35, 9), new T.MeshStandardMaterial({ color: 0x3f2817, roughness: 0.6 })); frame.position.y = -0.18; frame.receiveShadow = true; scene.add(frame);
    boardTop = new T.Mesh(new T.PlaneGeometry(9, 9), new T.MeshStandardMaterial({ map: boardTexW, roughness: 0.55, metalness: 0.0 }));
    boardTop.rotation.x = -Math.PI / 2; boardTop.position.y = 0.001; boardTop.receiveShadow = true; scene.add(boardTop);
    const shadowCatcher = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: 0.18 })); shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = -0.36; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);
    markMats = {
      sel: new T.MeshBasicMaterial({ color: 0x3348c8, transparent: true, opacity: 0.45 }), last: new T.MeshBasicMaterial({ color: 0xf0b400, transparent: true, opacity: 0.38 }),
      chk: new T.MeshBasicMaterial({ color: 0xe02020, transparent: true, opacity: 0.55 }), hint: new T.MeshBasicMaterial({ color: 0x18a050, transparent: true, opacity: 0.5 }),
      pick: new T.MeshBasicMaterial({ color: 0x3348c8, transparent: true, opacity: 0.5 }), ok: new T.MeshBasicMaterial({ color: 0x18a050, transparent: true, opacity: 0.55 }),
      ng: new T.MeshBasicMaterial({ color: 0xd03030, transparent: true, opacity: 0.6 }), miss: new T.MeshBasicMaterial({ color: 0x18a050, transparent: true, opacity: 0.3 }),
      from: new T.MeshBasicMaterial({ color: 0xf0b400, transparent: true, opacity: 0.55 }), dot: new T.MeshBasicMaterial({ color: 0x14203c, transparent: true, opacity: 0.35 }),
    };
    for (let i = 0; i < 64; i++) { const m = new T.Mesh(new T.PlaneGeometry(0.98, 0.98), markMats.sel); m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.visible = false; scene.add(m); overlays.push(m); }
    for (let i = 0; i < 32; i++) {
      const d = new T.Mesh(new T.CircleGeometry(0.15, 24), markMats.dot); d.rotation.x = -Math.PI / 2; d.position.y = 0.012; d.visible = false; scene.add(d); dots.push(d);
      const r = new T.Mesh(new T.RingGeometry(0.36, 0.46, 32), markMats.dot); r.rotation.x = -Math.PI / 2; r.position.y = 0.012; r.visible = false; scene.add(r); rings.push(r);
    }
    // 操作：ドラッグで視点、タップでマス選択
    let down = null;
    canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, az, polar, moved: false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 8) down.moved = true;
      if (down.moved) { az = Math.max(-AZ_LIM, Math.min(AZ_LIM, down.az - dx * 0.008)); polar = Math.max(0.12, Math.min(1.2, down.polar - dy * 0.006)); place(); }
    });
    canvas.addEventListener('pointerup', (e) => { const d = down; down = null; if (d && !d.moved) tapAt(e); });
    canvas.addEventListener('pointercancel', () => { down = null; });
    return true;
  }
  const ray = () => new T.Raycaster();
  function tapAt(e) {
    if (!api.onTap) return;
    const r = canvas.getBoundingClientRect();
    const v = new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = ray(); rc.setFromCamera(v, camera);
    const hitP = rc.intersectObjects(pieces.map((p) => p.mesh), true)[0];
    if (hitP) { let o = hitP.object; while (o.parent && !o.userData.type) o = o.parent; const p = pieces.find((x) => x.mesh === o); if (p) { api.onTap(p.sq); return; } }
    const hitB = rc.intersectObject(boardTop)[0];
    if (hitB) {
      const f = Math.floor(hitB.point.x + 4), rr = Math.floor(4 - hitB.point.z);
      if (f >= 0 && f < 8 && rr >= 0 && rr < 8) api.onTap(FILES[f] + (rr + 1));
    }
  }
  function place() {
    if (!renderer) return;
    const w = host ? host.clientWidth : 360, hgt = host ? host.clientHeight : 340;
    if (!w || !hgt) return;
    renderer.setSize(w, hgt, false); camera.aspect = w / hgt; camera.updateProjectionMatrix();
    // 盤全体（半幅4.6）が収まる距離
    const vt = Math.tan((camera.fov * Math.PI / 180) / 2), ht = vt * camera.aspect;
    const need = Math.max(4.75 / ht, (4.5 * Math.cos(polar) + 1.4 * Math.sin(polar)) / vt) * 1.02;
    const base = flip ? Math.PI : 0; const a = base + az;
    camera.position.set(Math.sin(a) * Math.sin(polar) * need, Math.cos(polar) * need, Math.cos(a) * Math.sin(polar) * need);
    camera.lookAt(0, 0.2, 0);
    kick();
  }
  function kick() { dirty = true; if (!raf) raf = requestAnimationFrame(loop); }
  function loop(t) {
    raf = 0; let active = false; const now = performance.now();
    for (let i = anims.length - 1; i >= 0; i--) {
      const a = anims[i]; const k = Math.min(1, (now - a.t0) / a.dur); const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      a.step(e, k);
      if (k >= 1) { anims.splice(i, 1); if (a.done) a.done(); } else active = true;
    }
    if (dirty || active) { renderer.render(scene, camera); dirty = false; }
    if (active) raf = requestAnimationFrame(loop);
  }
  // board: chess.js の board()（[0][0] が a8）
  function setPosition(board, flipped, animate = true) {
    if (!renderer) return;
    if (flip !== flipped) { flip = flipped; boardTop.material.map = flip ? boardTexB : boardTexW; boardTop.material.needsUpdate = true; az = 0; place(); }
    const want = [];
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const x = board[r][f]; if (x) want.push({ type: x.type, color: x.color, sq: FILES[f] + (8 - r) }); }
    const old = pieces.splice(0); const used = new Set(); const next = [];
    // 同じマスに同じ駒 → そのまま
    for (const w of want) { const i = old.findIndex((o, k) => !used.has(k) && o.sq === w.sq && o.type === w.type && o.color === w.color); if (i >= 0) { used.add(i); next.push(Object.assign(old[i], { sq: w.sq })); w.done = true; } }
    // 動いた駒 → 近い同種の駒を割り当てる
    for (const w of want) {
      if (w.done) continue; const p = sqPos(w.sq); let bi = -1, bd = 1e9;
      old.forEach((o, k) => { if (used.has(k) || o.type !== w.type || o.color !== w.color) return; const q = sqPos(o.sq); const d = (p.x - q.x) ** 2 + (p.z - q.z) ** 2; if (d < bd) { bd = d; bi = k; } });
      if (bi >= 0) {
        used.add(bi); const o = old[bi]; const from = sqPos(o.sq); o.sq = w.sq; next.push(o);
        if (animate) { const m = o.mesh; const lift = o.type === 'n' ? 0.55 : 0.12; anims.push({ t0: performance.now(), dur: 320, step: (e) => { m.position.x = from.x + (p.x - from.x) * e; m.position.z = from.z + (p.z - from.z) * e; m.position.y = Math.sin(Math.PI * e) * lift; } }); }
        else { o.mesh.position.set(p.x, 0, p.z); }
      } else { // 新しい駒（昇格・初期配置）
        const m = pieceMesh(w.type, w.color); m.position.set(p.x, 0, p.z); scene.add(m); next.push({ mesh: m, type: w.type, color: w.color, sq: w.sq });
        if (animate && old.length) { m.scale.setScalar(0.01); anims.push({ t0: performance.now(), dur: 300, step: (e) => m.scale.setScalar(Math.max(0.01, e)) }); }
      }
    }
    // 取られた駒 → 縮んで消える
    old.forEach((o, k) => { if (used.has(k)) return; const m = o.mesh; if (animate) anims.push({ t0: performance.now(), dur: 260, step: (e) => { m.scale.setScalar(Math.max(0.01, 1 - e)); m.position.y = e * 0.3; }, done: () => scene.remove(m) }); else scene.remove(m); });
    pieces.push(...next);
    kick();
  }
  // marks: { [sq]: 'sel'|'last'|'chk'|'hint'|'pick'|'ok'|'ng'|'miss'|'from' }, dots: [{sq, cap}]
  function setMarks(marks = {}, dl = []) {
    if (!renderer) return;
    let i = 0;
    for (const [sq, kind] of Object.entries(marks)) { if (i >= 64) break; const o = overlays[i++]; const p = sqPos(sq); o.position.x = p.x; o.position.z = p.z; o.material = markMats[kind] || markMats.sel; o.visible = true; o.position.y = kind === 'chk' ? 0.008 : 0.006; }
    for (; i < 64; i++) overlays[i].visible = false;
    dots.forEach((d) => { d.visible = false; }); rings.forEach((r) => { r.visible = false; });
    dl.slice(0, 32).forEach((d, k) => { const m = d.cap ? rings[k] : dots[k]; const p = sqPos(d.sq); m.position.x = p.x; m.position.z = p.z; m.visible = true; });
    kick();
  }
  function mount(el) {
    if (!init()) return false;
    host = el; el.append(canvas);
    if (ro) ro.disconnect();
    ro = new ResizeObserver(() => place()); ro.observe(el);
    place();
    return true;
  }
  function resetView() { az = 0; polar = 0.6; place(); }
  function topView() { polar = polar < 0.3 ? 0.6 : 0.12; az = 0; place(); }
  return Object.assign(api, { load, mount, setPosition, setMarks, resetView, topView, ok: () => !!window.THREE && !broken, isBroken: () => broken });
})();
