# Những quyết định kinh doanh cần chốt

Cập nhật: 18/09/2026. Bạn không cần quyết định framework, database index, phương thức API hay thuật toán hàng đợi. Những phần đó do Codex/người phụ trách kỹ thuật đề xuất và kiểm tra.

D01–D03, loại tài khoản Zalo D03a, phạm vi xem khách hàng D04 và D06 đã có câu trả lời trực tiếp. D06 gồm mẫu theo loại sản phẩm/nhận diện công ty và tạo, duyệt, gửi báo giá ngay trong CRM theo phần sửa mới nhất. Các lựa chọn ghi “đề xuất” chưa phải quyết định. Đã chốt cấp duyệt: trưởng nhóm duyệt thông thường; giám đốc duyệt khi vượt mức tiền hoặc chiết khấu quy định. Ngưỡng tiền/chiết khấu do công ty tự cấu hình sau; không cần chốt con số ở bước chuẩn bị. Nhận/gửi Zalo cá nhân trong CRM đã bắt buộc; cơ chế kết nối chưa xác minh.

## Các quyết định ảnh hưởng đến thiết kế ban đầu

### D01 Người sử dụng đầu tiên

**Đã chốt:** đội ngũ nội bộ iViTech trước. Nguồn xác nhận: câu trả lời của Giám đốc sản phẩm trong cuộc trò chuyện ngày 18/09/2026.

**Hệ quả:** một doanh nghiệp vận hành trong MVP; không xây đăng ký khách hàng SaaS, gói thuê bao hay thu phí nền tảng. Vẫn giữ mã doanh nghiệp và kiểm tra tách dữ liệu theo DB §7,167 để mở rộng và kiểm thử cách ly. Chưa suy ra số lượng nhân viên, số phòng ban hoặc quyền của từng người.

### D02 Khách hàng doanh nghiệp hay cá nhân

**Đã chốt:** cả doanh nghiệp và khách hàng cá nhân. Nguồn: trả lời trực tiếp ngày 18/09/2026.

**Hệ quả bắt buộc:** cá nhân phải có Customer 360 và cơ hội bán hàng mà không cần thuộc công ty. Người liên hệ của doanh nghiệp và khách mua cá nhân có thể là cùng một người, nhưng giao dịch và quyền xem phải theo đúng ngữ cảnh. Không gộp nhu cầu mua cá nhân vào doanh nghiệp chỉ vì người đó là Contact của doanh nghiệp.

**Trước M2:** Codex/kỹ thuật đề xuất lớp khách hàng hỗ trợ hai loại và ánh xạ vào organizations/contacts, cập nhật Lead Convert, Opportunity, Task/Meeting, Conversation, AI và báo cáo. Bạn duyệt bằng hai luồng B2B/B2C mẫu, không cần chọn cách đặt bảng. Đây là thay đổi cần thiết đối với DB §32/API §23.

### D03 Kênh giao tiếp thật đầu tiên

**Đã chốt:** Zalo là kênh nhận/gửi thật trong lần thử nghiệm đầu. Nguồn: trả lời trực tiếp ngày 18/09/2026.

**D03a — đã xác nhận:** iViTech có cả Zalo OA và Zalo cá nhân. Nguồn: câu trả lời trực tiếp ngày 18/09/2026. Người quản trị, quyền ứng dụng và khả năng tích hợp của tài khoản cụ thể chưa được kiểm tra; không yêu cầu gửi mật khẩu/token trong cuộc trò chuyện.

**Phạm vi đã chốt ngày 19/09/2026:** cả Zalo OA và Zalo cá nhân phải nhận/gửi tin nhắn thật ngay trong CRM ở bản thử đầu. Thay đề xuất chỉ OA trước. Khả năng kỹ thuật, quyền tài khoản và cơ chế tích hợp cá nhân chưa được xác minh; đây là yêu cầu bắt buộc, không phải tuyên bố đã hỗ trợ. Nếu chưa tìm được cách đáp ứng, phải báo rõ trở ngại và xin quyết định thay đổi phạm vi, không tự thay bằng ghi chú thủ công hoặc mô phỏng.

**Điều kiện tích hợp:** loại tài khoản đã biết; còn xác minh người quản trị, quyền ứng dụng/API, nhận sự kiện và chính sách gửi tin trên OA cụ thể. Đã kiểm tra nguồn chính thức ở mức khả năng nền tảng, chưa kiểm tra quyền tài khoản iViTech. Nếu tài khoản chưa đủ điều kiện, ghi rõ M3 còn chặn và hướng xử lý, không tự đổi sang Webchat rồi coi đã đáp ứng.

