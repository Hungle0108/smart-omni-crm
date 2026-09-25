# Thêm, lưu trữ và khôi phục dữ liệu

Bàn giao ngày 22/09/2026. Áp dụng cho bản Smart Omni CRM chạy trên máy, tại http://127.0.0.1:3000.

## Cách sử dụng

- Vào **Người dùng** bằng tài khoản admin: chọn **Thêm người dùng**, nhập tên đăng nhập, họ tên, vai trò, nhóm và mật khẩu ban đầu. Tài khoản mới có thể đăng nhập bằng cách chọn **Tự nhập tài khoản** ở màn hình đăng nhập.
- Cũng tại đây, chọn **Thêm nhóm** để tạo nhóm làm việc; **Sửa** để đổi tên nhóm. Tài khoản nghỉ việc dùng **Khóa / bàn giao**, chọn sales cùng nhóm nhận khách và việc còn lại. **Đã khóa** trong bộ lọc cho phép tìm và kích hoạt lại tài khoản.
- Trong danh bạ khách hàng, cơ hội, báo giá, kế hoạch, nội dung bot, mẫu công việc và hộp thư: dùng **Lưu trữ…** để chọn dữ liệu cần bỏ khỏi danh sách hoạt động và ghi lý do. Dùng **Đã lưu trữ / Khôi phục** để đưa dữ liệu trở lại. Hồ sơ khách, cơ hội, báo giá và bài FAQ còn có nút lưu trữ ngay trong trang chi tiết.
- Tại **Mẫu & nhận diện**, admin có thể thêm loại dịch vụ, sản phẩm và đơn giá, mẫu báo giá, logo. Phần **Lưu trữ và khôi phục danh mục** quản lý các mục không còn dùng.
- Tại **Cấu hình công ty → Các bước bán hàng**, admin có thể thêm bước trung gian, ngừng dùng hoặc dùng lại bước. Chuyển các cơ hội đang sử dụng bước đó trước khi ngừng.

**Lưu trữ là cách bỏ dữ liệu khỏi danh sách đang dùng và vẫn khôi phục được. Không có xóa vĩnh viễn trong đợt này.**

## Phạm vi theo chức năng

| Chức năng | Thao tác có thể dùng | Người được thực hiện |
|---|---|---|
| Người dùng | Thêm, sửa thông tin, khóa có bàn giao, kích hoạt lại | Admin |
| Nhóm làm việc | Thêm, đổi tên, lưu trữ, khôi phục | Admin |
| Khách hàng, tổ chức và đơn vị con | Thêm, sửa, lưu trữ, khôi phục | Sales với khách được giao; trưởng nhóm trong nhóm |
| Người liên hệ thuộc tổ chức | Thêm, sửa, ngừng, khôi phục | Theo quyền của tổ chức |
| Cơ hội bán hàng | Thêm, sửa tên/giá trị dự kiến/ngày chốt, chuyển bước, lưu trữ, khôi phục | Sales/trưởng nhóm trong phạm vi |
| Kế hoạch và công việc | Thêm, sửa, hoàn thành/mở lại, lưu trữ/khôi phục | Theo phân quyền công việc hiện có |
| Tiến trình khách và việc con | Thêm/sửa đầu việc, công việc con, cập nhật tiến độ; lưu trữ/khôi phục cả nhánh | Theo phân quyền khách |
| Mẫu công việc | Thêm, sửa, lưu trữ/khôi phục, áp dụng vào khách | Trưởng nhóm quản lý mẫu; sales có thể áp dụng |
| Báo giá | Tạo, sửa theo trạng thái, rút khỏi chờ duyệt có lý do, lưu trữ/khôi phục | Sales/trưởng nhóm trong phạm vi; duyệt theo cấp hiện có |
| Loại dịch vụ, sản phẩm, mẫu báo giá | Thêm, sửa, lưu trữ, khôi phục | Admin |
| Nhận diện và logo | Sửa thông tin công ty; tải/thay/gỡ logo công ty và logo riêng của mẫu | Admin |
| Nội dung bot FAQ | Thêm/sửa nháp, trình/duyệt, lưu trữ/khôi phục | Trưởng nhóm soạn; giám đốc quản lý việc lưu trữ nội dung đã/chờ duyệt |
| Ghi chú khách | Thêm, sửa, lưu trữ, khôi phục; lịch sử vẫn lưu | Sales/trưởng nhóm trong phạm vi |
| Hội thoại | Thêm hội thoại mô phỏng; đóng/mở, lưu trữ/khôi phục; giữ tin nhắn | Sales/trưởng nhóm trong phạm vi |
| Các bước bán hàng | Thêm bước trung gian, ngừng/dùng lại | Admin |
| Kênh kết nối | Sửa cấu hình, bật/tạm dừng OA theo chức năng hiện có | Admin; chưa có thêm tùy ý nhiều OA hoặc loại kết nối mới |

## Các điều kiện cần biết

