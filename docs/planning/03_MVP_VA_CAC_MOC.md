# Phạm vi MVP và các mốc chạy thử

Ngày: 18/09/2026. Đã chốt D01 nội bộ iViTech, D02 cả doanh nghiệp và cá nhân, D03 Zalo thật đầu tiên, D03a có OA và tài khoản cá nhân, D04 phạm vi xem khách, D06 tạo/duyệt/gửi báo giá theo mẫu sản phẩm và nhận diện công ty. Quyền tích hợp tài khoản, quyền thao tác/cơ sở tính ngưỡng duyệt, điều kiện chuyển/kết thúc D05 và D07–D12 còn cần hoàn thiện. Không có mã ứng dụng hoặc bản chạy thử được tạo trong mốc chuẩn bị này.

## Kết quả cuối của MVP

Nhân viên iViTech tiếp nhận khách doanh nghiệp hoặc cá nhân từ Zalo thật, xem được lịch sử trong đúng hồ sơ, để bot trả lời câu hỏi được phép và thu thập nhu cầu, nhận bàn giao sang người thật, chuyển Lead thành cơ hội, theo dõi công việc và dùng AI để tóm tắt/soạn nháp. Quản lý biết hồ sơ nào chưa có người xử lý và công việc nào quá hạn.

Luồng minh họa cần chạy xuyên suốt: khách nhắn → bot trả lời FAQ có nguồn → ghi nhận nhu cầu/Lead → chuyển sales → sales xem toàn bộ hội thoại → tạo cơ hội và lịch hẹn → tạo báo giá từ mẫu → duyệt → gửi khách trong CRM → ghi nhận kết quả → AI đề xuất follow-up → nhân viên xác nhận Task → quản lý xem dữ liệu đúng phạm vi.

## Trong phạm vi đề xuất

| Nhóm | Có trong MVP | Giới hạn chủ động |
|---|---|---|
| Người dùng và quyền | Đăng nhập, người dùng, vai trò, nhóm/phòng ban theo D04, thu hồi phiên, nhật ký | Một doanh nghiệp iViTech vận hành; không đăng ký SaaS |
| CRM | Khách doanh nghiệp và cá nhân, Organization/Contact/Lead, tìm kiếm, chống trùng, gộp Contact có kiểm soát, Customer 360, ghi chú/file cơ bản | B2C không cần công ty; không làm phân khúc động |
| Sales | Opportunity, một pipeline mặc định có cấu hình, thắng/thua, lịch sử stage, owner | Không dự báo AI nâng cao |
| Báo giá và sản phẩm | Phân loại/danh mục sản phẩm tối thiểu, mẫu tái sử dụng theo loại sản phẩm, nhận diện công ty, tạo/duyệt/gửi báo giá, PDF và lịch sử phiên bản | D06 đã chốt toàn luồng; ngưỡng tiền/chiết khấu do công ty cấu hình sau; công thức thương mại còn chờ, không thêm hợp đồng/thanh toán |
| Công việc | Task, nhắc việc trong ứng dụng, lịch và Meeting cơ bản, ghi hoạt động thủ công | Không đồng bộ lịch ngoài, ghi âm hay họp trực tuyến |
| Hội thoại | Unified Inbox, Zalo nhận/gửi text thật, file theo khả năng kênh, trạng thái gửi, phân công, đóng/mở, ghi chú nội bộ | Tài khoản/quyền Zalo cần xác minh; không giả định kênh có mọi trạng thái đọc |
| Nhận diện | Chuẩn hóa số/email, nhận diện kênh đã xác minh, gợi ý match, link/gộp có quyền | Không auto-merge chỉ vì tên/số do khách tự khai |
| Tri thức | Kho công khai và quyền nội bộ, văn bản nhập trực tiếp + tệp văn bản được hỗ trợ, xử lý, phiên bản, duyệt/công bố, tắt/hết hạn, thử truy xuất | Đề xuất TXT/DOCX/PDF có lớp chữ; chưa OCR ảnh, crawl URL hàng loạt hoặc nguồn API |
| Chatbot | Một bot, FAQ có nguồn, thu thập Lead, flow theo bước, intent cơ bản, test, publish phiên bản, handoff/fallback | Chưa canvas kéo thả, đặt lịch tự động hoặc gửi thương mại chủ động |
| AI | Tóm tắt khách/hội thoại, nháp trả lời, gợi ý hành động, Copilot đọc CRM và tạo Task có xác nhận, tóm tắt ghi chú Meeting | Một cấu hình nhà cung cấp ban đầu, có thể nhiều model theo loại tác vụ; chưa scoring/risk/analyst nâng cao |
| Báo cáo | Home, cơ hội mở/thắng/thua, Task quá hạn, hàng chờ hội thoại và số handoff/Lead từ bot | Công thức minh bạch, xem xuống hồ sơ; không báo “doanh thu đã thu” khi chưa có thanh toán |
| Vận hành | Nhật ký, lỗi dễ hiểu, kiểm soát chi phí AI cơ bản, sao lưu/khôi phục, môi trường thử riêng | Chi phí/hiệu năng và thời gian lưu theo quyết định pilot |
| Nhập/xuất | Nhập thử khách hàng/Contact bằng mẫu CSV, kiểm tra trùng/lỗi, xuất theo quyền | Nếu D10 không cần nhập dữ liệu cũ có thể hoãn import; không chuyển toàn bộ lịch sử tự động |

