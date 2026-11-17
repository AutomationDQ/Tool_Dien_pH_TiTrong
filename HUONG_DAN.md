# HƯỚNG DẪN CHẠY TOOL ĐIỀN pH & TỈ TRỌNG

Tool đọc **phiếu xét nghiệm (.xls)**, lấy **pH** và **tỉ trọng** theo SỐ THỨ TỰ, đối chiếu **họ tên** với **file công ty (.xlsx)**, rồi ghi vào cột "tỷ trọng" / "pH".

Có 3 cách chạy:

| Cách | Dành cho | Kết quả lưu ở đâu |
|---|---|---|
| **⭐ APP. Nhấp đúp `Chay_Tool.bat`** | **Dùng hằng ngày (khuyên dùng)** | **Tự lưu vào `output\`**, không cần bấm tải |
| A. Mở file HTML | Máy không có Node.js | Bấm Tải → thư mục Downloads |
| B. Lệnh Node.js | Kiểm tra, sửa code, tự động hoá | `output\` |

APP và cách B cần Node.js 18+ (máy đang có Node 24).

---

## 0. Chuẩn bị file đầu vào (bắt buộc)

Phiếu xét nghiệm lấy số liệu qua VLOOKUP từ file khác. Tool đọc **bản số liệu Excel lưu sẵn trong phiếu**, nên trước khi chạy:

1. Mở phiếu xét nghiệm `.xls` bằng Excel.
2. Vào **Data → Edit Links → Update Values** (hoặc bấm **Enable Content / Update** khi Excel hỏi).
3. **Lưu** (Ctrl+S) rồi đóng file.

> Bỏ qua bước này thì tool vẫn chạy, nhưng dùng số liệu của lần cập nhật trước.

File công ty `.xlsx` cần có:
- Cột **STT** ở cột A (số hoặc công thức `=ROW()-7`)
- Cột **HỌ VÀ TÊN**
- 2 tiêu đề **tỷ trọng** (hoặc "tỉ trọng") và **pH**

---

## ⭐ APP: chạy app trước, thả file sau, tự lưu kết quả

1. Nhấp đúp **`Chay_Tool.bat`** trong thư mục project.
   - Một cửa sổ đen hiện ra, ghi *TOOL ĐIỀN pH & TỈ TRỌNG đang chạy*. **Đừng đóng cửa sổ này** khi đang dùng.
   - Trình duyệt tự mở trang `http://127.0.0.1:3210/`. Nếu không tự mở, copy địa chỉ trong cửa sổ đen dán vào Chrome/Edge.
2. Kéo thả **phiếu .xls** và **file công ty .xlsx** vào trang. **Đủ 2 file là tool tự chạy**, không cần bấm nút.
3. Trang hiện **✔ Đã lưu: …\output\<tên file>_da_dien.xlsx** kèm bảng đối chiếu.
4. Bấm **Mở thư mục kết quả** để mở File Explorer, file vừa lưu được chọn sẵn.
5. Làm file tiếp theo: bấm **Làm lại** rồi thả 2 file mới. Không cần tắt app.
6. Dùng xong: đóng cửa sổ đen để tắt app.

**Ghi chú:**
- Chạy lại cùng một file công ty thì **ghi đè** file `_da_dien.xlsx` cũ. Nếu file cũ đang mở trong Excel, app tự lưu thành tên mới có thêm ngày giờ (`…_da_dien_20261117_132540.xlsx`).
- **Đổi thư mục lưu**: mở `config.json`, sửa `"outputDir"` (ví dụ `"D:\\KSK\\Ket qua"`; trong JSON phải viết `\\` cho mỗi dấu `\`). Lưu lại rồi chạy lại `Chay_Tool.bat`.
- Nếu cổng 3210 bận, app tự chuyển sang 3211, 3212…; xem địa chỉ đúng trong cửa sổ đen.
- App chỉ mở trên `127.0.0.1`: máy khác trong mạng không truy cập được, dữ liệu không ra ngoài.

---

## A. Chạy bằng file HTML (khi máy không có Node.js)

1. Mở thư mục `Documents\Tool_Dien_pH_TiTrong`.
2. Nhấp đúp `Tool_Dien_pH_TiTrong.html`. File sẽ mở bằng trình duyệt.
   - Nếu file mở ra bằng app khác: chuột phải → **Open with → Google Chrome / Microsoft Edge**.
3. Kéo thả **cả 2 file** vào trang (thả vào ô nào cũng được, tool tự nhận .xls / .xlsx).
4. Bấm **Chạy đối chiếu**.
5. Kiểm tra kết quả:
   - Ô tổng kết: số người **đã điền** / **bỏ qua**.
   - Bấm **Chỉ dòng có vấn đề** để xem các dòng bị bỏ qua:
     - 🔴 **Lệch tên – bỏ qua**: tên trên phiếu khác tên trong file công ty, nên không ghi.
     - 🟡 **Không có số liệu**: phiếu không có pH/tỉ trọng cho STT đó.
6. Bấm **Tải file đã điền**. File mới tên `<tên file công ty>_da_dien.xlsx` nằm trong thư mục **Downloads**.

File gốc **không bị sửa**. Muốn chạy lại thì bấm **Làm lại**.

---

## B. Chạy bằng Node.js trong VS Code

### B1. Mở terminal
Trong VS Code: menu **Terminal → New Terminal** (hoặc `` Ctrl + ` ``). Terminal mở sẵn trong thư mục project.

