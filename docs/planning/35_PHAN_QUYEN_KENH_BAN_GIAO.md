# Phân quyền kênh theo người dùng — bàn giao localhost

Ngày 24/09/2026. Thực hiện theo xác nhận của người dùng và [đặc tả](34_PHAN_QUYEN_KENH_DAC_TA.md). Kế hoạch/ánh xạ tại [33_PHAN_QUYEN_KENH_KE_HOACH.md](33_PHAN_QUYEN_KENH_KE_HOACH.md).

## Cách sử dụng

1. Mở http://127.0.0.1:3000/#/channels, đăng nhập bằng admin hoặc subadmin của công ty. Nếu trang đang mở, tải lại để nhận giao diện mới.
2. Trong **Phân quyền kênh theo người dùng**, bấm **Phân người dùng / Chỉnh phân quyền** ở đúng kênh.
3. Chọn **Theo phạm vi nhóm hiện có** hoặc **Chỉ người được chỉ định**. Ở chế độ chỉ định, đánh dấu những người được dùng, chọn **Chỉ xem** hoặc **Xem và gửi / thao tác**.
4. Có tìm theo tên/tài khoản, lọc nhóm, lọc người đã chọn và phân trang 10 người. Lựa chọn được giữ khi chuyển trang hoặc lọc. **Chọn tất cả trên trang này** chỉ tác động người đủ điều kiện trên trang đang xem.
5. Xem tổng người đã chọn, người đủ điều kiện và phần tóm tắt thay đổi trước khi lưu. Chọn 0 người ở chế độ chỉ định nghĩa là không cấp cho ai; không tự quay về quyền theo nhóm.
6. **Lưu phân quyền** mới áp dụng cấu hình. **Hủy** có cảnh báo nếu còn thay đổi chưa lưu. Lỗi lưu giữ bản nháp; xung đột với cửa sổ khác có nút tải lại cấu hình để đối chiếu.

## Đã triển khai

- Dòng kênh có trạng thái kỹ thuật độc lập với trạng thái phân quyền, tối đa ba tên người dùng và +N; theo nhóm không giả số người nếu chưa mở cấu hình.
- Hộp chọn nhiều người có tìm/lọc/phân trang, tổng lựa chọn, checkbox chọn một phần, người không đủ quyền không được cấp mới; người đã được chọn nhưng bị khóa/đổi nhóm/đổi vai trò được cảnh báo và có thể gỡ.
- Admin/subadmin quản lý cấu hình nhưng không có quyền đọc/gửi hội thoại do quyền quản trị. Chức năng nghiệp vụ chỉ cho sales/trưởng nhóm đủ điều kiện, thuộc nhóm hoạt động, đúng quyền kênh và phạm vi khách.
- Chuyển sang theo nhóm không cộng danh sách chỉ định cũ. Với kênh API bổ sung, người dùng phải thuộc nhóm phụ trách; rời nhóm hoặc nhóm ngừng hoạt động làm mất quyền hiệu lực.
- Lưu chế độ, thành viên, revision và audit trong cùng giao dịch của máy chủ. Audit ghi người thực hiện, thời gian, khóa kênh, chế độ cũ/mới, thêm/gỡ/đổi mức quyền, không chứa nội dung tin hoặc mã API.
- Cảnh báo số hội thoại đang mở của người sắp bị gỡ quyền. Không thay người phụ trách; hướng dẫn nhờ trưởng nhóm kiểm tra phân công trong Hộp thư.
- Quyền áp dụng cho danh sách, đường dẫn trực tiếp, gửi/thao tác hội thoại, gửi báo giá qua hội thoại, vòng đời hội thoại, hồ sơ khách/timeline, số hội thoại chờ phân công và hàng đợi OA.
- Hộp thư kiểm tra quyền mỗi 4 giây kể cả khi đang nhập; thu hồi thì gỡ vùng hội thoại, giảm xuống chỉ xem thì khóa thao tác. Mọi yêu cầu máy chủ kiểm tra ngay; khoảng 4 giây chỉ là thời gian cập nhật phần hiển thị. Quyền vừa được cấp thêm cần làm mới hộp thư để sử dụng.
- Không tự kết nối, tạo mã API, gửi tin, đổi người phụ trách hoặc sửa khách hàng khi lưu phân quyền.

## Dữ liệu và API

Không thêm/xóa/đổi bảng trong lần này. Tái sử dụng `channel_access`, `channel_members`, `audit`, `users`, `teams`, `channel_connections`, `zalo_connection`. Hai bảng quyền đã tồn tại từ bản SaaS trước; ràng buộc khóa chính chống thành viên trùng. Revision ban đầu 0 khi chưa có rule; lần lưu đầu là 1, các lần sau tăng một.

| API | Quyền / nội dung |
|---|---|
| GET /api/channel-access | Admin/subadmin: danh sách cấu hình và trạng thái công khai từng kênh |
| GET /api/channel-access/:key | Admin/subadmin: cấu hình hiện tại, nhóm, người có quyền hiệu lực, người đủ điều kiện theo nhóm, số hội thoại đang giao, 20 lịch sử gần nhất |
| GET /api/channel-access/:key/users | Admin/subadmin: tìm q, lọc team, page; selected_only + selected_ids dùng để lọc bản nháp, không cấp quyền |
| PUT /api/channel-access/:key | Admin/subadmin: mode=team/selected, revision, members=[{user_id,permission:read/send}]; cập nhật nguyên tử |
| GET /api/channel-access/effective | Người đã đăng nhập: các khóa kênh được dùng và mức read/send; conversation_id tùy chọn trả conversation_access=none/read/send trong đúng phạm vi khách |

