# Danh bạ theo doanh nghiệp/đơn vị — bàn giao localhost

Ngày: 24/09/2026. Đặc tả nguồn: `31_DANH_BA_THEO_DON_VI_DAC_TA.md`.

## Cách sử dụng

1. Mở http://127.0.0.1:3000/#/customers bằng tài khoản trưởng nhóm hoặc sales.
2. Chọn **Theo doanh nghiệp/đơn vị**. Bấm tên/vùng mở rộng của một đơn vị để xem thông tin và bảng đầu mối ngay trong Danh bạ. Nút **Mở hồ sơ 360°** nằm riêng.
3. **+ Thêm liên hệ** → tạo mới hoặc chọn hồ sơ liên hệ có sẵn. Hộp chọn chỉ cho liên kết hồ sơ chưa gắn đơn vị; hồ sơ đã thuộc đơn vị này/đơn vị khác có nhãn và không cho chọn lại.
4. Bấm tên người để xem hồ sơ liên hệ; **Sửa** để cập nhật. **Gỡ liên kết** yêu cầu lý do, giữ hồ sơ và lịch sử; hồ sơ xuất hiện trong **Liên hệ chưa gắn đơn vị**.
5. Chọn **Danh sách** để trở lại bảng. Tìm theo tên đơn vị, người liên hệ, điện thoại/email; bộ lọc người phụ trách, chăm sóc, nhiều dịch vụ dùng chung cho hai dạng xem.
6. Cá nhân mua hàng độc lập vẫn có trong tab **Cá nhân**. Họ không bị chuyển thành một tổ chức giả.

Lựa chọn dạng xem, bộ lọc, trang, đơn vị mở và tìm kiếm bên trong được lưu theo công ty + người dùng trong phiên trình duyệt. Không lưu cache dữ liệu liên hệ dùng chung giữa tài khoản. Danh sách đầu mối được tải khi mở đơn vị; phân trang riêng với danh sách cha. Kết quả tìm liên hệ ghi rõ số khớp và tổng, có nút xem tất cả được phép.

## Ánh xạ đặc tả / SPEC CONFLICT

- Mô hình hiện có tách `customers` (khách hàng cá nhân/tổ chức) và `contacts` (đầu mối của tổ chức). Không sao chép khách hàng cá nhân vào contacts hoặc ngược lại. Chọn liên hệ có sẵn chỉ chọn entity contacts trong phạm vi cho phép.
- Giữ quan hệ **một đơn vị đang liên kết / một contact**, không đổi sang nhiều–nhiều. Liên hệ đang thuộc tổ chức khác không tự chuyển. Người dùng có quyền hai bên có thể gỡ rõ ràng rồi liên kết lại; mỗi bước được ghi nhận.
- `contacts.organization_id` cũ bắt buộc có giá trị. Bổ sung `detached_at` để thể hiện đã gỡ; khi gỡ, ID đơn vị cũ chỉ giữ phạm vi quản lý, không được tính là liên kết đang hoạt động. Các danh sách đang liên kết và số đếm loại bỏ liên hệ đã gỡ. Hồ sơ đã gỡ vẫn theo phạm vi đơn vị quản lý gần nhất; không tự mở quyền cho người khác.
- Quyền contact hiện kế thừa hồ sơ đơn vị, chưa có quyền riêng theo từng trường/đầu mối hoặc vai trò chỉ đọc Danh bạ. Không tạo IAM mới. Admin/giám đốc không được tự mở quyền xem CRM; sales/trưởng nhóm giữ phạm vi bản ghi hiện có, kể cả lookup và API ghi trực tiếp.
- Chưa có contact ↔ Zalo ID hoặc contact ↔ task trong schema. Không suy từ điện thoại, không thêm cột giả, không gắn mọi hội thoại/giao dịch của người vào tổ chức. Hồ sơ contact mới hiển thị thông tin, quan hệ và lịch sử liên kết; không giả lập timeline bán hàng riêng cho contact.
- Các đơn vị con có hồ sơ riêng và xuất hiện như khối đơn vị riêng. Cây tổ chức và quản lý đơn vị con vẫn nằm trong hồ sơ tổ chức 360° hiện có.
- Lịch sử liên kết mới ghi từ lúc nâng cấp. Lịch sử tổ chức trước đó giữ nguyên ở hồ sơ tổ chức, không tự suy contact từ văn bản lịch sử cũ.