**Cần chốt:** trước thiết kế tích hợp M3; đầu vào tài khoản nên chuẩn bị ngay từ M0.

### D04 Ai được xem và thay đổi dữ liệu của ai

**Đã chốt phạm vi xem khách hàng:** sales chỉ xem khách được giao; quản lý xem khách của nhóm mình quản lý. Nguồn: câu trả lời trực tiếp của Giám đốc sản phẩm ngày 18/09/2026. Áp dụng cho cả khách doanh nghiệp và cá nhân, trên danh sách, tìm kiếm, hồ sơ và truy vấn AI.

**Còn cần chốt trước M2:** ai được chuyển chủ sở hữu, gộp khách trùng, xuất danh sách và xóa/khôi phục; quyền chi tiết với cơ hội/hội thoại liên quan; thành viên và người quản lý từng nhóm. Câu trả lời về quyền xem không tự cấp các quyền thao tác này.

**Ma trận đề xuất để hoàn thiện:** phạm vi xem khách của Sales và Quản lý đã chốt; các quyền thao tác và vai trò khác trong bảng vẫn là đề xuất.

| Vai trò | Xem dữ liệu | Hành động đặc biệt |
|---|---|---|
| Sales | Khách/cơ hội được giao; hội thoại liên quan được cấp quyền | Tạo/sửa theo phân công, không xuất toàn công ty hoặc gộp hồ sơ |
| CSKH | Hội thoại được giao và thông tin khách cần để xử lý | Trả lời, ghi chú nội bộ, tạo yêu cầu sales; không xem mặc định mọi thông tin thương mại |
| Quản lý sales | Dữ liệu nhóm được quản lý | Giao lại việc/hồ sơ, xử lý trùng trong phạm vi nhóm |
| Giám đốc | Báo cáo và dữ liệu toàn công ty theo quyền được cấp | Xem sâu vào số liệu; các quyền quản trị được cấp riêng |
| Quản trị hệ thống | Quản lý người dùng/cấu hình theo nhiệm vụ | Quyền đọc dữ liệu nghiệp vụ toàn công ty phải cấp rõ, không suy ra từ tên vai trò |

Ghi chú “riêng tư” chỉ người được phép mới xem, kể cả qua AI. Tài khoản bot công khai là một vai trò riêng, không kế thừa quyền của quản trị đã cấu hình bot.

### D05 Quy trình bán hàng và cách ghi nhận thắng thua

**Đã chốt các bước cho bản thử đầu ngày 19/09/2026.** Còn cần xác định trước M2: khi nào Lead đủ điều kiện thành cơ hội; quyền chuyển bước và người được phép mở lại cơ hội. Đã chốt cho phép mở lại cơ hội đã thua, giữ nguyên lịch sử và ghi lý do mở lại. Điều kiện “Thắng” đã chốt: hai bên đã ký hợp đồng.

**Quy trình đã chốt:** Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua. Thắng và Thua là hai kết quả kết thúc riêng. Nguồn: người dùng xác nhận dùng các bước này cho bản thử đầu ngày 19/09/2026. Điều kiện ghi nhận Thắng đã chốt: hai bên đã ký hợp đồng. Quyền chuyển bước và cơ chế tự động chuyển bước khi gửi báo giá còn cần hoàn thiện.

Thắng cần giá trị chốt và ngày chốt; thua cần lý do. **Đã chốt ngày 19/09/2026: chỉ ghi nhận “Thắng” khi hai bên đã ký hợp đồng.** Khách đồng ý báo giá, đặt hàng hoặc thanh toán chưa tự đáp ứng điều kiện này nếu chưa ký đủ hai bên. “Thắng” không tự có nghĩa đã thu tiền. Chuyển Lead cho phép chọn hồ sơ hiện có; đề xuất tạo cơ hội khi thực sự có nhu cầu bán hàng, còn nếu chưa tạo cơ hội thì mở trang khách hàng sau chuyển đổi. Quy tắc tùy chọn này phải được ghi rõ để xử lý R14.

### D06 Tạo duyệt gửi báo giá theo mẫu trong CRM