Lỗi: 401 chưa đăng nhập; 403 sai quyền; 404 không có kênh hoạt động; 400 dữ liệu/người được gán không hợp lệ; 409 revision cũ; lỗi lưu bất ngờ trả 500 và rollback. Tenant lấy từ phiên công ty đã xác thực, dùng cơ sở dữ liệu riêng; không lấy tenant từ body.

## Kiểm thử đã chạy

**36 nhóm kiểm tra tự động đạt** trên dữ liệu riêng, không gửi tin nhà cung cấp thật:

- `app/test-channel-access.js`: 8 nhóm — tìm/lọc/phân trang, cấp nhiều người, audit/revision, chống tự cấp quyền, chỉ xem, thu hồi/0 người, phạm vi khách/timeline, kế thừa nhóm/rời nhóm, trạng thái kỹ thuật, tài khoản khóa, dữ liệu sai và lỗi lưu audit có rollback toàn bộ.
- `app/test-saas.js`: 5 nhóm — cách ly hai công ty, chống sửa cookie, admin/subadmin, quyền kênh, phạm vi khách, lưu qua khởi động lại.
- `app/test-channel-connections.js`: 10 nhóm — hồi quy cấu hình/kiểm tra API/trạng thái/mã hóa, không giả nhận-gửi thật.
- `app/test-zalo.js`: 13 nhóm — bộ giả lập OA, kiểm tra lại quyền trước khi worker gửi, dừng tin còn chờ khi thu hồi; không gọi OA thật.

Đã thao tác trình duyệt trên bộ dữ liệu giả: mở cấu hình OA, chọn Nhân viên thử 01 ở trang 1 và Nhân viên thử 14 ở trang 2; lọc đã chọn còn đúng 2; đổi người 01 sang chỉ xem; lưu, mở lại và đọc DOM xác nhận một người read/một người send. Checkbox chọn một phần và người không có vai trò hộp thư bị vô hiệu hóa đã hiện đúng. Kích thước thực tế 1440 px: không tràn ngang, hộp rộng 820 px.

Sau đó trình duyệt kiểm thử lỗi khi xử lý xác nhận native và không chụp được ảnh. Đã đổi xác nhận hủy/tải lại thành cảnh báo nội bộ có hai nút; kiểm tra cú pháp đạt. Không dùng ảnh giả làm bằng chứng nghiệm thu.

Bản chính cổng 3000 đã được khởi động lại và kiểm tra đọc API bằng admin: health, danh sách/từng cấu hình, tìm người, quyền hiệu lực của admin bằng rỗng, tệp giao diện mới đều đạt. Không lưu thay đổi phân quyền ở dữ liệu chính.

## Sao lưu và bảo toàn dữ liệu

Sao lưu trước cập nhật: `app/backups/before-channel-access-2026-09-24T07-14-44-821Z`. Đã đối chiếu giá trị của 41 bảng CRM + 3 bảng registry sau khởi động lại: không có bảng thay đổi, kiểm tra toàn vẹn SQLite đạt. Báo cáo tại `app/test-output/channel-access-migration-results.json`.

## Ánh xạ đặc tả và giới hạn

- OA hiện là một kết nối thật duy nhất (id=1); khóa quyền `oa` dùng chung với các hội thoại OA mô phỏng như trước. `personal` là kênh cá nhân mô phỏng. `connection:<id>` phân biệt từng tài khoản API bổ sung. Chưa triển khai nhiều OA hoặc tách quyền OA thật khỏi OA mô phỏng; giữ tương thích cấu hình đã lưu.
- Hồ sơ người dùng chưa có trường email: tìm theo tên/tên tài khoản. Không tự tạo email giả hoặc thay IAM trong nhiệm vụ này.
- API bổ sung chưa có bộ nhận/gửi; phân quyền chỉ giới hạn khả năng sử dụng hiện có, không tạo tích hợp. Mỗi công ty có admin/subadmin phạm vi toàn công ty; chưa có cơ chế quản trị ủy quyền riêng từng nhóm.
- Chưa có WebSocket/SSE, xuất hội thoại hoặc gửi/tải tệp đính kèm trong bản hiện tại. Không có đăng ký realtime để hủy; việc cập nhật hộp thư dùng yêu cầu HTTP đã kiểm tra quyền. Khi xây những chức năng này phải áp dụng cùng policy.
- Không thay đổi quyền tự động của bot FAQ đã được duyệt; danh sách người dùng kiểm soát nhân viên, không mặc nhiên tắt bot hoặc kênh.
- Vẫn là localhost SQLite/API /api, chưa chuyển kiến trúc production PostgreSQL/API v1.

## NOT VERIFIED

- Chưa hoàn tất kiểm tra ảnh và thao tác ở 360/768 px do lỗi điều khiển/chụp ảnh trình duyệt; CSS đã bổ sung bố cục co giãn nhưng chưa tuyên bố nghiệm thu hình ảnh.
- Chưa kiểm chứng trực tiếp hộp cảnh báo hủy mới, lỗi lưu/xung đột giữ nháp, thu hồi ngay trong màn hình đang soạn và toàn bộ thao tác bàn phím/screen reader sau khi trình duyệt gặp lỗi. Backend cho các trường hợp quyền, xung đột và rollback đã kiểm thử đạt.
- Worker được kiểm tra bằng adapter OA giả lập, chưa nghiệm thu tin thật. Chưa kiểm thử tải với hàng nghìn nhân viên/kênh; backend tìm người có phân trang đầu ra nhưng còn lọc bộ người dùng công ty trong bộ nhớ.

## Tệp ứng dụng thay đổi

`app/channel-assignments.js`, `app/channel-assignments-ui.js`, `app/channel-connections.js`, `app/crm-server.js`, `app/workspace.css`, `app/package.json`; thêm `app/test-channel-access.js`. Tài liệu 33–35 và cập nhật README. Không thay Site công khai.
