# Phân tích hai báo giá và thiết kế danh mục dịch vụ

Ngày 19/09/2026. Đã đọc toàn bộ phần văn bản, bảng, header/footer trong hai tệp Word. Không có ảnh nhúng. Chưa kiểm tra bản render từng trang nên chưa kết luận về bố cục hiển thị, màu, font hoặc chất lượng in. Giữ nguyên tệp nguồn; bản sao và bản trích xuất nằm trong docs/quotation-references. Chưa viết mã ứng dụng hoặc tạo mẫu báo giá chạy được.

## Kết luận cho Smart Omni CRM

Hai tài liệu là ví dụ báo giá thực tế, không phải chỉ dẫn triển khai các chức năng Smart iVier vào Smart Omni CRM. Đề xuất dùng làm căn cứ cho hai loại mẫu: báo giá giải pháp phần mềm theo gói và báo giá đào tạo/chuyển giao theo quy mô. Giá, hạn mức và cam kết trong nguồn chưa được xác nhận là bảng giá/chính sách dùng chung hiện hành.

Cả hai mẫu chào cho UBND phường Tân Thuận. Mô hình khách tổ chức cần chứa được cơ quan hành chính, không chỉ công ty thương mại; đề xuất thêm loại tổ chức, không bắt cơ quan phải có dữ liệu đăng ký doanh nghiệp không phù hợp.

## Danh mục rút ra từ nguồn

Giá dưới đây tính bằng triệu VNĐ, chưa gồm thuế theo nội dung nguồn; không tự gán thuế suất.

| Nhóm | Gói trong tài liệu | Năm đầu | Gia hạn từ năm 2 | Ghi chú |
|---|---|---:|---:|---|
| Smart iVier | Gói 1 Nền tảng điều hành số | 499 | 349 | 10 tài khoản quản trị; nguồn B |
| Smart iVier | Gói 2 Mở rộng người dùng nghiệp vụ | 379 | 329 | Thêm 100 người dùng; cần Gói 1; nguồn C |
| Smart iVier | Gói 3 Chatbot AI và tương tác số | 499 | 429 | 4 kênh theo mô tả nguồn; nguồn D |
| Smart iVier | Gói 4 Zalo Mini App phản ánh hiện trường và kinh tế số | 479 | 229 | Nguồn E |
| Smart iVier | Trọn bộ Gói 1–4 | 1.629 | 1.149 | Giá phương án trọn bộ, không cộng thêm vào các gói thành phần |
| Đào tạo AI | AI 05 | 90 | Chưa nêu riêng | 5 tài khoản ChatGPT Plus, 5 chuyên đề, 12 tháng |
| Đào tạo AI | AI 10 | 125 | Chưa nêu riêng | 10 tài khoản, 5 chuyên đề, 12 tháng |
| Đào tạo AI | AI 20 | 219 | Chưa nêu riêng | 20 tài khoản, 5 chuyên đề, 12 tháng |

Báo giá đào tạo mục 2 liệt kê: tổng quan AI, ChatGPT/prompt, văn phòng–hành chính, truyền thông/phục vụ người dân và an toàn thông tin. Không suy ra số học viên bằng số tài khoản. Không suy ra giá gia hạn bằng giá năm đầu.

### Các lựa chọn bổ sung Smart iVier

| Mã nguồn | Nội dung | Giá VNĐ | Phạm vi ghi trong nguồn |
|---|---|---:|---|
| A1 | 100 GB và 5.000 tài liệu lập chỉ mục | 7.000.000 | Gói 1/2/3/4 |
| A2 | 200 triệu token AI | 39.000.000 | Gói 1/2 |
| A3 | 50.000 lượt hội thoại | 46.000.000 | Gói 3 |
| A4 | 10 người dùng và 60 triệu token | 17.000.000 | Gói 1/2 |
| A5 | 10.000 lượt phản ánh và 10.000 tin ZNS | 12.000.000 | Gói 4 |
| A6 | 500 GB, 500 triệu token, 50.000 lượt hội thoại | 159.000.000 | Gói 1/2/3 |
| R1 | 1.000 token | 200 | Gói 1/2/4 |
| R2 | 1 GB/12 tháng | 65.000 | Tất cả |
| R3 | 1 lượt hội thoại | 900 | Gói 3 |
| R4 | 1 tin ZNS | 1.100 | Gói 4 |

Đây là dữ liệu phục vụ mô tả/chào giá. Không tự mở rộng MVP thành hệ thống đo token, tính cước thực tế, xuất hóa đơn, quản lý thuê bao hay thanh toán.

## Kiểm tra số học