## Tệp đã thay đổi

- Mới: `app/directory.js`, `app/directory-ui.js`, `app/test-directory.js`.
- Cập nhật: `app/organizations.js`, `app/organizations-ui.js`, `app/organizations.css`, `app/filters-ui.js`, `app/workspace-ui.js`, `app/app.html`, `app/crm-server.js`.
- Mở rộng DB theo cách thêm trường/bảng: `contacts.detached_at`, `contacts.version`, `contact_link_history`. Không xóa hoặc nhân bản bản ghi cũ.
- Các thay đổi dữ liệu chạy trong transaction hiện có. API mới kiểm tra quyền ở server, phiên bản liên hệ khi gỡ/liên kết/sửa và dữ liệu đơn vị hiện hành khi sửa để tránh ghi đè âm thầm.

## Kiểm thử thực sự đã chạy

- `node app/test-directory.js`: **5 nhóm đạt** — tìm không dấu, đếm/phân trang, quyền bản ghi, gỡ/liên kết không nhân bản, chặn liên kết trùng hoặc tự chuyển, cập nhật 360°, xung đột phiên bản, tenant/cookie giả và khởi động lại.
- `node app/test-organizations.js`: **7 nhóm đạt** — hồi quy tổ chức nhiều cấp, đầu mối chính, chuẩn hóa trùng, ngừng/khôi phục, quyền và lịch sử.
- `node app/test-saas.js`: **5 nhóm đạt** — cách ly tenant, admin/subadmin, phân quyền kênh, nguồn cung và dữ liệu sau khởi động lại.
- Kiểm tra cú pháp các module mới/sửa: đạt.
- UI trên DB giả riêng: đăng nhập sales; mở Alpha; tạo contact mới; mở hồ sơ contact; quay lại đúng đơn vị đã mở; gỡ với lý do; tìm chọn có sẵn và liên kết lại. ID hồ sơ vẫn là 5. Tìm không dấu “ui gia” trả đúng Alpha và một dòng khớp, chuyển sang bảng vẫn cùng kết quả, bấm xem tất cả hiện đủ liên hệ.
- Đã phát hiện và sửa lỗi tải đơn vị đang mở khi quay về từ 360°; kiểm tra lại đạt.
- Responsive thực đo: **360 / 768 / 1440 px**, không tràn ngang toàn trang. Bảng liên hệ cuộn trong vùng riêng. Ảnh và số đo trong `docs/design/directory-review/`.
- Không ghi nhận lỗi JavaScript trong phiên UI thử cuối. Localhost chính đã khởi động lại, mở Danh bạ và mục Bình Minh thành công.
- Sao lưu trước cập nhật: `app/backups/before-directory-2026-09-24T04-48-22-188Z`. Đối chiếu sau migration: **42 bảng cũ giữ nguyên các giá trị/cột trước đó**, kiểm tra toàn vẹn SQLite đạt. Kết quả trong `app/test-output/directory-migration-results.json`.

## Ảnh

- [Desktop, dữ liệu giả](../design/directory-review/directory-desktop.png)
- [Tìm theo người liên hệ](../design/directory-review/search-contact.png)
- [Mobile 360 px](../design/directory-review/directory-mobile.png)
- [Tablet 768 px](../design/directory-review/directory-tablet.png)

## NOT VERIFIED / giới hạn

- Chưa đo hiệu năng với hàng chục nghìn hồ sơ. API phân trang kết quả và không gửi tất cả contact cho trình duyệt, nhưng hiện vẫn lọc tập dữ liệu được phép tại server; cần tối ưu SQL/index khi triển khai quy mô lớn.
- Chưa chủ động gây mất mạng/timeout trên UI; có lỗi tại khối, nút thử lại và giữ form khi API từ chối, nhưng các tình huống hạ tầng này chưa được thử bằng fault injection.
- Chưa kiểm toán toàn bộ bàn phím/screen reader hoặc mọi mẫu dữ liệu dài. Nút mở rộng có aria-expanded/aria-controls, tên truy cập; bảng cuộn riêng.
- Không thêm chuyển một contact sang nhiều tổ chức, tự gộp khách cá nhân và contact, hoặc định danh Zalo riêng. Các giới hạn này đi theo schema hiện có, không báo là đã triển khai.