**Đã chốt:** CRM cho phép tạo mẫu báo giá theo từng loại sản phẩm và định dạng nhận diện công ty, đồng thời **tạo, duyệt và gửi báo giá ngay trong CRM**. Nguồn: yêu cầu trực tiếp và phần sửa mới nhất của người dùng ngày 18/09/2026. Đưa toàn luồng báo giá vào MVP; bỏ đề xuất hoãn và trạng thái “duyệt/gửi chưa chốt” trước đó.

**Bổ sung đã chốt ngày 19/09/2026:** trưởng nhóm duyệt báo giá thông thường; giám đốc duyệt khi vượt mức tiền **hoặc** chiết khấu quy định. Chỉ cần một điều kiện vượt ngưỡng là cần giám đốc duyệt. Công ty chưa có quy định và đã yêu cầu tự điền ngưỡng tiền/chiết khấu sau trong CRM; không ấn định sẵn con số. Cơ sở tính và thứ tự duyệt khi vượt ngưỡng sẽ hoàn thiện trước khi áp dụng chính sách thực tế.

**Luồng triển khai:** cấu hình nhận diện → tạo mẫu theo loại sản phẩm → chọn mẫu và khách doanh nghiệp/cá nhân → nhập thông tin sản phẩm/giá → xem trước → gửi duyệt → duyệt/yêu cầu sửa/từ chối → gửi khách từ CRM → theo dõi kết quả. Đề xuất tạo PDF từ đúng phiên bản được duyệt và gửi qua Zalo OA theo khả năng tài khoản được xác minh. Mẫu dùng lại được, không chỉ là file đính kèm. Chưa có mẫu thực tế hoặc mã ứng dụng.

**Còn cần chốt:** loại sản phẩm cần mẫu đầu tiên, mẫu/nhận diện hiện có, trường bắt buộc, quy tắc giá/thuế/chiết khấu/làm tròn, ai quản lý mẫu, cách tính để chuyển giám đốc duyệt; ngưỡng tiền/chiết khấu do công ty cấu hình sau. Đã chốt cần duyệt và gửi trong CRM; không hỏi lại có cần hai chức năng này. Chưa cho phép AI tự duyệt hoặc tự gửi. Hợp đồng/thanh toán vẫn sau MVP. Chi tiết tại `06_MAU_BAO_GIA_VA_ZALO.md`.

## Quyết định trước khi kết nối khách hàng và AI

### D07 Nhận hội thoại và quyền tự động của bot

**Đã chốt phân công ngày 19/09/2026:** trưởng nhóm giao khách mới cho nhân viên; khách đã có người phụ trách tiếp tục chuyển về người đó. Áp dụng cho hội thoại từ OA và Zalo cá nhân khi đã xác định đúng khách.

**Đã chốt bổ sung:** hệ thống đề xuất danh sách sales phù hợp với khách hàng để trưởng nhóm chọn nhanh hơn; không tự giao khách. Bot tự trả lời FAQ từ nội dung công ty đã duyệt, thu thập nhu cầu; nhân viên tiếp nhận thì bot dừng trả lời. Bot không tự giảm giá hoặc cam kết ngoài nội dung đã duyệt.

**Cần chốt trước M3–M4:** thời điểm mở lại hội thoại; được phép nhắn chủ động cho ai?

**Đề xuất triển khai theo quyết định phân công:** khách mới vào danh sách chờ trưởng nhóm phân công; sales chỉ xem khách đã được giao, không tự nhận từ danh sách chung. Ngoài giờ, theo quyết định đã chốt, bot tiếp tục trả lời FAQ đã duyệt, ghi nhận nhu cầu và thông báo nhân viên sẽ liên hệ trong giờ làm việc; không hứa giờ gọi lại cụ thể. Admin tự cấu hình linh hoạt lịch làm việc của đội sales. Bot được trả lời FAQ đã duyệt, thu thập nhu cầu và tạo/cập nhật Lead không trùng. Khi người thật nhận, bot dừng tự trả lời; chỉ bật lại bằng thao tác rõ ràng.

AI soạn cho nhân viên chỉ tạo nháp. Đề xuất tạo Task qua Copilot phải xác nhận. Bot không tự giảm giá, xác nhận thanh toán hoặc thay điều khoản. Chốt riêng chính sách phản hồi yêu cầu khách so với marketing chủ động và cách xử lý “không liên hệ”. Đội kỹ thuật chuyển chính sách thành kiểm tra dùng chung.