1. Khóa tài khoản ngừng các phiên đăng nhập cũ. Không thể tự khóa tài khoản đang đăng nhập. Khách và việc cần người nhận bàn giao; tên người tạo, người duyệt trong lịch sử không thay đổi.
2. Nhóm còn người hoạt động hoặc khách đang hoạt động chưa được lưu trữ. Hiện chưa có chức năng chuyển vai trò/nhóm của tài khoản đã tạo; vai trò và nhóm được chọn khi tạo tài khoản mới.
3. Lưu trữ tổ chức mẹ cần xử lý các đơn vị con trước. Khách còn báo giá chờ duyệt hoặc tin OA đang gửi phải xử lý xong trước. Khôi phục đơn vị con cần khôi phục tổ chức mẹ trước.
4. Hồ sơ lưu trữ không còn trong danh sách xử lý và bị chặn chỉnh sửa qua đường dẫn/API cũ. Dữ liệu liên quan vẫn được giữ. Khi khôi phục khách hoặc hội thoại, bot không tự hoạt động lại.
5. Báo giá đang chờ duyệt cần rút duyệt trước khi lưu trữ. Báo giá đã duyệt/gửi giữ nội dung, giá và bản in; thay đổi danh mục không viết lại các báo giá cũ. Không gửi báo giá thử vào hội thoại đã lưu trữ.
6. Loại dịch vụ còn sản phẩm hoặc mẫu đang dùng cần lưu trữ các mục con trước. Khôi phục loại trước khi khôi phục sản phẩm/mẫu thuộc loại đó.
7. FAQ lưu trữ ngừng được bot sử dụng. Khôi phục đưa về nháp, phải duyệt lại trước khi bot sử dụng.
8. Các bước Mới, Thắng, Thua và bốn vai trò vẫn giữ ý nghĩa nghiệp vụ. Chưa có tạo vai trò tùy ý, đổi tên/sắp xếp bước, hoặc sửa các trạng thái phê duyệt. Cơ hội lưu trữ thuộc bước đã ngừng cần kích hoạt lại bước trước khi khôi phục.
9. Hội thoại thật chỉ nhận được sau khi kết nối OA đúng cấu hình. Nút “Thêm hội thoại thử” tạo hội thoại mô phỏng; không tạo tài khoản Zalo và không gửi ra ngoài.

## Kiểm tra đã thực hiện

- `node app/test-lifecycle.js`: 10 nhóm đạt. Bao gồm quyền tạo tài khoản/nhóm, mật khẩu, bàn giao, vô hiệu phiên cũ, chống tự khóa; lưu trữ và khôi phục các mô-đun; chặn API cũ; báo giá đã duyệt còn nguyên; FAQ cần duyệt lại; bước bán hàng; dữ liệu còn sau khởi động lại.
- Hồi quy đã đạt trong đợt: lõi nghiệp vụ 12 nhóm; chức năng mở rộng 13 nhóm; danh mục/báo giá/logo 8 nhóm; tổ chức/người liên hệ 7 nhóm; Zalo offline 12 nhóm; tiến trình 8 nhóm. Kiểm tra tiến trình gồm mẫu đủ 6 cấp, từ chối cấp thứ 7.
- Kiểm tra giao diện trên cơ sở dữ liệu riêng: biểu mẫu thêm tài khoản; tạo nhóm → lưu trữ → khôi phục; lưu trữ khách mẫu → khôi phục → thấy lịch sử; nút sửa cơ hội. Không tạo người dùng thử vào dữ liệu chính và không kết nối Zalo thật.
- Đã mở màn hình Người dùng mới trên bản chính. Sau migration, đối chiếu các cột cũ của 31 bảng với bản sao trước cập nhật: dữ liệu giữ nguyên.
- Kết quả tự động nằm trong `app/test-output`; bộ kiểm tra vòng đời có `lifecycle-results.json`, tiến trình có `progress-results.json`. Không coi các kiểm tra này là nghiệm thu toàn bộ MVP hoặc tích hợp thật.

## Thông tin bảo trì

- Sao lưu trước cập nhật: `app/backups/before-lifecycle-20260922/crm.db`. Không ghi đè dữ liệu mới bằng bản sao này nếu đã nhập thêm thông tin sau cập nhật.
- Migration: `lifecycle-v1`, bổ sung cột lưu trữ/lý do/thông tin khôi phục, bảng `lifecycle_history` và `pipeline_stages`.
- Mô-đun mới: `app/lifecycle.js`, `app/lifecycle-ui.js`. Tích hợp tại máy chủ và trang HTML; cập nhật lọc danh sách/tổng quan, kiểm tra trạng thái và danh mục; sửa giới hạn mẫu công việc sáu cấp.
- API chính: `GET /api/lifecycle/:kind`; `POST /api/lifecycle/:kind/:id/archive|restore`; quản lý `/api/admin/users`, `/api/admin/teams`, `/api/pipeline-stages`; sửa ghi chú/cơ hội và rút duyệt báo giá. Các thao tác đều kiểm tra quyền phía máy chủ, ghi lịch sử tương ứng.
- Không có tác vụ nền mới. Tiếp tục kiến trúc SQLite localhost và API `/api` đã có; chưa chuyển sang PostgreSQL/đa công ty/API v1 như reference. Phần pipeline nay lấy danh sách bước từ dữ liệu nhưng chưa đạt bộ thiết kế quy trình tùy chỉnh đầy đủ. Đối chiếu thêm `docs/reference/00_CACH_AP_DUNG.md`.
