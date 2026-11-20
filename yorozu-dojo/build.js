// node build.js → index.html（アーティファクトとしてそのまま公開できる1ファイル）
const fs = require('fs');
const p = (f) => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const app = p('app.js').replace('  /*__PLAY__*/', p('play.js'));
const js = ['content.js', 'mahjong.js', 'mjgame.js', 'chessai.js', 'board3d.js'].map((f) => `<script>\n${p(f)}</script>`).join('\n') + `\n<script>\n${app}</script>`;
const out = `${p('head.html')}\n<div id="app"></div>\n${js}\n`;
for (const f of ['content.js', 'mahjong.js', 'mjgame.js', 'chessai.js', 'board3d.js', 'app.js', 'play.js']) if (p(f).includes('</script')) throw new Error('script tag in ' + f);
fs.writeFileSync(__dirname + '/index.html', out);
console.log('index.html', (out.length / 1024).toFixed(1) + ' KB');