Các giới hạn về định dạng tri thức, một bot, một pipeline mặc định và nhập CSV là đề xuất giảm phạm vi, phải ghi trong biên bản M0. Pipeline/flow/prompt không hard-code; “một cấu hình dùng ban đầu” khác với “không thể cấu hình”.

## Sau MVP hoặc nhánh mở rộng

Hợp đồng/thanh toán; nhiều connector thật; gửi chiến dịch; workflow tổng quát; approval engine tổng quát; SLA nâng cao; customer segments; saved views chia sẻ; lead scoring/risk/churn nâng cao; app mobile riêng; đồng bộ calendar; transcribe ghi âm; OCR/URL ingestion; báo cáo phân tích đa chiều; quản lý gói SaaS. Mẫu/sản phẩm cơ bản và duyệt báo giá theo chính sách được chốt thuộc MVP; nếu doanh nghiệp yêu cầu nhiều cấp duyệt báo giá thì điều chỉnh mốc Q, không tự hoãn yêu cầu đó theo mục này.

Không bỏ hạ tầng duyệt hành động AI tối thiểu chỉ vì hoãn Approval Center. Không bỏ audit/cost log chỉ vì hoãn dashboard chi phí AI nâng cao. Hỗ trợ dùng trên điện thoại cho luồng chính vẫn nằm trong MVP; không đồng nghĩa phải tạo app iOS/Android.

## Các điều chỉnh cần ghi nhận so với nguồn

| Điều chỉnh đề xuất | Nguồn liên quan | Điều kiện |
|---|---|---|
| Bổ sung khách cá nhân xuyên suốt dữ liệu/API/UI/AI | DB §25,32; API §23 thiên về tổ chức | D02 đã chốt; hai luồng B2B/B2C là bắt buộc |
| Zalo là connector thật đầu tiên | PRD §52 cho chọn ít nhất một kênh | D03 đã chốt; kiểm tra điều kiện tài khoản tại M0, không thay bằng Webchat |
| Đưa mẫu/sản phẩm và toàn luồng báo giá vào MVP | DB §146 khác API §203 | D06 đã chốt; mốc Q bắt buộc trước M6 |
| Chưa nối hai kênh thật | PRD §52, FLOW §201 mục 9 | Một kênh thật + bài kiểm tra mô phỏng kênh thứ hai; công bố rõ giới hạn |
| Chưa lead scoring/risk nâng cao | PRD §51, UI §153, API §203 | MVP vẫn có Next Best Action và Summary; không hiện điểm/risk giả |
| Step builder với tập node giới hạn | UI §64, API §211 | Có FAQ, hỏi/thu thập, điều kiện, Lead/Task, handoff, kết thúc; đặt lịch tự động để sau |
| Chưa URL/API source, OCR | UI §86, FLOW §53 | Văn bản và tệp có lớp chữ đủ pilot; định dạng ngoài phạm vi báo rõ |
| Chưa Saved Views chia sẻ, bulk nâng cao | UI §110, FLOW §75,166–168 | Giữ tìm kiếm/lọc/phân trang và gộp Contact được kiểm soát |

