# Kế hoạch tiếp xúc theo đơn vị — 24/09/2026

- Màn hình /#/tasks mặc định gom công việc theo customer_id, mỗi đơn vị/khách hàng một khung có thể mở hoặc thu gọn. Không gộp các đơn vị trùng tên hoặc thay đổi liên kết dữ liệu.
- Hiển thị người phụ trách, số công việc, trạng thái và phần trăm hoàn thành tính trên toàn bộ công việc được phép xem của đơn vị (không thay đổi khi lọc).
- Nút Thêm việc trong từng khung chọn sẵn đúng khách hàng. Công việc không gắn khách hàng nằm trong nhóm Việc nội bộ.
- Tìm kiếm theo đơn vị, tên việc, người thực hiện và ghi chú; nhóm không có kết quả phù hợp được ẩn. Giữ các bộ lọc trạng thái và lịch tuần.
- Kiểm tra trực tiếp localhost bằng tài khoản trưởng nhóm: Bình Minh 4 việc/2 hoàn thành = 50%; Sao Mai 1/1 = 100%; tìm không dấu sao mai chỉ còn đúng nhóm; lọc hoàn thành còn 3 việc; lịch tuần đủ 7 ngày; mở/thu gọn hoạt động; Thêm việc chọn sẵn Bình Minh. Không tạo dữ liệu thử trên dữ liệu chính. Không có lỗi console; kiểm tra cú pháp hai tệp JavaScript đạt.
- Đây là thay đổi giao diện Kế hoạch tiếp xúc, không thay đổi dữ liệu, phân quyền hay luồng Tiến trình khách hàng.
