# Hiệu chỉnh localhost theo prototype Omni CRM

Ngày 21/09/2026. Yêu cầu: tham khảo giao diện và luồng nghiệp vụ của https://omni-crm-nguyet.leminhnguyet1977.chatgpt.site để hiệu chỉnh hệ thống đang tạo. Đích thay đổi là ứng dụng localhost trong `app`, không sửa hoặc triển khai lại Site tham chiếu.

## Đã khảo sát

Đã mở tổng quan, danh bạ và hồ sơ cá nhân, kế hoạch tiếp xúc, hộp thư, bảng cơ hội, giao dịch, Chatbot, AI Copilot, kênh kết nối và cài đặt/kiểm thử. Đã quan sát trực tiếp bố cục tổng quan, hộp thư ba cột và bảng cơ hội. Prototype công bố dữ liệu mô phỏng lưu trong trình duyệt và chưa có phân quyền phía máy chủ.

## Phạm vi hiệu chỉnh

- Khung làm việc xanh đậm/trắng, menu chia nhóm, thanh tiêu đề, tìm kiếm nhanh theo phạm vi, nút đổi tài khoản dễ tìm.
- Tổng quan dùng số liệu đang lưu, danh sách việc cần làm, phân bố cơ hội và hội thoại gần đây; đường dẫn đi thẳng đến bản ghi.
- Danh bạ có lọc tổ chức/cá nhân, người phụ trách và tình trạng chăm sóc; hồ sơ kết nối ghi chú, cơ hội, báo giá, hội thoại và kế hoạch.
- Hộp thư đặt danh sách, nội dung trao đổi và tóm tắt hồ sơ cạnh nhau; tìm/lọc theo kênh, trạng thái, người/bot; ghi chú nội bộ tách khỏi tin gửi thử.
- Kế hoạch tiếp xúc bổ sung loại việc và ưu tiên, chế độ danh sách/tuần; giữ phân quyền và dữ liệu thật trên máy.
- Bảng cơ hội có tìm kiếm, giá trị từng bước và luồng tạo báo giá gắn với cơ hội; không đổi ý nghĩa 7 bước đã chốt.
- Báo giá có bộ lọc và các bước nháp→chờ duyệt→duyệt→gửi thử. Nội dung bot, mẫu và cấu hình dùng chung phong cách, luôn ghi rõ phần mô phỏng.
- Sửa lỗi gõ tài khoản do trình xử lý phím trả false; dùng form chuẩn, thêm danh sách chọn vai trò, giữ nội dung khi mật khẩu sai.

## Đối chiếu quy tắc

| Prototype | Cách áp dụng vào bản đang tạo |
|---|---|
| Một quản trị viên demo, chưa có quyền ở máy chủ | Giữ 5 tài khoản hiện có và kiểm tra quyền ở API; chọn vai trò chỉ điền tên đăng nhập |
| Dữ liệu trong trình duyệt | Giữ SQLite hiện có; không nhập hay sao chép khách mẫu của prototype |
| Zalo, Viber, WhatsApp mô phỏng | Giữ Zalo OA + Zalo cá nhân công ty theo quyết định đã chốt; không tự thêm kênh khác |
| Bước Thành công trong prototype | Giữ Thắng cần xác nhận hai bên ký hợp đồng, giá trị và ngày chốt |
| Báo giá demo có trạng thái riêng | Giữ cấp duyệt, điều kiện Gói 1, phiên bản và nội dung đã duyệt của iViTech |
| Thanh toán mẫu và AI gợi ý sẵn | Không biến số mô phỏng thành kết quả kinh doanh thật; các chức năng chưa triển khai không hiển thị như đã hoạt động |
| Bot theo ngưỡng tin cậy mẫu | Giữ FAQ được giám đốc duyệt, dừng sau tiếp nhận và chỉ bật lại bằng thao tác của người dùng |

## Kế hoạch kỹ thuật của mốc

Tệp: khung HTML, module giao diện và CSS riêng; mở rộng API công việc và timeline hồ sơ trong module hiện có. Migration bổ sung trường công việc, không reset. Không có nhà cung cấp/tác vụ nền mới. Sao lưu nhất quán SQLite bằng Node backup tại `app/backups/before-prototype-adaptation-20260921` trước thay đổi luồng.

Kiểm tra: gõ bàn phím và chọn tài khoản, lỗi mật khẩu, đọc đúng phạm vi, luồng hồ sơ→công việc/hộp thư/cơ hội→báo giá, bộ lọc, trang tổng quan, responsive; kiểm tra lại quy tắc API khi có thay đổi liên quan. Sai khác kiến trúc PostgreSQL/tenant/API v1 đã ghi trong `docs/reference/00_CACH_AP_DUNG.md` vẫn còn hiệu lực; không coi thay đổi giao diện là đã hoàn thành kiến trúc đó.

## Kết quả thực hiện

Đã triển khai bản 0.3 trên localhost. Đã chạy đạt 12 nhóm kiểm tra nghiệp vụ và 13 nhóm bổ sung; các lượt kiểm tra giao diện trực tiếp, kiểm tra bảo toàn dữ liệu và giới hạn được ghi trong [bàn giao giao diện 0.3](13_BAN_GIAO_GIAO_DIEN_0.3.md). Hướng dẫn thao tác mới nằm trong README ở thư mục dự án.