## M0 Chốt cơ sở triển khai

**Bản bàn giao:** bộ rà soát hiện tại cộng nhật ký quyết định đã cập nhật, phạm vi được thống nhất và bảng quy tắc nghiệp vụ. M0 là tài liệu, chưa có ứng dụng để bấm.

**Điều kiện đầu vào:** 5 nguồn đã đọc; D01–D03, loại tài khoản D03a, phạm vi xem khách D04 và toàn luồng báo giá D06 đã chốt. **Cần hoàn tất:** quyền thao tác chi tiết D04, điều kiện chuyển/kết thúc D05, mẫu/giá/cơ chế cấu hình duyệt D06, nguyên tắc D07–D08; sơ bộ D09 và D11; thiết kế bổ sung B2C và xác minh quyền tích hợp Zalo OA. Nhận/gửi Zalo cá nhân ngay trong CRM là điều kiện pilot đã chốt; phải kiểm chứng khả thi tại M0.

**Nghiệm thu:** mỗi việc còn mở có người chịu trách nhiệm và mốc cần chốt; R01–R02 đã có phương án thống nhất; nguồn ưu tiên được ghi rõ; mọi phần hoãn được nhìn thấy. Codex chuẩn bị danh mục màn hình/API/dữ liệu tối thiểu theo mốc và người kỹ thuật rà soát. Không lấy việc tài liệu đã được tạo làm bằng chứng M0 đã được bạn duyệt.

## M1 Bản mẫu giao diện để kiểm tra nghiệp vụ

**Phụ thuộc:** phạm vi và vai trò M0 đủ rõ. **Bạn dùng thử:** My Home, Customer 360, Pipeline, Inbox, khung Chatbot/AI với dữ liệu mẫu có nhãn.

**Cách thử:** đi từ hội thoại của Công ty Sao Mai đến hồ sơ, cơ hội, tạo việc rồi quay lại đúng hội thoại. Lặp lại với khách cá nhân Bình không có công ty. Thử chuyển thắng/thua, xem thông báo thiếu dữ liệu, mở trên điện thoại.

**Tiêu chí:** hoàn tất đường đi không bị ngõ cụt; quay lại giữ đúng hồ sơ/bộ lọc; trạng thái rỗng/đang tải/lỗi có thông báo; tác vụ nhanh ưu tiên 2–3 thao tác khi phù hợp. Wizard chuyển Lead 5 bước trong UI §24 là ngoại lệ được hiển thị rõ, không lược bỏ kiểm tra chỉ để đạt số lần bấm.

**Giới hạn:** mọi tin nhắn, dữ liệu và AI còn có thể là mẫu; chưa nghiệm thu quyền, dữ liệu bền vững hoặc tích hợp. Đây là bản duyệt trải nghiệm, không phải MVP hoạt động.

## M2 CRM có dữ liệu thật trong môi trường thử

**Phụ thuộc:** M1; D02, D04, D05. **Bạn dùng thử:** tài khoản sales/quản lý, tạo khách/Contact/Lead, chuyển Lead, Pipeline, Task, Calendar, Meeting, ghi chú, Timeline, tìm kiếm, Home và audit.

**Kịch bản:** tạo khách Sao Mai → Contact An → Lead → chuyển thành cơ hội → giao Task và lịch họp → ghi kết quả → cập nhật stage → đăng xuất/đăng nhập lại. Lặp lại với Lead cá nhân Bình → Customer 360 cá nhân → cơ hội mua cá nhân, không tạo Organization. Thêm trường hợp An vừa là Contact công ty vừa mua cá nhân; hồ sơ giao dịch và quyền xem không bị lẫn.