### D08 Ai duyệt tri thức và dữ liệu nào được đưa cho AI

**Đã chốt ngày 19/09/2026:** trưởng nhóm chuẩn bị nội dung; giám đốc duyệt trước khi bot sử dụng trả lời khách.

**Cần chốt trước M4:** tài liệu nào được trả lời công khai; dữ liệu nào chỉ nội bộ; có giới hạn gửi dữ liệu ra nhà cung cấp AI không?

**Đề xuất:** chỉ một kho công khai đã duyệt cho bot; không dùng ghi chú sales hoặc hợp đồng nội bộ để trả lời khách. Người sở hữu nội dung duyệt từng phiên bản trước công bố. Copilot nội bộ chỉ nhận phần dữ liệu người đang dùng được xem. Nội dung thiếu/mâu thuẫn thì hỏi lại hoặc chuyển người, không đoán giá và cam kết.

## Quyết định trước pilot

### D09 Quy mô thử nghiệm và thành công mong muốn

**Đã chốt số người dùng thử:** 2 sales và 1 trưởng nhóm. **Còn cần hoàn thiện trước M6:** lượng khách/tin nhắn dự kiến, thời lượng và mục tiêu cải thiện.

**Quy mô đã chốt ngày 19/09/2026:** 2 nhân viên sales và 1 trưởng nhóm tham gia bản thử đầu. Không áp dụng đề xuất 5–10 người trước đó.

**Còn là đề xuất:** pilot 10 ngày làm việc, tập trung giảm bỏ sót follow-up và tiếp nhận hội thoại liền mạch. Thời lượng và mục tiêu chưa được người dùng xác nhận. Vai trò giám đốc duyệt nội dung/báo giá và admin cấu hình vẫn cần được kiểm thử; chưa tự cộng thêm người dùng thật hoặc gộp các quyền này vào trưởng nhóm.

Mục tiêu đề xuất: ít nhất 90% Lead được xác nhận có người phụ trách và bước tiếp theo trong một ngày làm việc; ít nhất 90% người thử hoàn thành luồng chính không cần trợ giúp; mọi lỗi lộ dữ liệu/gửi sai người/mất dữ liệu phải bằng 0 trong kiểm thử. Cần đo hiện trạng trước pilot; chưa hứa tỷ lệ cải thiện doanh số.

### D10 Dữ liệu dùng thử và dữ liệu cũ

**Đã chốt ngày 19/09/2026:** dùng dữ liệu khách hàng mẫu trước. Chưa nhập khách hàng thật, chưa yêu cầu người dùng cung cấp Excel hoặc dữ liệu từ CRM cũ trong giai đoạn đầu.

Bộ mẫu cần có cả doanh nghiệp và cá nhân, khách mới/chưa giao, khách đã giao cho từng sales, cơ hội ở các bước đã chốt, báo giá và nội dung FAQ mẫu. Mọi dữ liệu giả phải được ghi nhãn rõ. Đây là yêu cầu chuẩn bị bộ dữ liệu cho bản chạy thử; chưa tạo dữ liệu hoặc mã ứng dụng ở bước này.

Đã chốt bước tiếp theo sau kiểm tra dữ liệu mẫu: nhập một nhóm khách thật để dùng thử. Danh sách, số lượng, nguồn dữ liệu, phạm vi lịch sử và người kiểm tra chất lượng cần xác định trước khi nhập; chưa thực hiện nhập dữ liệu. Chức năng nhập thử có thể nghiệm thu bằng tệp dữ liệu tổng hợp có dòng mới/trùng/lỗi.

Quyết định dùng dữ liệu mẫu không hủy yêu cầu nhận/gửi Zalo thật: kiểm tra tích hợp phải dùng người nhận/tài khoản thử được phép và nội dung mẫu, không gửi đến khách thật hoặc lấy danh sách khách thực tế để làm mẫu.

### D11 Ngân sách và thời điểm cần dùng

**Đã ghi nhận ngày 19/09/2026:** ngày bắt đầu dùng thử chưa chốt, theo trả lời trực tiếp của người dùng. Không tự đặt hạn hoặc coi đây là yêu cầu triển khai ngay.

**Cần chốt trước chọn dịch vụ có phí:** ngân sách xây dựng, trần chi phí hàng tháng và người quyết định khoản chi. Lịch triển khai sẽ được đề xuất sau khi kiểm chứng khả năng tích hợp Zalo cá nhân và các phụ thuộc cần thiết; thời lượng pilot vẫn chưa được xác nhận.

