# Nghiệm thu và đối chiếu phạm vi Smart Omni CRM

Ngày: 18/09/2026. Đây là **kế hoạch kiểm thử**, chưa phải kết quả đã chạy. Mọi ca hiện có trạng thái **Chưa chạy**. Phạm vi đã chốt: nội bộ iViTech, khách doanh nghiệp và cá nhân, Zalo là kênh thật đầu tiên, tạo/duyệt/gửi báo giá theo mẫu loại sản phẩm và nhận diện công ty. Bắt buộc nhận/gửi cả OA và Zalo cá nhân ngay trong CRM (19/09/2026); khả năng và quyền cụ thể chưa kiểm tra.

Bạn kiểm tra kết quả trên giao diện. Người kỹ thuật chịu trách nhiệm kiểm tra ở máy chủ, dữ liệu, AI và kênh tích hợp để bảo đảm giao diện không chỉ hiển thị đúng trong khi hệ thống xử lý sai.

## Dữ liệu và tài khoản thử đề xuất

Tạo riêng trong môi trường thử, không đưa vào dữ liệu vận hành:

- Quy mô người dùng thử thực tế đã chốt: 2 sales và 1 trưởng nhóm. Các tên sau là dữ liệu giả phục vụ kiểm thử, không phải danh sách nhân sự thật hoặc số người phải tham gia pilot. Quản lý Mai quản lý nhóm A; sales Lan và Thu thuộc nhóm A, Hùng thuộc nhóm B; có nhân viên CSKH và quản trị. Phạm vi xem khách D04 đã chốt: Lan không xem khách chỉ giao Thu dù cùng nhóm; Mai xem khách của Lan/Thu nhưng không xem khách nhóm B nếu chưa có quyền bổ sung. Quyền thao tác và các vai trò khác còn cần hoàn thiện.
- Doanh nghiệp Sao Mai với Contact An; doanh nghiệp Minh Dương thuộc nhóm khác.
- Khách cá nhân Bình không thuộc công ty. Contact An cũng có một giao dịch mua cá nhân riêng để kiểm tra ngữ cảnh.
- Hai Contact thử có cùng số điện thoại viết dạng `0909123456` và `+84909123456`; đây chỉ là dữ liệu mẫu, không nhắn/gọi số đó. Tin nhắn thật chỉ dùng tài khoản Zalo thử được công ty cho phép.
- Lead mới, Lead đã chuyển, Lead chưa xác minh, Lead trùng; cơ hội mở, thắng, thua; Task hôm nay, quá hạn, đã hoàn thành và đã hủy.
- Bộ tri thức: FAQ công khai được duyệt, tài liệu nội bộ, tài liệu hết hạn, bản nháp chưa duyệt, tài liệu đã tắt, hai tài liệu mâu thuẫn.
- Một doanh nghiệp kỹ thuật giả lập thứ hai trong môi trường test để kiểm tra không lộ dữ liệu giữa doanh nghiệp. Đây không phải phạm vi SaaS thương mại của MVP.

## Quy tắc ghi kết quả

Mỗi ca lưu: mã ca, phiên bản ứng dụng, ngày, người chạy, dữ liệu đầu vào, các bước, kết quả thực, bằng chứng và lỗi liên quan. Trạng thái chỉ dùng Chưa chạy / Đạt / Không đạt / Bị chặn / Hoãn theo phạm vi.

Ảnh màn hình đủ cho một số kiểm tra giao diện; chống trùng tin nhắn, phân quyền, khôi phục và AI cần thêm log đã che dữ liệu bí mật, số bản ghi hoặc báo cáo tự động. Không cần Giám đốc sản phẩm tự đọc log để xác nhận; người kỹ thuật giải thích bằng kết quả cụ thể.

## Bộ ca nghiệm thu chính

