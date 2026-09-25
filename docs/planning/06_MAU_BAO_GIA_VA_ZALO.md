# Báo giá theo mẫu và phạm vi Zalo

Cập nhật theo câu trả lời và phần sửa mới nhất của Giám đốc sản phẩm ngày 18/09/2026. Đây là đặc tả chuẩn bị triển khai; chưa tạo mẫu thật, viết mã hay kết nối tài khoản.

## Các yêu cầu đã xác nhận

1. CRM cho phép tạo mẫu báo giá theo từng loại sản phẩm và định dạng nhận diện công ty.
2. Cho phép **tạo, duyệt và gửi báo giá ngay trong CRM**. Phần sửa này bổ sung quy trình đầy đủ, không hủy yêu cầu mẫu theo sản phẩm/nhận diện.
3. Đã chốt ngày 19/09/2026: trưởng nhóm duyệt thông thường; giám đốc duyệt khi vượt mức tiền hoặc chiết khấu quy định. Ngưỡng tiền/chiết khấu do công ty tự cấu hình sau; thứ tự duyệt khi vượt ngưỡng còn mở.
4. iViTech yêu cầu nhận/gửi cả Zalo OA và Zalo cá nhân ngay trong CRM trong bản thử đầu (xác nhận 19/09/2026).

Mốc Q về báo giá là bắt buộc trước pilot M6. Không còn áp dụng đề xuất hoãn toàn bộ sản phẩm/báo giá sang sau MVP. Các đoạn trong tài liệu nguồn xếp báo giá ở P1 được giữ nguyên để truy xuất, nhưng kế hoạch triển khai theo quyết định mới của người dùng.

## Trải nghiệm báo giá đề xuất

Người quản lý mẫu thiết lập nhận diện iViTech và mẫu theo loại sản phẩm. Sales chọn loại sản phẩm/mẫu, khách doanh nghiệp hoặc cá nhân, điền thông tin và tạo báo giá. Người có quyền duyệt xem đúng bản, duyệt hoặc yêu cầu sửa/từ chối. Sau khi được duyệt, nhân viên gửi khách từ CRM và theo dõi kết quả gửi trong cùng hồ sơ.

Mẫu là cấu trúc tái sử dụng có trường điền dữ liệu, không chỉ là file PDF đính kèm. MVP đề xuất trình cấu hình có các vùng định sẵn; chưa cần công cụ thiết kế tự do tương đương Canva/Word.

| Thành phần | Cách đáp ứng đề xuất | Đầu vào doanh nghiệp cần cung cấp |
|---|---|---|
| Nhận diện công ty | Logo, tên công ty, thông tin liên hệ, màu/chữ và đầu/cuối trang dùng chung | Bộ nhận diện hoặc một báo giá hiện tại làm mẫu; không tự sáng tác thông tin công ty |
| Loại sản phẩm | Mỗi loại có một hoặc nhiều mẫu, có thể đặt mẫu mặc định | Danh sách loại sản phẩm và 1–2 loại ưu tiên trước |
| Nội dung theo mẫu | Tên mẫu, phần giới thiệu, bảng hạng mục, điều khoản và thời hạn hiệu lực | Trường bắt buộc, nội dung được phép sửa và điều khoản chuẩn |
| Dữ liệu báo giá | Khách B2B/B2C, người nhận, cơ hội nếu có, hạng mục/đơn giá/số lượng, thuế/chiết khấu, tổng tiền | Công thức, tiền tệ, cách làm tròn và đánh số được xác nhận |
| Duyệt | Gửi yêu cầu, người duyệt xem PDF/nội dung/giá, yêu cầu sửa/từ chối/duyệt; audit | Đã chốt trưởng nhóm/giám đốc theo ngưỡng; công ty tự nhập mức tiền/chiết khấu sau; cơ sở tính cần xác nhận trước áp dụng |
| Gửi | Chọn đúng người nhận, xem nội dung gửi, gửi bản được duyệt từ CRM | Chính sách gửi và kênh tài khoản đã được xác minh |
| Lịch sử | Giữ mẫu/nhận diện/giá tại lúc tạo, phiên bản đã duyệt và đã gửi | Quy tắc sửa và thời gian lưu |

Đề xuất luồng:

**Chọn mẫu → điền báo giá → xem trước → gửi duyệt → duyệt → chọn người nhận → gửi từ CRM → theo dõi trạng thái.**

Nếu bị yêu cầu sửa/từ chối, trả về bước chỉnh sửa theo quy tắc đã chốt. Nếu nội dung thương mại đổi sau duyệt, phải duyệt lại bản mới. Không cho phép nút gửi vượt trạng thái duyệt bằng gọi API trực tiếp. Không tự trao quyền duyệt cho quản lý chỉ vì quản lý đã có quyền xem khách cả nhóm.

## Các quy tắc cần thể hiện ngay trong thiết kế

- Mẫu và báo giá cụ thể có phiên bản riêng. Sửa mẫu/logo/giá danh mục không làm thay đổi báo giá đã duyệt hoặc đã gửi.
- Khách cá nhân không bị bắt buộc chọn Organization. Một người mua cá nhân và đại diện công ty có giao dịch được phân biệt rõ.
- Gửi đúng phiên bản được duyệt; đính kèm/tệp hoặc đường dẫn tải phải tương ứng với bản đó. Phương án đường dẫn phải có cơ chế truy cập phù hợp cho người nhận, không làm lộ tệp khác.
- Tách trạng thái duyệt khỏi trạng thái giao tin. Được duyệt chưa có nghĩa đã gửi; đã gửi không có nghĩa khách đã đọc hoặc đã chấp nhận báo giá.
- Gửi thất bại/timeout không báo thành công giả. Thử lại cùng yêu cầu không gửi trùng; lưu liên kết báo giá–tin nhắn–người gửi–lần duyệt.
- Quyền xem khách đã chốt phải áp dụng cả báo giá/PDF, tìm kiếm và AI. Nội dung mẫu chung không được chứa sẵn dữ liệu riêng của khách trước.
- AI có thể hỗ trợ soạn nội dung nếu sau này được giao, nhưng không tự chọn giá, duyệt hay phát hành báo giá.
- Khi một báo giá có nhiều loại sản phẩm, cần quy tắc chọn mẫu: đề xuất người lập chọn một mẫu phù hợp cho toàn báo giá, thay vì tự ghép các mẫu gây sai bố cục. Đây là đề xuất còn cần xác nhận nghiệp vụ.

## Đầu việc kỹ thuật bổ sung cho mốc Q

Nguồn DB §36–46/API §44–49 đã có sản phẩm và từng báo giá; UI §35–37 có builder/preview. Chưa có đặc tả đầy đủ cho thư viện mẫu theo loại sản phẩm và nhận diện công ty.

Codex/người kỹ thuật cần thiết kế quan hệ mẫu–loại sản phẩm, phiên bản mẫu, cấu hình nhận diện, snapshot báo giá, dữ liệu tính tiền, phê duyệt theo chính sách và liên kết lần gửi. Tên bảng/API cuối do kỹ thuật chọn, không yêu cầu Giám đốc sản phẩm quyết định. Nguồn DB §99–100/API §102 có thể làm cơ sở duyệt, nhưng không cần triển khai workflow tổng quát cho tất cả nghiệp vụ.

Phụ thuộc: M2 có khách và phân quyền; M3 có Zalo thật để tích hợp gửi. Mốc Q phải hoàn tất trước M6. Các ca Q01–Q05 trong tài liệu nghiệm thu kiểm tra mẫu, tính tiền, quyền duyệt, gửi thật, sửa sau duyệt và giữ phiên bản.

## Zalo OA và tài khoản cá nhân

