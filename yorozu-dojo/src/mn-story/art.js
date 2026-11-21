// 絵：すべて canvas にコードで描く（画像ファイルなし＝権利の心配なし）
// 景色 drawScene(ctx, W, H, id, t) / 人物 drawBust(ctx, S, look, t, talking) / 数える馬 drawCount(ctx, W, H, n)

const TAU = Math.PI * 2;
const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = v => Math.max(0.1, v); // 半径は必ず正（負だと ellipse が例外を投げる）

function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, R(rx), R(ry), rot, 0, TAU); c.fill(); }
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, R(r), 0, TAU); c.fill(); }
function poly(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); }
function vgrad(c, y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }

// なだらかな丘
function ridge(c, W, H, base, amp, seed, color, freq = 1) {
  const r = rnd(seed * 97 + 13), p = [r() * 9, r() * 9, r() * 9];
  c.fillStyle = color; c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += W / 60) {
    const u = x / W * freq;
    c.lineTo(x, H * (base - amp * (.6 * Math.sin(u * 5 + p[0]) + .3 * Math.sin(u * 11 + p[1]) + .15 * Math.sin(u * 23 + p[2]))));
  }
  c.lineTo(W, H); c.closePath(); c.fill();
}
function cloud(c, x, y, s, a = .9) {
  c.fillStyle = `rgba(255,255,255,${a})`;
  ell(c, x, y, s * .5, s * .16); circ(c, x - s * .18, y - s * .08, s * .16); circ(c, x + s * .08, y - s * .14, s * .2);
}
function clouds(c, W, H, t, n, seed, top = .3) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const s = W * (.12 + r() * .12), sp = 4 + r() * 6;
    cloud(c, ((r() * W + t * sp) % (W + s * 2)) - s, H * (.06 + r() * top), s, .75 + r() * .2);
  }
}
function sunDisc(c, x, y, r, col) {
  const g = c.createRadialGradient(x, y, r * .2, x, y, r * 3);
  g.addColorStop(0, col); g.addColorStop(.3, col + "88"); g.addColorStop(1, col + "00");
  c.fillStyle = g; circ(c, x, y, r * 3); c.fillStyle = col; circ(c, x, y, r);
}

// ゲル（x, y は地面の中心）
function ger(c, x, y, s, door = "#d9480f", t = 0, smoke = false) {
  const h = s * .4, top = y - h;
  c.fillStyle = "#f3efe6"; c.fillRect(x - s / 2, top, s, h);
  c.fillStyle = "rgba(90,70,40,.12)"; c.fillRect(x + s * .15, top, s * .35, h);
  c.fillStyle = "#b9a789"; c.fillRect(x - s / 2, top + h * .3, s, s * .02); c.fillRect(x - s / 2, top + h * .72, s, s * .02);
  c.fillStyle = "#ebe5d8"; c.beginPath(); c.moveTo(x - s * .54, top + s * .02);
  c.quadraticCurveTo(x - s * .3, top - s * .2, x - s * .06, top - s * .24); c.lineTo(x + s * .06, top - s * .24);
  c.quadraticCurveTo(x + s * .3, top - s * .2, x + s * .54, top + s * .02); c.closePath(); c.fill();
  c.fillStyle = "#8a7558"; ell(c, x, top - s * .235, s * .07, s * .025);
  c.fillStyle = "#f1c24b"; c.fillRect(x - s * .1, y - h * .7, s * .2, h * .7);
  c.fillStyle = door; c.fillRect(x - s * .075, y - h * .62, s * .15, h * .62);
  if (smoke) {
    c.fillStyle = "#6b6b6b"; c.fillRect(x + s * .14, top - s * .3, s * .025, s * .14);
    for (let i = 0; i < 4; i++) {
      const k = (t * .25 + i / 4) % 1;
      c.fillStyle = `rgba(240,240,240,${.55 * (1 - k)})`;
      circ(c, x + s * .15 + Math.sin(k * 6 + i) * s * .04 + k * s * .2, top - s * .32 - k * s * .5, s * (.03 + k * .06));
    }
  }
}

