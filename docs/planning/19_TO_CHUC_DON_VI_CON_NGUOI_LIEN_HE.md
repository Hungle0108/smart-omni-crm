# Tổ chức, đơn vị con và người liên hệ

Cập nhật 22/09/2026 cho bản thử localhost. Đã triển khai và kiểm tra trên dữ liệu thử riêng.

## Cách sử dụng

1. Vào **Danh bạ khách hàng**. Phần **Cây tổ chức & đơn vị trực thuộc** hiển thị các đơn vị trong phạm vi được xem. Bấm tên để mở hồ sơ.
2. Trong hồ sơ tổ chức, chọn **Tổ chức & đơn vị con**. Bấm **Bổ sung thông tin** để điền tên viết tắt, lĩnh vực, website, địa chỉ và giới thiệu. Thông tin tên đầy đủ, loại tổ chức, mã số thuế, điện thoại và email sửa tại **Chỉnh sửa hồ sơ**.
3. Bấm **+ Đơn vị con** để tạo chi nhánh, phòng ban, công ty con hoặc đơn vị trực thuộc. Mở đơn vị con để tiếp tục thêm các cấp bên dưới. Mỗi đơn vị có hồ sơ, cơ hội, báo giá và tiến trình riêng.
4. Chọn **Người liên hệ → + Thêm người liên hệ**. Nhập họ tên, chức vụ, phòng ban, vai trò trong giao dịch, điện thoại, email và ghi chú. Đánh dấu **Đầu mối liên hệ chính** khi cần.
5. Bấm **Sửa** để cập nhật cá nhân. **Ngừng liên hệ** yêu cầu lý do, vẫn giữ lịch sử; có thể **Khôi phục** trong danh sách đã ngừng.

Ví dụ: Công ty A → Chi nhánh Thủ Đức → Phòng Kinh doanh. Chị thêm người phụ trách ở đúng hồ sơ đơn vị nơi người đó làm việc.

## Quy tắc đang áp dụng

- Mỗi đơn vị có tối đa một đơn vị mẹ. Không cho chọn chính mình hoặc một đơn vị bên dưới làm đơn vị mẹ.
- Trưởng nhóm có thể gắn một tổ chức đã có vào đơn vị mẹ, đổi đơn vị mẹ hoặc tách độc lập, kèm lý do. Hai đơn vị phải thuộc cùng nhóm quản lý.
- Đơn vị con mới giữ người phụ trách và cờ dữ liệu mẫu/thật của đơn vị mẹ tại thời điểm tạo. Đổi phân công sau đó không tự đổi các đơn vị còn lại. Trưởng nhóm vẫn quản lý phân công theo hồ sơ hiện có.
- Sales chỉ xem khách được giao; trưởng nhóm xem nhóm mình. Quan hệ mẹ–con không tự mở rộng quyền xem. Nếu đơn vị mẹ ngoài phạm vi, chỉ hiển thị thông báo, không lộ tên hay liên kết của đơn vị mẹ.
- Mỗi đơn vị có nhiều người liên hệ và tối đa một đầu mối chính đang hoạt động. Chọn người mới làm đầu mối chính sẽ bỏ đánh dấu người trước.
- Điện thoại hoặc email trùng với người đang hoạt động trong cùng đơn vị sẽ bị chặn để kiểm tra. Điện thoại Việt Nam dạng `0`, `84`, `+84`, `0084` được đối chiếu; email không phân biệt chữ hoa/thường. Không tự gộp người giữa các tổ chức.
- Khôi phục người liên hệ cũng kiểm tra trùng. Người được khôi phục chưa tự trở lại làm đầu mối chính; có thể sửa để chọn lại.
- Thay đổi thông tin tổ chức, đơn vị mẹ và người liên hệ được ghi trong **Lịch sử tương tác**. Không xóa người liên hệ khỏi cơ sở dữ liệu bằng thao tác ngừng liên hệ.
- Địa chỉ tổ chức được lưu riêng với địa chỉ triển khai dịch vụ. Đơn vị con không tự được đánh dấu đã đăng ký Gói 1 chỉ vì đơn vị mẹ đã đăng ký.

## Phạm vi phiên bản này

Người liên hệ là thông tin cá nhân nằm trong tổ chức/đơn vị, không phải tài khoản đăng nhập. Khách hàng cá nhân mua độc lập vẫn giữ loại hồ sơ riêng. Chưa có thao tác liên kết tự động một khách cá nhân đã có với người liên hệ, chuyển một người giữa nhiều tổ chức, hoặc nhập hàng loạt người liên hệ.

Đây là phần bổ sung cho nhu cầu quản lý tổ chức và cá nhân; không đồng nghĩa đã hoàn thành toàn bộ yêu cầu trong hai tài liệu iVier CRM. Báo cáo đối chiếu số 18 giữ nguyên kết quả tại thời điểm kiểm tra trước thay đổi này.

## Đã kiểm tra

- 7 nhóm kiểm tra tổ chức/người liên hệ: cây nhiều cấp, chống vòng lặp, lưu chi tiết, trùng liên hệ, đầu mối chính, ngừng/khôi phục và lịch sử, phân quyền, dữ liệu sau khởi động lại.
- 13 nhóm kiểm tra chức năng CRM hiện có và 7 nhóm tiến trình khách hàng đạt sau thay đổi.
- Thử trực tiếp trên giao diện riêng: tạo đơn vị con, thêm/sửa đầu mối chính, lưu thông tin tổ chức, mở quan hệ đơn vị mẹ và kiểm tra bố cục thẻ liên hệ.
- Đã sao lưu nhất quán dữ liệu đang dùng tại `app/backups/before-organizations-20260922/crm.db`. Dữ liệu thử giao diện nằm riêng, không đưa vào hồ sơ của chị.

Chạy lại kiểm tra: `node app/test-organizations.js`. Kết quả gần nhất: `app/test-output/organizations-results.json`.