Cộng lại các bảng chi tiết năm đầu: Gói 1 = 499 triệu; Gói 2 = 379 triệu; Gói 3 = 499 triệu; Gói 4 = 479 triệu, khớp tổng nguồn. Tổng mua rời 1.856 triệu năm đầu, 1.336 triệu gia hạn. Chênh lệch trọn bộ 227 triệu và 187 triệu khớp. Phương án 1+2 là 878/678 triệu, 1+3 là 998/778 triệu, khớp. A1×5 + A2×2,5 + A3 = 178,5 triệu; chênh A6 19,5 triệu, khoảng 10,92%. Đây chỉ là đối chiếu số học, không xác nhận điều kiện bán hoặc tương đương đầy đủ tài nguyên.

## Mâu thuẫn và thông tin cần hoàn thiện

| Mã | Nguồn đối chiếu | Phát hiện | Cách xử lý trong thiết kế |
|---|---|---|---|
| BG01 | Smart iVier A, B đoạn 58, G.3 đoạn 519 của bản trích | Mâu thuẫn trong nguồn; đã được người dùng giải quyết | Gói 3 và 4 chỉ bán kèm khi khách đã đăng ký Gói 1; bỏ mô tả bán độc lập khi chuẩn bị bản phát hành mới |
| BG02 | Đào tạo phần đầu đoạn 9 và mục 5 đoạn 76 | Mốc thời hạn không thống nhất trong nguồn; đã được người dùng giải quyết | Đào tạo tính 12 tháng từ ngày kích hoạt, không dùng ngày nghiệm thu hoặc bàn giao thay thế |
| BG03 | Smart iVier F.1/A6 | So sánh dùng 2,5 gói A2; A1×5 kèm 25.000 tài liệu nhưng mô tả A6 không nêu phần tài liệu tương ứng | Chưa suy ra gói lẻ bán được số lượng phân số hoặc A6 hoàn toàn tương đương |
| BG04 | Smart iVier F.1/F.2/F.3 | Có quyết toán tiêu thụ theo quý, bổ sung hết hạn cùng chu kỳ, đơn giá GB/12 tháng và yêu cầu đồng ý khi vượt hạn mức | Cần xác định cách chào bổ sung giữa kỳ; chưa tự tính theo tỷ lệ ngày/tháng hoặc tự tạo phí |
| BG05 | Smart iVier G.1 đoạn 484 | Mua thêm năm sau hưởng ưu đãi trọn bộ trên chênh lệch nhưng chưa có công thức | MVP cho nhập giá phương án có kiểm soát duyệt; chưa tự áp công thức nâng cấp |
| BG06 | Cả hai, ngày phát hành/hiệu lực | Ngày 15/08/2026, hiệu lực 30 ngày; đến ngày rà soát đã qua thời hạn ghi trong mẫu | Dùng để tham khảo, không phát hành lại nguyên ngày/giá cho khách mới |
| BG07 | Thuế cả hai mẫu | Chưa gồm VAT; không có thuế suất cụ thể cho từng hạng mục | Cần trường thuế theo hạng mục và trạng thái chưa xác định; không mặc định 0% |
| BG08 | Đào tạo mục 1–5 | Chưa rõ số buổi/giờ, số học viên, hình thức/địa bàn chuẩn và đầu ra nghiệm thu | Đưa thành trường/phụ lục chương trình trước khi phát hành báo giá thật |
| BG09 | Smart iVier G.3/G.4 và đào tạo mục 5 | Smart iVier có cam kết hạ tầng Việt Nam/không chia sẻ bên thứ ba, còn đào tạo có dịch vụ bên thứ ba | Không sao chép điều khoản bảo mật/nhà cung cấp giữa hai mẫu hoặc coi là chính sách CRM |
| BG10 | Hai phần nhận diện | Có tên công ty và header chữ; không có ảnh logo nhúng | Không tự sáng tác logo, địa chỉ, MST, tài khoản ngân hàng; bổ sung tài sản nhận diện khi cần |

Nguồn chứa tên ZNS và ChatGPT Plus như các hạng mục đang chào. Báo cáo này chưa xác minh giá, quyền cung cấp hoặc chính sách hiện hành của các nền tảng; không đưa các tuyên bố đó vào bot như kiến thức đã được giám đốc duyệt.

## Thiết kế mẫu báo giá đề xuất

### Mẫu giải pháp phần mềm theo gói

Nhận diện công ty → khách tổ chức/cá nhân → ngày và hiệu lực → tổng quan phương án → gói được chào → phạm vi/hạn mức → giá năm đầu và gia hạn tách riêng → gói bổ sung nếu chọn → điều kiện thương mại → phần đại diện. Phân biệt bảng so sánh tất cả gói với phương án thực sự chào để không cộng gộp sai. Các dòng chi tiết cấu thành gói không được cộng thêm một lần nữa vào tổng gói.

