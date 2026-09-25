# Sửa/xóa khách hàng — 24/09/2026

Đã đưa nút **Sửa**, **Xóa** vào từng khách hàng, cả cá nhân và tổ chức, ở dạng Danh sách và Theo doanh nghiệp/đơn vị. Hồ sơ 360° giữ **Chỉnh sửa hồ sơ** và có **Xóa khách hàng**.

- Sửa dùng biểu mẫu hiện có: tên, điện thoại, email, loại tổ chức, mã số thuế, dịch vụ quan tâm và trạng thái chăm sóc.
- Xóa yêu cầu lý do và xác nhận. Đây là xóa có thể khôi phục: khách rời danh sách hoạt động; báo giá, lịch sử, hội thoại, công việc và thông tin liên hệ được giữ theo cơ chế lưu trữ hiện tại.
- Vào **Đã xóa / Khôi phục** để phục hồi khách.
- Sales chỉ thao tác khách trong phạm vi được giao; trưởng nhóm thao tác khách trong nhóm. Giữ nguyên chính sách admin quản trị cấu hình, không tự cấp quyền quản lý dữ liệu khách.
- Nếu tổ chức còn đơn vị con hoạt động, báo giá chờ duyệt hoặc tin OA đang gửi, máy chủ yêu cầu xử lý các mục đó trước. Không xóa dây chuyền.

Thay đổi: `app/directory-ui.js`, `app/lifecycle-ui.js`, `app/organizations.css`. Không thay schema hoặc dữ liệu chính; tái sử dụng PUT /api/customers/:id và API lifecycle archive/restore đã có. Tệp giao diện được phục vụ trực tiếp, chỉ cần tải lại trình duyệt, không cần khởi động lại máy chủ.

Kiểm chứng: `node app/test-lifecycle.js` đạt 10 nhóm kiểm tra; kiểm tra cú pháp hai tệp JavaScript đạt. Trình duyệt trên bộ dữ liệu mẫu riêng cổng 4032 đã sửa tên khách cá nhân, lưu, xóa kèm lý do, xác nhận khách không còn trong danh sách, mở Đã xóa / Khôi phục và phục hồi thành công; kiểm tra nút Sửa/Xóa trong dạng danh sách cho cả tổ chức và cá nhân. Không sửa/xóa khách trong bản chính cổng 3000.
