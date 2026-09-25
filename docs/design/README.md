# Bản thiết kế tương tác Smart Omni CRM

Ngày 19/09/2026. Bản mẫu để Giám đốc sản phẩm duyệt cách sử dụng trước khi lập trình ứng dụng. Nguồn tương tác: `smart-omni-review.html`, được hiển thị trực tiếp trong cuộc trò chuyện. Chưa kết nối tài khoản, chưa gọi API, không gửi tin hoặc tạo PDF thật. JavaScript chỉ phục vụ mô phỏng thiết kế, không phải mã CRM triển khai.

## Các màn hình

| Màn hình | Thao tác có thể thử | Quy tắc đã đưa vào |
|---|---|---|
| Hộp thư và giao khách | Trưởng nhóm chọn sales, sales tiếp nhận/trả lời, chuyển lại bot, thử tin mới | Gợi ý theo chuyên môn rồi tải công việc; khách cũ giữ người phụ trách; bot không trả lời chen |
| Hồ sơ khách hàng | Chuyển giữa khách tổ chức và cá nhân, mở hội thoại, lập báo giá | Cá nhân không bắt buộc có công ty; sales thấy khách được giao |
| Cơ hội bán hàng | Chuyển bước, đánh dấu ký hai bên, thua và mở lại kèm lý do | Thắng sau ký hợp đồng; lịch sử thua không bị xóa |
| Báo giá | Chọn mẫu Smart iVier/đào tạo, chọn gói, giảm thêm, gửi duyệt/duyệt/gửi mô phỏng, tạo bản sửa | Gói 2/3/4 cần Gói 1; thời hạn đào tạo từ kích hoạt; giá năm đầu và gia hạn tách riêng; không gửi bản chưa duyệt |
| Nội dung bot | Trưởng nhóm soạn nháp/gửi duyệt, giám đốc duyệt/trả lại | Nội dung sửa chưa duyệt không được bot dùng |
| Cấu hình | Admin nhập ngưỡng, nạp ví dụ để thử, sửa ngày/giờ làm việc | Ngưỡng công ty tự điền; trống khác với 0; trạng thái kênh ghi rõ mô phỏng |
| Kịch bản duyệt | Hướng dẫn thử các luồng theo vai | Không cần người dùng biết lập trình |

## Cách thử đề xuất

1. Giữ vai Trưởng nhóm, giao Đơn vị Bình Minh cho Lan. Đổi vai Lan rồi tiếp nhận và trả lời. Thử tin nhắn mới trước/sau khi bấm Chuyển lại cho bot.
2. Đổi vai Admin, mở Cấu hình, bấm Nạp ngưỡng minh họa. Đổi về Trưởng nhóm, mở Báo giá, xác nhận khách đã có Gói 1 nếu chào Gói 3/4, gửi duyệt và duyệt. Thử giảm thêm 12% để cần Giám đốc thay vì trưởng nhóm. Nút gửi chỉ mô phỏng.
3. Trưởng nhóm sửa nội dung bot, lưu nháp, gửi duyệt. Đổi sang Giám đốc, duyệt. Quan sát bản nội dung bot được phép dùng.
4. Với khách đã giao, thử cơ hội Thắng khi chưa xác nhận ký; thử Thua rồi mở lại, bỏ trống lý do và nhập lý do để so sánh.

## Giả định cần duyệt, không phải chính sách đã chốt

- Màu xanh, bố cục thanh điều hướng và mật độ hiển thị là đề xuất thiết kế, chưa dùng logo chính thức.
- Ví dụ ngưỡng 600 triệu/10% chỉ để thử. Giá trị xét ngưỡng là năm đầu sau giảm thêm, và bản vượt ngưỡng chuyển thẳng giám đốc; công thức cùng thứ tự duyệt cần chốt trước triển khai thật.
- Quyền admin cấu hình ngưỡng, quyền trưởng nhóm lập/gửi báo giá và quyền nhân viên chuyển bước đang minh họa, chưa thay ma trận quyền chính thức. Người duyệt được thấy báo giá cần duyệt, không mặc định được truy cập toàn bộ hồ sơ/hội thoại khách.
- Khi chưa cấu hình ngưỡng, bản mẫu chặn gửi duyệt. Đây là đề xuất hành vi, không phải quy tắc đã được công ty duyệt.
- Nội dung bot cũ đã duyệt còn được dùng trong khi bản mới chờ duyệt là đề xuất; cần chính sách hiệu lực/thu hồi trong hệ thống thật.
- Chuyên môn và số khách đang xử lý là dữ liệu giả. Không đánh giá nhân viên thực tế từ ví dụ này.
- Lịch chỉ minh họa một khung giờ chung; nghỉ trưa, nhiều ca, ngày lễ và lịch theo nhóm sẽ cần thiết kế tiếp.

## Giới hạn bản mẫu

Chỉ có hai khách giả, một cơ hội và một báo giá đang thao tác. Lịch sử phiên bản báo giá minh họa bằng nhật ký, chưa có kho PDF bất biến. Chưa làm trình thiết kế mẫu tự do, đầy đủ cấu phần gói, kết hợp nhiều gói, VAT, cơ chế kiểm chứng đăng ký Gói 1, báo cáo, thư viện tri thức nhiều tài liệu, nhập dữ liệu và kiểm tra ngoài giờ theo đồng hồ thực. Không suy ra ứng dụng hoặc mốc M1–M6 đã hoàn tất từ bản mẫu này. Các kiểm tra giao diện không chứng minh bảo mật API hoặc khả năng Zalo thật.

## Kiểm tra đã thực hiện

Đã chạy kiểm tra tương tác bằng trình duyệt Edge không giao diện: phân công, giới hạn xem của hai sales, dừng/bật lại bot, ngưỡng duyệt, điều kiện Gói 1, chuyển cấp giám đốc, duyệt phiên bản nội dung, điều kiện ký hợp đồng và mở lại giữ lịch sử. Đã kiểm tra không tràn ngang ở chiều rộng 390px trên 7 màn hình; xem ảnh máy tính, điện thoại và giao diện tối. Không phát hiện lỗi thực thi trong lượt kiểm tra. Chi tiết máy đọc được ở `verification.json`; bộ kiểm tra chỉ dành cho prototype.

Khi góp ý, người duyệt chỉ cần nói tên màn hình, thao tác muốn thay đổi và cách mong muốn. Chưa có màn hình nào được coi là đã được người dùng duyệt.