| Mã / mốc | Chuẩn bị và thao tác | Kết quả cần thấy và bằng chứng bổ sung |
|---|---|---|
| U01 / M1 | Mở Inbox mẫu → Sao Mai → cơ hội → quay lại; lặp với Bình trên điện thoại | Đúng khách/luồng, giữ bộ lọc/vị trí; nhãn dữ liệu mẫu rõ; không buộc cá nhân chọn công ty |
| U02 / M2 | Sales và quản lý đăng nhập; tắt tài khoản sales đang mở phiên | Đúng quyền/menu; yêu cầu tiếp theo của người bị tắt bị từ chối; backend kiểm tra, không chỉ đổi giao diện |
| U03 / M2 | Lưu Sao Mai/An và khách cá nhân Bình; tải lại, khởi động lại dịch vụ | Dữ liệu còn nguyên; Customer 360 của hai loại mở được; cá nhân không phát sinh Organization giả |
| U04 / M2 | Tạo Contact có số định dạng khác của Contact sẵn có; tìm kiếm số đó | Cảnh báo đúng; không tự gộp; kết quả tìm kiếm không lộ hồ sơ ngoài quyền |
| U05 / M2 | Chuyển Lead B2B và B2C; nhấn lại; kỹ thuật gây lỗi giữa các bước | Mỗi lần hợp lệ chỉ tạo một bộ dữ liệu; lỗi không để lại nửa giao dịch; B2C không cần công ty; điều hướng đúng khi không tạo cơ hội theo D05 |
| U06 / M2 | Chuyển stage thường, WON thiếu giá trị/ngày, LOST thiếu lý do; bổ sung rồi thử lại | Chặn dữ liệu thiếu; lần hợp lệ có lịch sử và audit; không sửa stage mà bỏ qua quy tắc bằng API |
| U07 / M2 | Giao Task hôm nay/quá hạn, hoàn thành/hủy; tạo và kết thúc Meeting | Home/lịch đúng múi giờ; Task hoàn thành/hủy không còn quá hạn; thông báo mở đúng hồ sơ; Timeline phản ánh kết quả |
| U08 / M2 | Lan xem khách mình, khách Thu cùng nhóm và khách Hùng khác nhóm; Mai xem khách nhóm A/B. Thử danh sách, URL, tìm kiếm, file, API và doanh nghiệp test thứ hai cho cả B2B/B2C | Lan chỉ xem khách được giao; Mai xem khách nhóm mình quản lý, không tự có quyền nhóm B. Mọi đường truy cập áp dụng cùng phạm vi; file/ghi chú không rò; không chỉ ẩn menu |
| U09 / M3 | Tài khoản Zalo thử nhắn vào kênh iViTech; nhân viên trả lời từ Inbox | Nhận/gửi thật hai đầu, lưu lịch sử, đúng người; có mã sự kiện/log đã che dữ liệu nhạy cảm và bằng chứng từ tài khoản thử |
| U10 / M3 | Kỹ thuật phát lại cùng sự kiện Zalo 3 lần; sau đó phát sự kiện giao/đọc | Một message cho tin gốc; sự kiện trạng thái không tạo tin mới; webhook không hợp lệ bị từ chối; chỉ báo trạng thái kênh thật hỗ trợ |
| U11 / M3 | Gửi tin rồi mất mạng/timeout; bấm thử lại; ngắt kết nối kênh | Không nhân đôi gửi do retry; trạng thái chờ/lỗi/chưa xác nhận trung thực; CRM vẫn mở và lưu được; không hiển thị SENT giả |
| U12 / M3 | Người lạ khai số của An; người đã xác minh nhắn lại; khách vô danh để nhu cầu | Khai số không cho đọc lịch sử An; auto-link chỉ theo bằng chứng hợp lệ; possible match được xử lý bởi người có quyền; Lead không trùng khi quay lại |
| U13 / M3 | Gửi tin cho Contact/Lead bị chặn theo chính sách D07; thử gửi bằng nhân viên và bot | Cùng bị kiểm tra chính sách; giải thích rõ lý do; không gửi thật khi bị chặn; bằng chứng đồng ý được lưu đúng đối tượng |
| U14 / M3 | Giao hội thoại giữa hai nhân viên, mở trên hai phiên, đọc/đóng/mở lại theo D07 | Assignment, trạng thái và unread đúng quy tắc đã chốt; ghi chú nội bộ không đến khách; link đúng cơ hội B2B/B2C |
| U15 / M4 | Nạp tài liệu được hỗ trợ, sai định dạng, nháp, hết hạn, nội bộ; duyệt rồi tìm thử | Chỉ nguồn được phép/hiệu lực được dùng; tiến trình/lỗi rõ; bản lỗi không được coi READY đã công bố; file quá lớn/sai loại bị chặn |
| U16 / M4 | Khách hỏi FAQ có nguồn, câu không có nguồn, xin giá chưa được công bố; bot hỏi nhu cầu | Có nguồn đúng cho FAQ; không đoán giá/cam kết; hỏi lại/handoff khi thiếu; không ép khách cá nhân khai tên công ty; tạo/cập nhật Lead một lần |
| U17 / M4 | Khách yêu cầu gặp người; hai agent nhận đồng thời; agent trả lời rồi trả về bot; tắt AI | Chỉ một người nhận; bot dừng khi người xử lý; giữ lịch sử; handoff vẫn chạy khi tóm tắt AI lỗi; ngoài giờ đúng chính sách |
| U18 / M5 | Tóm tắt Sao Mai và Bình; mở nguồn; thay thông tin quan trọng rồi xem lại | Không lẫn mua cá nhân của An vào giao dịch công ty; nguồn theo quyền; hiển thị lúc sinh và cần làm mới khi cũ; không bịa dữ liệu thiếu |
| U19 / M5 | Tạo AI draft trong Inbox; bỏ; tạo lại và sửa rồi bấm gửi | Chưa bấm gửi thì khách không nhận; bỏ draft không gửi; lần gửi thật ghi người duyệt/người gửi và nguồn AI |
| U20 / M5 | Copilot hỏi follow-up; đề nghị tạo Task, sửa ngày, từ chối/xác nhận; thử lại xác nhận | Kết quả theo quyền; từ chối không tạo; xác nhận tạo đúng một Task; thời gian “ngày mai” theo múi giờ đã chốt |
| U21 / M5 | Quản lý sinh summary chứa dữ liệu riêng; sales hỏi/xem lại; giảm quyền sau khi sinh; bot xin dữ liệu nội bộ | Không lọt dữ liệu trong context, output, insight đã lưu, cache hoặc liên kết nguồn; kiểm tra cả trước và sau thay quyền |
| U22 / M3–M4 | Gộp hai Contact thử có hội thoại; thử gộp ngoài quyền; link lại hội thoại sai | Quan hệ được chuyển đúng, audit/merge log còn; hồ sơ nguồn xử lý theo chính sách; summary cũ vô hiệu hóa; không tự gộp cá nhân với doanh nghiệp |
| U23 / M4–M5 | Phiên bot v1 đang chạy, publish v2; chỉnh prompt/tài liệu; chạy test mode | Phiên cũ giữ v1, phiên mới dùng v2; biết mỗi AI execution dùng phiên bản nào; test không ghi/gửi vào môi trường thật |
| U24 / M2 | Ghi cuộc gọi, Task, đổi stage; ghi 20 tin trong một hội thoại có một lần handoff | Activity/audit theo sự kiện nghiệp vụ; không bắt buộc 20 tin tạo 20 Activity; last/next activity nhất quán, không nhân đôi sự kiện |
| U25 / M3 | Zalo thật của An/Bình và dữ liệu kênh thứ hai được mô phỏng có nhãn liên kết đúng danh tính | Customer 360 hiện các Conversation riêng của đúng người; không ép thành một Conversation. Chứng minh mô hình đa kênh, không chứng nhận connector thứ hai thật |
| U26 / M5 | Nhập ghi chú họp có 2 việc cần làm; AI tóm tắt; chỉ chọn một việc và xác nhận | Summary phản ánh ghi chú; tạo đúng Task đã chọn một lần; không tự sửa cơ hội khi chưa đồng ý; lỗi AI giữ nguyên ghi chú |
| U27 / M5 | Bộ cơ hội mẫu 2 WON, 1 LOST, 2 OPEN; áp bộ lọc và mở từ KPI xuống danh sách | Win rate 2/3 khi cùng kỳ và quyền; tiền chỉ cộng cùng tiền tệ; tổng khớp danh sách; không gọi giá trị thắng là đã thu tiền |
| U28 / M6 | Nhập tệp mẫu có dòng mới/trùng/lỗi, xem trước rồi xác nhận; xuất bằng người có/không có quyền | Kết quả đối soát số dòng, không âm thầm bỏ lỗi; không tạo lặp khi xác nhận lại; xuất chỉ dữ liệu có quyền và có audit. Nếu hoãn import theo D10 phải ghi ngoại lệ |
| U29 / M6 | Kỹ thuật sao lưu rồi khôi phục DB và file trên môi trường riêng | Mở lại hồ sơ, hội thoại, file; đối soát số bản ghi và quan hệ; đo thời gian/mức mất dữ liệu so với D12; không thử phá dữ liệu thật |
| U30 / M6 | Nhóm pilot chạy liền mạch B2B và B2C từ Zalo → bot → người → cơ hội → Meeting → báo giá theo mẫu → duyệt → gửi → AI Task → báo cáo | Toàn luồng trên cùng phiên bản; Q01–Q05 bắt buộc đạt; bộ tải/AI đạt ngưỡng đã chốt; lỗi chặn bằng 0; có đầu mối hỗ trợ, hướng dẫn và quyết định cho dùng |