Tách các khoản: công cụ phát triển, máy chủ/cơ sở dữ liệu/lưu file, AI, kênh nhắn tin, vận hành kỹ thuật. Chưa có báo giá hoặc đăng ký dịch vụ nào trong lượt làm việc này. Nếu thời hạn gấp, giảm phạm vi theo quyết định rõ ràng; không bỏ kiểm tra quyền hoặc gọi một bản mô phỏng là sản phẩm đã chạy thật.

### D12 Người vận hành và mức gián đoạn chấp nhận

**Cần chốt trước M6:** ai xử lý lỗi; ai duyệt đưa vào dùng; muốn lưu lịch sử bao lâu; tối đa chấp nhận mất bao nhiêu dữ liệu và ngừng hệ thống bao lâu?

**Đề xuất đưa ra để thảo luận:** trong pilot, mục tiêu khôi phục trong 4 giờ, mất dữ liệu không quá 24 giờ; nếu điều này không phù hợp nghiệp vụ thì phải nâng yêu cầu và dự trù chi phí. Thời hạn lưu hội thoại/AI/audit do doanh nghiệp chốt, không tự gán con số. Khôi phục phải được thử thật; việc có tệp sao lưu chưa chứng minh khôi phục được.

## Nhật ký quyết định

| Mã | Trạng thái | Nội dung đã xác nhận | Nguồn/ngày | Ảnh hưởng |
|---|---|---|---|---|
| D01 | Đã chốt | Nội bộ iViTech trước | Trả lời trực tiếp, 18/09/2026 | Một doanh nghiệp vận hành, hoãn SaaS thương mại |
| D02 | Đã chốt | Cả doanh nghiệp và khách hàng cá nhân | Trả lời trực tiếp, 18/09/2026 | Điều chỉnh mô hình B2B/B2C trước M2 |
| D03 | Đã chốt kênh | Zalo | Trả lời trực tiếp, 18/09/2026 | Zalo thật là điều kiện nghiệm thu M3 |
| D03a | Đã chốt phạm vi, kỹ thuật chưa xác minh | Nhận/gửi thật cả Zalo OA và Zalo cá nhân ngay trong CRM | Trả lời trực tiếp, 19/09/2026 | Bắt buộc M3/pilot; không thay bằng OA đơn lẻ hoặc mô phỏng |
| D04 | Đã chốt phạm vi xem khách; quyền thao tác còn mở | Sales chỉ xem khách được giao; quản lý xem cả nhóm mình quản lý | Trả lời trực tiếp, 18/09/2026 | Áp dụng cả B2B/B2C, tìm kiếm và AI; không tự cấp quyền sửa/xuất/gộp |
| D05 | Đã chốt các bước; điều kiện chuyển/kết thúc còn mở | Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua | Trả lời trực tiếp, 19/09/2026 | Áp dụng bản thử đầu M1/M2; Thắng khi hai bên đã ký hợp đồng (19/09/2026); quyền chuyển bước còn mở |
| D06 | Đã chốt toàn luồng, cấp duyệt và ngưỡng do công ty cấu hình sau | Mẫu theo loại sản phẩm/nhận diện công ty; tạo, duyệt và gửi báo giá trong CRM | Trả lời và phần sửa trực tiếp, 18/09/2026 | Mốc Q bắt buộc trước M6; trưởng nhóm duyệt thông thường, giám đốc duyệt khi vượt ngưỡng tiền hoặc chiết khấu (xác nhận 19/09/2026) |
| D07 | Đã chốt phân công, hai tiêu chí gợi ý sales, nguyên tắc bot và ngoài giờ; admin cấu hình lịch làm việc | Trưởng nhóm giao khách mới; khách đã có người phụ trách tiếp tục về người đó | Trả lời trực tiếp, 19/09/2026 | Routing M3, giữ phạm vi xem D04 |
| D08 | Đã chốt người chuẩn bị/duyệt; phạm vi dữ liệu còn mở | Trưởng nhóm chuẩn bị, giám đốc duyệt trước khi bot sử dụng | Trả lời trực tiếp, 19/09/2026 | M4 cần phân quyền soạn/duyệt và kiểm soát phiên bản nội dung |
| D09 | Đã chốt quy mô; thời lượng/mục tiêu còn mở | 2 nhân viên sales và 1 trưởng nhóm | Trả lời trực tiếp, 19/09/2026 | Chuẩn bị pilot M6 |
| D10 | Đã chốt dữ liệu mẫu trước; đã chốt nhập một nhóm khách thật sau vòng dữ liệu mẫu | Chưa nhập khách hàng hiện có trong bản thử đầu | Trả lời trực tiếp, 19/09/2026 | Bộ mẫu B2B/B2C; kiểm thử nhập bằng dữ liệu tổng hợp |
| D11 | Đã ghi nhận chưa chốt ngày dùng thử; ngân sách còn mở | Chưa có hạn bắt đầu dùng thử | Trả lời trực tiếp, 19/09/2026 | Đề xuất lịch sau kiểm chứng tích hợp; không tự cam kết ngày |
| D12 | Chưa chốt | Chỉ có đề xuất | Tài liệu này | Vận hành |

