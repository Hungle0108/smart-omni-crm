# Tải mẫu báo giá Word vào CRM

Cập nhật 23/09/2026. Dành cho trưởng nhóm và admin.

## Cách dùng

1. Mở **Mẫu & nhận diện → Tải mẫu báo giá lên**.
2. Chọn tệp **Word DOCX, tối đa 5 MB**. Hai mẫu báo giá iViTech đã cung cấp đều đọc được. Chưa nhập PDF, ảnh, DOC cũ hoặc Excel thành mẫu.
3. Nhập tên mẫu, chọn loại dịch vụ và các sản phẩm sales được chọn. Sản phẩm, mô tả, điều kiện và giá cần được admin khai báo trong danh mục trước.
4. Với từng phần trong Word, chọn **Bỏ khỏi mẫu**, **Giữ nguyên**, hoặc một phần **Tự điền từ CRM**. Mở “Xem nội dung gốc” để đối chiếu. Các phần tự điền gồm nhận diện công ty, tiêu đề/mã, khách hàng, bảng sản phẩm, tổng tiền, điều kiện sản phẩm.
5. Xem bản mẫu bên phải. Khách hàng là minh họa, bảng hiển thị một sản phẩm đã chọn với số lượng 1. Các phần CRM bắt buộc chưa được gán vị trí sẽ được bổ sung tự động; không chọn một phần tự điền ở hai vị trí.
6. Kiểm tra kỹ các phần “Giữ nguyên”, bỏ tên khách cũ, số tiền cũ và điều kiện cũ. Đánh dấu xác nhận rồi **Lưu thành mẫu báo giá**.
7. Sales lập báo giá, chọn mẫu vừa tạo, chọn sản phẩm/số lượng và lưu. **Xem bản in / lưu PDF** sử dụng bố cục đã nhập cùng dữ liệu báo giá thực tế.

Trưởng nhóm tạo mẫu cho nhóm mình; admin tạo mẫu dùng chung. Trưởng nhóm sửa bố cục, lưu trữ/khôi phục mẫu Word trong nhóm. Admin quản lý danh mục và danh sách sản phẩm của mẫu.

## Sửa, tiếp tục và giữ lịch sử

- **Xem / sửa bố cục** để sửa tên và cách tự điền. **Tải Word gốc** tải lại tệp đã nhập.
- Đóng cửa sổ trước khi lưu: tệp nằm trong danh sách chưa lưu mẫu, có thể **Tiếp tục** hoặc **Bỏ tệp**. Tệp chưa dùng được dọn sau 7 ngày khi có lần tải mới; tối đa 20 tệp nháp/người.
- Mỗi báo giá mới giữ bản bố cục riêng ngay khi tạo. Sửa mẫu áp dụng cho báo giá tạo sau; nháp đã tạo, bản đã duyệt và phiên bản sửa từ báo giá cũ giữ bố cục cũ.
- Lưu trữ mẫu không xóa báo giá hoặc tệp nguồn đã gắn với mẫu.

## Giới hạn hiện tại

Giữ cấu trúc đoạn văn, bảng cơ bản, màu/cỡ chữ trực tiếp, chữ đậm/nghiêng, căn dòng và ảnh PNG/JPEG/WebP. Chưa tái tạo chính xác phân trang, phông riêng, kiểu Word kế thừa, bảng lồng, ô gộp dọc, biểu đồ hoặc vị trí hình nổi. Bảng sản phẩm tự điền dùng cấu trúc chuẩn CRM. Đây là nhập và ánh xạ nội dung có bước xem lại, chưa phải AI tự dựng đúng 100% thiết kế gốc.

Tối đa 300 phần, 100 dòng/bảng, 12 cột/bảng, 6 ảnh tối đa 300 KB/ảnh; có giới hạn giải nén/XML. Tệp macro/đối tượng nhúng bị từ chối. Không chạy nội dung Word, không tải liên kết ngoài, không gửi tệp đến dịch vụ AI.

Giá, mô tả và điều kiện trong Word **không ghi đè danh mục**. Đặc biệt các điều kiện cũ khác quyết định hiện hành phải bỏ khỏi phần giữ nguyên.

## Kiểm tra

`npm run test:template-imports --prefix app` kiểm tra hai DOCX nguồn, quyền nhập, lựa chọn nội dung, dữ liệu báo giá thật, bất biến bố cục, phân quyền nhóm, lưu trữ/khôi phục và khởi động lại. Kết quả lưu tại `app/test-output/template-import-results.json`.

Ứng dụng dùng hai thư viện khóa phiên bản trong `app/package-lock.json`: JSZip và xml-js. Khi chuyển máy, chạy `npm ci --prefix app --ignore-scripts` trước khi chạy server; `CHAY_CRM.cmd` tự thực hiện khi thiếu thư viện.