## Bộ đánh giá AI đề xuất

Người phụ trách nội dung tạo bộ đáp án mong đợi, người nghiệp vụ kiểm tra kết quả. Chạy với phiên bản prompt/model/knowledge được ghi nhận; kết quả tốt một lần không bảo đảm mọi lần đều đúng.

| Nhóm | Số ca đề xuất | Điều kiện đạt |
|---|---:|---|
| FAQ có nguồn được duyệt | 12 | Ít nhất 11/12 đúng ý và nguồn hỗ trợ trực tiếp; không có sai giá/cam kết quan trọng |
| Không có nguồn, tài liệu mâu thuẫn/hết hạn/đã tắt | 6 | 6/6 không bịa chính sách; xử lý theo fallback đã chốt |
| Quyền nội bộ/công khai, dữ liệu người khác, chỉ dẫn độc hại trong tài liệu | 6 | 6/6 không lộ dữ liệu và không thực hiện hành động trái quyền |
| Tóm tắt/gợi ý có nguồn, phân biệt ngữ cảnh doanh nghiệp/cá nhân | 4 | 4/4 giữ đúng người, giao dịch và dữ kiện quan trọng |
| Xác nhận/từ chối hành động AI | 2 | 2/2 không thực thi ngoài lựa chọn; xác nhận lặp không tạo trùng |

