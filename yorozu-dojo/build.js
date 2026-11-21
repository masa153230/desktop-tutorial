// node build.js → index.html（アーティファクトとしてそのまま公開できる1ファイル）
const fs = require('fs');
const p = (f) => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const app = p('app.js').replace('  /*__PLAY__*/', p('play.js')).replace('  /*__TOEIC__*/', p('toeic.js')).replace('  /*__MNSTORY__*/', p('mnstory.js'));
const wrap = (name, files, names) => `const ${name} = (() => {\n${files.map(p).join('\n')}\nreturn { ${names} };\n})();`;
const extra = wrap('TOEIC_EXTRA', ['toeic-extra/vocab.js', 'toeic-extra/drills.js'], 'VOCAB, LESSONS, P5, P2, P34, P7');
const mnStory = wrap('MN_STORY', ['mn-story/data.js'], 'PEOPLE, LETTER, CHAPTERS, PROLOGUE, PRAISE') + '\n' + wrap('MN_ART', ['mn-story/art.js'], 'drawScene, drawBust, drawCount');
const js = [`<script>\n${extra}\n</script>`, `<script>\n${mnStory}\n</script>`].join('\n') + '\n' + ['content.js', 'toeic-data.js', 'mahjong.js', 'mjgame.js', 'chessai.js', 'board3d.js', 'mj3d.js'].map((f) => `<script>\n${p(f)}</script>`).join('\n') + `\n<script>\n${app}</script>`;
const out = `${p('head.html')}\n<div id="app"></div>\n${js}\n`;
for (const f of ['toeic-extra/vocab.js', 'toeic-extra/drills.js', 'mn-story/data.js', 'mn-story/art.js', 'mnstory.js', 'content.js', 'toeic-data.js', 'toeic.js', 'mahjong.js', 'mjgame.js', 'chessai.js', 'board3d.js', 'mj3d.js', 'app.js', 'play.js']) if (p(f).includes('</script')) throw new Error('script tag in ' + f);
fs.writeFileSync(__dirname + '/index.html', out);
console.log('index.html', (out.length / 1024).toFixed(1) + ' KB');
