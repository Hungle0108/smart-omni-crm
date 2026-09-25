# Bàn giao giao diện Smart Omni CRM 0.3

Ngày 21/09/2026. Bản localhost đã được hiệu chỉnh theo [prototype Omni CRM đã gửi](https://omni-crm-nguyet.leminhnguyet1977.chatgpt.site). Mở ứng dụng tại http://127.0.0.1:3000, hoặc nhấp đúp CHAY_CRM.cmd trong thư mục dự án.

## Những phần đã thay đổi

| Màn hình | Cách dùng trong bản mới |
|---|---|
| Khung làm việc | Tông xanh/trắng, menu theo nhóm, tìm kiếm nhanh, nút Đổi tài khoản ở đầu trang |
| Tổng quan | Số liệu đang lưu, phân bố cơ hội, việc cần làm và hội thoại gần đây; bấm để mở bản ghi |
| Danh bạ | Lọc tổ chức/cá nhân, người phụ trách, tình trạng; tìm theo thông tin khách |
| Hồ sơ khách | Xem lịch sử tương tác; chuyển sang cơ hội, báo giá, kế hoạch và ghi chú; tạo hoạt động ngay từ khách |
| Kế hoạch tiếp xúc | Loại việc, mức ưu tiên, người thực hiện, hạn, ghi chú; xem danh sách hoặc lịch tuần; hoàn thành/mở lại |
| Hộp thư Zalo | Danh sách hội thoại, nội dung và tóm tắt khách cạnh nhau; lọc kênh/trạng thái; trả lời thử hoặc lưu ghi chú nội bộ |
| Cơ hội bán hàng | Bảng 7 bước, giá trị từng bước, tìm kiếm; mở thẻ để chuyển bước và lập báo giá gắn với cơ hội |
| Báo giá | Lọc theo trạng thái, thấy các bước nháp–trình duyệt–duyệt–gửi thử; mở lại khách/cơ hội khi có quyền |
| Nội dung bot và kênh | Hiển thị trình tự soạn–duyệt–bot sử dụng và trạng thái mô phỏng thực tế |
| Đăng nhập | Đã sửa lỗi không nhận phím gõ/xoá; chọn nhanh 5 tài khoản, giữ tài khoản đã chọn khi mật khẩu sai |

Hồ sơ vẫn phân biệt tổ chức và cá nhân. Quan hệ nhiều người liên hệ thuộc một tổ chức chưa được xây dựng đầy đủ. Việc chuyển trạng thái hoặc gửi dữ liệu vẫn đi qua kiểm tra quyền và quy tắc nghiệp vụ của ứng dụng hiện có.

## Các lượt dùng thử đã xác nhận

Kiểm tra giao diện thực hiện trong trình duyệt Codex với dữ liệu riêng tại cổng 4003, không chèn các giao dịch kiểm thử vào cơ sở dữ liệu người dùng tại cổng 3000.

| Lượt thử | Kết quả quan sát |
|---|---|
| Gõ `adminx`, xoá ký tự cuối rồi Enter | Đăng nhập admin được, không còn lỗi chặn phím |
| Chọn hoa, duc, minh, lan; nhập sai mật khẩu của lan rồi sửa | Đổi đúng vai trò; lỗi mật khẩu hiển thị rõ, lựa chọn lan được giữ |
| Lọc danh bạ cá nhân | Hiện đúng khách cá nhân; mở được hồ sơ với các thẻ nội dung |
| Tạo lịch Demo từ Công ty Sao Mai | Giữ khách và người phụ trách Lan, ưu tiên cao; lịch tuần hiển thị lúc 14:00 ngày 22/09/2026 |
| Ghi chú trong hộp thư | Nội dung xuất hiện trong lịch sử hồ sơ Nguyễn Văn Bình; không trở thành tin gửi khách |
| Nhận tin thử ngoài giờ khi nhân viên đang xử lý | Tin được lưu; bot không tự bật lại hoặc chen vào |
| Hồ sơ → cơ hội đào tạo → lập báo giá | Mẫu đào tạo, khách Nguyễn Văn Bình, liên kết cơ hội được giữ |
| Hoa lập báo giá AI 10, Đức duyệt | Chờ đúng cấp giám đốc; bản in hiển thị 125 triệu, người duyệt và thời hạn 12 tháng từ kích hoạt |
| Minh gửi báo giá đã duyệt | Bản gửi thử xuất hiện trong đúng hội thoại Zalo cá nhân của Nguyễn Văn Bình |
| Tìm kiếm bằng tài khoản Minh | Tìm được báo giá của khách được giao; tìm Sao Mai không trả về hồ sơ ngoài phạm vi |
| Bảng cơ hội bằng tài khoản Lan | Hiện một cơ hội thuộc khách Lan; đủ 7 bước, bảng cuộn ngang |
| Giao diện laptop và chiều rộng 390 px | Hộp thư ba cột trên laptop; trên màn hình nhỏ xếp dọc, ô soạn và nút gửi vẫn thao tác được |
| Nhật ký lỗi trình duyệt ở lượt cuối | Không ghi nhận lỗi JavaScript trong phiên kiểm tra |

Đã chạy đạt `node app/test.js` (12 nhóm) và `node app/test-features.js` (13 nhóm). Hai nhóm bổ sung kiểm tra loại/ưu tiên/chỉnh sửa công việc, lịch sử hồ sơ và chặn đọc/sửa ngoài phạm vi. Cũng đã kiểm tra cú pháp các tệp JavaScript được thay đổi.

Chưa chạy lại toàn bộ chương trình Edge `test-ui.cjs` của mốc 0.2; đã cập nhật thao tác bàn phím và lựa chọn cho giao diện mới. Kiểm tra giao diện lần này là các lượt trực tiếp nêu trên, không phải tuyên bố đã nghiệm thu mọi thao tác, mọi trình duyệt hoặc mọi kích thước màn hình. Kéo thả thẻ cơ hội chưa được kiểm tra riêng trong lượt này; có thể mở thẻ để đổi bước.

## Dữ liệu và phần kỹ thuật

Trước thay đổi đã sao lưu mã liên quan và tạo bản sao SQLite nhất quán tại `app/backups/before-prototype-adaptation-20260921`. Migration chỉ bổ sung trường loại việc, ưu tiên, ghi chú và thời điểm hoàn thành vào công việc. Lịch sử hồ sơ tổng hợp sự kiện hiện có, không nhân bản toàn bộ tin chat.

Đối chiếu chỉ đọc các cột đã có trước migration cho thấy toàn bộ bản ghi cũ được giữ nguyên: 3 khách, 2 cơ hội, 2 công việc, 2 báo giá, 11 tin nhắn. Kết quả lưu tại `app/test-output/prototype-data-preservation.json`. Kiểm tra API bổ sung lưu tại `app/test-output/api-results.json`.

Tệp chính: `app/workspace-ui.js`, `app/workspace.css`, `app/app.html`, `app/features-ui.js`, `app/features.js`, `app/server.js`. Phiên bản khai báo trong `app/package.json` là 0.3.0. Website tham chiếu không được sửa hoặc triển khai lại.

## Phần chưa triển khai

- Kết nối thật Zalo OA và Zalo cá nhân, đồng bộ/nhận tin nền, trạng thái gửi/đọc thật.
- AI tạo sinh, RAG/Copilot; bot hiện tra câu hỏi thường gặp bằng nội dung đã duyệt.
- Quản lý hợp đồng/thanh toán, ký số, đồng bộ lịch ngoài, trình thiết kế báo giá kéo thả.
- Hạ tầng nhiều người dùng qua Internet, PostgreSQL và kiến trúc nhiều công ty/API v1 theo CLAUDE.reference.md. Các sai khác đã ghi trong tài liệu tham chiếu vẫn còn hiệu lực.

Đây là mốc hiệu chỉnh để duyệt cách dùng và thử nghiệp vụ tại máy. Để ghi nhận phản hồi, ghi tên màn hình, tài khoản đang dùng, thao tác, kết quả mong muốn và kết quả thực tế. Với giao diện mới, nên bắt đầu bằng `hoa` rồi dùng nút Đổi tài khoản để thử quyền của từng vai trò.
