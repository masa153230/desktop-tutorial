// node build.js → index.html（アーティファクトとしてそのまま公開できる1ファイル）
const fs = require('fs');
const p = (f) => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const js = ['content.js', 'mahjong.js', 'app.js'].map((f) => `<script>\n${p(f)}</script>`).join('\n');
const out = `${p('head.html')}\n<div id="app"></div>\n${js}\n`;
if (/<\/script>[\s\S]*<\/script>/.test(p('app.js'))) throw new Error('script tag in js');
fs.writeFileSync(__dirname + '/index.html', out);
console.log('index.html', (out.length / 1024).toFixed(1) + ' KB');