// 動物（x, y は足元、s は体の長さ、dir=1 で右向き）
function horse(c, x, y, s, col, t = 0, run = false, rider = null, dir = 1) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  const g = run ? Math.sin(t * 14) : 0;
  c.strokeStyle = col; c.lineCap = "round"; c.lineWidth = s * .07;
  [[-.3, g], [-.2, -g], [.25, -g], [.35, g]].forEach(([lx, sw]) => {
    c.beginPath(); c.moveTo(s * lx, -s * .5); c.lineTo(s * (lx + sw * .12), -s * .02); c.stroke();
  });
  c.fillStyle = col; ell(c, 0, -s * .58, s * .42, s * .17);
  poly(c, [[s * .25, -s * .7], [s * .42, -s * .66], [s * .62, -s * 1.02], [s * .48, -s * 1.08]]);
  ell(c, s * .62, -s * 1.02, s * .15, s * .07, .55);
  c.strokeStyle = "rgba(20,10,5,.75)"; c.lineWidth = s * .05;
  c.beginPath(); c.moveTo(s * .3, -s * .74); c.lineTo(s * .5, -s * 1.1); c.stroke();
  c.beginPath(); c.moveTo(-s * .4, -s * .64); c.quadraticCurveTo(-s * .62, -s * .5 + g * s * .05, -s * .56, -s * .22); c.stroke();
  if (rider) {
    c.fillStyle = rider; c.fillRect(-s * .05, -s * 1.08, s * .2, s * .32);
    c.fillStyle = "#e3ae84"; circ(c, s * .07, -s * 1.18, s * .09);
    c.fillStyle = rider; ell(c, s * .07, -s * 1.25, s * .1, s * .05);
  }
  c.restore();
}
function sheep(c, x, y, s, dir = 1) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.strokeStyle = "#3b3b3b"; c.lineWidth = s * .08;
  [-.2, .2].forEach(lx => { c.beginPath(); c.moveTo(s * lx, -s * .3); c.lineTo(s * lx, 0); c.stroke(); });
  c.fillStyle = "#f6f3ec"; ell(c, 0, -s * .42, s * .42, s * .25); circ(c, -s * .2, -s * .55, s * .18); circ(c, s * .15, -s * .58, s * .18);
  c.fillStyle = "#2f2f2f"; ell(c, s * .45, -s * .5, s * .14, s * .1, .3);
  c.restore();
}
function goat(c, x, y, s, dir = 1) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.strokeStyle = "#6d4c35"; c.lineWidth = s * .07;
  [-.2, .22].forEach(lx => { c.beginPath(); c.moveTo(s * lx, -s * .3); c.lineTo(s * lx, 0); c.stroke(); });
  c.fillStyle = "#8b6a4f"; ell(c, 0, -s * .42, s * .38, s * .18); ell(c, s * .42, -s * .62, s * .12, s * .09, -.4);
  c.strokeStyle = "#3a2a1e"; c.lineWidth = s * .04; c.beginPath(); c.moveTo(s * .38, -s * .7); c.quadraticCurveTo(s * .3, -s * .9, s * .2, -s * .86); c.stroke();
  c.restore();
}
function cow(c, x, y, s, dir = 1) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.strokeStyle = "#4a2f20"; c.lineWidth = s * .09;
  [-.28, -.12, .2, .32].forEach(lx => { c.beginPath(); c.moveTo(s * lx, -s * .35); c.lineTo(s * lx, 0); c.stroke(); });
  c.fillStyle = "#5b3a29"; ell(c, 0, -s * .48, s * .45, s * .2); ell(c, s * .5, -s * .52, s * .14, s * .11);
  c.fillStyle = "#f2efe8"; ell(c, -s * .1, -s * .5, s * .12, s * .08);
  c.restore();
}
function camel(c, x, y, s, dir = 1) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.strokeStyle = "#a57c52"; c.lineWidth = s * .07;
  [-.25, -.12, .15, .28].forEach(lx => { c.beginPath(); c.moveTo(s * lx, -s * .5); c.lineTo(s * lx, 0); c.stroke(); });
  c.fillStyle = "#c39a6b"; ell(c, 0, -s * .6, s * .4, s * .16);
  circ(c, -s * .14, -s * .74, s * .13); circ(c, s * .14, -s * .74, s * .13);
  c.lineWidth = s * .09; c.strokeStyle = "#c39a6b"; c.beginPath(); c.moveTo(s * .32, -s * .62); c.quadraticCurveTo(s * .55, -s * .6, s * .5, -s * .95); c.stroke();
  ell(c, s * .58, -s * .98, s * .12, s * .06);
  c.restore();
}
function person(c, x, y, s, deel, hat = "#333") {
  c.fillStyle = deel; poly(c, [[x - s * .18, y], [x + s * .18, y], [x + s * .12, y - s * .6], [x - s * .12, y - s * .6]]);
  c.fillStyle = "#f4c542"; c.fillRect(x - s * .13, y - s * .38, s * .26, s * .06);
  c.fillStyle = "#e3ae84"; circ(c, x, y - s * .72, s * .12);
  c.fillStyle = hat; ell(c, x, y - s * .8, s * .13, s * .06);
}
function plane(c, x, y, s, a = 0) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = "#e9eef5"; ell(c, 0, 0, s * .5, s * .07);
  poly(c, [[-s * .38, -s * .02], [-s * .5, -s * .22], [-s * .42, -s * .22], [-s * .26, -s * .03]]);
  c.fillStyle = "#c8d3e2"; poly(c, [[-s * .05, 0], [s * .1, 0], [-s * .12, s * .26], [-s * .22, s * .26]]);
  c.fillStyle = "#2f6fd0"; c.fillRect(-s * .4, -s * .005, s * .86, s * .025);
  c.fillStyle = "#24324f"; for (let i = 0; i < 9; i++) circ(c, -s * .25 + i * s * .07, -s * .025, s * .011);
  c.restore();
}
function ovoo(c, x, y, s, t) {
  c.fillStyle = "#8b8f97"; ell(c, x, y - s * .15, s * .5, s * .18);
  c.fillStyle = "#a3a7ae"; ell(c, x, y - s * .32, s * .36, s * .15);
  c.fillStyle = "#b9bcc2"; ell(c, x, y - s * .47, s * .22, s * .12);
  c.fillStyle = "#6b4f2a"; c.fillRect(x - s * .025, y - s * 1.3, s * .05, s * .9);
  ["#2f6fd0", "#5aa3f0", "#f4f1e8", "#2f6fd0"].forEach((col, i) => {
    c.strokeStyle = col; c.lineWidth = s * .05; c.beginPath();
    const yy = y - s * (1.25 - i * .12); c.moveTo(x, yy);
    c.quadraticCurveTo(x + s * .25, yy + Math.sin(t * 3 + i) * s * .08, x + s * .45, yy + s * .1 + Math.sin(t * 3 + i + 1) * s * .1); c.stroke();
  });
}
function fire(c, x, y, s, t) {
  const g = c.createRadialGradient(x, y - s * .3, 1, x, y - s * .3, s * 3);
  g.addColorStop(0, "rgba(255,170,60,.45)"); g.addColorStop(1, "rgba(255,120,30,0)");
  c.fillStyle = g; circ(c, x, y - s * .3, s * 3);
  c.fillStyle = "#5a3a22"; c.fillRect(x - s * .5, y - s * .08, s, s * .1);
  [["#ff7a1a", 1], ["#ffb02e", .7], ["#fff1a8", .4]].forEach(([col, k], i) => {
    const f = 1 + .12 * Math.sin(t * 9 + i * 2);
    c.fillStyle = col; c.beginPath(); c.moveTo(x - s * .32 * k, y - s * .05);
    c.quadraticCurveTo(x - s * .3 * k, y - s * .6 * k * f, x + Math.sin(t * 5 + i) * s * .05, y - s * k * f);
    c.quadraticCurveTo(x + s * .3 * k, y - s * .6 * k * f, x + s * .32 * k, y - s * .05); c.fill();
  });
  for (let i = 0; i < 6; i++) { const k = (t * .6 + i / 6) % 1; c.fillStyle = `rgba(255,200,90,${1 - k})`; circ(c, x + Math.sin(i * 7 + k * 5) * s * .4, y - s - k * s * 2, s * .03); }
}
function building(c, x, y, w, h, col, lit, seed) {
  const r = rnd(seed);
  c.fillStyle = col; c.fillRect(x, y - h, w, h);
  for (let yy = y - h + h * .08; yy < y - h * .1; yy += h * .12)
    for (let xx = x + w * .12; xx < x + w * .85; xx += w * .22) { c.fillStyle = r() < lit ? "#ffd977" : "rgba(255,255,255,.35)"; c.fillRect(xx, yy, w * .12, h * .06); }
}
function stars(c, W, H, t, seed, n) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H * .62, s = r() * 1.6 + .4, ph = r() * 9;
    c.fillStyle = `rgba(255,255,240,${.45 + .55 * Math.abs(Math.sin(t * .8 + ph))})`; circ(c, x, y, s * W / 900);
  }
}

