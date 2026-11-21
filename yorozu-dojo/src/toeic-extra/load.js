// node 用：tests から TOEIC_EXTRA を読む（ブラウザではビルドで同じ形に包む）
const fs = require('fs');
const src = ['vocab.js', 'drills.js'].map((f) => fs.readFileSync(__dirname + '/' + f, 'utf8')).join('\n');
module.exports = new Function(src + '\nreturn { VOCAB, LESSONS, P5, P2, P34, P7 };')();
