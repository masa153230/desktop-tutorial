import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// キゲンメモ (kigen/index.html) のテスト。商品データベースへの通信は偽の応答に差し替える。
const here = path.dirname(fileURLToPath(import.meta.url));
const fx = name => path.join(here, 'fixtures', name);

const NAN = {
  code: '4550182144338',
  product_name_ja: 'フライパンでつくるナン',
  brands: '無印良品',
  quantity: '200g',
  nutrition_data_per: '100g',
  nutriments: { 'energy-kcal_100g': 352, proteins_100g: 10.2, fat_100g: 1.4, carbohydrates_100g: 74.5, salt_100g: 1.2 },
  allergens_tags: ['en:gluten'],
  traces_tags: ['en:eggs', 'en:milk'],
  ingredients_text_ja: '小麦粉(国内製造)、砂糖、パネトーネ種粉末、食塩/増粘剤(キサンタンガム)',
};
const LOTION = { code: '4901234567894', product_name: 'Test Lotion', brands: 'Test', periods_after_opening: '12 months' };

// db: { off: {code: product}, obf: {...}, opf: {...} }。呼ばれた回数を数える
async function mockDb(page, db) {
  const calls = [];
  const hosts = { off: 'world.openfoodfacts.org', obf: 'world.openbeautyfacts.org', opf: 'world.openproductsfacts.org' };
  for (const [id, host] of Object.entries(hosts)) {
    await page.route(`https://${host}/api/v2/product/**`, route => {
      const code = new URL(route.request().url()).pathname.split('/').pop().replace('.json', '');
      calls.push(`${id}:${code}`);
      const p = db[id] && db[id][code];
      route.fulfill({
        status: p ? 200 : 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(p ? { status: 1, code, product: p } : { status: 0, code, status_verbose: 'product not found' }),
      });
    });
  }
  return calls;
}
async function open(page) {
  await page.goto('kigen/index.html');
  await page.waitForFunction(() => window.Kigen);
}
const today = page => page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });

test('写真のバーコードから食品の情報を引いて登録し、開き直しても残る', async ({ page }) => {
  const calls = await mockDb(page, { off: { [NAN.code]: NAN } });
  await open(page);
  await page.setInputFiles('#filePhoto', fx('kigen-ean13.png'));
  await expect(page.locator('#sheet')).toBeVisible();
  await expect(page.locator('#fCode')).toHaveValue(NAN.code);
  await expect(page.locator('#sheetMsg')).toContainText('Open Food Facts で見つかりました');
  await expect(page.locator('#fName')).toHaveValue('フライパンでつくるナン 200g');
  await expect(page.locator('#product .nut')).toContainText('352 kcal');
  await expect(page.locator('#product .nut')).toContainText('1.20 g');
  await expect(page.locator('#product .allergen')).toContainText('小麦');
  expect(calls).toContain(`off:${NAN.code}`);
  await page.locator('#quick [data-m="6"]').click();
  await page.click('#saveBtn');
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(page.locator('#list .item')).toHaveCount(1);
  await expect(page.locator('#list')).toContainText('フライパンでつくるナン');
  await expect(page.locator('#list')).toContainText('それ以降');
  await page.reload();
  await page.waitForFunction(() => window.Kigen);
  await expect(page.locator('#list .item')).toHaveCount(1);
  await expect(page.locator('#sAll')).toHaveText('1');
});

test('データベースに無い商品は手で入れた名前と期限の癖を覚え、次は通信しない', async ({ page }) => {
  const calls = await mockDb(page, {});
  await open(page);
  await page.click('#manualBtn');
  await page.fill('#fCode', '4901234567894');
  await page.click('#lookupBtn');
  await expect(page.locator('#sheetMsg')).toContainText('データベースに無い商品');
  expect(calls.length).toBe(3);
  await page.fill('#fName', '近所の豆腐');
  await page.locator('#quick [data-d="3"]').click();
  await page.locator('#segKind [data-v="use"]').click();
  await page.click('#saveBtn');
  await expect(page.locator('#list .item')).toHaveCount(1);
  await expect(page.locator('#list .item .days')).toContainText('3');

  // 2 回目: 写真から読むと、名前・種類・期限の目安が自動で入る
  await page.setInputFiles('#filePhoto', fx('kigen-ean13-b.png'));
  await expect(page.locator('#fCode')).toHaveValue('4901234567894');
  await expect(page.locator('#sheetMsg')).toContainText('登録済みの商品です');
  await expect(page.locator('#sheetMsg')).toContainText('もう 1 個あります');
  await expect(page.locator('#fName')).toHaveValue('近所の豆腐');
  await expect(page.locator('#segKind [data-v="use"]')).toHaveAttribute('aria-pressed', 'true');
  const t = await today(page);
  const expected = await page.evaluate(t => { const [y, m, d] = t.split('-').map(Number); const x = new Date(y, m - 1, d + 3); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }, t);
  await expect(page.locator('#fDate')).toHaveValue(expected);
  expect(calls.length).toBe(3);
});

