// App chạy trên máy: node app/server.js  (hoặc nhấp đúp Chay_Tool.bat)
// Mở trình duyệt → thả phiếu .xls + file công ty .xlsx → kết quả TỰ LƯU vào thư mục output/
// Chỉ dùng thư viện có sẵn của Node (không cần npm install). Chỉ nghe trên 127.0.0.1 (máy khác không truy cập được).
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const X = require('../src/core.js');

const ROOT = path.join(__dirname, '..');
const CONFIG_FILE = path.join(ROOT, 'config.json');
let config = {};
try { config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { /* chưa có config → dùng mặc định */ }
const OUT_DIR = path.resolve(ROOT, process.env.OUTPUT_DIR || config.outputDir || 'output');
const START_PORT = +(process.env.PORT || config.port || 3210);
const MAX_BODY = 100 * 1024 * 1024;

const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = req => new Promise((ok, fail) => {
  const chunks = []; let n = 0;
  req.on('data', c => { n += c.length; if (n > MAX_BODY) { fail(new Error('File quá lớn (giới hạn 100 MB).')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => ok(Buffer.concat(chunks))); req.on('error', fail);
});
const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
const safeName = s => String(s || 'cong_ty').replace(/\.xlsx$/i, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 150);

function saveResult(buf, jbName) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let file = path.join(OUT_DIR, safeName(jbName) + '_da_dien.xlsx');
  try { fs.writeFileSync(file, buf); }
  catch (e) {
    if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e;
    // file cũ đang mở trong Excel → lưu tên mới, không ghi đè
    file = path.join(OUT_DIR, `${safeName(jbName)}_da_dien_${stamp()}.xlsx`);
    fs.writeFileSync(file, buf);
  }
  return file;
}

function run(cmd, args) { // spawn an toàn: lỗi (vd. thiếu lệnh) không làm sập app
  try { const p = spawn(cmd, args, { detached: true, stdio: 'ignore' }); p.on('error', () => {}); p.unref(); } catch { /* bỏ qua */ }
}
function openFolder(target) {
  const cmd = process.platform === 'win32' ? ['explorer', [target]] : process.platform === 'darwin' ? ['open', [target]] : ['xdg-open', [target]];
  run(cmd[0], cmd[1]);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?')))
      return send(res, 200, fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8');
    if (req.method === 'GET' && req.url === '/api/config') return send(res, 200, { outDir: OUT_DIR });
    if (req.method === 'POST' && req.url === '/api/process') {
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      const xls = Buffer.from(body.xlsB64 || '', 'base64'), xlsx = Buffer.from(body.xlsxB64 || '', 'base64');
      if (!xls.length || !xlsx.length) return send(res, 400, { ok: false, error: 'Thiếu file .xls hoặc .xlsx.' });
      const logs = [];
      const t0 = Date.now();
      const r = await X.processJB(xlsx, xls, m => logs.push(m));
      let outPath = null;
      if (r.filled > 0) outPath = saveResult(Buffer.from(await r.blob.arrayBuffer()), body.xlsxName);
      const ms = Date.now() - t0;
      console.log(`[${new Date().toLocaleTimeString()}] ${body.xlsName} + ${body.xlsxName} → điền ${r.filled}/${r.report.length}` + (outPath ? ` → ${outPath}` : ' (không có dòng nào để lưu)'));
      return send(res, 200, { ok: true, filled: r.filled, sheet: r.sheet, report: r.report, logs, outPath, outDir: OUT_DIR, ms });
    }
    if (req.method === 'POST' && req.url === '/api/open-folder') {
      const body = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      // chỉ mở thư mục output (hoặc chọn sẵn file kết quả trong đó)
      if (body.file && path.dirname(path.resolve(body.file)) === OUT_DIR && fs.existsSync(body.file) && process.platform === 'win32')
        run('explorer', ['/select,', body.file]);
      else { fs.mkdirSync(OUT_DIR, { recursive: true }); openFolder(OUT_DIR); }
      return send(res, 200, { ok: true });
    }
    send(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    console.error('Lỗi:', e.message);
    send(res, 200, { ok: false, error: e.message });
  }
});

let port = START_PORT, tries = 0;
server.on('error', e => {
  if (e.code === 'EADDRINUSE' && tries++ < 10) { port++; return server.listen(port, '127.0.0.1'); }
  console.error('Không mở được cổng:', e.message); process.exit(1);
});
server.once('listening', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  console.log('\n========================================================');
  console.log('  TOOL ĐIỀN pH & TỈ TRỌNG đang chạy');
  console.log('  Mở trình duyệt: ' + url);
  console.log('  File kết quả tự lưu vào: ' + OUT_DIR);
  console.log('  Đóng cửa sổ này (hoặc Ctrl+C) để tắt app.');
  console.log('========================================================\n');
  if (!process.env.NO_BROWSER) {
    if (process.platform === 'win32') run('cmd', ['/c', 'start', '', url]);
    else openFolder(url);
  }
});
server.listen(port, '127.0.0.1');
