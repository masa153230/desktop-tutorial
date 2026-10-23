import { test, expect } from '@playwright/test';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
// 合成動画: 棒が回るだけのスイング。正解は 始動 0.80s / トップ 1.565s / インパクト 1.83s (実時間)
const fx = (name, browserName) => path.join(here, 'fixtures', `${name}.${browserName === 'chromium' ? 'webm' : 'mp4'}`);
const TRUTH = { start: 0.80, top: 1.565, impact: 1.83 };

async function open(page) {
  await page.goto('index.html');
  await page.waitForFunction(() => window.SwingLab);
}
async function loadVideo(page, slot, file) {
  await page.setInputFiles('#file' + slot, file);
  await page.waitForFunction((s) => window.SwingLab.slots[s].v.videoWidth > 0, slot);
  await page.waitForFunction((s) => !window.SwingLab.slots[s].busy && window.SwingLab.slots[s].marks.impact != null, slot, { timeout: 90_000 });
}
const marks = (page, slot = 'A') => page.evaluate((s) => ({ ...window.SwingLab.slots[s].marks, slow: window.SwingLab.slots[s].slow }), slot);
const expectNear = (got, want, tol, label) => expect(Math.abs(got - want), `${label}: ${got} (正解 ${want})`).toBeLessThanOrEqual(tol);

test('60fps の動画で始動・トップ・インパクトを自動判定する', async ({ page, browserName }) => {
  await open(page);
  await loadVideo(page, 'A', fx('swing60', browserName));
  const m = await marks(page);
  expect(m.slow).toBe(1);
  expectNear(m.start, TRUTH.start, 0.07, '始動');
  expectNear(m.top, TRUTH.top, 0.05, 'トップ');
  expectNear(m.impact, TRUTH.impact, 0.06, 'インパクト');
  await expect(page.locator('#tempoNote')).toContainText('実質 60fps');
});

test('8倍スロー動画はスロー倍率を推定して実時間に直す', async ({ page, browserName }) => {
  await open(page);
  await loadVideo(page, 'A', fx('slow8', browserName));
  const m = await marks(page);
  expect(m.slow).toBe(8);
  expectNear(m.start / 8, TRUTH.start, 0.08, '始動');
  expectNear(m.top / 8, TRUTH.top, 0.05, 'トップ');
  expectNear(m.impact / 8, TRUTH.impact, 0.05, 'インパクト');
});

test('再生がブロックされても1コマずつ読んで判定する', async ({ page, browserName }) => {
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); });
  await open(page);
  await loadVideo(page, 'A', fx('swing60', browserName));
  const m = await marks(page);
  expectNear(m.top, TRUTH.top, 0.06, 'トップ');
  expectNear(m.impact, TRUTH.impact, 0.08, 'インパクト');
});

test('2本並べて連動中は、スライダーで戻すと両方戻る', async ({ page, browserName }) => {
  await open(page);
  await page.check('#cmp');
  await loadVideo(page, 'A', fx('swing60', browserName));
  await loadVideo(page, 'B', fx('swing60', browserName));
  await page.click('[data-go=impact]');
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => [window.SwingLab.slots.A.v.currentTime, window.SwingLab.slots.B.v.currentTime]);
  await page.evaluate(() => { const s = document.getElementById('scrub'); s.value = +s.value - 0.5; s.dispatchEvent(new Event('input')); });
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => [window.SwingLab.slots.A.v.currentTime, window.SwingLab.slots.B.v.currentTime]);
  expectNear(before[0] - after[0], 0.5, 0.05, 'A の戻り');
  expectNear(before[1] - after[1], 0.5, 0.05, 'B の戻り');
});