**Tiêu chí:** dữ liệu vẫn còn sau tải lại và khởi động lại dịch vụ; cảnh báo trùng số ở định dạng khác; không chuyển Lead hai lần; lỗi giữa quá trình chuyển đổi không để lại nửa hồ sơ; thắng chỉ khi hai bên đã ký hợp đồng và cần giá trị/ngày, thua cần lý do; sales không thấy hồ sơ ngoài quyền cả qua tìm kiếm và URL trực tiếp; thu hồi người dùng chặn phiên đang dùng; nhật ký ghi người sửa. Bộ U01–U08 và phần CRM của U24 phải đạt; phần kiểm tra AI/quyền U21 thực hiện ở M5.

**Nền tảng chuẩn bị:** khóa khách/hội thoại dùng chung, cấu trúc quyền AI và điểm kết nối được thiết kế từ đây. Chưa yêu cầu AI/kênh có mặt để CRM hoạt động. Bản này gọi “CRM thử sớm”, chưa gọi hoàn thành MVP Omni CRM.

## M3 Một kênh thật và Unified Inbox

**Phụ thuộc:** M2, cơ chế kết nối và quyền tài khoản thực tế cho cả OA lẫn Zalo cá nhân được kiểm chứng, chính sách D07. **Bạn dùng thử:** khách thử gửi đến OA và tài khoản cá nhân đã cho phép; nhân viên nhận/trả lời ngay trong Inbox CRM, gắn đúng khách, đúng tài khoản gửi và đúng người phụ trách. M3 chưa đạt nếu mới chạy được OA.

**Tiêu chí:** tin hai chiều đến thật và lưu được; người chưa xác minh không đọc được dữ liệu CRM; một sự kiện nhận lặp 3 lần chỉ tạo một message; thử lại sau mất mạng không gửi trùng; gửi lỗi hiển thị đúng, không báo thành công giả; consent/DNC chặn theo chính sách đã chốt; reassign/close và unread có hành vi nhất quán giữa hai nhân viên. U09–U14, U22, U25 liên quan đạt.

**Bắt buộc Zalo:** có bài thử trên tài khoản được phép, kiểm tra xác thực webhook, chuẩn hóa tin, định danh gắn đúng tài khoản kênh và giới hạn gửi tin/đính kèm/trạng thái của tài khoản thực tế. Chưa có quyền truy cập thì chỉ kết luận phần mô phỏng/adapter đã thử, M3 còn chưa đạt. Không cam kết kết nối tài khoản Zalo cá nhân khi chưa có cơ chế chính thức được xác minh.

**Webchat:** không thuộc yêu cầu connector thật của MVP đã chốt. Có thể dùng công cụ mô phỏng nội bộ để kiểm thử bot, nhưng không dùng nó thay bằng chứng Zalo thật.

**Giới hạn:** chưa bot tự động; AI có thể chưa hoạt động. Không gọi dữ liệu kênh giả là hội thoại khách thật.

## M4 Tri thức và Chatbot bàn giao được cho người

**Phụ thuộc:** M3, D07–D08, nội dung FAQ mẫu được duyệt. **Bạn dùng thử:** tải tài liệu, kiểm tra trả lời, công bố bot, khách hỏi FAQ, để lại nhu cầu rồi yêu cầu gặp nhân viên.

**Tiêu chí:** tài liệu chưa duyệt/hết hạn/đã tắt không được dùng cho trả lời mới; câu trả lời có nguồn; câu ngoài phạm vi được xử lý bằng hỏi lại/chuyển người; khách quay lại không tạo Lead lặp; người nhận thấy lịch sử và thông tin thu thập; bot dừng khi người nhận; hai nhân viên nhận cùng lúc chỉ một người thành công; lỗi AI vẫn chuyển người được. Publish v2 không đổi giữa chừng phiên đang ở v1; test bot không tạo CRM thật. U15–U17, U22–U23 liên quan đạt.

**Giới hạn:** tập intent/node vừa đủ luồng đã chọn, chưa bot thương lượng giá, tự đặt lịch có cam kết hoặc chatbot đa ngôn ngữ.

## M5 AI hỗ trợ sales và báo cáo cơ bản