Khi có câu trả lời, ghi nội dung cụ thể và ngày; cập nhật cả phạm vi, mốc và nghiệm thu liên quan. Không chỉ sửa một câu trong chat rồi để các tệp kế hoạch khác giữ giả định cũ.


### D03b — tài khoản Zalo cá nhân cho bản thử đầu

**Đã chốt ngày 19/09/2026:** kết nối khoảng **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**, cùng với Zalo OA. Nhận và gửi tin nhắn ngay trong CRM vẫn là yêu cầu bắt buộc. Đây không phải yêu cầu kết nối tài khoản riêng của nhân viên. Chưa xác minh khả năng tích hợp thực tế; chưa chốt nhập lịch sử cũ hoặc nhóm chat. Số lượng tài khoản OA chưa được xác nhận riêng.


### D05b — điều kiện ghi nhận Thắng (19/09/2026)

Người dùng xác nhận: **hai bên đã ký hợp đồng**. Quy tắc này áp dụng cho bản thử đầu và báo cáo cơ hội thắng. Không tự mở rộng phạm vi thành chức năng soạn, duyệt hoặc ký hợp đồng điện tử trong CRM; hợp đồng/thanh toán vẫn ngoài phạm vi chức năng MVP hiện tại. Đề xuất ghi nhận xác nhận ký và tham chiếu tài liệu qua ghi chú/tệp hiện có; trường bắt buộc và quyền xác nhận là chi tiết cần hoàn thiện, chưa được người dùng chốt.


### D05c — mở lại cơ hội đã thua (19/09/2026)

**Đã chốt:** cho phép mở lại cơ hội đã đánh dấu Thua, giữ nguyên lịch sử và bắt buộc ghi lý do mở lại. Không xóa hoặc ghi đè sự kiện thua trước đó. Phạm vi quyết định này chỉ là cơ hội đã thua; chưa tự cho phép mở lại cơ hội đã thắng. Người có quyền mở lại và bước quay về chưa được xác nhận. Đề xuất khi mở lại chọn một bước đang xử lý phù hợp, ghi người thao tác/thời điểm và lý do; chưa coi đề xuất này là quyết định của doanh nghiệp.


### D07a — giới hạn quyết định phân công

Quyền trưởng nhóm giao khách mới đã chốt trong phạm vi nhóm mình quản lý. Không tự mở rộng thành quyền xem/giao khách toàn công ty hoặc quyền đổi người phụ trách của khách hiện có. Khi không xác định chắc khách, người phụ trách đã nghỉ/vô hiệu hóa hoặc chưa xác định nhóm tiếp nhận, cách xử lý ngoại lệ cần hoàn thiện; đề xuất đưa về trưởng nhóm phù hợp xử lý, không tự giao sales khác. Không tự chuyển danh tính OA/cá nhân thành cùng khách khi chưa có bằng chứng liên kết.


### D07b — gợi ý sales và nguyên tắc bot, xác nhận 19/09/2026

**Yêu cầu đã chốt:** hệ thống đề xuất danh sách sales phù hợp với khách hàng để trưởng nhóm lựa chọn nhanh hơn. Trưởng nhóm quyết định giao; danh sách đề xuất không tự cấp quyền xem hồ sơ cho sales chưa được giao. Khách đã có người phụ trách tiếp tục về người đó; tính năng gợi ý không tự thay người phụ trách.

