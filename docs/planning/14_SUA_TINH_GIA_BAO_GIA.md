# Sửa cập nhật giá khi chọn gói

Ngày 21/09/2026. Lỗi: phần tổng tiền chỉ đọc dữ liệu đã lưu từ máy chủ, nên tick/bỏ tick gói hoặc sửa chiết khấu chưa làm tổng tiền thay đổi.

Đã sửa trong `app/features-ui.js`: tính xem trước ngay từ danh mục giá, giữ số lượng hạng mục hiện có khi lưu; hiển thị rõ thay đổi chưa lưu. Trọn bộ và gói thành phần loại trừ nhau; các phương án đào tạo chỉ chọn một. Chiết khấu không hợp lệ hoặc thiếu điều kiện Gói 1 có thông báo và chặn lưu. Trước khi lưu thay đổi, không cho mở bản in cũ hoặc gửi bản đã duyệt với lựa chọn chưa lưu. Quy tắc kiểm tra phía máy chủ được giữ nguyên.

Kiểm tra trực tiếp bằng trình duyệt Codex trên dữ liệu riêng ở cổng 4004:

| Thao tác | Kết quả đã xác nhận |
|---|---|
| Chọn Gói 1 + Gói 3 | Tổng 998.000.000 đ, gia hạn 778.000.000 đ |
| Giảm thêm 10% | Còn 898.200.000 đ; gia hạn không đổi |
| Chọn Trọn bộ | Bỏ các gói lẻ, tổng 1.629.000.000 đ |
| Chọn lại Gói 1 | Bỏ Trọn bộ, tổng 499.000.000 đ |
| Bỏ hết gói | Tổng về 0, không cho gửi duyệt |
| Nhập chiết khấu 101% | Báo lỗi và chặn lưu |
| Mở bản in khi chưa lưu | Nhắc lưu trước, không mở bản in với giá cũ |
| Lưu rồi tải lại Gói 1 + Gói 3, giảm 10% | Tổng và gia hạn giữ đúng như xem trước |
| Chọn AI 05 rồi AI 10 | Chỉ giữ AI 10, tổng 125.000.000 đ; gia hạn chưa xác định |
| Chọn Gói 3 cho khách chưa đăng ký Gói 1 | Cảnh báo điều kiện và chặn lưu |

Không phát hiện lỗi JavaScript trong phiên kiểm tra. Đã kiểm tra cú pháp và bổ sung kịch bản hồi quy vào `app/test-ui.cjs`; chưa chạy lại toàn bộ chương trình Edge trong lượt này. Các dữ liệu kiểm thử nằm ở `app/test-output/quote-preview-20260921.db`, tách khỏi `app/crm.db` của người dùng.

Cách sử dụng: tải lại trang một lần để nhận sửa đổi; chọn gói và xem tổng tiền ngay bên phải. Bấm **Lưu nội dung** để giữ lại hoặc **Lưu & gửi duyệt** khi báo giá đã hoàn tất.