**Phụ thuộc:** M2–M4; quy tắc truy cập và dữ liệu AI D08; công thức báo cáo D09. **Bạn dùng thử:** tóm tắt Customer/Conversation có nguồn, soạn nháp, tạo Task từ gợi ý sau xác nhận, hỏi Copilot việc cần follow-up, tóm tắt ghi chú họp rồi tạo Task.

**Tiêu chí:** AI không nhận dữ liệu ngoài quyền; nguồn mở được theo quyền; tóm tắt cũ được đánh dấu cần cập nhật; nháp không tự gửi; bỏ qua/từ chối gợi ý không tạo dữ liệu; bấm xác nhận/thử lại nhiều lần chỉ tạo một Task; prompt và phiên bản tài liệu truy ngược được; có phản hồi tốt/xấu và chi phí sử dụng; AI ngừng hoạt động thì CRM/nhắn tin thủ công vẫn chạy. U18–U21, U23, U26–U27 đạt.

**Báo cáo:** dữ liệu thật theo quyền, công thức bên dưới, click số liệu ra đúng tập hồ sơ. Không tạo biểu đồ có số liệu mẫu trong bản nghiệm thu chức năng.

## M6 Pilot nội bộ và quyết định đưa vào dùng

**Phụ thuộc:** M2–M5 và mốc Q đều đạt; D09–D12 chốt. **Bạn dùng thử:** nhóm nội bộ iViTech dùng bản tích hợp trên môi trường được kiểm soát, cùng dữ liệu thử và phần dữ liệu đã được cho phép nhập.

**Tiêu chí:** kiểm tra xuyên suốt trên cùng phiên bản; nhập thử đối soát được; khôi phục backup trên môi trường riêng thành công; kiểm thử tải đạt mức đã chốt; đạt bộ đánh giá AI; không còn lỗi chặn pilot; có hướng dẫn người dùng, đầu mối hỗ trợ, ngân sách/giới hạn chi phí, phương án quay lại bản trước và biên bản nghiệm thu. U28–U30 và toàn bộ ca bắt buộc được chạy lại trên bản tích hợp khi cần để chứng minh tích hợp đúng.

**Kết luận được phép:** “MVP thử nghiệm nội bộ đạt phạm vi đã chốt”, kèm giới hạn một kênh và những phần hoãn. Chưa kết luận sản phẩm sẵn sàng bán đại trà hoặc đáp ứng mọi nhu cầu SaaS.

## Mốc Q Báo giá theo mẫu bắt buộc trong MVP

Đặt sau M2; kết nối gửi sau M3 và phải xong trước M6. D06 mới nhất đã yêu cầu mẫu theo loại sản phẩm/nhận diện công ty và tạo, duyệt, gửi ngay trong CRM. Đây là mốc bổ sung bắt buộc vào kế hoạch M0–M6, không còn nhánh tùy chọn.

**Bạn dùng thử:** cấu hình mẫu cho hai loại sản phẩm → chọn mẫu → chọn khách doanh nghiệp/cá nhân và cơ hội → điền sản phẩm/giá → xem trước PDF → gửi duyệt → người được chỉ định duyệt/yêu cầu sửa/từ chối → gửi khách trong CRM → xem trạng thái và lịch sử. Đã chốt trưởng nhóm duyệt thông thường; giám đốc duyệt khi vượt mức tiền hoặc chiết khấu quy định. Ngưỡng do công ty tự cấu hình sau. Việc báo giá vượt ngưỡng đi thẳng giám đốc hay qua trưởng nhóm trước còn cần chốt. AI không tự duyệt hay tự gửi.

**Cần có:** danh mục/phân loại sản phẩm tối thiểu, mẫu và phiên bản, nhận diện công ty, quy tắc giá được xác nhận, cơ chế duyệt, PDF đúng bản được duyệt và dịch vụ gửi chung. Thay mẫu/giá sản phẩm không được làm đổi báo giá đã lập. Không thêm hợp đồng/thanh toán chỉ vì đã thêm báo giá.

