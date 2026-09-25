# Kênh kết nối: thêm cấu hình API và VNPT SIP

Cập nhật 23/09/2026. Người dùng xác nhận đang có **đường truyền SIP của VNPT**, chưa rõ tên tổng đài/phần mềm tiếp nhận SIP.

## Admin thực hiện

1. Đăng nhập admin → **Kênh kết nối → + Thêm kênh kết nối**.
2. Chọn VNPT SIP, Messenger, WhatsApp Business, Viber Bot, Twilio, tổng đài khác hoặc API tùy chỉnh. Lựa chọn Zalo OA mở màn hình OA hiện có, vẫn chỉ một OA ở bản thử này.
3. Đặt tên để phân biệt nhiều tài khoản, chọn nhóm phụ trách, nhập thông số của nhà cung cấp. Có thể lưu nháp khi chưa đủ thông tin.
4. **Lưu cấu hình**. Mã bí mật được mã hóa, không hiện lại trong trình duyệt. Khi sửa, để trống để giữ mã cũ; chọn ô “Xóa mã ... đã lưu” để xóa mã có chủ ý.
5. Với Messenger, WhatsApp, Viber và Twilio, nhập đủ thông tin rồi **Kiểm tra API**. Thao tác này chỉ đọc tài khoản từ nhà cung cấp, không gửi tin, gọi điện, đăng ký webhook, mua dịch vụ hoặc thay đổi tài khoản ngoài CRM.
6. Có thể sửa, tạm dừng cấu hình, lưu trữ có lý do và khôi phục. Khôi phục giữ cấu hình tạm dừng; cần tiếp tục và kiểm tra lại. Lịch sử ghi người thực hiện và thời điểm, không chứa mã API.

Tên kênh không được trùng, kể cả kênh đã lưu trữ. Page ID, Phone Number ID, Bot ID đã khai báo hoặc Twilio Account SID không được tạo lặp trong cùng loại bộ kết nối. Khi cần đổi nhà cung cấp, tạo một kênh khác.

## Hiểu đúng trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| Chưa đủ cấu hình | Bản nháp, còn trường cần bổ sung |
| Đã lưu · chưa kiểm tra | Thông tin đã lưu; chưa xác minh tài khoản ngoài CRM |
| Đã xác minh tài khoản API | Lần kiểm tra gần nhất đọc được đúng tài khoản; chưa chứng minh quyền gửi/nhận |
| Cần kiểm tra lại | API lỗi hoặc quyền chưa phù hợp; không giữ nhãn xác minh cũ |
| Tạm dừng cấu hình | Không chạy kiểm tra cho tới khi tiếp tục |
| Đã lưu trữ | Ẩn khỏi danh sách, có thể khôi phục |

**Các kênh mới chưa nhận/gửi tin, chưa gọi điện và chưa đồng bộ lịch sử vào CRM.** Phần mới là quản lý cấu hình và kiểm tra tài khoản API. Chưa có webhook đa kênh, bộ gửi/nhận, phân công hội thoại mới, ghi âm hoặc màn hình gọi. Không nhập mã rồi xem đó là hoàn thành tích hợp. Zalo OA tiếp tục dùng bộ gửi/nhận riêng đã có.

## Thông tin cần chuẩn bị theo nhà cung cấp

| Kênh | Thông tin chính | Kiểm tra hiện có |
|---|---|---|
| Messenger | Phiên bản Graph API của ứng dụng, Page ID, Page Access Token; App ID/Secret và mã webhook có thể lưu trước | Đọc `me`, so ID với Page ID đã nhập |
| WhatsApp Cloud API | Phiên bản Graph API, WABA ID, Phone Number ID, Access Token; App ID/Secret và mã webhook có thể lưu trước | Đọc danh sách số của WABA, đối chiếu Phone Number ID |
| Viber Bot | Auth Token, Bot ID nếu biết | Đọc thông tin bot; đối chiếu Bot ID nếu khai báo |
| Twilio | Account SID, Auth Token, số tổng đài nếu biết | Đọc tài khoản đang hoạt động; chưa xác minh sở hữu số gọi ra |
| VNPT SIP | Tên tổng đài, máy chủ/cổng SIP, giao thức, cách xác thực, đầu số và thông số do VNPT cấp | Mới lưu/kiểm tra cấu trúc thông tin; chưa đăng ký hoặc kiểm tra SIP ngoài mạng |
| Tổng đài khác / API tùy chỉnh | Nhà cung cấp, URL HTTPS, mã tài khoản, API Key/Secret, tài liệu | Mới lưu cấu hình; không tự thực thi URL nhập tùy ý |

