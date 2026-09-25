# Phân quyền kênh — kế hoạch triển khai 24/09/2026

Người dùng xác nhận triển khai vào localhost. Tham chiếu: `Omni_CRM_Description_Phan_quyen_kenh_Astra6.md`.

- Phạm vi: hoàn thiện khối phân người dùng, hộp chọn nhiều người và kiểm tra quyền hiện hữu. Không kết nối nhà cung cấp mới.
- Tệp: channel-assignments.js, channel-assignments-ui.js, workspace.css, crm-server.js và kiểm thử liên quan.
- Dữ liệu: tái sử dụng channel_access/channel_members/audit, không đổi bảng hoặc reset; giữ revision và giao dịch máy chủ.
- API: giữ GET/PUT channel-access; thêm đọc từng cấu hình, danh sách người có phân trang, quyền hiệu lực, lịch sử và cảnh báo ảnh hưởng.
- Giao diện: hai chế độ, tìm/lọc nhóm và người đã chọn, phân trang, đếm toàn bộ lựa chọn, tóm tắt trước lưu, lỗi/xung đột không mất nháp.
- Tác vụ nền: tiếp tục dùng kiểm tra quyền của worker OA; hộp thư kiểm tra quyền định kỳ cả khi đang soạn. Không có WebSocket/SSE hiện tại để hủy đăng ký.
- Kiểm thử: dữ liệu riêng; cấp/thu hồi, vai trò, nhóm, tenant, revision, rollback, trạng thái kết nối, worker; giao diện 360/768/1440.
- An toàn: admin/subadmin quản lý cấu hình nhưng không có quyền hội thoại; truy cập nghiệp vụ yêu cầu vai trò sales/leader, nhóm hoạt động, kênh và phạm vi khách.

## Ánh xạ và giới hạn hiện tại

- SPEC DEVIATION: tiếp tục SQLite riêng mỗi công ty và API /api của bản thử, không chuyển PostgreSQL/API v1 trong đợt này.
- Users hiện chưa có trường email; tìm theo tên/tên tài khoản, không tạo email giả hoặc mở rộng IAM ngoài phạm vi.
- Kênh bổ sung dùng connection:<id>, độc lập từng tài khoản. OA hiện chỉ hỗ trợ một kết nối (zalo_connection id=1) và quy tắc oa dùng chung với hội thoại OA mô phỏng như bản cũ. Giữ khóa và cấu hình cũ, hiển thị rõ; không tuyên bố hỗ trợ nhiều OA. Cá nhân là một kênh mô phỏng.
- Theo nhóm: kế thừa nhóm hoạt động của người dùng và phạm vi khách; kênh bổ sung yêu cầu đúng nhóm phụ trách. Không có nhóm hợp lệ thì không có quyền nghiệp vụ. Chế độ chỉ định vẫn chịu điều kiện nhóm/vai trò.
- Quyền read/send đã có trong backend; tái sử dụng, không thêm vai trò hoặc ma trận quản trị. Admin/subadmin hiện quản lý toàn công ty, chưa có vai trò quản trị giới hạn theo nhóm.
- Không có xuất hội thoại/tệp đính kèm hoặc realtime push; không tự xây các chức năng đó. Lịch sử audit cũ giữ nguyên; chi tiết thêm/gỡ bắt đầu từ lần lưu sau nâng cấp.