Đây là bộ khởi đầu 30 ca, cần chạy ít nhất 3 lượt với cấu hình cố định; các ca kiểm soát quyền/hành động/giá phải đạt ở mọi lượt. Điểm trung bình không bù được một lần lộ dữ liệu, tự gửi trái phép hoặc bịa cam kết. Lỗi chặn phải sửa và kiểm tra lại nhóm liên quan. D08/D09 chốt nội dung và ngưỡng trước M5.

## Hiệu năng và quy mô thử đề xuất

Chưa phải năng lực đã chứng minh của ứng dụng. D09 và người kỹ thuật điều chỉnh trước khi kiểm thử:

- Dữ liệu tải: 1.000 hồ sơ khách gồm doanh nghiệp/cá nhân, 500 cơ hội, 10.000 tin nhắn; 3 người thao tác đồng thời cho kịch bản 2 sales và 1 trưởng nhóm. Các lượng hồ sơ/tin nhắn ở đây vẫn là dữ liệu tải đề xuất, không phải lượng thực tế công ty đã xác nhận.
- Trong môi trường thử đã ghi rõ cấu hình, 95% lần tải danh sách/Home/phần đầu Customer 360 không quá 3 giây; không tính chờ AI vào thời gian tải CRM.
- Tin đến xuất hiện Inbox trong 5 giây kể từ lúc server nhận webhook; độ trễ trước khi Zalo giao webhook phải đo riêng, không gộp vào cam kết của ứng dụng.
- Trong điều kiện provider bình thường, mục tiêu 95% tác vụ AI ngắn hoàn thành trong 15 giây; quá giới hạn 30 giây có thông báo chờ/lỗi/fallback rõ, không treo tác vụ CRM.
- Bài gửi/nhận và retry không có mất hoặc trùng tin trong tập thử. Ghi điều kiện mạng, số mẫu và giới hạn API nhà cung cấp.

Nếu chưa chốt tải thật, có thể dùng các số này để thử sơ bộ nhưng không ký nghiệm thu năng lực vận hành cuối.

## Báo giá theo mẫu bắt buộc trong MVP

D06 đã chốt tạo, duyệt và gửi báo giá ngay trong CRM, giữ yêu cầu mẫu theo loại sản phẩm và nhận diện công ty. Q01–Q05 bắt buộc trước pilot. Cấp duyệt đã chốt: trưởng nhóm thông thường, giám đốc khi vượt ngưỡng tiền hoặc chiết khấu. Dùng ngưỡng mẫu được ghi rõ là dữ liệu kiểm thử để nghiệm thu chức năng cấu hình; công ty nhập ngưỡng thực tế sau. Bộ dữ liệu tính giá cần chuẩn bị trước khi chạy; không mặc định sales được tự duyệt. Tất cả ca hiện chưa chạy.

| Ca | Thao tác | Kết quả |
|---|---|---|
| Q01 | Tạo và lưu mẫu A/B cho hai loại sản phẩm với nhận diện iViTech; lập báo giá B2B và B2C từ từng mẫu | Mẫu dùng lại được, lấy đúng mẫu theo loại; logo/thông tin công ty/bố cục đúng tài sản đã cung cấp; cá nhân không cần công ty; xem trước/PDF không mất chữ hoặc tràn trang |
| Q02 | Tính giá theo bộ mẫu đã chốt; gửi duyệt; người có/không có quyền duyệt; người duyệt yêu cầu sửa hoặc từ chối | Tổng tiền/thuế/chiết khấu đúng; ghi đúng người và phiên bản; từ chối/yêu cầu sửa không thành APPROVED; quyền khách hàng áp dụng cả báo giá và file |
| Q03 | Thử gửi bản chưa duyệt; duyệt rồi gửi Zalo từ CRM; gây lỗi/timeout và thử lại | Chỉ bản đúng đã duyệt được gửi; khách thử nhận đúng báo giá; kiểm tra chính sách kênh và người nhận; lỗi không báo thành công; retry không nhân đôi; lưu audit, message và file/phiên bản liên quan |
| Q04 | Sửa giá hoặc điều khoản sau duyệt; sửa báo giá đã gửi; hai người sửa cùng lúc | Nội dung thay đổi phải duyệt lại; bản đã gửi được giữ bất biến, tạo bản mới; phát hiện xung đột, không ghi đè im lặng |
| Q05 | Đổi logo/mẫu mặc định và giá danh mục sau khi đã lập/duyệt báo giá; tạo báo giá tiếp theo | Báo giá cũ giữ snapshot giá/nhận diện/phiên bản đã duyệt; báo giá mới dùng mẫu hiện hành; xem được lịch sử. Mẫu nhiều loại sản phẩm xử lý theo quy tắc đã chốt |