**Nghiệm thu:** đúng mẫu/nhận diện và tổng tiền; người không có quyền không duyệt được; không gửi bản chưa duyệt; sửa nội dung thương mại sau duyệt phải được duyệt lại; báo giá đã gửi không sửa đè; bấm gửi lại do timeout không nhân đôi; lỗi gửi không đánh dấu SENT thành công; bản v1 còn truy xuất được khi tạo v2. Ca Q01–Q05 bắt buộc. Cách gửi PDF hoặc đường dẫn bảo vệ qua OA phải được xác minh trên tài khoản thực tế; chỉ tải PDF xuống chưa đáp ứng yêu cầu gửi ngay trong CRM.

## Công thức báo cáo MVP đề xuất

| Chỉ số | Công thức và cách hiểu |
|---|---|
| Giá trị cơ hội mở | Tổng estimated_value của cơ hội ở stage OPEN trong phạm vi quyền; lọc kỳ theo expected_close_date nếu đã chọn kỳ |
| Giá trị bán hàng thắng | Tổng final_value của cơ hội WON theo actual_close_date; không gọi là tiền thu thực tế |
| Tỷ lệ thắng | Số WON / (WON + LOST) có actual_close_date trong kỳ; mẫu số 0 hiển thị “Chưa có dữ liệu”, không hiển thị 0% gây hiểu nhầm |
| Task quá hạn | due_at < thời điểm hiện tại và trạng thái chưa COMPLETED/CANCELLED; ngày hiển thị theo múi giờ doanh nghiệp |
| Hội thoại chưa phân công | Hội thoại chưa đóng/chưa spam, assigned_user_id trống, trong phạm vi được xem |
| Lead từ bot | Đếm Lead duy nhất được tạo từ bot trong kỳ; không đếm lại khi bot cập nhật Lead cũ |
| Tỷ lệ handoff | Số phiên bot bắt đầu trong kỳ đã phát sinh ít nhất một yêu cầu handoff / tổng phiên bot bắt đầu trong kỳ; ghi rõ thời điểm chốt số liệu |

Đề xuất pilot dùng VND và múi giờ Việt Nam, còn chờ xác nhận trong D09/D12. Nếu nhiều tiền tệ, tách theo tiền tệ; chưa cộng thẳng hoặc tự quy đổi không có tỷ giá chốt. Forecast có thể hoãn; nếu hiển thị phải định nghĩa estimated_value × probability và không trình bày là doanh thu chắc chắn.

## Quy tắc hoàn thành một mốc

Mỗi mốc cần phiên bản bản thử, danh sách phạm vi, bằng chứng chức năng, kết quả kiểm thử kỹ thuật, người nghiệm thu, ngày và lỗi còn lại. Ca chưa thực hiện ghi “Chưa chạy”; ca hoãn ghi lý do/phạm vi; không đổi thành “Đạt”. Mốc tiếp theo có thể chuẩn bị phần độc lập, nhưng không được công bố mốc phụ thuộc đã đạt khi đầu vào còn thiếu.

Không đưa ra lịch tuần cố định khi chưa có D09/D11 và chưa kiểm tra quyền tích hợp kênh. Sau M0, người thực hiện ước lượng công sức từng mốc, tách thời gian xây dựng khỏi thời gian chờ tài khoản/duyệt nội dung và dự phòng sửa lỗi.

## Bổ sung bắt buộc M0/M3/M6 — 19/09/2026

M0: kiểm chứng riêng khả năng nhận/gửi Zalo cá nhân, nguồn cung cấp cơ chế tích hợp, điều kiện tài khoản, chi phí và giới hạn; chưa viết mã ứng dụng trong bước hiện tại. M3: bản chạy thử nhận/gửi thật cả OA và cá nhân, không lẫn tài khoản hoặc quyền xem. M6 chỉ đạt khi cả hai đã được kiểm thử thực tế. Kênh mô phỏng vẫn hữu ích cho kiểm thử nhưng không thay thế một trong hai loại Zalo bắt buộc. Nếu chưa xác minh khả thi, báo phụ thuộc này trước khi cam kết lịch triển khai.


