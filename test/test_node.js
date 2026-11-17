// Chạy tool bằng Node.js
//   Cách 1 (dễ nhất): bỏ phiếu .xls và file công ty .xlsx vào thư mục input/  →  node test/test_node.js
//   Cách 2: chỉ định đường dẫn thật       →  node test/test_node.js "<phiếu.xls>" "<công ty.xlsx>"
// Kết quả ghi vào thư mục output/
const fs = require('fs'), path = require('path');
const X = require('../src/core.js');

const ROOT = path.join(__dirname, '..');
const IN = path.join(ROOT, 'input'), OUT = path.join(ROOT, 'output');

function die(msg) { console.error('\n❌ ' + msg + '\n'); process.exit(1); }

function pickInputs() {
  let [xls, xlsx] = process.argv.slice(2);
  if (xls || xlsx) {
    if (!xls || !xlsx) die('Cần đủ 2 đường dẫn: node test/test_node.js "<phiếu.xls>" "<công ty.xlsx>"');
    if (xls.includes('...') || xlsx.includes('...')) die('Đường dẫn đang có "..." — đó là ví dụ, hãy thay bằng đường dẫn thật (kéo file từ File Explorer vào terminal để dán).');
    if (/\.xlsx$/i.test(xls) && /\.xls$/i.test(xlsx)) [xls, xlsx] = [xlsx, xls]; // cho phép truyền ngược thứ tự
    for (const f of [xls, xlsx]) if (!fs.existsSync(f)) die('Không tìm thấy file: ' + f);
    return [xls, xlsx];
  }
  if (!fs.existsSync(IN)) fs.mkdirSync(IN);
  const files = fs.readdirSync(IN).filter(f => !f.startsWith('~$'));
  const xlsList = files.filter(f => /\.xls$/i.test(f)), xlsxList = files.filter(f => /\.xlsx$/i.test(f));
  if (xlsList.length !== 1 || xlsxList.length !== 1)
    die(`Thư mục input/ cần đúng 1 file .xls (phiếu xét nghiệm) và 1 file .xlsx (file công ty).\n   Hiện có: ${xlsList.length} file .xls, ${xlsxList.length} file .xlsx\n   Thư mục: ${IN}`);
  return [path.join(IN, xlsList[0]), path.join(IN, xlsxList[0])];
}

(async () => {
  const [xls, xlsx] = pickInputs();
  console.log('Phiếu xét nghiệm :', xls);
  console.log('File công ty     :', xlsx, '\n');
  const r = await X.processJB(fs.readFileSync(xlsx), fs.readFileSync(xls), m => console.log('  • ' + m));
  const bad = r.report.filter(x => x.status !== 'Đã điền');
  console.log(`\n✅ Đã điền: ${r.filled}   ⚠ Bỏ qua: ${bad.length}   (tổng ${r.report.length} người, sheet "${r.sheet}")`);
  if (bad.length) {
    console.log('\nCác dòng bỏ qua:');
    console.table(bad.map(x => ({ STT: x.stt, Dòng: x.row, 'Tên (công ty)': x.name, 'Tên (phiếu)': x.phieuName, 'Lý do': x.status })));
  }
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
  const outFile = path.join(OUT, path.basename(xlsx).replace(/\.xlsx$/i, '') + '_da_dien.xlsx');
  try { fs.writeFileSync(outFile, Buffer.from(await r.blob.arrayBuffer())); }
  catch (e) { if (e.code === 'EBUSY' || e.code === 'EPERM') die('File kết quả đang mở trong Excel, hãy đóng rồi chạy lại:\n   ' + outFile); throw e; }
  console.log('\n📄 File kết quả:', outFile, '\n');
})().catch(e => die(e.message));