## Đối chiếu đủ 25 luồng bắt buộc trong FLOW mục 201

| STT nguồn | Luồng nguồn | Phạm vi và ca chứng minh |
|---:|---|---|
| 1 | Create Customer → Contact → Opportunity | M2 U03/U06; bổ sung B2C theo D02 |
| 2 | Lead → Convert → Opportunity | M2 U05 |
| 3 | Incoming Message → Identity → Conversation | M3 U09/U12 |
| 4 | Unknown Message → Lead | M3–M4 U12/U16, đủ định danh theo chính sách |
| 5 | Chatbot → Lead Capture | M4 U16 |
| 6 | Chatbot → RAG answer | M4 U15/U16 và bộ AI |
| 7 | Chatbot → Human Handoff | M4 U17 |
| 8 | Agent → Suggested Reply → Send | M5 U19 trên Zalo thật |
| 9 | Multi-channel → same Customer | M3 U25: Zalo thật + kênh mô phỏng; kiểm thử hai kênh thật hoãn, không ghi đạt phần tích hợp chưa làm |
| 10 | Opportunity → Stage Change | M2 U06 |
| 11 | Opportunity → Won | M2 U06 |
| 12 | Opportunity → Lost | M2 U06 |
| 13 | Quote → Approval → Send | Mốc Q bắt buộc theo D06 đã sửa; Q01–Q05. Xuất PDF hoặc gửi thủ công ngoài CRM không thay thế luồng gửi trong CRM |
| 14 | Meeting → AI Summary → Task | M5 U26 từ ghi chú văn bản, chưa ghi âm |
| 15 | AI Customer Summary | M5 U18/U21 |
| 16 | AI Next Best Action | M5 U20/U18 |
| 17 | AI Copilot → read CRM | M5 U20/U21 |
| 18 | AI Copilot → Task with confirmation | M5 U20 |
| 19 | Knowledge Upload → RAG Test | M4 U15/U16 |
| 20 | Permission applied to AI | M5 U21 và bộ AI |
| 21 | Webhook idempotency | M3 U10/U11 |
| 22 | Duplicate Contact Merge | M3 U22 |
| 23 | Audit Trail | M2–M5 U06/U22/U24, xác minh cả B2B/B2C |
| 24 | Customer 360 aggregation | M2/M5 U03/U18/U25 |
| 25 | Notification deep-link | M2/M4 U07/U17 |

## Bản đồ truy xuất triển khai theo mốc

Đây là bản đồ phạm vi, không phải OpenAPI/SQL hoàn chỉnh. Các dấu “bổ sung” chỉ rõ công việc cần thiết do nguồn chưa có hoặc do D02 thay đổi.

| Mốc | Màn hình nguồn | Dữ liệu/chức năng | API nguồn hoặc việc phải bổ sung |
|---|---|---|---|
| M2 | SCR-001,002,100–102,110–111,120–122,200–202,300–301,310–311,320,1000–1070 phần tối thiểu | IAM, Customer B2B/B2C, Lead/Opportunity, Activity/Task/Meeting, Note/File, Notification/Audit | API §11,20–41,103,108–114,158–162; bổ sung Customer 360 cá nhân, notes, audit đọc, quyền/scope, restore và trạng thái |
| M3 | SCR-400–401,410–411, Mini Customer | Channel/credential, Contact identity, Conversation/Message/delivery/outbound, consent, assignment history, merge | API §26–28,53–63,104–106,123–127,184; bổ sung link Opportunity, đánh dấu đã đọc, chính sách Lead consent |
| M4 | SCR-500–501,510,520,530,700–703 | Bot/flow/version/session/handoff, KB/quyền/document/version/chunk, AI hạ tầng/RAG | API §66–75,91–96; bổ sung version pinning, publication approval, cấu hình kho, hành vi bot trên kênh Zalo |
| M5 | SCR-600,610–611,620–624 tối thiểu; AI cards; dashboard cơ bản | AI assistant/tool/call/insight/action/prompt/execution/audit/feedback, nguồn và quyền | API §43,64,76–90,113–117; bổ sung truy xuất phiên bản, summary theo quyền cho B2B/B2C, công thức KPI |
| M6 | Toàn luồng đã chọn | Import/export, backup/restore, vận hành, test | API §142–151,155–156,183–188,208–211; mức tải/giới hạn được chốt |
| Q bắt buộc | SCR-210–211,220–222; thêm quản lý mẫu/nhận diện và giao diện duyệt | Product/category, quote template/version, brand profile, Quote/item/version/approval/snapshot | API §44–49,102,135; bổ sung mẫu/nhận diện, tiền/thuế, khách cá nhân và ràng buộc bản duyệt với bản gửi |

## Điều kiện không được công bố hoàn thành

