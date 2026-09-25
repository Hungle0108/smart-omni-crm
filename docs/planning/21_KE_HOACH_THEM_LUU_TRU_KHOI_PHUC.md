# Bổ sung quản lý dữ liệu theo từng chức năng

Yêu cầu 22/09/2026: cho admin/người dùng tự thêm và bỏ dữ liệu khỏi các chức năng, thay vì chỉ sửa dữ liệu mẫu.

Phạm vi thực hiện: thêm tài khoản và nhóm; khóa/kích hoạt có bàn giao; bổ sung sửa cơ hội; lưu trữ/khôi phục khách, cơ hội, báo giá, kế hoạch, nội dung FAQ, mẫu công việc, mẫu báo giá, sản phẩm và loại dịch vụ; quản lý các bước bán hàng bổ sung. Giữ phân quyền đã chốt: admin quản trị hệ thống; sales/trưởng nhóm quản lý dữ liệu khách trong phạm vi.

Đã có: thêm khách, đơn vị con, người liên hệ, cơ hội, công việc, mẫu công việc, FAQ, loại/sản phẩm/mẫu báo giá; ngừng/khôi phục người liên hệ và đầu việc; đóng/mở hội thoại; tạm dừng kết nối OA. Bổ sung nút rõ ràng, nơi xem dữ liệu đã lưu trữ và kiểm tra máy chủ cho phần còn thiếu.

Thiết kế: lưu trữ có lý do, khôi phục được; không xóa lịch sử giao dịch. Khách lưu trữ dừng bot, loại khỏi công việc đang xử lý; chặn khi còn báo giá chờ duyệt hoặc tin OA đang gửi. Bản báo giá đã duyệt/gửi giữ snapshot. FAQ khôi phục về nháp, cần duyệt lại. Danh mục có quan hệ phụ thuộc phải xử lý mục đang dùng trước khi lưu trữ.

Các trạng thái có ý nghĩa nghiệp vụ (Thắng, Thua, Chờ duyệt, Đã duyệt), bốn vai trò bảo mật, loại kênh tích hợp và nhật ký hệ thống không phải dữ liệu mẫu có thể tùy ý xóa. Thêm bước bán hàng trung gian qua cấu hình, giữ điều kiện ký hợp đồng và phê duyệt.

Mô-đun: `lifecycle.js`, `lifecycle-ui.js` và tích hợp danh sách/tổng quan/điều hướng. Migration cộng thêm cột lưu trữ và bảng lịch sử, danh sách bước bán hàng. API quản lý vòng đời, tài khoản, nhóm và bước bán hàng; giao diện ngay tại các chức năng tương ứng. Không có tác vụ nền mới.

Kiểm tra: quyền thêm/khóa, bàn giao, chống tự khóa, chặn sửa bản lưu trữ qua URL/API, lọc tổng quan/danh sách, khôi phục và lịch sử, mẫu/giá cũ, FAQ không tự chạy lại, các quy tắc duyệt và tiến trình cũ. Sao lưu dữ liệu trước cập nhật. Tiếp tục kiến trúc SQLite localhost đã có; không mở rộng thành hệ thống phân quyền tùy chỉnh hoặc nhiều OA trong lần này.
