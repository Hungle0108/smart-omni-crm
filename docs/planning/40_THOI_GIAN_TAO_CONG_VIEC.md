# Thời gian tạo công việc

Ngày cập nhật: 24/09/2026.

- Tận dụng thời điểm `tasks.created_at` đã được máy chủ lưu khi tạo công việc, công việc con hoặc áp dụng mẫu.
- Hiển thị Ngày tạo gồm ngày/tháng/năm, giờ/phút/giây theo giờ Việt Nam tại Kế hoạch tiếp xúc, chi tiết công việc, Tiến trình khách hàng và tab Công việc & Lịch hẹn của hồ sơ 360°.
- Ngày tạo tách biệt với hạn thực hiện, không phải trường cho người dùng sửa. Bản ghi thiếu thời gian hiển thị Chưa ghi nhận, không tự điền thời gian hiện tại.
- Kiểm tra cú pháp ba tệp giao diện thành công. Bộ test-customer-360 đạt 5 nhóm, bổ sung xác minh created_at vẫn giữ nguyên khi gửi yêu cầu sửa kèm thời gian giả, hoàn thành, mở lại và khởi động lại máy chủ.
- Không thay đổi cấu trúc hoặc dữ liệu cũ. Chưa kiểm tra hiển thị bằng trình duyệt trong lần chỉnh nhỏ này.

Tệp chỉnh: `app/workspace-ui.js`, `app/progress-ui.js`, `app/customer-360-ui.js`, `app/test-customer-360.js`.