### Quy mô kết nối cá nhân đã chốt — 19/09/2026

M0/M3/M6 dùng **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên** cho bản thử đầu, cùng với OA. Không yêu cầu nhiều tài khoản cá nhân để đạt mốc này. Kiểm chứng khả năng tích hợp trên tài khoản được công ty cho phép trước khi cam kết cách triển khai; số lượng tài khoản không chứng minh khả năng kết nối.


### Các bước bán hàng đã chốt — 19/09/2026

**Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua.** Áp dụng cho bản thử đầu. Thắng và Thua là hai kết quả riêng. Đã chốt Thắng khi hai bên đã ký hợp đồng; quyền chuyển bước/người được phép mở lại còn cần xác nhận; đã chốt cho phép mở lại cơ hội đã thua, giữ lịch sử và ghi lý do; không tự coi khách nhận báo giá là đã thắng hoặc đã thanh toán.


**D05b cập nhật 19/09/2026:** cơ hội chỉ ghi nhận Thắng khi hai bên đã ký hợp đồng. Báo cáo WON tuân theo điều kiện này; không suy ra đã thu tiền. Ghi nhận sự kiện ký không bổ sung chức năng quản lý hoặc ký hợp đồng điện tử vào MVP.


**D05c bổ sung cho M2 (19/09/2026):** cho phép mở lại cơ hội đã thua; bắt buộc lý do và giữ nguyên lịch sử. Nghiệm thu phải chứng minh việc mở lại không xóa thông tin/lý do lần thua trước. Người có quyền và bước quay về cần hoàn thiện trong thiết kế. Đề xuất báo cáo trạng thái hiện tại coi cơ hội đã mở lại là đang xử lý; báo cáo lịch sử vẫn thể hiện lần thua trước, cách thống kê theo kỳ cần đặc tả trước M5.


**D07 phân công đã chốt — 19/09/2026:** trưởng nhóm giao khách mới cho nhân viên trong nhóm; khách đã có người phụ trách tiếp tục chuyển về người đó. Áp dụng OA và tài khoản Zalo cá nhân khi nhận diện đúng khách. Thiết kế M3 phải giữ nguyên D04: sales chỉ thấy khách được giao, quản lý trong phạm vi nhóm. Không tự chia đều hoặc để sales tự nhận khách mới. Chính sách ngoại lệ khi người phụ trách không còn hoạt động hoặc chưa xác định nhóm tiếp nhận vẫn cần hoàn thiện.


### D07b — bổ sung phạm vi M3/M4 (19/09/2026)

M3 phải có danh sách sales được gợi ý khi trưởng nhóm phân công khách mới; trưởng nhóm chọn và xác nhận, hệ thống không tự giao. Hiển thị lý do phù hợp và số khách cần xử lý để hỗ trợ lựa chọn. Hai tiêu chí đã chốt: ưu tiên am hiểu sản phẩm khách quan tâm, sau đó ít khách cần xử lý hơn. Chỉ gợi ý người trong phạm vi nhóm và không làm lộ khách cho sales chưa được giao. Khách đã có người phụ trách giữ quy tắc chuyển về người đó. Có thể nghiệm thu gợi ý bằng quy tắc rõ ràng, không bắt buộc AI.

M4: nguyên tắc bot đã được người dùng chốt — trả lời FAQ từ nội dung công ty đã duyệt, thu thập nhu cầu, dừng tự trả lời khi nhân viên tiếp nhận; không tự giảm giá/cam kết ngoài nội dung duyệt. Khả năng bot trên từng loại Zalo phải xác minh riêng, không suy ra từ việc nhắn tin được.


### Cập nhật duyệt nội dung bot — 19/09/2026

D08/M4 đã chốt: trưởng nhóm chuẩn bị nội dung, giám đốc duyệt trước khi bot sử dụng trả lời khách. Bản chạy thử phải thể hiện bước soạn → gửi duyệt → giám đốc duyệt → nội dung đủ điều kiện cho bot dùng. Bản sửa nội dung cần được duyệt trước khi sử dụng; quyền soạn không đồng nghĩa quyền duyệt.