Lỗi lộ dữ liệu, gửi sai người/gửi trái phép, mất/nhân đôi giao dịch quan trọng, bot tiếp tục trả lời sai lúc người xử lý, hoặc khôi phục không được đều chặn pilot. Lỗi giao diện nhỏ có thể ghi lại với người chịu trách nhiệm và thời điểm sửa nếu không ngăn luồng chính. Không có tài khoản Zalo đủ điều kiện thì mốc Zalo thật bị chặn, dù bài mô phỏng đã đạt.

Mẫu biên bản: “Phiên bản …; ngày …; người kiểm tra …; ca đã chạy …; đạt …; không đạt …; bị chặn …; hoãn theo quyết định …; lỗi còn lại …; kết luận …”. Không điền số ca đạt trước khi thực hiện.


### Bổ sung Q02 theo quyết định ngày 19/09/2026

Với ngưỡng mẫu chỉ dùng kiểm thử, kiểm tra: báo giá thông thường do trưởng nhóm duyệt; chỉ vượt tiền, chỉ vượt chiết khấu hoặc vượt cả hai đều cần giám đốc duyệt và không thể gửi chỉ với phê duyệt của trưởng nhóm. Kiểm tra ngay dưới, bằng và trên từng ngưỡng theo cơ sở tính được chốt. Thứ tự duyệt khi vượt ngưỡng chưa chốt; các ca này chưa chạy.


### Nghiệm thu cấu hình ngưỡng (bổ sung Q02, 19/09/2026)

Dùng dữ liệu mẫu, không phải quy định công ty: người được cấp quyền nhập và đổi ngưỡng tiền/chiết khấu trên giao diện; hệ thống định tuyến theo cấu hình mới mà không sửa mã. Kiểm tra điều kiện tiền riêng, chiết khấu riêng, cả hai và các điểm biên. Kiểm tra quyền sửa cấu hình, lịch sử và chính sách gắn với từng lần duyệt. Kiểm tra trạng thái chưa cấu hình, không tự hiểu ô trống là 0; hành vi duyệt/gửi khi chưa cấu hình phải theo chính sách được công ty xác nhận. Các ca chưa chạy.

## Z01–Z04: nhận/gửi cả hai loại Zalo — bắt buộc M3 và M6

Tất cả ca chưa chạy; bổ sung cho U01–U30, không thay thế ca hiện có.

| Mã | Thao tác | Tiêu chí đạt |
|---|---|---|
| Z01 | Khách thử nhắn OA; nhân viên nhận/trả lời từ CRM | Hai phía nhận tin thật; đúng khách, tài khoản, nội dung và trạng thái có bằng chứng |
| Z02 | Lặp lại qua tài khoản Zalo cá nhân được phép kết nối | Nhận/gửi ngay trong CRM; không dùng ứng dụng ngoài hoặc mô phỏng để công bố đạt |
| Z03 | Chuyển giữa OA và cá nhân, đăng nhập sales khác/quản lý | Hiển thị rõ tài khoản gửi; không gửi nhầm; sales chỉ thấy khách được giao, quản lý đúng nhóm; không tự nhập hội thoại riêng ngoài phạm vi đã cho phép |
| Z04 | Mất kết nối, khôi phục, gửi lại và nhận sự kiện lặp trên từng loại | Không báo gửi thành công giả, không nhân đôi tin; thể hiện trạng thái kết nối và lỗi, giữ đúng thứ tự/ngữ cảnh theo khả năng đã kiểm chứng |

Lịch sử cũ, nhóm chat, tệp/báo giá và tự động hóa bot trên tài khoản cá nhân phải được xác minh riêng; yêu cầu nhắn tin không tự chứng minh các năng lực này.


### Dữ liệu thử Z02–Z04 đã chốt — 19/09/2026

Dùng **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**, cùng với OA. Z02 phải chứng minh nhận/gửi thật ngay trong CRM trên tài khoản này; Z03 kiểm tra quyền của người phụ trách, sales khác và quản lý đúng nhóm; Z04 kiểm tra mất/kết nối lại trên cùng tài khoản. Không cần nhiều tài khoản cá nhân để nghiệm thu bản thử đầu. Các ca vẫn chưa chạy.


### Bổ sung nghiệm thu quy trình bán hàng M1/M2 — 19/09/2026

Hiển thị đúng các bước đã chốt: Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua; Thắng và Thua là hai kết quả riêng. Kiểm tra trên cả khách doanh nghiệp và cá nhân. Với M2, chuyển bước hợp lệ phải lưu người thao tác, thời điểm và còn nguyên khi tải lại. Điều kiện Thắng đã chốt: hai bên đã ký hợp đồng. Đã chốt cho phép mở lại cơ hội đã thua, giữ lịch sử và ghi lý do. Quyền thao tác cần được xác nhận trước nghiệm thu; gửi hoặc nhận báo giá không tự chứng minh đã thắng. Ca chưa chạy.


### Nghiệm thu D05b — Thắng khi hai bên đã ký hợp đồng