test('動画ごと保存して、開き直すとフェーズが戻る', async ({ page, browserName }) => {
  await open(page);
  await loadVideo(page, 'A', fx('swing60', browserName));
  // トップを手で2コマ後ろへ直す → 当たり具合の記録にも残る
  await page.click('[data-go=top]');
  await page.click('#fwd'); await page.click('#fwd');
  await page.waitForTimeout(300);
  await page.click('[data-set=top]');
  const saved = await marks(page);
  await page.fill('#svLabel', 'テスト');
  await page.click('#saveSwing');
  await page.waitForFunction(() => window.SwingLab.S.swings.at(-1)?.video === true);
  expect(await page.evaluate(() => window.SwingLab.calibStats('top').fixed)).toBe(1);
  await page.reload();
  await page.waitForFunction(() => window.SwingLab);
  await page.click('[data-tab=log]');
  await page.click('[data-open][data-slot=A]');
  await page.waitForFunction(() => window.SwingLab.slots.A.v.videoWidth > 0 && window.SwingLab.slots.A.marks.top != null);
  const m = await marks(page);
  expectNear(m.top, saved.top, 0.001, '戻したトップ');
  await expect(page.locator('#svLabel')).toHaveValue('テスト');
});

test('動画ごと ZIP に書き出して、別の端末 (新しいプロファイル) に戻せる', async ({ page, browserName, browser }) => {
  await open(page);
  await loadVideo(page, 'A', fx('swing60', browserName));
  await page.click('#saveSwing');
  await page.waitForFunction(() => window.SwingLab.S.swings.at(-1)?.video === true);
  await page.click('[data-tab=log]');
  await page.click('summary:has-text("バックアップ")');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#zipOut')]);
  const zipPath = path.join(os.tmpdir(), `swinglab-${browserName}-${Date.now()}.zip`);
  await dl.saveAs(zipPath);
  const ctx = await browser.newContext({ baseURL: 'http://127.0.0.1:8790/', viewport: { width: 390, height: 844 } });
  const p2 = await ctx.newPage();
  await open(p2);
  await p2.click('[data-tab=log]');
  await p2.click('summary:has-text("バックアップ")');
  await p2.setInputFiles('#zipIn', zipPath);
  await expect(p2.locator('#zipMsg')).toContainText('動画1本');
  await p2.click('[data-open][data-slot=A]');
  await p2.waitForFunction(() => window.SwingLab.slots.A.v.videoWidth > 0 && window.SwingLab.slots.A.marks.top != null);
  await ctx.close();
});

test('統計: Welch の t 検定が R と一致する', async ({ page }) => {
  await open(page);
  const w = await page.evaluate(() => window.SwingLab.welch([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]));
  expect(w.d).toBeCloseTo(3, 9);
  expect(w.df).toBeCloseTo(5.8824, 3);
  expect(w.p).toBeCloseTo(0.1075, 3); // R: t.test(x, y) → p-value = 0.1075
});

test('スイング計測の実験: 保存したスイングが A/B に入る', async ({ page, browserName }) => {
  await open(page);
  await page.click('[data-tab=exp]');
  await page.click('#expNewBtn');
  await page.selectOption('#nKind', 'swing');
  await page.selectOption('#nK1', 'ratio');
  await page.fill('#nName', 'テンポ');
  await page.click('#expCreate');
  await page.click('[data-tab=video]');
  for (const c of ['A', 'B']) {
    await loadVideo(page, 'A', fx('swing60', browserName));
    await page.click('#sv' + c);
    await page.click('#saveSwing');
    await page.waitForTimeout(500);
  }
  await page.click('[data-tab=exp]');
  const sh = await page.evaluate(() => window.SwingLab.shotsOf(window.SwingLab.S.exps[0]));
  expect(sh.map((x) => x.c)).toEqual(['A', 'B']);
  expect(sh[0].v1).toBeGreaterThan(1.5);
});

test('骨格推定: 同梱の MediaPipe が読み込めて、人がいない動画はそう伝える', async ({ page, browserName }) => {
  await open(page);
  await loadVideo(page, 'A', fx('swing60', browserName));
  await page.click('#poseGo');
  await page.waitForFunction(() => !window.SwingLab.slots.A.busy && document.getElementById('diag').textContent, null, { timeout: 90_000 });
  await expect(page.locator('#diag')).toContainText('人をうまく見つけられなかった');
});