Các trường phục vụ webhook mới chỉ được lưu để chuẩn bị; **chưa có URL webhook của CRM để đăng ký cho các kênh mới**. Không đăng ký đường localhost làm webhook công khai.

## Riêng đường VNPT SIP của iViTech

VNPT mô tả SIP Trunk là đường trung kế nối các đầu số với tổng đài IP PBX có hỗ trợ SIP. Vì vậy cần xác định tổng đài của công ty trước khi chọn cách nối CRM. [Thông tin dịch vụ VNPT](https://vnpt.vn/doanh-nghiep/san-pham-dich-vu/giai-phap-sip-trunking-co-dinh/).

Hiện **chưa biết tổng đài**, không tự chọn Twilio, Asterisk hay một thiết bị cụ thể. Chị có thể hỏi bên lắp đặt:

> Công ty đang dùng đường SIP VNPT. Nhờ anh/chị cho biết tên, model hoặc phần mềm tổng đài đang tiếp nhận đường SIP; tổng đài có hỗ trợ kết nối CRM để gọi và lấy lịch sử cuộc gọi không; nếu có, xin tài liệu API/WebRTC và thông số đường SIP. Mật khẩu/mã bí mật sẽ nhập trực tiếp vào cấu hình CRM.

Sau khi có thông tin: xác định API/đầu nối tổng đài → xây phần nhận sự kiện cuộc gọi và gắn khách → thử cuộc gọi trên đầu số thử đã chỉ định → kiểm tra quyền nhân viên, trạng thái/rớt cuộc gọi và lịch sử. Chưa thực hiện cuộc gọi thật trong đợt cập nhật này.

## Vận hành và kiểm tra

Admin quản lý toàn bộ; nhân viên/trưởng nhóm chỉ thấy tên/trạng thái kênh thuộc nhóm, không đọc thông số hoặc mã bí mật. Giám đốc thấy trạng thái các nhóm. Có chống ghi đè cấu hình đang được sửa/kiểm tra.

Mã hóa cấu hình bằng AES-256-GCM trong SQLite. Khóa nằm ở `app/crm.db.channels-key`; khi chuyển máy hoặc sao lưu cần giữ kèm khóa với cơ sở dữ liệu, bảo vệ như dữ liệu đăng nhập. Khóa và cơ sở dữ liệu không được đưa vào Git. Không công bố máy localhost ra Internet trong cập nhật này.

`npm run test:channels --prefix app`: kiểm tra CRUD/phân quyền/nhóm, mã hóa, giữ/xóa token, SIP, tạm dừng/lưu trữ/khôi phục, lỗi/concurrency và bộ kiểm tra tài khoản qua phản hồi giả lập. Không dùng token thật; chưa nghiệm thu API với tài khoản iViTech. Kết quả: `app/test-output/channel-connections-results.json`.

Tài liệu chính thức đối chiếu: [WhatsApp Cloud API của Meta](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api), [Viber REST API](https://developers.viber.com/docs/api/rest-bot-api/), [Twilio Account API](https://www.twilio.com/docs/iam/api/account), [Messenger Platform](https://developers.facebook.com/docs/messenger-platform/). Phiên bản Meta do admin nhập theo ứng dụng đang dùng; ví dụ trên form không phải cam kết phiên bản mới nhất.
