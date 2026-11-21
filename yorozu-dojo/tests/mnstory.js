// モンゴル語の物語（src/mn-story）の形式チェック：話し手・文字・単語・受け答え・絵の場面
const fs = require('fs');
const src = (f) => fs.readFileSync(__dirname + '/../src/mn-story/' + f, 'utf8');
const S = new Function(src('data.js') + '\nreturn { PEOPLE, LETTER, CHAPTERS, PROLOGUE };')();
const A = new Function(src('art.js') + '\nreturn { SCENES };')();
let bad = 0; const fail = (m) => { bad++; console.log('NG', m); };
const speakers = new Set([...Object.keys(S.PEOPLE), 'letter']);
let items = 0, replies = 0;
for (const l of S.PROLOGUE) if (!speakers.has(l[0])) fail('プロローグの話し手 ' + l[0]);
for (const [ci, ch] of S.CHAPTERS.entries()) {
  if (!A.SCENES[ch.scene]) fail(`${ch.id}: 絵の場面がない ${ch.scene}`);
  if (!S.PEOPLE[ch.npc]) fail(`${ch.id}: 人物がない ${ch.npc}`);
  for (const l of [...ch.intro, ...ch.clear]) if (!speakers.has(l[0]) || l.length !== 3) fail(`${ch.id}: 会話の行 ${JSON.stringify(l)}`);
  if (!ch.items.length) fail(`${ch.id}: 項目なし`);
  for (const it of ch.items) {
    items++;
    if (!it.mn || !it.kana || !it.rom) fail(`${ch.id}: 欠け ${JSON.stringify(it)}`);
    if (it.kind === 'letter' ? !(it.ex && it.exJa) : !it.ja) fail(`${ch.id}: 意味・例がない ${it.mn}`);
  }
  if (ch.kind === 'letter' && ch.items.some((it) => it.kind !== 'letter')) fail(`${ch.id}: 文字の章に文字以外`);
  if (ch.items.length < 4) fail(`${ch.id}: 4択に足りない`);
  for (const r of ch.replies || []) {
    replies++;
    if (r.length !== 5 || !Array.isArray(r[4]) || r[4].length !== 3 || r[4].includes(r[2]) || new Set(r[4]).size !== 3) fail(`${ch.id}: 受け答え ${r[0]}`);
  }
  if (!ch.tip || ch.tip.length !== 2 || !ch.reward || ch.reward.length !== 2) fail(`${ch.id}: ポイント・ごほうび`);
}
console.log(`章 ${S.CHAPTERS.length}・項目 ${items}・受け答え ${replies}`);
console.log(bad ? `NG ${bad}件` : 'mn story OK');
process.exit(bad ? 1 : 0);