### Mẫu đào tạo và chuyển giao

Nhận diện → khách nhận → phạm vi đào tạo → chuyên đề → so sánh AI 05/10/20 → phương án lựa chọn → nội dung bàn giao/hỗ trợ → điều kiện kích hoạt, chi phí ngoài phạm vi và điều khoản bên thứ ba. Bảng so sánh 3 phương án không phải đơn hàng mua cả 3. Không nhân giá gói với số tài khoản khi giá đã là giá trọn gói.

### Trường dữ liệu tối thiểu cho mốc Q

Tên và phiên bản mẫu; khách/đầu mối nhận; ngày phát hành/hiệu lực; loại dịch vụ; tên gói và phương án; số lượng/đơn vị; giá năm đầu và gia hạn (có thể chưa có); thời hạn/mốc bắt đầu; phạm vi và hạn mức; điều kiện gói; thuế/chiết khấu; điều khoản và phần loại trừ. Các trường chỉ dành cho giải pháp hoặc đào tạo được hiển thị theo mẫu. Lưu bản chụp giá, nội dung, nhận diện và lần duyệt để đổi danh mục sau này không làm thay đổi báo giá đã gửi.

Giá trọn bộ là cơ chế giá gói trong nguồn, không tự coi là tỷ lệ chiết khấu của sales để so với ngưỡng giám đốc. Cơ sở xét ngưỡng tiền (năm đầu hay tổng cam kết) và phân biệt ưu đãi gói/giảm giá thêm cần làm rõ trước chạy luồng duyệt thật.

## Bổ sung nghiệm thu Q01–Q02

Chưa chạy. Dùng tên khách giả trong dữ liệu mẫu, không lấy tên Tân Thuận làm hồ sơ giả hoặc người nhận thử. Kiểm tra hai mẫu; đổi gói giữ đúng nội dung; bảng so sánh không cộng tất cả phương án vào tổng; không cộng hai lần giá gói và cấu phần; giá năm đầu/gia hạn tách riêng; giá gia hạn đào tạo chưa có thì không tự điền; chỉ chọn Gói 2 thì báo thiếu Gói 1 theo nguồn. BG01/BG02 đã chốt: khách chưa đăng ký Gói 1 không đủ điều kiện mua Gói 3/4; đào tạo tính 12 tháng từ ngày kích hoạt. Kiểm tra Gói 1 đã đăng ký từ trước, không bắt mua lại Gói 1 trong mọi báo giá bổ sung. Đổi mẫu hoặc giá danh mục không sửa phiên bản đã duyệt/gửi.

## Quyết định bổ sung của người sản phẩm

**Đã chốt:** Gói 3 và Gói 4 chỉ bán kèm khi khách hàng đã đăng ký Gói 1. Không bán độc lập. Dịch vụ đào tạo có thời hạn 12 tháng từ ngày kích hoạt. Đây là xác nhận trực tiếp trong cuộc trò chuyện, ưu tiên hơn các đoạn mâu thuẫn trong nguồn.

Tệp Word gốc vẫn giữ nguyên. Khi tạo bản phát hành mới, sửa cột điều kiện Gói 3/4 trong bảng tổng quan và mục G.3; với báo giá đào tạo sửa phần đầu và mục 5 thống nhất “12 tháng từ ngày kích hoạt”. Không tự thay các điều khoản khác.

**Chi tiết chưa suy diễn:** khách đăng ký Gói 1 và Gói 3/4 trong cùng giao dịch xử lý theo trình tự nào; Gói 1 hết hạn có còn đủ điều kiện mua thêm không; gia hạn Gói 3/4 có bắt buộc đồng thời gia hạn Gói 1 không. Cần hoàn thiện các trường hợp này trước tự động hóa điều kiện bán thực tế. Với khách đã có Gói 1, báo giá bổ sung không bắt buộc cộng tiền mua Gói 1 lần nữa.

**Thời hạn đào tạo:** ghi rõ mốc kích hoạt. Nếu chưa có ngày kích hoạt, trình bày thời hạn tương đối “12 tháng từ ngày kích hoạt”, không tự lấy ngày lập báo giá, ngày ký, bàn giao hoặc nghiệm thu làm ngày bắt đầu. Việc lưu mốc này không mở rộng MVP thành hệ thống cấp tài khoản hoặc quản lý thuê bao.

Giá và điều khoản khác trong mẫu vẫn chưa phải bảng giá chuẩn đã được duyệt.