**Đã xác minh ở mức nền tảng:** Zalo công bố OA OpenAPI để kết nối OA doanh nghiệp với hệ thống như CRM; có nhóm quyền nhắn tin và webhook. [Nguồn chính thức Zalo OA, đọc ngày 18/09/2026](https://oa.zalo.me/home/function/extension).

**Zalo OA trong MVP:** tích hợp OA song song với yêu cầu Zalo cá nhân; chỉ OA chưa đủ nghiệm thu. Xác minh OA cụ thể, người quản trị, quyền API, chính sách gửi tin/file, xác thực webhook và cơ chế gia hạn token. Nhận/gửi thử bằng tài khoản khách được cho phép; kiểm tra khả năng gửi báo giá qua file hoặc đường dẫn phù hợp. Chưa cam kết tài khoản iViTech hiện đã có đủ các quyền đó.

**Zalo cá nhân — bắt buộc theo quyết định 19/09/2026:** nhận và gửi tin nhắn ngay trong CRM. Cơ chế kết nối còn cần kiểm chứng; không suy ra từ khả năng của OA. Ghi Timeline thủ công, mở ứng dụng Zalo bên ngoài hoặc dùng tin mô phỏng không đáp ứng nghiệm thu. Yêu cầu này chưa xác định phải nhập toàn bộ lịch sử cũ, hỗ trợ nhóm chat hay tự động hóa bot trên tài khoản cá nhân.

## Những chi tiết còn cần người sản phẩm quyết định

Đã chốt cần mẫu, tạo, duyệt và gửi; không hỏi lại các câu này. Tiếp theo cần:

1. Không cần chốt con số ngưỡng hiện tại: công ty sẽ tự điền sau. Cơ sở tính và thứ tự duyệt cần hoàn thiện khi thiết lập chính sách thực tế.
2. Những loại sản phẩm và mẫu nhận diện nào dùng làm chuẩn đầu tiên?
3. Đã chốt cả OA và 1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên trong pilot. Phạm vi nhập lịch sử cũ cần xác định khi chuẩn bị kết nối.

Các câu trả lời này có thể chốt lần lượt. Chưa cần cung cấp mật khẩu, token hoặc học cách cấu hình API.


## Cấu hình ngưỡng duyệt — cập nhật 19/09/2026

**Đã chốt:** công ty chưa có ngưỡng cố định; CRM phải có mục để công ty tự nhập và thay đổi ngưỡng giá trị báo giá hoặc mức chiết khấu sau. Không viết cứng con số trong ứng dụng và không yêu cầu người sản phẩm cung cấp ngay.

**Thiết kế đề xuất, chưa phải chính sách được duyệt:** cho phép cấu hình từng điều kiện tiền/chiết khấu, cơ sở tính và người được sửa cấu hình; ghi lịch sử thay đổi, lưu chính sách áp dụng cho từng lần gửi duyệt. Phân biệt chưa cấu hình với ngưỡng bằng 0 hoặc chủ động tắt một điều kiện. Khi chưa thiết lập chính sách, vẫn cho tạo nháp; đề xuất chưa cho duyệt/gửi thực tế đến khi công ty kích hoạt chính sách để tránh tự suy diễn quyền. Hành vi này cần được xác nhận trước triển khai luồng duyệt. Không tự mặc định mọi báo giá được trưởng nhóm duyệt hoặc mọi báo giá phải trình giám đốc.


### Tài khoản cá nhân dùng thử — đã chốt 19/09/2026

Kết nối **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**, cùng với OA, nhận/gửi ngay trong CRM. Không phải tài khoản riêng của nhân viên. Khả năng kỹ thuật chưa được xác minh; nhập lịch sử cũ, nhóm chat và gửi tệp qua tài khoản cá nhân chưa được mặc định hỗ trợ.


### Hai báo giá thực tế đã tiếp nhận — 19/09/2026

Đã đọc báo giá Smart iVier V2 và đào tạo AI/ChatGPT Plus. Chi tiết tại [Phân tích mẫu báo giá](09_PHAN_TICH_MAU_BAO_GIA.md). Mốc Q cần thể hiện hai loại mẫu, phương án lựa chọn, giá năm đầu/gia hạn và cấu phần gói không cộng trùng. Giá/điều khoản là dữ liệu nguồn chưa được duyệt làm chính sách chung. BG01/BG02 đã chốt: Gói 3/4 cần khách đã đăng ký Gói 1; đào tạo 12 tháng từ ngày kích hoạt. Không triển khai chức năng điều hành số, Mini App hoặc tính cước chỉ vì xuất hiện trong danh mục dịch vụ đang chào.


### Quyết định điều kiện gói và thời hạn đào tạo

Đã chốt BG01/BG02: Gói 3/4 chỉ bán kèm khi khách đã đăng ký Gói 1; thời hạn đào tạo 12 tháng từ ngày kích hoạt. Mẫu CRM phải dùng quy tắc mới; báo giá Word tham khảo chưa được sửa. Khách đã có Gói 1 không bị cộng lại giá Gói 1 khi chào bổ sung.
