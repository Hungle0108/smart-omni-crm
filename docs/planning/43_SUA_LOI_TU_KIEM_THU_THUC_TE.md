# Sửa lỗi theo kiểm thử thực tế — 24/09/2026

Không gộp hai tab trong đợt sửa này.

| Quan sát | Xử lý |
|---|---|
| Điện thoại `abc` làm mất số cũ | Kiểm tra tại máy chủ; báo lỗi 400, không ghi thay đổi. Áp dụng hồ sơ, danh bạ tổ chức, liên hệ và nhập khách. Để trống chủ động vẫn cho phép xóa số. |
| Khách bị ghi Hoàn thành 100% khi làm xong một việc | Bản Tiến trình hiện tại đã bỏ phần trăm công việc gắn cho khách. Trạng thái quan hệ, công việc và cơ hội tách riêng. Không thêm bộ trạng thái triển khai mới. |
| Pipeline lọc thẻ nhưng không lọc số tổng | Bỏ bộ lọc DOM chồng lên bộ lọc dữ liệu; số lượng và giá trị mỗi cột dùng đúng các thẻ sau lọc. Tổng chưa lọc được ghi rõ. |
| Mở lại cơ hội thiếu phản hồi | Có nút Mở lại cơ hội; form chọn bước đang xử lý và yêu cầu lý do. Các lần bấm chuyển bước từ Thua cũng mở cùng form. Lịch sử thua được giữ. |
| Nhật ký tiếng Anh/thiếu người tạo báo giá | Bổ sung nhãn approval_revoked và các nhãn còn thiếu; sự kiện tạo đọc người tạo từ audit, dự phòng chủ báo giá. Không tự sửa lịch sử gốc. |
| Pipeline hai ô tìm và phần đầu quá dài | Chỉ giữ một thanh tìm/lọc; giảm chiều rộng menu và khoảng cách phần đầu ở màn hình Pipeline. |
| Lọc xuất hiện ở cấu hình/hướng dẫn | Không cài bộ lọc danh sách tại cấu hình, hướng dẫn và tổng quan. |
| Gói 2/3/4 và Gói 3/4 mâu thuẫn | Điều kiện hiển thị/lưu/trình duyệt lấy từ needs_pkg1 trong danh mục đã chụp cho báo giá. Nội dung mặc định của báo giá mới được tạo theo từng sản phẩm; không thay đổi chính sách bán của Gói 2. Báo giá cũ giữ nguyên snapshot và nội dung đã chốt. |

## Xác minh

- `test-review-fixes.js`: 4 nhóm đạt, gồm điện thoại không hợp lệ không làm mất dữ liệu, mở lại về Xác định nhu cầu, người tạo báo giá, điều kiện sản phẩm và form/bộ lọc.
- `test-service-content.js`: 6 nhóm đạt; thay đổi danh mục không sửa báo giá đã lập/đã duyệt.
- `test-features.js`: 13 nhóm đạt.
- `test-workflow.js`: 11 nhóm đạt.
- Trình duyệt tại localhost: tìm `QA TEST` còn đúng 1 thẻ, cột Mới hiển thị 1.000.000 đ; các cột không có thẻ về 0. Không còn thanh tìm kiếm bị lặp.
- Chưa thử mọi thao tác sửa trên dữ liệu thật; các kiểm thử ghi dữ liệu dùng database riêng. Bản chính chỉ kiểm tra đọc, đăng nhập và khởi động lại.

## File thay đổi

`app/phone-validation.js`, `features.js`, `organizations.js`, `directory.js`, `filters-ui.js`, `workspace-ui.js`, `workspace.css`, `customer-360.js`, `features-ui.js`, `catalog.js`, `test-review-fixes.js`.

## Ảnh Pipeline sau lọc

![Pipeline sau sửa](../design/workflow-review/pipeline-review-fixed.png)
