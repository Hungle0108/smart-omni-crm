# Đồng bộ kế hoạch trong hồ sơ khách hàng

Ngày cập nhật: 24/09/2026.

## Cách sử dụng

Vào Danh bạ khách hàng → mở hồ sơ → Kế hoạch. Mục này dùng chung danh sách công việc với Kế hoạch tiếp xúc, chỉ lấy công việc gắn đúng khách hàng và trong phạm vi được phép xem.

- Hiển thị tên việc, người thực hiện, thời hạn, ghi chú, loại tiếp xúc và trạng thái.
- Có thể thêm kế hoạch, sửa, hoàn thành hoặc mở lại ngay trong hồ sơ. Lưu xong danh sách cập nhật tại chỗ.
- Nút Làm mới lấy dữ liệu mới nhất nếu công việc vừa được sửa ở cửa sổ khác. Đây chưa phải cập nhật thời gian thực giữa các cửa sổ.
- Công việc đã lưu trữ bị ẩn ở cả hai nơi; khôi phục sẽ xuất hiện lại.
- Công việc nội bộ hoặc của khách khác không được tự chuyển vào hồ sơ đang xem.

## Đối chiếu dữ liệu hiện có

Khách “đfdfdf” trong ảnh phản ánh chưa có công việc gắn với hồ sơ. Các công việc hiện có thuộc Đơn vị Bình Minh và Công ty Sao Mai. Giữ nguyên liên kết và dữ liệu của người dùng.

## Kiểm tra đã thực hiện

- Kiểm tra cú pháp các tệp giao diện và máy chủ thành công.
- Bộ kiểm tra danh bạ đạt 6 nhóm, gồm đối chiếu hai danh sách sau thêm, sửa, hoàn thành, mở lại, lưu trữ và khôi phục; kiểm tra giới hạn quyền xem.
- Trên cơ sở dữ liệu kiểm thử riêng: mở Kế hoạch tại hồ sơ Alpha mới, đánh dấu hoàn thành và thấy cùng trạng thái ở Kế hoạch tiếp xúc. Sửa tên việc trong hồ sơ, lưu thành công và danh sách cập nhật mà không rời hồ sơ.
- Không thay đổi dữ liệu khách hàng thật khi kiểm thử.

## Thay đổi kỹ thuật

`app/crm-server.js`: thêm GET /api/customers/:id/tasks, kiểm tra quyền khách hàng và tái sử dụng danh sách /api/tasks đã áp dụng quyền và trạng thái lưu trữ.

`app/workspace-ui.js`: tải kế hoạch riêng khi mở tab; dùng chung hộp chi tiết và biểu mẫu kế hoạch; hỗ trợ cập nhật tại chỗ.

`app/test-directory.js`: kiểm tra tính đồng nhất và quyền truy cập. Không thay đổi cấu trúc cơ sở dữ liệu.