> Nếu VS Code đang ở **Restricted Mode**, bấm **Manage → Trust** ở dải thông báo phía trên thì terminal mới chạy được đầy đủ.

Kiểm tra Node:
```powershell
node -v
```
Kết quả phải từ `v18` trở lên.

### B2. Chạy với 2 file

**Cách dễ nhất (không cần gõ đường dẫn):**
1. Copy **1 phiếu xét nghiệm .xls** và **1 file công ty .xlsx** vào thư mục `input\` của project.
2. Chạy:
```powershell
node test/test_node.js
```

**Hoặc chỉ định đường dẫn thật:**
```powershell
node test/test_node.js "D:\KSK 2026\xet nghiem.xls" "D:\KSK 2026\CÔNG TY JB FOOD 2026.xlsx"
```
- Đây là **ví dụ**. Thay bằng đường dẫn thật trên máy bạn, **không gõ `...`**.
- Đường dẫn có dấu cách hoặc dấu tiếng Việt thì **phải đặt trong ngoặc kép**.
- Mẹo: gõ `node test/test_node.js ` (có dấu cách cuối), rồi **kéo file từ File Explorer thả vào terminal**. Đường dẫn sẽ tự được dán.
- Truyền ngược thứ tự 2 file cũng được, tool tự nhận.

Kết quả:
- Terminal in ra nguồn dữ liệu, số người **đã điền** / **bỏ qua**, và bảng các dòng bị bỏ qua (nếu có).
- File kết quả `<tên file công ty>_da_dien.xlsx` nằm trong thư mục `output\`.
- Nếu báo *file đang mở trong Excel*: đóng file `_da_dien.xlsx` trong Excel rồi chạy lại.

### B3. Sửa code và build lại file HTML
Code nằm trong `src/`:

| File | Sửa khi muốn… |
|---|---|
| `src/core.js` | Đổi cách tìm cột, cách đối chiếu tên, định dạng số (`'0.000'`, `'0.0'`), khoảng giá trị pH/tỉ trọng hợp lệ |
| `src/ui_head.html` | Đổi giao diện, màu, chữ |
| `src/ui_tail.html` | Đổi hành vi nút, bảng kết quả, tên file tải về |

Sau khi sửa, **luôn build lại**:
```powershell
node build.js
```
Lệnh này ghép 3 file trong `src/` thành `Tool_Dien_pH_TiTrong.html` mới. Rồi chạy lại **B2** để kiểm tra.

---

## Xử lý lỗi thường gặp

| Thông báo | Nguyên nhân | Cách xử lý |
|---|---|---|
| *Không tìm thấy dữ liệu pH / tỉ trọng…* | Phiếu chưa lưu bản số liệu từ file nguồn | Làm lại **Bước 0** (Update Values → Lưu) |
| *Không tìm thấy sheet nào… có cột "tỷ trọng" và "pH"* | Tiêu đề cột trong file công ty bị đặt tên khác | Đổi tiêu đề thành `tỷ trọng` và `pH`, hoặc sửa regex trong `core.js` (tìm `t[ỷỉ] tr[ọo]ng`) |
| *File xét nghiệm không phải định dạng .xls* | Phiếu đã được lưu thành .xlsx | Mở bằng Excel → **Save As → Excel 97-2003 (.xls)** |
| Nhiều dòng **Lệch tên** | Họ tên gõ khác nhau giữa 2 file | Sửa tên cho giống nhau rồi chạy lại. Tool đã tự bỏ qua khác biệt hoa/thường và khoảng trắng thừa |
| `'node' is not recognized…` | Chưa cài Node hoặc chưa có trong PATH | Cài Node LTS từ nodejs.org rồi mở lại VS Code |
| `Không tìm thấy file` / `ENOENT` | Đường dẫn sai hoặc còn `...` của ví dụ | Dùng thư mục `input\`, hoặc kéo thả file vào terminal để lấy đúng đường dẫn |
| Nhấp đúp `Chay_Tool.bat` báo *Chua cai Node.js* | Máy chưa có Node | Cài Node LTS từ nodejs.org, hoặc dùng cách A (file HTML) |
| Trang báo *Mất kết nối với app* | Cửa sổ đen đã bị đóng | Chạy lại `Chay_Tool.bat` rồi tải lại trang (F5) |
| Tỉ trọng hiển thị 1.02 thay vì 1.015 | Mở nhầm file gốc, không phải file `_da_dien` | Mở đúng file đã tải về; cột tỉ trọng có định dạng `0.000` |

---

## Lưu ý

- Tool chạy **hoàn toàn trên máy**, không gửi dữ liệu ra ngoài.
- Chỉ 2 cột tỉ trọng và pH bị ghi đè. Các ô, công thức và sheet khác giữ nguyên.
- Năm sinh trên phiếu xét nghiệm (ô L5) đang tra sang file **Thép Hồng Nam**, nên có thể khác năm sinh trong file công ty. Tool **không dùng năm sinh** để đối chiếu, chỉ dùng **STT + họ tên**. Nên sửa công thức L5 nếu cần in phiếu.
