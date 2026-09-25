# Kiểm chứng sơ bộ tích hợp Zalo

Ngày nghiên cứu: 19/09/2026. Chỉ đọc tài liệu công khai; chưa đăng nhập, cài thư viện, liên hệ nhà cung cấp, trả phí hoặc thử nhận/gửi. Không có mã ứng dụng.

## Kết quả

| Phương án | Bằng chứng đã đọc | Kết luận cho dự án |
|---|---|---|
| Zalo OA OpenAPI | Trang chính thức mô tả tích hợp hệ thống doanh nghiệp, nhắn tin và webhook | Có hướng tích hợp chính thức; quyền và khả năng trên OA iViTech vẫn chưa kiểm tra |
| Zalo cá nhân qua zca-js | Tác giả công bố nhận/gửi, đăng nhập QR và mô phỏng Zalo Web; gọi rõ là API không chính thức | Có ứng viên kỹ thuật, chưa đạt điều kiện chọn cho tài khoản công ty hoặc cam kết tiến độ |
| Dịch vụ trung gian | Kết quả tìm kiếm trang akaBiz Chat quảng bá API public; mở trang trực tiếp bị timeout | Chỉ là đầu mối nghiên cứu, chưa chứng minh API nhận/gửi cá nhân đáp ứng Smart Omni CRM, chưa xác nhận phí hoặc cơ chế kết nối |

Trong các nguồn chính thức đã tra cứu, chưa xác minh được API công khai của Zalo cho hộp thư cá nhân tương đương OA. Đây là giới hạn bằng chứng, không phải kết luận không tồn tại hoặc không thể tích hợp.

## Điểm cần biết về ứng viên zca-js

README của tác giả nêu nguy cơ tài khoản bị khóa và chỉ một bộ lắng nghe web hoạt động mỗi tài khoản; mở Zalo trên trình duyệt có thể làm bộ lắng nghe dừng. Đây là tuyên bố từ tác giả, chưa được dự án thử nghiệm. Nhận/gửi qua thư viện không tự chứng minh độ ổn định, khả năng phục hồi hoặc phù hợp vận hành cho iViTech. Chưa cài hoặc chọn thư viện này.

## Đề xuất bước tiếp theo

Giữ yêu cầu OA và 1 tài khoản cá nhân, không tự hạ phạm vi. Đánh giá dịch vụ trung gian có API và hỗ trợ vận hành trước khi chọn cách tự tích hợp không chính thức. Việc có nhà cung cấp không chứng minh cơ chế đó được Zalo hỗ trợ; vẫn cần bằng chứng riêng. Song song tiếp tục thiết kế màn hình và dữ liệu mẫu, vì các phần đó chưa cần kết nối tài khoản thật.

## Hồ sơ cần thu thập để chọn phương án

1. Tài liệu API nhận tin mới và gửi tin từ CRM của iViTech, không chỉ có hộp thư riêng của nhà cung cấp.
2. Cơ chế xác thực, căn cứ quyền kết nối, cách thu hồi phiên và giới hạn sử dụng; phân biệt chính thức với không chính thức.
3. Demo 1 tài khoản cá nhân: nhận/gửi, mất kết nối, đăng nhập lại; tác động khi nhân viên dùng điện thoại hoặc Zalo Web.
4. Khả năng gửi tệp/báo giá, trạng thái lỗi, chống gửi trùng, bot và bàn giao cho người; không suy ra từ khả năng gửi văn bản.
5. Dữ liệu đi qua đâu, ai truy cập, cách xóa/xuất dữ liệu và hỗ trợ khi tài khoản mất kết nối.
6. Báo giá cho 1 tài khoản cá nhân và 3 người dùng nghiệp vụ, phí API/tin nhắn/hỗ trợ nếu có. Chưa có mức giá được xác minh.

Chỉ sau khi có bằng chứng và kiểm tra thực tế mới ghi đạt Z01–Z04. Không dùng tài khoản đang chứa khách thật để thử tùy tiện. Trước khi kết nối, chuẩn bị tài khoản/người nhận thử được phép. Hiện chưa gửi câu hỏi ra bên ngoài hoặc đăng ký dịch vụ.

## Nguồn

- [Zalo OA: tính năng mở rộng](https://oa.zalo.me/home/function/extension) — nguồn chính thức cho OA.
- [Zalo Developers](https://developers.zalo.me/) — danh mục nền tảng; trang /docs không trả nội dung đọc được trong lần mở, nên không coi đã đọc toàn bộ tài liệu API.
- [zca-js: README của tác giả](https://github.com/RFS-ADRENO/zca-js) — nguồn sơ cấp về thư viện; không phải tài liệu chính thức của Zalo.
- [akaBiz Chat](https://akachat.akabiz.net/) — đầu mối nhà cung cấp từ kết quả tìm kiếm; chưa đọc được toàn trang, chưa xác minh độc lập các tuyên bố.
