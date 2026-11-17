// Ghép src/ thành 1 file HTML chạy độc lập:  node build.js
const fs = require('fs'), p = f => __dirname + '/src/' + f;
fs.writeFileSync(__dirname + '/Tool_Dien_pH_TiTrong.html',
  fs.readFileSync(p('ui_head.html'), 'utf8') + fs.readFileSync(p('core.js'), 'utf8') + fs.readFileSync(p('ui_tail.html'), 'utf8'));
console.log('Đã build Tool_Dien_pH_TiTrong.html');
