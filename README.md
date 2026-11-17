# Tool điền pH & Tỉ trọng

Đọc phiếu xét nghiệm (.xls), lấy pH và tỉ trọng theo SỐ THỨ TỰ, đối chiếu họ tên rồi ghi vào file công ty (.xlsx).

## Dùng
**App (khuyên dùng):** nhấp đúp `Chay_Tool.bat` → thả 2 file vào trang → kết quả tự lưu vào `output/`.

**Không có Node:** Mở `Tool_Dien_pH_TiTrong.html` bằng Chrome/Edge → thả 2 file → **Chạy đối chiếu** → **Tải file đã điền**.

## Cấu trúc
| File | Vai trò |
|---|---|
| `src/core.js` | Lõi xử lý: đọc OLE2/BIFF8 (.xls) lấy cache liên kết ngoài (SUPBOOK/XCT/CRN), mở/sửa/nén lại .xlsx |
| `src/ui_head.html` | HTML + CSS giao diện |
| `src/ui_tail.html` | JS giao diện (kéo thả, bảng, tải file) |
| `app/server.js` | App chạy trên máy (127.0.0.1): nhận 2 file, chạy `core.js`, tự lưu vào `output/` |
| `app/index.html` | Giao diện của app |
| `Chay_Tool.bat` | Khởi động app (nhấp đúp) |
| `config.json` | Thư mục lưu kết quả (`outputDir`), cổng (`port`) |
| `build.js` | Ghép `src/` thành 1 file HTML: `node build.js` |
| `test/test_node.js` | Chạy bằng Node: bỏ 2 file vào `input/` rồi `node test/test_node.js` (kết quả ở `output/`) |

## Luồng dữ liệu
1. Phiếu .xls dùng VLOOKUP tới file ngoài; Excel lưu sẵn bản sao vùng tham chiếu trong record CRN.
2. `findNTSource` chọn sheet cache có cột B giống pH (4–9.5) và cột C giống tỉ trọng (1.000–1.060), ưu tiên tên "THÔNG SỐ NT".
3. `findNameSource` chọn sheet cache có (STT, họ tên) khớp nhiều nhất với file công ty.
4. Tìm cột theo tiêu đề "tỷ trọng"/"pH" trong file công ty, chỉ ghi khi tên khớp; định dạng `0.000` và `0.0`.

Sau khi sửa code trong `src/`, chạy `node build.js` để cập nhật file HTML.