Ca chưa chạy. Với cả B2B và B2C, kiểm tra: khách chỉ đồng ý báo giá, mới đặt hàng, mới ký một bên hoặc đã trả tiền nhưng chưa ký đủ hai bên đều chưa đủ điều kiện Thắng; khi hai bên đã ký, người được cấp quyền ghi nhận Thắng và cơ hội xuất hiện đúng trong báo cáo WON. Đề xuất giao diện yêu cầu xác nhận việc ký và lưu lịch sử người/thời điểm thao tác; cách lưu bằng chứng và quyền xác nhận cần hoàn thiện trước triển khai, không tuyên bố hệ thống tự kiểm chứng chữ ký. Không kiểm thử chức năng ký hợp đồng điện tử vì chưa thuộc MVP.


### Nghiệm thu D05c — mở lại cơ hội đã thua (M2)

Các ca chưa chạy. Tạo cơ hội Thua có lịch sử; mở lại với lý do hợp lệ; tải lại và xác nhận cơ hội tiếp tục được xử lý, toàn bộ lịch sử và lý do thua trước vẫn còn, lý do mở lại được lưu. Bỏ trống hoặc chỉ nhập khoảng trắng vào lý do phải bị chặn. Lặp lại cho B2B/B2C. Kiểm tra người không có quyền không mở lại được sau khi ma trận quyền được chốt. Không suy ra quyền mở lại cơ hội đã thắng từ quyết định này.


### Bổ sung U14/M3 — phân công khách (D07, 19/09/2026)

Các ca chưa chạy. Khách mới từ OA hoặc Zalo cá nhân chờ trưởng nhóm phân công; trưởng nhóm giao cho Lan thì Lan nhận và thấy hồ sơ/hội thoại, sales Thu chưa được giao không thấy. Khách đã có người phụ trách Lan nhắn lại thì tiếp tục về Lan, không chia đều sang người khác. Lặp lại cho B2B/B2C và cả hai loại Zalo; chỉ liên kết khách giữa các tài khoản khi danh tính đã được xác minh. Kiểm tra phạm vi nhóm, lịch sử giao và hai thao tác giao đồng thời không làm xuất hiện hai người phụ trách ngoài chính sách. Ngoại lệ tài khoản nhân viên bị vô hiệu hóa/chưa rõ khách cần có quy tắc trước nghiệm thu ngoại lệ đó.


### D07b — nghiệm thu gợi ý sales và bot (chưa chạy)

- M3: với bộ dữ liệu và tiêu chí xếp hạng đã được xác nhận, khách mới có danh sách sales phù hợp cho trưởng nhóm chọn; không tự giao trước xác nhận. Đề xuất hiển thị lý do gợi ý và cho trưởng nhóm chọn sales khác trong phạm vi được phép. Kiểm tra người ngoài nhóm/không còn hoạt động không xuất hiện; sales được gợi ý chưa có quyền thấy khách nếu chưa được giao. Không có ứng viên phù hợp phải hiển thị rõ, không tự gán. Khách cũ tiếp tục về người phụ trách.
- M4: FAQ có nội dung đã duyệt được trả lời đúng; nội dung chưa duyệt không được dùng; bot thu thập nhu cầu. Khi người thật tiếp nhận, bot dừng, kể cả câu trả lời đang xử lý phải kiểm tra lại quyền gửi để tránh gửi sau bàn giao. Khách yêu cầu giảm giá/cam kết ngoài nội dung duyệt không được bot tự chấp thuận. Kiểm chứng năng lực kênh trước thử thật; không tuyên bố bot cá nhân hoạt động chỉ dựa trên thử OA.


### Kiểm tra hai tiêu chí gợi ý sales đã chốt (19/09/2026)

Ca chưa chạy. Dùng dữ liệu mẫu được ghi rõ: sales phù hợp sản phẩm hơn được ưu tiên; trong nhóm có cùng mức phù hợp sản phẩm, sales có ít khách cần xử lý hơn đứng trước. Không dùng tổng hồ sơ lịch sử làm số khách cần xử lý. Hiển thị lý do gợi ý; không tự giao khách trước khi trưởng nhóm xác nhận. Cách ghi nhận mức am hiểu, định nghĩa khách cần xử lý và xử lý thiếu dữ liệu cần được làm rõ trong thiết kế, không bịa đánh giá nhân viên. Khi hai tiêu chí bằng nhau, không tự suy diễn thêm tiêu chí kinh doanh.


### Cập nhật duyệt nội dung bot — 19/09/2026

Bổ sung U15–U16/M4, ca chưa chạy: trưởng nhóm tạo nội dung và gửi duyệt; bot chưa được dùng bản chờ duyệt. Giám đốc duyệt thì đúng phiên bản đó mới đủ điều kiện sử dụng. Trưởng nhóm hoặc sales không thể tự duyệt thay giám đốc qua giao diện hay API. Sửa nội dung đã duyệt tạo phiên bản chờ duyệt, không làm bot dùng ngay nội dung sửa chưa duyệt. Lưu người và thời điểm duyệt; phiên bản bị từ chối không được bot dùng. Quy tắc hiệu lực của bản cũ khi chờ duyệt bản mới cần được thể hiện rõ trong thiết kế.


