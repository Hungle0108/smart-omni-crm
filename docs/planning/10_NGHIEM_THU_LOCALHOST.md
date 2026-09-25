# Phiếu thử Smart Omni CRM trên laptop

Bản 0.2.0 — 21/09/2026. Mở http://127.0.0.1:3000. Mật khẩu mẫu `123456`. Dùng dữ liệu mẫu trước. Các ngưỡng ví dụ dưới đây phục vụ kiểm thử.

| Mã | Đăng nhập và thao tác | Kết quả cần thấy | Kết quả của bạn |
|---|---|---|---|
| T01 | admin → Cấu hình → ví dụ 600 triệu / 10%, chọn lịch rồi lưu | Mở lại vẫn giữ cấu hình; sales xem nhưng không sửa | Chưa thử |
| T02 | hoa → Khách chưa giao hoặc Hộp thư → chọn người phụ trách | Gợi ý chuyên môn trước, số khách cần xử lý sau; chỉ trưởng nhóm chọn | Chưa thử |
| T03 | Đăng nhập lan, rồi minh | Mỗi người thấy khách được giao cho mình; không mở được hồ sơ người kia | Chưa thử |
| T04 | Tạo khách tổ chức và cá nhân; thêm ghi chú/cơ hội/công việc | Dữ liệu liên kết cùng hồ sơ; không cần tạo công ty giả cho cá nhân | Chưa thử |
| T05 | Khách chưa có Gói 1 → báo giá Gói 3 hoặc Gói 1 + Gói 3 | Bị chặn vì khách chưa đăng ký Gói 1; đánh dấu đã đăng ký trong hồ sơ rồi thử lại | Chưa thử |
| T06 | Chọn trọn bộ kèm gói thành phần; chọn AI05 và AI10 | Bị chặn cộng các phương án không được bán chung | Chưa thử |
| T07 | lan lập báo giá Gói 1, giảm 0%, trình duyệt | hoa duyệt được; lan không tự duyệt | Chưa thử |
| T08 | Với ngưỡng ví dụ, lập báo giá tổng >600 triệu hoặc giảm thêm >10% | Chỉ duc được duyệt; cấp duyệt hiển thị đúng | Chưa thử |
| T09 | Sửa báo giá đã duyệt | Duyệt cũ mất hiệu lực; phải trình duyệt lại. Bản đã gửi phải tạo phiên bản mới | Chưa thử |
| T10 | Sales gửi bản được duyệt qua hội thoại thử | Hiển thị đã gửi thử, lưu đúng hội thoại; không báo Zalo đã nhận | Chưa thử |
| T11 | In báo giá → Lưu dạng PDF; đổi nhận diện bằng admin rồi mở báo giá cũ | Bản đã duyệt giữ nội dung và nhận diện tại lúc duyệt | Chưa thử |
| T12 | Báo giá đào tạo không nhập ngày kích hoạt | Vẫn ghi 12 tháng từ ngày kích hoạt; không lấy ngày báo giá thay thế | Chưa thử |
| T13 | hoa soạn nội dung FAQ nhưng chưa duc duyệt; hỏi thử | Bot không dùng bản nháp; duc duyệt xong mới có câu trả lời từ nguồn đó | Chưa thử |
| T14 | Sửa nội dung đã duyệt nhưng chưa duyệt bản mới | Bot giữ bản cũ đã duyệt; không dùng thay đổi nháp | Chưa thử |
| T15 | Hộp thư → tin thử → tiếp nhận → tin thử khác → Chuyển lại cho bot | Sau tiếp nhận bot im lặng; chỉ trả lời lại sau nút chuyển lại | Chưa thử |
| T16 | Tạo tin thử ngoài giờ hoặc yêu cầu giảm giá | FAQ phù hợp vẫn trả lời ngoài giờ, hẹn liên hệ trong giờ làm việc, không hứa giờ cụ thể; không tự giảm giá | Chưa thử |
| T17 | Cơ hội → Thắng không xác nhận ký; sau đó nhập đầy đủ | Thiếu xác nhận bị chặn; chỉ Thắng khi xác nhận hai bên ký, có giá trị/ngày chốt | Chưa thử |
| T18 | Cơ hội → Thua → mở lại | Cả hai lần cần lý do; lịch sử không mất | Chưa thử |
| T19 | hoa → nhập CSV: thử dòng lỗi, rồi sửa và xác nhận | Hiện lỗi trước khi nhập; không nhập dở dang; nhập hợp lệ đủ số dòng | Chưa thử |
| T20 | Đóng rồi mở lại ứng dụng | Khách, báo giá, nội dung đã lưu còn nguyên; đăng nhập lại nếu phiên kết thúc | Chưa thử |

Khi gặp lỗi, ghi: mã bài thử, tài khoản đang dùng, màn hình, thao tác vừa bấm, kết quả thực tế và điều bạn mong đợi. Không cần mô tả bằng thuật ngữ lập trình.

Phiếu này để bạn nghiệm thu cách dùng. Kết quả test tự động không thay thế đánh giá nghiệp vụ của bạn. Chưa nghiệm thu Zalo/AI thật bằng bản này; các yêu cầu đó vẫn nằm trong MVP, không bị loại bỏ.