### Ngoài giờ và lịch làm việc — 19/09/2026

Bổ sung bắt buộc M4: admin cấu hình linh hoạt lịch làm việc đội sales. Ngoài giờ bot trả lời FAQ đã duyệt, ghi nhận nhu cầu và thông báo nhân viên liên hệ trong giờ làm việc; không hứa giờ gọi lại cụ thể. Mốc chạy thử dùng lịch mẫu được ghi rõ, không phải lịch thật của công ty. Giữ quy tắc dừng bot khi người đã tiếp nhận, kể cả ngoài giờ.


### Chuyển lại cho bot — 19/09/2026

M4 bổ sung D07d: nút “Chuyển lại cho bot” cho nhân viên/trưởng nhóm có quyền xử lý hội thoại. Sau bàn giao cho người, chỉ thao tác này bật lại bot; không tự bật do tin mới, ngoài giờ, hết thời gian chờ, đóng/mở hoặc kết nối lại. Giữ nguyên lịch sử trao đổi.


**D09 đã chốt 19/09/2026:** nhóm dùng thử gồm 2 nhân viên sales và 1 trưởng nhóm; cùng phạm vi Zalo OA và 1 tài khoản Zalo cá nhân công ty cấp đã chốt. Thời lượng/mục tiêu pilot còn mở. Vai trò giám đốc duyệt và admin cấu hình không tự gộp vào trưởng nhóm; kiểm thử phân quyền riêng, chưa xác nhận người thật đảm nhiệm.


**Thời điểm dùng thử — cập nhật 19/09/2026:** người dùng xác nhận chưa chốt ngày bắt đầu. Không đặt hạn mặc định; đề xuất lịch sau khi kiểm chứng khả năng tích hợp Zalo cá nhân và các phụ thuộc. Điều này không thay đổi phạm vi MVP hoặc cho phép bắt đầu viết mã ứng dụng. Thời lượng pilot cũng chưa được xác nhận.


### Dữ liệu mẫu trước — 19/09/2026

D10: các bản chạy thử đầu và vòng thử nội bộ M6 ban đầu dùng dữ liệu khách hàng mẫu, chưa nhập dữ liệu khách thật. Chức năng nhập/đối soát có thể kiểm tra bằng tệp tổng hợp. Bộ mẫu bao phủ B2B/B2C, phân công cho 2 sales, trưởng nhóm, cơ hội, báo giá và FAQ. Tích hợp Zalo vẫn phải kiểm chứng nhận/gửi thật với tài khoản/người nhận thử được phép; dữ liệu mẫu không thay cho bằng chứng kết nối. Đã chốt tiếp theo nhập một nhóm khách thật để dùng thử sau khi vòng mẫu đạt; xác định danh sách và nguồn trước khi nhập, chưa thực hiện trong bước chuẩn bị.


### Hai báo giá thực tế đã tiếp nhận — 19/09/2026

Đã đọc báo giá Smart iVier V2 và đào tạo AI/ChatGPT Plus. Chi tiết tại [Phân tích mẫu báo giá](09_PHAN_TICH_MAU_BAO_GIA.md). Mốc Q cần thể hiện hai loại mẫu, phương án lựa chọn, giá năm đầu/gia hạn và cấu phần gói không cộng trùng. Giá/điều khoản là dữ liệu nguồn chưa được duyệt làm chính sách chung. BG01/BG02 đã chốt: Gói 3/4 cần khách đã đăng ký Gói 1; đào tạo 12 tháng từ ngày kích hoạt. Không triển khai chức năng điều hành số, Mini App hoặc tính cước chỉ vì xuất hiện trong danh mục dịch vụ đang chào.


### Quyết định điều kiện gói và thời hạn đào tạo

Mốc Q: kiểm tra điều kiện khách đã đăng ký Gói 1 khi chào Gói 3/4; không chào hai gói này là độc lập. Thời hạn đào tạo lấy mốc kích hoạt. Không xây hệ thống cấp tài khoản/thuê bao hoặc tính cước chỉ để lưu các điều kiện báo giá.
