# Bàn giao Hồ sơ khách hàng 360°

Ngày: 24/09/2026. Bản chạy chính: http://127.0.0.1:3000.

## Cách dùng

Mở Danh bạ → chọn hồ sơ khách. Màn hình mặc định là Tổng quan & Tiến trình. Thanh đầu hiển thị người/nhóm phụ trách, liên lạc, dịch vụ quan tâm, tình trạng chăm sóc, tương tác gần nhất và kênh được phép.

Chọn một đầu mối hoặc cơ hội để xem việc tiếp theo và lịch sử liên quan. Mỗi cơ hội có giai đoạn riêng; việc thắng một cơ hội không kết thúc toàn bộ khách hàng.

1. Mở Thông tin & Người liên hệ để quản lý tổ chức, đơn vị con và đầu mối bằng chức năng hiện có.
2. Ghi nhận trao đổi: chọn loại cuộc gọi/cuộc gặp, nội dung và kết quả. Có thể chọn tiếp tục tạo bước tiếp theo; chỉ tạo việc khi người dùng lưu biểu mẫu công việc.
3. Tạo công việc/Đặt lịch hẹn: khách đã được điền sẵn, chọn đầu mối và cơ hội, người thực hiện, hạn. Dùng cùng bản ghi với Kế hoạch tiếp xúc và Tiến trình khách hàng.
4. Tạo cơ hội, sửa và đổi giai đoạn ngay trong hồ sơ. Quy tắc thắng/thua/mở lại giữ nguyên.
5. Tạo báo giá cho cơ hội để mở trình soạn hiện có. Nút quay lại đưa về hồ sơ và giữ tab/bộ lọc.
6. Xem tin nhắn trong Trao đổi đa kênh; mở màn hình hội thoại chuyên sâu để tiếp nhận, trả lời hoặc xử lý bot.

## Phạm vi đã triển khai

- Bảy tab đúng nhóm chức năng; lịch sử tổng hợp có lọc loại hoạt động, đầu mối, cơ hội và ngày.
- Liên kết contact_id/opp_id tùy chọn trên công việc; contact_id trên cơ hội. Kiểm tra đúng khách/tổ chức trước khi ghi.
- Ghi nhận trao đổi là bản ghi gốc mới; không sao chép khách hàng/tin nhắn vào bảng tổng hợp.
- Mỗi sự kiện dùng mã định danh ổn định, không nhân bản theo từng tab. Tin nhắn thường không thành từng sự kiện lịch sử; chỉ sự kiện hệ thống và bản tóm tắt do người dùng ghi nhận.
- Quyền hồ sơ, quyền kênh và phạm vi công ty được giữ theo backend hiện có. Admin cấu hình không tự có quyền đọc hồ sơ khách.
- Trên màn hình nhỏ, phần thông tin đầu cuộn cùng trang để không che thao tác. Màn hình trên 1400 px dùng thanh thông tin cố định khi cuộn.

## Kết quả kiểm thử thực tế

| Nhóm | Kết quả |
|---|---|
| test-customer-360.js | 5 nhóm đạt: phạm vi và liên kết; trao đổi/công việc/nhiều cơ hội; thu hồi kênh; báo giá và đầu mối đã gỡ; lưu sau khởi động lại |
| test-directory.js | 6 nhóm đạt; gồm đồng bộ công việc, danh bạ/liên hệ, phạm vi công ty và dữ liệu qua khởi động lại |
| test-channel-access.js | 8 nhóm đạt; không mở rộng quyền khách, chỉ xem/được gửi, thu hồi và chống ghi đè |
| Trình duyệt trên dữ liệu riêng | Tạo đầu mối, ghi cuộc gọi, tạo bước tiếp theo, tạo cơ hội, đổi giai đoạn, lập báo giá và quay lại đúng tab/bộ lọc: đạt |
| Tải lại trang | Tab công việc, đầu mối và cơ hội chọn trước vẫn được giữ |
| Màn hình 390 × 844 | Mở tab công việc và hộp chi tiết được; không tràn ngang toàn trang; không ghi nhận lỗi JavaScript trong phiên kiểm tra |
| Localhost chính | HTTP 200; không ghi dữ liệu thử vào cơ sở dữ liệu chính |

Ảnh thực tế: [màn hình rộng](../design/customer360-review/desktop.png), [điện thoại](../design/customer360-review/mobile.png). Ảnh dùng dữ liệu kiểm thử.

Kết quả máy: `app/test-output/customer360-results.json`, `directory-results.json`, `customer360-migration-check.json`.

## Sao lưu và dữ liệu

Đã sao lưu SQLite nhất quán trước nâng cấp tại `app/backups/before-customer360-2026-09-24T13-16-34-847Z` gồm dữ liệu CRM và quản trị nền tảng. Sau nâng cấp, số bản ghi của tất cả bảng cũ không thay đổi, ngoại trừ schema_migrations tăng một mục. Có thêm bảng trao đổi và cột liên kết, không reset dữ liệu.

## Chưa triển khai / chưa xác minh

- Hợp đồng, thanh toán, công nợ và tải tài liệu vào hồ sơ chưa có module riêng; giao diện thông báo rõ. Xác nhận đã ký trong cơ hội không đồng nghĩa đã thanh toán.
- Hội thoại hiện liên kết ở cấp khách hàng; chưa liên kết từng hội thoại với một đầu mối/cơ hội. Tab hội thoại ghi rõ phạm vi này và không suy luận quan hệ cá nhân–doanh nghiệp.
- Tóm tắt hội thoại được ghi thủ công; chưa bổ sung AI tạo sinh hoặc tự động áp dụng AI. Không gửi tin thật tới nhà cung cấp trong kiểm thử.
- Ghi chú chung chưa gắn đầu mối/cơ hội. Dữ liệu cũ thiếu liên kết vẫn giữ nguyên và xem ở phạm vi toàn đơn vị.
- Cập nhật ở cửa sổ khác cần Làm mới hoặc mở lại hồ sơ; chưa có đẩy dữ liệu thời gian thực.
- Chưa kiểm thử trên điện thoại vật lý, tải lớn hoặc toàn bộ trình duyệt. Bố cục nhỏ được xác minh qua viewport 390 × 844.

## Tệp thay đổi

- `app/customer-360.js`: dữ liệu tổng hợp, liên kết hợp lệ, bản ghi trao đổi và lịch sử.
- `app/customer-360-ui.js`, `app/customer-360.css`: hồ sơ chính, các tab, biểu mẫu ngữ cảnh và responsive.
- `app/crm-server.js`, `app/app.html`: đăng ký module và tài nguyên.
- `app/workspace-ui.js`: đổi giai đoạn cơ hội có callback cập nhật hồ sơ tại chỗ.
- `app/test-customer-360.js`, `app/package.json`: kiểm tra và lệnh test:customer360.
- `docs/planning/38_HO_SO_360_ANH_XA.md`: bảng ánh xạ trước triển khai.
