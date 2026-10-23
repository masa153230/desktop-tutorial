import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// ブラウザごとの動画まわりの挙動を CI のログに出すだけのテスト (常に通る)
const here = path.dirname(fileURLToPath(import.meta.url));
test('動画まわりの挙動を記録する', async ({ page, browserName }) => {
  await page.goto('index.html');
  await page.waitForFunction(() => window.SwingLab);
  await page.addScriptTag({ content: 'window.__noAuto=1' });
  const file = path.join(here, 'fixtures', `swing60.${browserName === 'chromium' ? 'webm' : 'mp4'}`);
  await page.setInputFiles('#fileB', file).catch(() => {});
  const v = await page.evaluate(async () => {
    const out = {}, v = document.createElement('video');
    v.muted = true; v.playsInline = true; document.body.appendChild(v);
    const f = document.getElementById('fileB').files[0] || window.SwingLab.slots.B.file;
    v.src = URL.createObjectURL(f);
    await new Promise((r) => { v.onloadedmetadata = r; setTimeout(r, 5000); });
    out.meta = [v.videoWidth, v.videoHeight, v.duration, v.readyState];
    out.rvfc = 'requestVideoFrameCallback' in v;
    let n = 0; if (out.rvfc) { const cb = () => { n++; v.requestVideoFrameCallback(cb); }; v.requestVideoFrameCallback(cb); }
    try { await v.play(); out.play = 'ok'; } catch (e) { out.play = e.name; }
    await new Promise((r) => setTimeout(r, 1500));
    out.afterPlay = { t: v.currentTime, paused: v.paused, rvfcCalls: n };
    v.pause();
    const ts = [];
    for (const t of [0.5, 1.0, 1.5, 2.0]) { const t0 = performance.now(); await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = t; setTimeout(r, 3000); }); ts.push(Math.round(performance.now() - t0)); }
    out.seekMs = ts;
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; const x = c.getContext('2d');
    try { x.drawImage(v, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data; let m = 0; for (let i = 0; i < d.length; i += 4) m = Math.max(m, d[i] + d[i + 1] + d[i + 2]); out.draw = m; } catch (e) { out.draw = e.name; }
    return out;
  });
  console.log(`[probe ${browserName}]`, JSON.stringify(v));
});