**Hai tiêu chí đã chốt cho bản thử đầu (19/09/2026):** ưu tiên người am hiểu sản phẩm khách đang quan tâm; tiếp theo ưu tiên người đang phụ trách ít khách cần xử lý hơn. Chỉ xét người đang hoạt động trong nhóm trưởng nhóm quản lý. Cách ghi nhận mức am hiểu sản phẩm và định nghĩa khách cần xử lý sẽ được đề xuất trong thiết kế để công ty rà soát; chưa có dữ liệu đánh giá nhân viên thực tế. Không mặc định cần mô hình AI hoặc chấm điểm bằng dữ liệu nhạy cảm.

**Nguyên tắc bot đã chốt:** tự trả lời câu hỏi thường gặp từ nội dung công ty đã duyệt, thu thập nhu cầu; nhân viên tiếp nhận thì dừng tự trả lời; không tự giảm giá hoặc cam kết ngoài nội dung đã duyệt. Đã chốt trưởng nhóm chuẩn bị, giám đốc duyệt nội dung. Lịch làm việc do admin cấu hình linh hoạt; chính sách ngoài giờ đã chốt. Đã chốt: sau bàn giao cho người, bot chỉ hoạt động lại khi nhân viên hoặc trưởng nhóm bấm “Chuyển lại cho bot”. Quyết định nghiệp vụ không chứng minh tài khoản Zalo cá nhân hỗ trợ tự động hóa bot; cần kiểm chứng riêng khả năng kênh.


### D07c — ngoài giờ và cấu hình lịch làm việc (19/09/2026)

**Đã chốt:** ngoài giờ bot vẫn trả lời FAQ đã duyệt, ghi nhận nhu cầu và thông báo nhân viên sẽ liên hệ trong giờ làm việc; không tự hứa giờ gọi lại cụ thể. Giờ làm việc đội sales do admin tự thiết lập linh hoạt trong cấu hình, không cần công ty chốt một khung giờ cố định ở bước chuẩn bị.

**Chi tiết thiết kế đề xuất:** cấu hình ngày làm việc, nhiều khoảng giờ trong ngày, múi giờ và ngày nghỉ/ngoại lệ; lưu lịch sử thay đổi. Cần phân biệt chưa cấu hình với ngày nghỉ, không tự hiểu chưa cấu hình là trực 24/7. Những trường cấu hình này là đề xuất kỹ thuật cần rà soát, không phải lịch làm việc thực tế đã được cung cấp. Quyền cấu hình lịch không tự cấp quyền đọc mọi khách hàng.

Quy tắc nhân viên tiếp nhận thì bot dừng vẫn có hiệu lực ngoài giờ; thay đổi lịch không tự bật lại bot cho hội thoại đang do người xử lý. Đã chốt: chỉ nhân viên hoặc trưởng nhóm bấm “Chuyển lại cho bot” mới bật lại bot sau bàn giao.


### D07d — chuyển lại cho bot (19/09/2026)

**Đã chốt:** sau khi nhân viên tiếp nhận, bot chỉ hoạt động lại khi nhân viên hoặc trưởng nhóm bấm **“Chuyển lại cho bot”**. Không tự bật lại do hết giờ làm việc, im lặng, khách gửi tin mới, đóng/mở hội thoại, đổi lịch hoặc kết nối lại. Áp dụng trong phạm vi hội thoại mà người thao tác được phép xử lý theo D04; không trao quyền thao tác trên khách ngoài phạm vi được giao/quản lý.

**Thiết kế đề xuất:** lưu người thao tác, thời điểm chuyển và trạng thái trước/sau; đánh giá quyền và trạng thái ngay trước gửi để tránh bot trả lời chen khi có thao tác nhận lại đồng thời. Chuyển lại không phát lại câu trả lời cũ đã bị hủy khi bàn giao. Khả năng tự động hóa trên từng loại Zalo vẫn phải được kiểm chứng.


### Quyết định điều kiện gói và thời hạn đào tạo

D06 bổ sung từ hai báo giá: Gói 3 và Gói 4 chỉ bán kèm khi khách đã đăng ký Gói 1, không bán độc lập. Dịch vụ đào tạo tính 12 tháng từ ngày kích hoạt. Xác nhận này giải quyết BG01/BG02 trong 09_PHAN_TICH_MAU_BAO_GIA.md. Điều kiện Gói 1 hết hạn/đăng ký đồng thời chưa được suy ra.
