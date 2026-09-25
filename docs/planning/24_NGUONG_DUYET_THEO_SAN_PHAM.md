# Ngưỡng duyệt báo giá theo loại và sản phẩm / dịch vụ

Cập nhật ngày 22/09/2026 theo yêu cầu chuyển Duyệt báo giá từ Cấu hình công ty sang cùng trang tạo mẫu và cho trưởng nhóm thiết lập riêng.

## Hướng dẫn

1. Đăng nhập **Trưởng nhóm**, mở **Mẫu & nhận diện**, bấm **Thiết lập duyệt báo giá** ở đầu trang.
2. Mở loại dịch vụ, chọn **Thiết lập ngưỡng loại** để đặt ngưỡng mặc định.
3. Chọn **Thiết lập riêng** tại sản phẩm nếu muốn áp dụng ngưỡng khác. **Dùng ngưỡng loại** bỏ thiết lập riêng, trở về mặc định của loại cho các lần trình duyệt sau.
4. Nhập ngưỡng giá trị VNĐ, ngưỡng giảm thêm %, chọn khoản tiền so sánh và cơ sở trước/sau giảm thêm rồi lưu.

Thiết lập thuộc nhóm của trưởng nhóm đang đăng nhập. Admin quản lý danh mục và mẫu; admin, sales, giám đốc không sửa các ngưỡng này. Tham số gửi lên không thể đổi thiết lập của nhóm khác.

## Quy tắc tính

- Ngưỡng sản phẩm ưu tiên ngưỡng loại. Sản phẩm không có ngưỡng riêng dùng ngưỡng loại.
- **Giá trị riêng sản phẩm**: đơn giá × số lượng của sản phẩm đó. Các mã khác nhau được xét riêng, kể cả cùng loại.
- **Tổng giá trị cả báo giá**: dùng tổng giá trị năm đầu của tất cả hạng mục để so với ngưỡng đang xét. Trưởng nhóm chọn cách tính trong mỗi thiết lập.
- Cơ sở tiền có thể là trước hoặc sau giảm thêm; dùng giá năm đầu chưa thuế, không cộng tiền gia hạn. Tiền sau giảm được làm tròn VNĐ theo cách tính hiện có.
- Mức giảm thêm hiện nhập chung cho báo giá. Mức này được so với ngưỡng chiết khấu của từng hạng mục; chưa có nhập phần trăm giảm khác nhau cho từng dòng.
- Chỉ cần một hạng mục vượt ngưỡng giá trị **hoặc** chiết khấu thì toàn bộ báo giá trình giám đốc. Bằng ngưỡng vẫn nằm trong hạn.
- Trưởng nhóm lập báo giá vẫn trình giám đốc, không tự duyệt. Điều kiện gói bán kèm, thuế và giá gia hạn không thay đổi.
- Thiếu một trong hai ngưỡng của hạng mục, không có ngưỡng riêng hợp lệ cũng không có mặc định của loại: chặn trình và nêu tên sản phẩm cần thiết lập. Ngưỡng 0 là giá trị hợp lệ, khác để trống.
- Chính sách được chốt tại lần trình duyệt, gồm ngưỡng từng dòng, nguồn loại/sản phẩm, phiên bản quy tắc, cơ sở tiền, giá trị so sánh và kết quả. Đổi ngưỡng không đổi cấp duyệt của báo giá đang chờ. Sửa/rút và trình lại sẽ xét ngưỡng hiện tại.
- Màn hình báo giá có phần chính sách theo hạng mục đã lưu. Khi thay sản phẩm hoặc chiết khấu, lưu nội dung trước để xem lại cấp duyệt.

## Chuyển dữ liệu

- Ngưỡng chung đã cấu hình được chuyển thành mặc định theo loại cho từng nhóm hiện có. Giữ số tiền, phần trăm và cơ sở trước/sau giảm; giữ cách so với **cả báo giá** để không tự thay đổi ý nghĩa ngưỡng cũ.
- Nếu cấu hình cũ thiếu ngưỡng, loại vẫn được đánh dấu cần thiết lập. Loại hoặc nhóm mới tạo sau cập nhật cũng cần trưởng nhóm cấu hình; hệ thống không tự đặt mức kinh doanh.
- Giá trị đang có trong dữ liệu thử là dữ liệu đã lưu từ trước, không phải quy định công ty mới được tự quyết định trong lần này. Trưởng nhóm có thể chỉnh lại tại vị trí mới.
- Cấu hình công ty giữ lịch làm việc và các bước bán hàng, có đường dẫn tới phần ngưỡng mới. API cũ không còn cho sửa ngưỡng; báo giá cũ, bản duyệt và lịch sử được giữ.

## Kiểm tra và kỹ thuật

- Bộ `test-approval-rules.js`: 8 nhóm đạt — quyền/đầu vào/đường cũ; thiếu ngưỡng; số lượng và bằng ngưỡng; riêng so với mặc định; điều kiện OR; trước/sau giảm; so riêng hoặc cả báo giá; chính sách đang chờ; không tự duyệt; cách ly nhóm; khởi động lại.
- Hồi quy đã đạt: lõi 12 nhóm, chức năng mở rộng 13, danh mục 8, lưu trữ/khôi phục 10, nội dung theo dịch vụ 6. Dữ liệu chuẩn bị kiểm tra chuyển sang API trưởng nhóm qua `test-approval-fixtures.js`; không dùng đường sửa ngưỡng cũ làm lối tắt.
- Giao diện thử trên dữ liệu riêng: trưởng nhóm lưu ngưỡng loại 500/10%, đặt sản phẩm A riêng 300/5%, nhìn thấy B dùng mặc định; nút truy cập nhanh, biểu mẫu, bảng ngưỡng và trang Cấu hình công ty không còn ô ngưỡng. Giá trị này chỉ nằm trong dữ liệu kiểm thử, không áp dụng vào bản chính.
- Đã thử migration trên bản sao và đối chiếu dữ liệu chính sau cập nhật: 33 bảng cũ giữ nguyên; nhật ký đăng nhập mới phát sinh được loại khỏi phép đối chiếu. Kết quả: `app/test-output/approval-rules-results.json`, `app/test-output/approval-migration-results.json`.
- Sao lưu trước cập nhật: `app/backups/before-approval-rules-20260922/crm.db`. Không khôi phục đè lên dữ liệu nhập sau thời điểm sao lưu.
- Migration `quote-approval-rules-v1`, bảng `quote_approval_rules` theo nhóm và loại/sản phẩm, có phiên bản và nhật ký chỉnh sửa. Không sửa JSON chính sách của các báo giá đang chờ.
- Mô-đun mới: `app/approval-rules.js`, `app/approval-ui.js`. Tích hợp trong `features.js`, `features-ui.js`, máy chủ, HTML và CSS danh mục. Không có tác vụ nền mới.
- API: `GET /api/approval-rules`, `PUT /api/approval-rules/:kind/:id` (kind category/product), `POST /api/approval-rules/product/:id/inherit`. `PUT /api/settings` từ chối amount/discount/threshold_basis; vẫn lưu lịch và giờ làm việc.
- Kiến trúc tiếp tục SQLite localhost/API `/api` theo bản thử hiện có; không phải hoàn tất nền tảng PostgreSQL/đa công ty hay bộ thiết kế quy trình tùy ý trong reference.
