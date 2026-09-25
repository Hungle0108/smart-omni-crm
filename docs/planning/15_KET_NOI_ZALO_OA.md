# Kết nối Zalo OA trong Smart Omni CRM

Bản 0.4 · 22/09/2026. Đây là module kết nối trong CRM, không phải plugin cài vào Codex.

**Hiện trạng:** đã có màn hình quản trị, bộ nhận sự kiện và hàng đợi gửi văn bản. Chưa kết nối OA thật của iViTech; chưa gửi tin thật hoặc mở máy ra Internet. Chị có quyền quản trị OA, chưa tạo ứng dụng Zalo Developers.

## Việc chị thực hiện tiếp

1. Mở [Quản lý ứng dụng Zalo](https://developers.zalo.me/apps), đăng nhập và tạo ứng dụng tên gợi ý **Smart Omni CRM – iViTech**. Công ty tự kiểm tra và chấp nhận các điều khoản/quyền do Zalo yêu cầu.
2. Trong ứng dụng, thực hiện cấu hình/xét duyệt quyền quản lý thông tin OA, gửi tin tư vấn và nhận sự kiện theo hướng dẫn Zalo. Có tài khoản quản trị OA chưa đồng nghĩa ứng dụng đã được cấp mọi quyền API.
3. Dùng công cụ API Explorer của Zalo, chọn ứng dụng, loại **OA Access Token** và OA của iViTech; hoàn tất bước quản trị OA cấp quyền. Cần App ID, OA ID, App Secret, OA Secret Key dùng cho webhook, OA Access Token và OA Refresh Token. Không dùng token đăng nhập mạng xã hội thay token OA.
4. Trong CRM đăng nhập **admin → Kênh kết nối → Cấu hình Zalo OA**. Nhập các thông tin tại đây. Không gửi mật khẩu, token hoặc khóa bí mật vào cuộc trò chuyện. Ô đã lưu để trống sẽ giữ nguyên mã; mã đã lưu không hiện lại.
5. Chuẩn bị địa chỉ HTTPS nhận tin với người phụ trách kỹ thuật. Chỉ chuyển tiếp đường nhận sự kiện riêng, không công bố toàn bộ CRM. Chưa có địa chỉ này vẫn lưu thông tin trước được, nhưng chưa nghiệm thu nhận tin thật.
6. Đăng ký webhook trong Zalo: sự kiện người dùng gửi văn bản và OA gửi văn bản. Nếu muốn nhận mọi tin văn bản, kiểm tra bộ lọc cú pháp đang tắt.
7. **Lưu cấu hình → Kiểm tra kết nối → Bật nhận/gửi thật**. Kiểm tra kết nối chỉ đọc thông tin để đối chiếu OA ID; chưa chứng minh webhook hay quyền gửi đã hoạt động. Lưu thay đổi luôn tạm dừng để kiểm tra lại.

Bot FAQ cho OA thật mặc định tắt. Chỉ bật khi nội dung đã được giám đốc duyệt và công ty muốn cho phép tự trả lời. Sau khi nhân viên tiếp nhận, bot chỉ chạy lại khi chủ động bấm Chuyển lại cho bot.

## Cách nghiệm thu với tài khoản thử

1. Dùng một tài khoản thử gửi câu chào tới OA. Hộp thư CRM phải nhận đúng một tin và gắn nhãn **Zalo OA thật**.
2. Trưởng nhóm mở khách mới, giao cho sales. Nếu đã có hồ sơ khách, dùng **Liên kết khách** để giữ một hồ sơ nghiệp vụ; hệ thống không tự đoán khách bằng tên hoặc số điện thoại.
3. Sales trả lời một câu thử. Kiểm tra trên Zalo của tài khoản thử có đúng nội dung, đúng người nhận và chỉ một lần. Trạng thái **Zalo đã tiếp nhận** trong CRM chỉ nói API đã nhận yêu cầu, chưa xác nhận khách đã đọc.
4. Thử nhân viên tiếp nhận để bot dừng; ngoài giờ chỉ dùng FAQ được duyệt và thông báo liên hệ trong giờ làm việc, không hứa giờ gọi cụ thể.
5. Thử tạm dừng kết nối và cấp lại quyền khi hết hạn. Chỉ nghiệm thu sau khi các bước nhận/gửi hai chiều thực tế đạt.

Quyền gửi, điều kiện tương tác và hạn mức áp dụng theo OA/ứng dụng và chính sách Zalo tại lúc thử. Không mặc định việc đọc được thông tin OA là gửi được mọi khách.

## Phạm vi và giới hạn

- Hỗ trợ một OA, nhận/gửi văn bản, ghép khách theo mã người dùng trong OA, phân công theo quyền CRM, nhận sự kiện trả lời từ trang quản trị OA.
- Chưa hỗ trợ ảnh/tệp, tự gửi báo giá/PDF, nhập lịch sử tin trước khi kết nối, trạng thái đã giao/đã đọc, nhiều OA hoặc luồng cấp quyền OAuth một nút. Hiện nhập token OA từ API Explorer và tự làm mới bằng refresh token đã cấp.
- Zalo cá nhân vẫn mô phỏng. Kết nối OA không đăng nhập Zalo cá nhân.
- Hàng đợi lưu trạng thái chờ, đang gửi, Zalo tiếp nhận, thất bại, chưa rõ hoặc đã hủy. Khi kết quả chưa rõ, kiểm tra bên Zalo trước khi gửi lại; hệ thống không tự gửi lại mù để tránh trùng.
- Tạm dừng giữ lại tin đang chờ; bật lại có thể xử lý các tin chờ đó. Tin đã bắt đầu gửi không thể thu hồi bằng nút tạm dừng. Cần rà trạng thái hội thoại trước khi bật lại.
- Tin từ cùng mã người dùng tiếp tục về hồ sơ/nhân viên đã liên kết. Khách mới chưa được giao thuộc danh sách trưởng nhóm; sales chưa nhìn thấy cho tới khi được giao.
- Máy chạy CRM cần hoạt động và đường HTTPS cần truy cập được. Chưa triển khai dịch vụ chạy liên tục hoặc đảm bảo sẵn sàng khi laptop ngủ/tắt máy.

## Ghi chú cho người phụ trách kỹ thuật

Ứng dụng chính vẫn chỉ lắng nghe `127.0.0.1:3000`. Bộ nhận webhook mặc định `127.0.0.1:3001`, chỉ nhận POST `/zalo/oa/webhook`. Biến `CRM_ZALO_WEBHOOK_PORT` đổi cổng nếu cần. Địa chỉ công khai cần dạng `https://ten-mien/zalo/oa/webhook` và chuyển tới cổng webhook riêng; không chuyển cổng 3000 ra Internet. Chưa tạo tunnel, tên miền, chứng chỉ hay hạ tầng công khai trong lần này.

Xác minh `X-ZEvent-Signature` trên nguyên văn nội dung nhận, kiểm tra App ID/OA ID, chống nhận/gửi trùng theo mã sự kiện/yêu cầu. Không gọi API gửi trong xử lý webhook; hàng đợi SQLite gửi sau. API nhà cung cấp cố định; không cho nhập URL API tùy ý. Webhook chính thức yêu cầu phản hồi trong hai giây; handler không đợi mạng nhưng chưa kiểm thử tải để cam kết thời gian này.

Token và khóa lưu mã hóa trong SQLite; khóa giải mã cục bộ ở `app/crm.db.zalo-key` khi lần đầu lưu cấu hình. Tệp này không đưa vào Git. Mã hóa không thay thế bảo vệ tài khoản Windows/ổ đĩa: người có cả DB và khóa có thể giải mã. Sao lưu DB và khóa ở nơi kiểm soát truy cập; thiếu khóa sẽ không khôi phục được kết nối. Không đưa bản sao chứa khóa lên kho mã. Không có mã OA thật nào được nhập trong kiểm thử.

Đã kiểm thử ngoại tuyến bằng bộ giả lập nhà cung cấp; chưa chứng nhận khả năng chạy production hoặc tuân thủ đầy đủ kiến trúc đa doanh nghiệp trong tài liệu tham chiếu.

## Nguồn chính thức đã đối chiếu

- [Tổng quan webhook](https://developers.zalo.me/docs/official-account/webhook/tong-quan): HTTPS, thời gian phản hồi và cơ chế gửi lại.
- [Sự kiện người dùng gửi tin nhắn](https://developers.zalo.me/docs/official-account/webhook/tin-nhan/su-kien-nguoi-dung-gui-tin-nhan): dữ liệu tin đến.
- [Sự kiện OA gửi tin](https://stc-developers.zdn.vn/docs/v2/official-account/webhook/tin-nhan/su-kien-official-account-gui-tin-nhan-cho-nguoi-dung): chữ ký và dữ liệu phản hồi.
- [Xác thực và ủy quyền OA](https://stc-developers.zdn.vn/docs/v2/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new): cấp/làm mới token.
- [Thông tin OA](https://stc-developers.zdn.vn/docs/v2/official-account/quan-ly/quan-ly-thong-tin-oa/lay-thong-tin-zalo-official-account) và [gửi tin tư vấn](https://stc-developers.zdn.vn/docs/v2/official-account/tin-nhan/tin-tu-van/gui-tin-tu-van-trich-dan): kiểm tra OA và gửi văn bản.