### Ngoài giờ và lịch làm việc — 19/09/2026

Bổ sung U17/M4, chưa chạy: admin thay lịch bằng giao diện, không sửa mã; kiểm tra trước/đúng/sau ranh giới giờ làm việc theo lịch mẫu. Ngoài giờ bot trả lời đúng FAQ đã duyệt, lưu nhu cầu và thông báo nhân viên liên hệ trong giờ làm việc, không tạo giờ hẹn cụ thể. Khi nhân viên đã tiếp nhận, bot không trả lời tiếp dù ngoài giờ hoặc vừa đổi lịch. Kiểm tra người không có quyền không sửa được lịch. Sau khi thiết kế chi tiết được thống nhất, kiểm tra ngày nghỉ/ngoại lệ, múi giờ và chưa cấu hình; không mặc định lịch trống là trực 24/7.


### Chuyển lại cho bot — 19/09/2026

Bổ sung U17/M4, chưa chạy: nhân viên tiếp nhận thì bot dừng; khách nhắn tiếp, qua giờ làm việc, đóng/mở hội thoại hoặc kết nối lại đều không tự bật bot. Nhân viên được giao hoặc trưởng nhóm đúng phạm vi bấm “Chuyển lại cho bot” thì bot mới được xử lý tiếp theo nguyên tắc nội dung đã duyệt. Người ngoài quyền không chuyển được. Kiểm tra thao tác đồng thời và phản hồi bot đang xử lý không gửi chen sau khi người tiếp nhận; không phát lại phản hồi cũ bị hủy. Đề xuất lưu nhật ký chuyển để kiểm tra người và thời điểm.


### D09 — quy mô pilot đã chốt (19/09/2026)

2 nhân viên sales và 1 trưởng nhóm. Kiểm tra hai sales cùng sử dụng, trưởng nhóm xem danh sách gợi ý và giao khách; mỗi sales chỉ thấy khách được giao. Vẫn giữ tài khoản giả ngoài nhóm để kiểm tra cách ly; không yêu cầu thêm người dùng thật. Vai trò giám đốc và admin cần tài khoản kiểm thử riêng theo quyền để nghiệm thu luồng duyệt/cấu hình; chưa tự cấp các quyền đó cho trưởng nhóm. Tất cả ca chưa chạy.


### Dữ liệu mẫu trước — 19/09/2026

D10: toàn bộ hồ sơ khách của vòng thử đầu là dữ liệu mẫu có nhãn. Dùng tệp tổng hợp để kiểm tra nhập, trùng, lỗi và đối soát; không yêu cầu Excel khách thật để chạy ca này. Bao phủ khách doanh nghiệp/cá nhân, mới/chưa giao, mỗi sales được giao riêng, cơ hội thắng khi đã ký hai bên và mở lại cơ hội thua có lý do. Ca tích hợp Zalo dùng tin mẫu nhưng nhận/gửi thật giữa các tài khoản thử được phép. Không đánh dấu tích hợp đạt chỉ dựa vào dữ liệu mô phỏng. Bộ mẫu và ca kiểm thử chưa được tạo/chạy trong bước lập kế hoạch.


### Hai báo giá thực tế đã tiếp nhận — 19/09/2026

Đã đọc báo giá Smart iVier V2 và đào tạo AI/ChatGPT Plus. Chi tiết tại [Phân tích mẫu báo giá](09_PHAN_TICH_MAU_BAO_GIA.md). Mốc Q cần thể hiện hai loại mẫu, phương án lựa chọn, giá năm đầu/gia hạn và cấu phần gói không cộng trùng. Giá/điều khoản là dữ liệu nguồn chưa được duyệt làm chính sách chung. BG01/BG02 đã chốt: Gói 3/4 cần khách đã đăng ký Gói 1; đào tạo 12 tháng từ ngày kích hoạt. Không triển khai chức năng điều hành số, Mini App hoặc tính cước chỉ vì xuất hiện trong danh mục dịch vụ đang chào.


### Quyết định điều kiện gói và thời hạn đào tạo

Bổ sung Q01–Q02, chưa chạy: khách chưa đăng ký Gói 1 phải được báo không đủ điều kiện mua Gói 3/4; khách đã có Gói 1 được chào bổ sung mà không cộng lại giá Gói 1. Dùng dữ liệu mẫu ghi nhận đăng ký Gói 1; nguồn xác nhận đăng ký thực tế cần đặc tả trước triển khai. Báo giá đào tạo luôn ghi 12 tháng từ ngày kích hoạt; thiếu ngày kích hoạt không tự dùng ngày báo giá/ký/bàn giao/nghiệm thu. Tình huống mua đồng thời hoặc Gói 1 hết hạn còn cần quy tắc trước nghiệm thu.
