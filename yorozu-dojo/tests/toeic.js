// TOEIC 教材の形式チェック：単語の重複・例文の対象語、Part 2/5 の選択肢数、Part 3/4/7 の設問
const T = require('../src/toeic-data.js');
let bad = 0; const fail = (m) => { bad++; console.log('NG', m); };
const ids = new Set();
for (const w of T.words) {
  if (ids.has(w.id)) fail('単語の重複 ' + w.id); ids.add(w.id);
  if (!w.pos || !w.ja || !w.ex || !w.exJa) fail('欠け ' + w.id);
  if (!w.ex.includes(w.form)) fail('例文に対象語がない ' + w.id);
  if (!['名', '動', '形', '副', '前', '接', '句'].includes(w.pos)) fail('品詞 ' + w.id + ' ' + w.pos);
}
const bands = {}; for (const w of T.words) bands[w.band] = (bands[w.band] || 0) + 1;
for (const q of T.p5) {
  if ((q.q.match(/-------/g) || []).length !== 1) fail('Part5 空欄 ' + q.id + ' ' + q.q);
  if (q.choices.length !== 4 || new Set(q.choices).size !== 4) fail('Part5 選択肢 ' + q.id);
  if (!['pos', 'verb', 'prep', 'pron', 'rel', 'vocab', 'comp'].includes(q.cat)) fail('Part5 分類 ' + q.id);
  if (![1, 2, 3].includes(q.lv) || !q.ex) fail('Part5 lv/解説 ' + q.id);
}
for (const q of T.p2) if (q.choices.length !== 3 || new Set(q.choices).size !== 3 || !q.ex || ![1, 2, 3].includes(q.lv)) fail('Part2 ' + q.id);
for (const s of [...T.p34, ...T.p7]) {
  if (!s.ja || !s.ex || ![1, 2, 3].includes(s.lv)) fail('セット ' + s.id);
  for (const q of s.qs) if (q.choices.length !== 4 || new Set(q.choices).size !== 4) fail('設問の選択肢 ' + s.id + ' ' + q.q);
}
for (const s of T.p34) for (const [sp, t] of s.lines) if (!['M', 'W', 'W2', 'N'].includes(sp) || !t) fail('話者 ' + s.id);
const cats = {}; for (const q of T.p5) cats[q.cat] = (cats[q.cat] || 0) + 1;
console.log('単語', T.words.length, bands, '/ Part5', T.p5.length, cats, '/ Part2', T.p2.length, '/ Part3・4', T.p34.length, 'セット', T.p34.reduce((a, s) => a + s.qs.length, 0), '問 / Part7', T.p7.length, '文書', T.p7.reduce((a, s) => a + s.qs.length, 0), '問');
console.log(bad ? `NG ${bad}件` : 'toeic data OK');
process.exit(bad ? 1 : 0);