test('化粧品は開封後の使用期限を使い、開封した日から数える', async ({ page }) => {
  await mockDb(page, { obf: { [LOTION.code]: LOTION } });
  await open(page);
  await page.click('#manualBtn');
  await page.fill('#fCode', LOTION.code);
  await page.click('#lookupBtn');
  await expect(page.locator('#sheetMsg')).toContainText('Open Beauty Facts');
  await expect(page.locator('#fPlace')).toHaveValue('bath');
  await expect(page.locator('#segKind [data-v="none"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#paoChips [data-p="12m"]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#saveBtn');
  await expect(page.locator('#list')).toContainText('期限なし');
  await page.locator('#list .item').getByRole('button', { name: '開封した' }).click();
  const t = await today(page);
  const due = await page.evaluate(t => window.Kigen.addMonths(12, t), t);
  const it = await page.evaluate(() => window.Kigen.S().items[0]);
  expect(it.opened).toBe(t);
  expect(await page.evaluate(i => window.Kigen.due(i).date, it)).toBe(due);
  await expect(page.locator('#list')).toContainText('開封後12か月');
});

test('期限の分類・消費期限切れの警告・使った/捨てたの記録', async ({ page }) => {
  await mockDb(page, {});
  await open(page);
  const t = await today(page);
  await page.evaluate(t => {
    const add = n => { const [y, m, d] = t.split('-').map(Number); const x = new Date(y, m - 1, d + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    localStorage.setItem('kigen-pwa-v1', JSON.stringify({ items: [
      { id: 'a', name: '刺身', place: 'fridge', kind: 'use', expiry: add(-1), qty: 1, addedAt: add(-2) },
      { id: 'b', name: 'ヨーグルト', place: 'fridge', kind: 'best', expiry: add(-2), qty: 1, addedAt: add(-9) },
      { id: 'c', name: '牛乳', place: 'fridge', kind: 'best', expiry: add(1), qty: 2, addedAt: t },
      { id: 'd', name: '洗剤', place: 'stock', kind: 'none', expiry: null, qty: 1, addedAt: t },
    ], products: {}, log: [] }));
  }, t);
  await page.reload();
  await page.waitForFunction(() => window.Kigen);
  await expect(page.locator('#sBad')).toHaveText('2');
  await expect(page.locator('#sSoon')).toHaveText('1');
  await expect(page.locator('#sAll')).toHaveText('5');
  await expect(page.locator('#list .group').first()).toContainText('期限切れ');
  await expect(page.locator('#list')).toContainText('消費期限切れ。食べない方が安全');
  await expect(page.locator('#list')).toContainText('賞味期限は品質の目安');
  await expect(page.locator('#list .group').last()).toContainText('期限なし');
  const milk = page.locator('#list .item', { hasText: '牛乳' });
  await expect(milk.locator('.days')).toContainText('明日');
  await milk.getByRole('button', { name: '使った' }).click();
  await expect(page.locator('#list .item', { hasText: '牛乳' })).toContainText('牛乳');
  await expect(page.locator('#sAll')).toHaveText('4');
  await page.locator('#list .item', { hasText: '刺身' }).getByRole('button', { name: '捨てた' }).click();
  await expect(page.locator('#list .item', { hasText: '刺身' })).toHaveCount(0);
  await expect(page.locator('#month')).toContainText('廃棄率 50%');
  await page.click('#toastUndo');
  await expect(page.locator('#list .item', { hasText: '刺身' })).toHaveCount(1);
  await expect(page.locator('#month')).not.toContainText('廃棄率 50%');
});

test('日付とチェック数字の計算', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => ({
    m1: window.Kigen.addMonths(1, '2026-01-31'), m2: window.Kigen.addMonths(12, '2028-02-29'),
    ok: window.Kigen.validCode('4550182144338'), bad: window.Kigen.validCode('4550182144339'), upc: window.Kigen.validCode('036000291452'),
  }));
  expect(r).toEqual({ m1: '2026-02-28', m2: '2029-02-28', ok: true, bad: false, upc: true });
});