const SCENES = {
  title(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .7, "#f29e5f", "#fde3bf"); c.fillRect(0, 0, W, H);
    sunDisc(c, W * .74, H * .48, H * .08, "#fff2c2"); clouds(c, W, H, t, 3, 4, .2);
    ridge(c, W, H, .6, .06, 1, "#b69a8a"); ridge(c, W, H, .68, .05, 2, "#7f8f62"); ridge(c, W, H, .78, .04, 3, "#55703f");
    ger(c, W * .22, H * .86, W * .14, "#d9480f", t, true); ger(c, W * .36, H * .84, W * .1, "#2f6fd0");
    horse(c, W * .7, H * .7, W * .06, "#3d2a1e", t, false, "#2f6fd0");
    c.strokeStyle = "#5a4636"; c.lineWidth = W * .002;
    for (let i = 0; i < 3; i++) { const bx = (W * (.5 + i * .05) + t * 8) % W, by = H * (.2 + i * .04); c.beginPath(); c.moveTo(bx - 6, by - 3); c.lineTo(bx, by); c.lineTo(bx + 6, by - 3); c.stroke(); }
  },
  airport(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .6, "#5d97e0", "#cfe4f7"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 4, 7); ridge(c, W, H, .55, .07, 4, "#93a8b8");
    c.fillStyle = "#8c96a3"; c.fillRect(0, H * .62, W, H * .38);
    c.fillStyle = "#e9edf2"; c.fillRect(W * .05, H * .38, W * .62, H * .25);
    c.fillStyle = "#2f4f7a"; for (let i = 0; i < 12; i++) c.fillRect(W * (.07 + i * .05), H * .45, W * .04, H * .14);
    c.fillStyle = "#1d3d78"; c.fillRect(W * .12, H * .31, W * .48, H * .07);
    c.fillStyle = "#fff"; c.font = `700 ${H * .045}px Rubik, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("Тавтай морилно уу!", W * .36, H * .345);
    c.fillStyle = "#dfe5ec"; c.fillRect(W * .78, H * .24, W * .035, H * .38); c.fillStyle = "#2f4f7a"; c.fillRect(W * .765, H * .2, W * .065, H * .06);
    c.fillStyle = "#f2f2f2"; for (let i = 0; i < 8; i++) c.fillRect(W * (i * .14 - .02), H * .86, W * .07, H * .012);
    plane(c, W * .62, H * .74, W * .36);
  },
  city(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .6, "#4f86d6", "#c4dbf3"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 3, 9); ridge(c, W, H, .5, .1, 5, "#6f9161");
    for (let i = 0; i < 9; i++) ger(c, W * (.04 + i * .1), H * (.5 + (i % 3) * .02), W * .035, "#c2410c");
    const cols = ["#d7d2c8", "#9fb3c8", "#c9a27a", "#e6e1d7", "#7f95ad", "#b8c4d2", "#d9c6a5"];
    for (let i = 0; i < 9; i++) building(c, W * (i * .11 - .01), H * .8, W * .1, H * (.22 + ((i * 37) % 5) * .06), cols[i % 7], .25, i + 3);
    c.fillStyle = "#555b63"; c.fillRect(0, H * .8, W, H * .2); c.fillStyle = "#e9e0b8";
    for (let i = 0; i < 10; i++) c.fillRect(((i * W * .14 - t * 30) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * .1, H * .9, W * .06, H * .01);
    const cx = W * .3 + Math.sin(t * .5) * W * .02;
    c.fillStyle = "#2f7d55"; c.fillRect(cx, H * .83, W * .13, H * .045); c.fillRect(cx + W * .025, H * .8, W * .07, H * .035);
    c.fillStyle = "#1c1c1c"; circ(c, cx + W * .03, H * .875, H * .02); circ(c, cx + W * .1, H * .875, H * .02);
  },
  market(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .55, "#e8935a", "#f8d9ad"); c.fillRect(0, 0, W, H);
    sunDisc(c, W * .85, H * .2, H * .06, "#ffe7a8");
    c.fillStyle = "#b08b67"; c.fillRect(0, H * .66, W, H * .34);
    const aw = [["#c2410c", "#fff3e0"], ["#1d4ed8", "#e0ecff"], ["#15803d", "#ecfdf3"], ["#b91c1c", "#fff7d6"]];
    for (let i = 0; i < 4; i++) {
      const x = W * (.03 + i * .245), w = W * .21, [a, b] = aw[i];
      c.fillStyle = "#6b4f3a"; c.fillRect(x, H * .38, W * .008, H * .32); c.fillRect(x + w - W * .008, H * .38, W * .008, H * .32);
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? b : a; c.fillRect(x + k * w / 6, H * .34, w / 6, H * .08); }
      c.fillStyle = "#8a6a4e"; c.fillRect(x, H * .58, w, H * .1);
      const goods = ["#f59e0b", "#ef4444", "#84cc16", "#f97316", "#eab308"];
      for (let k = 0; k < 7; k++) { c.fillStyle = goods[(k + i) % 5]; circ(c, x + w * (.1 + k * .13), H * .565, H * .025); }
    }
    for (let i = 0; i < 6; i++) person(c, W * (.1 + i * .16) + Math.sin(t * .7 + i) * W * .01, H * .95, H * .3, ["#7c3aed", "#2563eb", "#b91c1c", "#0f766e", "#c2410c", "#334155"][i]);
    c.strokeStyle = "#5b4636"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * .12); c.quadraticCurveTo(W / 2, H * .24, W, H * .12); c.stroke();
    for (let i = 0; i < 14; i++) { const x = W * i / 13, y = H * .12 + Math.sin(Math.PI * i / 13) * H * .1; c.fillStyle = `rgba(255,214,120,${.6 + .4 * Math.sin(t * 2 + i)})`; circ(c, x, y + 4, H * .012); }
  },
  library(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .6, "#7d93c0", "#d6deee"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 3, 11, .15);
    c.fillStyle = "#7c9a6a"; c.fillRect(0, H * .78, W, H * .22);
    c.fillStyle = "#e8dcc4"; c.fillRect(W * .18, H * .4, W * .64, H * .38);
    c.fillStyle = "#d9cbb0"; poly(c, [[W * .14, H * .4], [W * .86, H * .4], [W * .5, H * .2]]);
    c.fillStyle = "#c9b896"; c.fillRect(W * .14, H * .38, W * .72, H * .03);
    for (let i = 0; i < 8; i++) { c.fillStyle = "#f4ecdc"; c.fillRect(W * (.21 + i * .08), H * .42, W * .035, H * .34); c.fillStyle = "rgba(80,60,30,.15)"; c.fillRect(W * (.235 + i * .08), H * .42, W * .01, H * .34); }
    c.fillStyle = "#3d4a5c"; c.fillRect(W * .46, H * .6, W * .08, H * .18);
    for (let i = 0; i < 3; i++) { c.fillStyle = ["#cfc3aa", "#c4b799", "#b9ab8c"][i]; c.fillRect(W * (.16 - i * .02), H * (.78 + i * .03), W * (.68 + i * .04), H * .03); }
    [[.07, .74], [.93, .74]].forEach(([x, y]) => { c.fillStyle = "#4f6f3f"; circ(c, W * x, H * y - H * .12, H * .12); c.fillStyle = "#5a3f2a"; c.fillRect(W * x - 3, H * y - H * .04, 6, H * .08); });
  },
  road(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .55, "#3f8ae6", "#c4e2fb"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 5, 13, .25); ridge(c, W, H, .52, .06, 6, "#8fae86"); ridge(c, W, H, .6, .03, 7, "#7eb356");
    c.fillStyle = "#6ea544"; c.fillRect(0, H * .62, W, H * .38);
    c.fillStyle = "#b9a27e"; poly(c, [[W * .44, H * .6], [W * .47, H * .6], [W * .62, H], [W * .2, H]]);
    c.fillStyle = "#e6dcc2"; for (let i = 0; i < 5; i++) { const k = ((i / 5 + t * .08) % 1), y0 = H * (.6 + k * k * .4); c.fillRect(W * (.455 - k * .03) , y0, W * (.004 + k * .012), H * .015 * (1 + k * 3)); }
    ovoo(c, W * .78, H * .72, H * .3, t);
  },
  ger(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .55, "#3d8be0", "#b9ddfa"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 4, 17); ridge(c, W, H, .5, .08, 8, "#8aa7a0"); ridge(c, W, H, .6, .04, 9, "#86b956");
    c.fillStyle = "#79ac48"; c.fillRect(0, H * .66, W, H * .34);
    ger(c, W * .3, H * .8, W * .22, "#d9480f", t, true); ger(c, W * .55, H * .74, W * .14, "#1e5aa8", t, true);
    c.strokeStyle = "#5a3f2a"; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .72, H * .78); c.lineTo(W * .92, H * .78); c.stroke();
    c.fillStyle = "#5a3f2a"; c.fillRect(W * .72, H * .74, 3, H * .1); c.fillRect(W * .92 - 3, H * .74, 3, H * .1);
    horse(c, W * .78, H * .88, W * .07, "#7a4a2a", t); horse(c, W * .88, H * .88, W * .065, "#2b2b2b", t, false, null, -1);
    for (let i = 0; i < 7; i++) sheep(c, W * (.08 + i * .05 + Math.sin(t * .2 + i) * .01), H * (.93 + (i % 2) * .03), W * .035, i % 2 ? 1 : -1);
  },
  pasture(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .55, "#7cb6ec", "#e9f3fb"); c.fillRect(0, 0, W, H);
    sunDisc(c, W * .15, H * .2, H * .06, "#fff6d0"); clouds(c, W, H, t, 3, 19, .2);
    ridge(c, W, H, .5, .06, 10, "#9db59a"); c.fillStyle = "#8fbf5a"; c.fillRect(0, H * .6, W, H * .4);
    ger(c, W * .12, H * .66, W * .08, "#d9480f", t, true);
    horse(c, W * .32, H * .75, W * .07, "#7a4a2a", t); horse(c, W * .42, H * .76, W * .065, "#e8e0d0", t, false, null, -1);
    cow(c, W * .58, H * .78, W * .08); camel(c, W * .8, H * .76, W * .1, -1);
    for (let i = 0; i < 5; i++) sheep(c, W * (.25 + i * .06), H * (.9 + (i % 2) * .04), W * .04, i % 2 ? 1 : -1);
    for (let i = 0; i < 3; i++) goat(c, W * (.62 + i * .07), H * (.92 + (i % 2) * .03), W * .04, i % 2 ? -1 : 1);
  },
  naadam(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .5, "#4a90e2", "#d4e9fa"); c.fillRect(0, 0, W, H);
    clouds(c, W, H, t, 3, 23, .15); ridge(c, W, H, .45, .05, 11, "#9bb08f");
    c.fillStyle = "#a9b86a"; c.fillRect(0, H * .5, W, H * .5);
    for (let i = 0; i < 6; i++) {
      const x = W * (.05 + i * .17); c.fillStyle = "#f8f6f0"; poly(c, [[x, H * .55], [x + W * .12, H * .55], [x + W * .06, H * .42]]);
      c.fillStyle = i % 2 ? "#2f6fd0" : "#c8102e"; c.fillRect(x, H * .53, W * .12, H * .02);
      c.fillStyle = "#6b4f2a"; c.fillRect(x + W * .06, H * .32, 2, H * .1);
      c.fillStyle = ["#c8102e", "#2f6fd0", "#f4c542"][i % 3]; poly(c, [[x + W * .06, H * .32], [x + W * .06 + W * .04 + Math.sin(t * 4 + i) * W * .005, H * .34], [x + W * .06, H * .36]]);
    }
    const crowd = ["#c8102e", "#2f6fd0", "#f4c542", "#15803d", "#7c3aed", "#f97316"];
    for (let i = 0; i < 40; i++) { c.fillStyle = crowd[i % 6]; circ(c, W * (i / 40) + 4, H * .6 + (i % 2) * 5, H * .018); c.fillStyle = "#e3ae84"; circ(c, W * (i / 40) + 4, H * .57 + (i % 2) * 5, H * .011); }
    c.fillStyle = "#c9b98a"; c.fillRect(0, H * .66, W, H * .12);
    for (let i = 0; i < 5; i++) {
      const x = ((t * 60 + i * W * .22) % (W * 1.3)) - W * .15;
      c.fillStyle = "rgba(200,180,140,.5)"; ell(c, x - W * .06, H * .76, W * .05, H * .025);
      horse(c, x, H * (.78 + (i % 2) * .02), W * .07, ["#7a4a2a", "#2b2b2b", "#a0522d", "#e8e0d0", "#5a3a22"][i], t + i, true, crowd[i]);
    }
    c.fillStyle = "#93a35c"; c.fillRect(0, H * .82, W, H * .18);
  },
  night(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .7, "#070c1f", "#24335f"); c.fillRect(0, 0, W, H);
    c.save(); c.translate(W * .5, H * .3); c.rotate(-.35);
    const mw = c.createLinearGradient(0, -H * .12, 0, H * .12); mw.addColorStop(0, "rgba(180,190,255,0)"); mw.addColorStop(.5, "rgba(200,205,255,.16)"); mw.addColorStop(1, "rgba(180,190,255,0)");
    c.fillStyle = mw; c.fillRect(-W, -H * .12, W * 2, H * .24); c.restore();
    stars(c, W, H, t, 31, 160); c.fillStyle = "#f4f1dc"; circ(c, W * .85, H * .15, H * .04);
    ridge(c, W, H, .62, .05, 12, "#121c2e"); c.fillStyle = "#0f1a14"; c.fillRect(0, H * .72, W, H * .28);
    ger(c, W * .2, H * .8, W * .17, "#ffb347", t, true);
    fire(c, W * .62, H * .88, H * .12, t);
    [[.5, -1], [.56, -1], [.7, 1], [.75, 1]].forEach(([x], i) => person(c, W * x, H * .93, H * .22, "#1a2238", "#11182b"));
  },
  farewell(c, W, H, t) {
    c.fillStyle = vgrad(c, 0, H * .7, "#5b4a8f", "#f6a96b"); c.fillRect(0, 0, W, H);
    sunDisc(c, W * .3, H * .6, H * .09, "#ffd59a");
    ridge(c, W, H, .66, .04, 14, "#4c3f6b"); c.fillStyle = "#3a3152"; c.fillRect(0, H * .74, W, H * .26);
    c.fillStyle = "#2b2440"; c.fillRect(W * .55, H * .62, W * .4, H * .12); c.fillRect(W * .88, H * .48, W * .03, H * .26);
    const k = (t * .06) % 1;
    c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W * .1, H * .7); c.lineTo(W * (.1 + k * .8), H * (.7 - k * .55)); c.stroke();
    plane(c, W * (.1 + k * .8), H * (.7 - k * .55), W * .16, -.55);
  },
};

function drawScene(c, W, H, id, t) { c.save(); (SCENES[id] || SCENES.title)(c, W, H, t); c.restore(); }

// 胸から上の人物。talking 中は口が動く
function drawBust(c, S, L, t = 0, talking = false) {
  c.clearRect(0, 0, S, S);
  c.save(); c.beginPath(); c.arc(S / 2, S / 2, S / 2, 0, TAU); c.clip();
  c.fillStyle = L.bg; c.fillRect(0, 0, S, S);
  const b = Math.sin(t * 2) * S * .006, hx = S / 2, hy = S * .44 + b, hr = S * .2;
  if (L.style === "braid") { c.fillStyle = L.hair; ell(c, hx - hr * .9, hy + hr * 1.2, hr * .22, hr * .9); }
  if (L.style === "bun" && L.hat !== "scarf") { c.fillStyle = L.hair; circ(c, hx, hy - hr * 1.05, hr * .38); }
  c.fillStyle = L.deel; ell(c, hx, S * 1.04, S * .42, S * .32);
  c.fillStyle = L.skin; c.fillRect(hx - S * .055, hy + hr * .6, S * .11, S * .14);
  c.fillStyle = L.trim; ell(c, hx, S * .76 + b, S * .12, S * .035);
  c.strokeStyle = L.trim; c.lineWidth = S * .025; c.beginPath(); c.moveTo(hx, S * .78); c.quadraticCurveTo(hx + S * .14, S * .8, hx + S * .2, S * .95); c.stroke();
  c.fillStyle = "#f4c542"; [[.08, .8], [.15, .86]].forEach(([dx, dy]) => circ(c, hx + S * dx, S * dy, S * .012));
  c.fillStyle = L.skin; circ(c, hx - hr * .98, hy + hr * .1, hr * .17); circ(c, hx + hr * .98, hy + hr * .1, hr * .17); circ(c, hx, hy, hr);
  c.fillStyle = L.hair;
  if (L.hat !== "scarf") {
    c.beginPath(); c.arc(hx, hy, hr * 1.04, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
    if (L.style === "bob") { c.fillRect(hx - hr * 1.08, hy - hr * .2, hr * .3, hr * 1.1); c.fillRect(hx + hr * .78, hy - hr * .2, hr * .3, hr * 1.1); }
    if (L.style === "short" || L.style === "braid" || L.style === "bun") ell(c, hx - hr * .35, hy - hr * .55, hr * .55, hr * .3, -.3);
  }
  const blink = (t % 4.3) < .12;
  c.fillStyle = "#1d1714";
  [-1, 1].forEach(s => blink ? c.fillRect(hx + s * hr * .38 - hr * .1, hy + hr * .08, hr * .2, hr * .04) : ell(c, hx + s * hr * .38, hy + hr * .1, hr * .085, hr * .11));
  c.fillStyle = "rgba(235,110,110,.28)"; circ(c, hx - hr * .6, hy + hr * .42, hr * .16); circ(c, hx + hr * .6, hy + hr * .42, hr * .16);
  if (L.mustache) { c.fillStyle = L.hair; ell(c, hx, hy + hr * .5, hr * .3, hr * .07); }
  if (talking) { c.fillStyle = "#7a2e2e"; ell(c, hx, hy + hr * .66, hr * .14, hr * (.05 + .07 * Math.abs(Math.sin(t * 16)))); }
  else { c.strokeStyle = "#7a2e2e"; c.lineWidth = hr * .07; c.beginPath(); c.arc(hx, hy + hr * .5, hr * .2, .25 * Math.PI, .75 * Math.PI); c.stroke(); }
  if (L.glasses) { c.strokeStyle = "#2b2b2b"; c.lineWidth = hr * .06; [-1, 1].forEach(s => { c.beginPath(); c.arc(hx + s * hr * .38, hy + hr * .1, hr * .22, 0, TAU); c.stroke(); }); c.beginPath(); c.moveTo(hx - hr * .16, hy + hr * .08); c.lineTo(hx + hr * .16, hy + hr * .08); c.stroke(); }
  c.fillStyle = L.hatC;
  switch (L.hat) {
    case "pillbox": c.fillRect(hx - hr * .7, hy - hr * 1.3, hr * 1.4, hr * .45); c.fillStyle = "#e7b43c"; c.fillRect(hx - hr * .7, hy - hr * .95, hr * 1.4, hr * .1); break;
    case "cap": c.beginPath(); c.arc(hx, hy - hr * .35, hr * .95, Math.PI, 0); c.fill(); ell(c, hx + hr * .7, hy - hr * .38, hr * .6, hr * .12); break;
    case "brim": ell(c, hx, hy - hr * .55, hr * 1.5, hr * .22); c.beginPath(); c.arc(hx, hy - hr * .55, hr * .8, Math.PI, 0); c.fill(); break;
    case "jockey": c.beginPath(); c.arc(hx, hy - hr * .3, hr, Math.PI, 0); c.fill(); c.fillStyle = "#fde047"; circ(c, hx, hy - hr * 1.32, hr * .16); c.fillStyle = L.hatC; ell(c, hx + hr * .55, hy - hr * .3, hr * .55, hr * .1); break;
    case "scarf": c.beginPath(); c.arc(hx, hy, hr * 1.12, Math.PI * .92, Math.PI * 2.08); c.fill(); poly(c, [[hx - hr * 1.1, hy + hr * .1], [hx - hr * .95, hy + hr * .9], [hx - hr * .6, hy + hr * .2]]); c.fillStyle = "rgba(255,255,255,.25)"; for (let i = 0; i < 4; i++) circ(c, hx - hr * .5 + i * hr * .35, hy - hr * .7, hr * .07); break;
    case "loovuuz": c.fillStyle = "#c9a26b"; ell(c, hx, hy - hr * .7, hr * 1.15, hr * .32); c.fillStyle = L.hatC; poly(c, [[hx - hr * .75, hy - hr * .8], [hx + hr * .75, hy - hr * .8], [hx, hy - hr * 1.75]]); c.fillStyle = "#c8102e"; circ(c, hx, hy - hr * 1.75, hr * .12); break;
  }
  c.restore();
}

// 「何頭いる？」の馬の絵
function drawCount(c, W, H, n) {
  c.fillStyle = "#e8f1dc"; c.fillRect(0, 0, W, H);
  c.fillStyle = "#c9dcae"; c.fillRect(0, H * .55, W, H * .45);
  const cols = n > 5 ? 5 : n, rows = Math.ceil(n / 5), s = Math.min(W / (cols + 1) * .8, H / (rows + .4) * .5);
  const horseCols = ["#7a4a2a", "#2b2b2b", "#a0522d", "#5a3a22", "#8b6a4f"];
  for (let i = 0; i < n; i++) {
    const r = i / 5 | 0, k = i % 5, inRow = Math.min(5, n - r * 5);
    horse(c, W / 2 + (k - (inRow - 1) / 2) * s * 1.25, H * (.42 + r * .42) + s * .1, s, horseCols[i % 5]);
  }
}
