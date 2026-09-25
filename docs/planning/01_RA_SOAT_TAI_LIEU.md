# Rà soát 5 tài liệu Smart Omni CRM

Ngày: 18/09/2026. Đây là phân tích tài liệu, chưa phải kết quả kiểm tra phần mềm. Mã PRD, DB, UI, FLOW, API được giải thích trong `00_BAT_DAU_TU_DAY.md`. Với FLOW, ghi cả số mục và số luồng để tránh lệch 2 đơn vị.

## Cách phân loại

- **Mâu thuẫn:** hai nơi mô tả khác nhau về cùng vấn đề.
- **Chưa đồng bộ:** màn hình/luồng yêu cầu một khả năng nhưng dữ liệu hoặc API chưa đặc tả đủ. Chưa đồng bộ không đồng nghĩa chức năng không thể làm.
- **Thiếu quyết định:** có nhiều cách làm hợp lệ nhưng chưa biết cách nào đúng với doanh nghiệp.
- **Chặn mốc:** cần giải quyết trước mốc liên quan; không nhất thiết chặn toàn bộ dự án.

Không coi một phần mở rộng của tài liệu chi tiết là mâu thuẫn chỉ vì PRD không liệt kê. Các ví dụ và phần ghi “optional”, “future”, “có thể” không tự trở thành yêu cầu bắt buộc của MVP.

## A. Phạm vi và hợp đồng giữa các phần

### R01 Phạm vi sản phẩm và báo giá chưa thống nhất

**Loại:** mâu thuẫn phạm vi. **Chặn:** M0. **Quyết định:** D06.

**Bằng chứng:** DB §146 liệt kê `products`, `opportunity_products`, `quotes`, `quote_items` trong các bảng MVP. API §202–203 đặt Products và Quotes ở P1. UI §153 hoãn **Advanced** Quote Builder nhưng không xác định rõ báo giá cơ bản có thuộc MVP hay không. PRD §51 có Product/Quote trong bước Sales, còn danh sách MVP §52 không nêu hai phần này.

**Tác động:** đội làm dữ liệu có thể xây báo giá, đội API hoãn, giao diện vẫn hiện nút không dùng được.

**Cập nhật D06 mới nhất:** người dùng yêu cầu mẫu theo loại sản phẩm/nhận diện công ty và đã sửa rõ **tạo, duyệt, gửi báo giá trong CRM**. Toàn luồng thuộc MVP, thay đề xuất hoãn; mốc Q bắt buộc trước M6. Cần thêm mô hình mẫu/phiên bản/nhận diện vì bảng `quotes` và `quote_items` hiện mới mô tả từng báo giá, không đủ cho thư viện mẫu tái sử dụng. Chức năng cấu hình ngưỡng duyệt, cách tính giá và tài khoản gửi phải đặc tả trước triển khai; con số ngưỡng do công ty tự điền sau; không bỏ duyệt/gửi khỏi phạm vi.

### R02 Danh sách kiểm thử toàn sản phẩm rộng hơn MVP

**Loại:** chưa phân loại theo giai đoạn. **Chặn:** M0/M6.

**Bằng chứng:** FLOW §201 yêu cầu kiểm thử báo giá → duyệt → gửi, nhiều kênh → cùng khách hàng, Meeting → AI Summary → Task. Trong khi PRD §52 chỉ yêu cầu ít nhất một connector thật; DB §147 và API §203 hoãn approval engine và nhiều chức năng thương mại.

**Tác động:** dễ tuyên bố “đạt hết” bằng cách bỏ các luồng chưa xây, hoặc khiến MVP mở rộng không kiểm soát.

**Đề xuất cập nhật:** đối chiếu đủ 25 yêu cầu kiểm thử ở tài liệu nghiệm thu. Luồng nhiều kênh được kiểm chứng kiến trúc bằng dữ liệu mô phỏng có nhãn; không gọi đó là hai tích hợp thật. Luồng báo giá đầy đủ “tạo → duyệt → gửi” bắt buộc theo D06 đã sửa; không ghi đạt chỉ vì đã tạo mẫu/PDF. AI tóm tắt ghi chú họp cơ bản được giữ ở M5; âm thanh/ghi âm để sau.

### R03 Mã màn hình Chatbot Knowledge AI thay đổi

**Loại:** mâu thuẫn mã định danh. **Chặn:** M1. **Người xử lý:** Codex/kỹ thuật.

**Bằng chứng:** PRD §27–30 dùng Chatbot List/Detail/Flow `SCR-150/151/152`, Knowledge `SCR-160/161`, AI Workspace `SCR-170`. UI §57–64 dùng `SCR-500/501/520`, §83–84 dùng `SCR-700/701`, §71 dùng `SCR-600`.

**Đề xuất:** dùng hệ mã UI làm chuẩn và lưu bảng chuyển đổi. Đây là chuẩn hóa tham chiếu, không cần Giám đốc sản phẩm chọn số màn hình.

### R04 Đường dẫn và phương thức API chưa thống nhất

**Loại:** mâu thuẫn hợp đồng. **Chặn:** M2–M5. **Người xử lý:** Codex/kỹ thuật.

**Bằng chứng:** UI §135–141 dùng `/api/...`, API §6–7 yêu cầu `/api/v1`. UI §137 dùng `PATCH /api/opportunities/:id/stage`; API §35 dùng `POST /api/v1/opportunities/:id/change-stage`. UI §135 dùng `/api/home/summary`; API §113 dùng `/api/v1/dashboard/home`. UI §140 đặt suggest-reply/customer-summary dưới `/ai`; API §64,86 đặt dưới conversation/organization. Ngay API §11,15,181 có ví dụ đường dẫn rút gọn.

**Đề xuất:** một danh mục endpoint được chốt trước mỗi mốc, phân biệt đường dẫn minh họa và đường dẫn thực. Dùng API chi tiết làm cơ sở; không tạo hai API cùng nghiệp vụ chỉ để khớp cả hai tài liệu. UI §141 có knowledge search/test chung trong khi API §95–96 chia endpoint theo KB và dịch vụ nội bộ; cần ánh xạ rõ.

### R05 Trạng thái handoff và tên trường AI khác nhau

**Loại:** mâu thuẫn tên/trạng thái. **Chặn:** M4–M5. **Người xử lý:** Codex/kỹ thuật.

**Bằng chứng:** PRD §22 kết thúc handoff bằng `CLOSED`, có `closed_at`, `summary`; DB §65 dùng `RESOLVED`, thêm `CANCELLED`, có `resolved_at`, `ai_summary`. UI §68 dùng nhãn `Active`, còn DB dùng `ACCEPTED`. PRD §9 dùng `model_id`, loại `SALES_ASSISTANT/MEETING_ASSISTANT/WRITING_ASSISTANT`; DB §71 dùng `default_model_id`, `SALES/MEETING/WRITING`.

**Đề xuất:** bảng trạng thái chuẩn theo DB, ánh xạ nhãn giao diện thân thiện; `Active` là nhãn của `ACCEPTED` nếu được xác nhận. Phân biệt “giải quyết yêu cầu chuyển người” và “đóng hội thoại”, không gộp hai hành động. Các tên AI dùng DB làm cơ sở và ghi rõ mapping.

### R06 Thứ tự lưu và gửi tin nhắn mô tả khác nhau

**Loại:** mâu thuẫn thứ tự ở sơ đồ. **Chặn:** M3.

**Bằng chứng:** PRD §24 và FLOW §11/FLOW 09 mô tả Send Response → Save Message. DB §157, FLOW §21/FLOW 19, API §54 và §204 yêu cầu tạo/lưu tin nhắn và đưa vào hàng đợi trước khi gửi.

**Tác động:** gửi thành công nhưng chưa lưu có thể làm mất lịch sử; thử lại có thể gửi trùng.

**Đề xuất:** chuẩn hóa “lưu ý định gửi + trạng thái chờ → hàng đợi → gửi → cập nhật kết quả”; sơ đồ Chatbot cũng gọi cùng dịch vụ gửi. Ghi nhận trạng thái chưa chắc chắn khi nhà cung cấp timeout, không tự đánh dấu gửi thành công.

## B. Dữ liệu chưa đủ để thực hiện luồng

### R07 Một Chatbot nhiều kho tri thức chưa có quan hệ đầy đủ

**Loại:** chưa đồng bộ. **Chặn:** M4.

**Bằng chứng:** UI §61 cho gắn một hoặc nhiều Knowledge Bases. DB §71 chỉ có một `knowledge_base_id` trên assistant; DB §57 không có liên kết Chatbot–KB riêng. API §96 nhận danh sách KB nhưng chưa mô tả lưu cấu hình danh sách đó.

**Đề xuất:** bổ sung quan hệ nhiều kho và quyền truy cập rõ ràng. Giao diện MVP có thể bắt đầu với một kho công khai đã duyệt, nhưng phải ghi đây là giới hạn MVP; không để nhiều lựa chọn trên UI mà chỉ lưu được một.

### R08 Phiên Chatbot chưa ghim phiên bản flow đang chạy

**Loại:** chưa đồng bộ. **Chặn:** M4.

**Bằng chứng:** FLOW §58/FLOW 56 yêu cầu phiên hiện tại tiếp tục phiên bản cũ khi publish bản mới. DB §59 có `current_flow_id`, `current_node_id`, nhưng không chỉ rõ `flow_version_id`; DB §63 có bảng phiên bản.

**Đề xuất:** lưu định danh phiên bản bất biến trên phiên Chatbot, kiểm thử v1 đang chạy trong khi v2 được publish. Không chỉ tìm “flow mới nhất” ở mỗi tin nhắn.

### R09 Chưa truy ngược đầy đủ phiên bản prompt và cấu hình AI

**Loại:** chưa đồng bộ. **Chặn:** M5.

**Bằng chứng:** FLOW §88/FLOW 86 yêu cầu truy được prompt cũ của lần chạy cũ; DB §122 có prompt versions nhưng `ai_executions` §123 không nêu prompt version. FLOW §135–136/FLOW 133–134 yêu cầu cấu hình bot/assistant Save Draft → Test → Publish; DB §57,71 chỉ có bản ghi cấu hình hiện hành, chưa tách rõ bản nháp/bản công bố.

**Đề xuất:** đặc tả snapshot/phiên bản cấu hình và liên kết mỗi lần chạy đến prompt, model, cấu hình, phiên bản tri thức. Không cần một giao diện quản trị phiên bản phức tạp ở MVP, nhưng bằng chứng truy xuất phải tồn tại.

### R10 Team và phạm vi quyền chưa có mô hình hoàn chỉnh

**Loại:** chưa đồng bộ và thiếu quyết định. **Chặn:** M2. **Quyết định:** D04.

**Bằng chứng:** DB §52,65,126 tham chiếu `assigned_team_id/from_team_id/to_team_id`; API §13,127 yêu cầu phạm vi TEAM. DB §9–14 có users, departments, roles nhưng chưa định nghĩa teams/team_members hoặc nơi lưu scope gắn với quyền. `agent_queues` không tự đồng nghĩa với đội sales.

**Cập nhật D04:** người dùng đã chốt sales chỉ xem khách được giao, quản lý xem cả nhóm mình quản lý. Kỹ thuật quyết định ánh xạ nhóm/phòng ban và lưu phạm vi quyền; còn cần hoàn thiện quyền thao tác và thành viên nhóm. MVP có thể dùng nhóm nhỏ dưới phòng ban nhưng phải định nghĩa rõ, không chỉ ẩn menu. Tìm kiếm và AI phải giữ cùng phạm vi xem đã chốt.

### R11 Liên kết hội thoại với cơ hội bán hàng còn mơ hồ

**Loại:** chưa đồng bộ. **Chặn:** M3.

**Bằng chứng:** PRD §26, UI §32,51 và FLOW §19/FLOW 17 yêu cầu thấy Opportunity trong hội thoại và Conversations trong Opportunity. DB §52 không có `opportunity_id` hay bảng nối hội thoại–cơ hội được định nghĩa riêng.

**Tác động:** một công ty có nhiều cơ hội, hệ thống không biết tin nhắn thuộc giao dịch nào; AI có thể dùng nhầm nội dung.

**Đề xuất:** kỹ thuật bổ sung quan hệ tường minh; cho nhân viên xác nhận cơ hội liên quan. Không suy ra duy nhất từ `organization_id`. Nếu cho một hội thoại liên quan nhiều cơ hội, phải chốt hành vi hiển thị và ngữ cảnh AI.

### R12 Tài liệu sẵn sàng tìm kiếm chưa đồng nghĩa được phép công bố

**Loại:** thiếu vòng đời tri thức. **Chặn:** M4. **Quyết định:** D08.

**Bằng chứng:** PRD §46 yêu cầu Approved Knowledge Base; API §130–131 yêu cầu status/effective date/scope và kho công khai đã duyệt. FLOW §52/FLOW 50 kết thúc xử lý bằng `READY`; DB §83 có document_status/effective dates nhưng chưa nêu trạng thái duyệt và người duyệt/công bố.

**Đề xuất:** tách “xử lý xong” khỏi “được phép dùng”; bản tải lên không tự thành nguồn trả lời công khai. Có người chịu trách nhiệm nội dung, phiên bản hiệu lực và thao tác thu hồi.

### R13 Danh sách bảng MVP bỏ sót phụ thuộc của chính chức năng MVP

**Loại:** danh sách triển khai chưa đầy đủ. **Chặn:** từng mốc M3–M5.

**Bằng chứng:** DB §146 có chatbot_sessions/handoffs nhưng không liệt kê chatbot_flows/flow_versions; có AI tools nhưng thiếu ai_tool_calls, ai_audit_logs, ai_executions, credentials, prompt versions; có knowledge_documents nhưng thiếu knowledge_base_permissions/document_versions. Các bảng này được định nghĩa ở phần khác và luồng/API yêu cầu chúng.

**Đề xuất:** lấy chức năng đã chốt làm đầu vào, lập danh sách bảng phụ thuộc cho từng mốc. Không coi §146 là danh sách đủ, cũng không tạo toàn bộ schema 176 mục ngay chỉ vì có trong tài liệu.

### R14 Trạng thái và vòng đời nghiệp vụ chưa được đóng thành quy tắc

**Loại:** thiếu đặc tả. **Chặn:** M2–M5. **Quyết định:** D05, D07.

**Bằng chứng:** DB §28 có `status` và `qualification_status`; §32 có `status` cùng `stage_id`; §52 có trạng thái hội thoại/bot_mode. FLOW §24/FLOW 22 mô tả chuyển Lead tạo Opportunity; API §31 có cờ `opportunity.create` nhưng chưa giải thích trường hợp false. UI §24 luôn điều hướng sang Opportunity. FLOW §61/FLOW 59 cho chọn mở lại hoặc tạo hội thoại mới; §119–120 mô tả timeout/resume nhưng chưa định lượng.

**Đề xuất:** bảng chuyển trạng thái: ai được chuyển, dữ liệu bắt buộc, side effect, trường hợp lỗi, mở lại và lịch sử. Nếu cho chuyển Lead mà không tạo Opportunity, cần điểm điều hướng khác. Quy định stage nào ghi nhận thắng/thua và tránh `status` mâu thuẫn với stage.

## C. Khoảng trống kinh doanh và vận hành

### G01 Chân dung người dùng và mục tiêu thành công

PRD §1,54 nêu tầm nhìn và vai trò, nhưng chưa chốt nhóm thử nghiệm, số người dùng, ngành ưu tiên, vấn đề cần cải thiện và chỉ số đích. Tệp mang tên PRD thực tế thiên về kiến trúc. Cần D01, D02, D09; không tự suy từ các ví dụ “150 user”, “480 triệu” thành dữ liệu doanh nghiệp.

### G02 Khách cá nhân và người làm việc cho nhiều tổ chức

DB §25 cho Contact không có Organization, nhưng §32 yêu cầu Opportunity có Organization; API §23 Customer 360 nằm dưới Organization. FLOW §179/FLOW 177 giữ lịch sử khi người liên hệ rời công ty, nhưng DB chưa mô tả lịch sử quan hệ làm việc. **D02 đã chốt cả doanh nghiệp và cá nhân** trong cuộc trò chuyện. Vì vậy đây là khoảng trống bắt buộc giải quyết trước M2: Customer 360, Opportunity, chuyển Lead, hoạt động và AI đều phải hỗ trợ B2C; không tạo “công ty giả”. Một người có thể là người liên hệ B2B đồng thời mua cá nhân; danh tính có thể dùng chung nhưng ngữ cảnh giao dịch phải tách đúng. Quyết định của người dùng mới hơn được ưu tiên hơn giả định B2B trong nguồn.

### G03 Trùng khách hàng và xác minh danh tính

DB §104–116, FLOW §10/FLOW 08, §114/FLOW 112 có chuẩn hóa và human merge; chưa định nghĩa bằng chứng xác minh, ngưỡng auto-link, trường hợp số điện thoại dùng chung/đổi chủ, và quyền override trùng. API §27 trả `confidence: 0.98` là ví dụ, không phải ngưỡng được chốt. Kết quả tìm trùng cũng phải theo quyền, không làm lộ hồ sơ người khác. Đề xuất tự liên kết bằng định danh kênh đã xác thực, còn số/email tự khai chỉ gợi ý cho nhân viên; merge do người có quyền xác nhận. D04 quyết định ai được xử lý.

### G04 Đồng ý liên hệ với khách chưa thành Contact

DB §117 lưu consent trên Contact; DB §52 cho hội thoại chỉ gắn Lead. FLOW §21/FLOW 19 yêu cầu kiểm tra consent cho gửi đi, còn §84/FLOW 82 nhấn mạnh marketing. Chưa rõ phản hồi yêu cầu khách, nhắn chủ động và bot FAQ được áp dụng khác nhau thế nào; Lead/khách vô danh ghi bằng chứng ở đâu. D07 chốt chính sách nghiệp vụ; kỹ thuật phải áp dụng cùng chính sách cho người, bot, automation. Không mặc định “khách đã nhắn = đồng ý mọi marketing”.

### G05 AI tự gửi FAQ và AI nháp cho nhân viên

PRD §44 mặc định duyệt gửi tin/Email nhưng cho cấu hình ít rủi ro; DB §160 cho bot tự trả lời FAQ. Đây là ngoại lệ có thể dung hòa, không phải cấm toàn bộ bot tự trả lời. Cần ma trận: FAQ công khai được tự trả lời; AI nháp sales phải bấm gửi; tạo Task từ Copilot phải xác nhận; thay giá, ký hợp đồng, thanh toán bị chặn trong MVP. D07–D08 xác nhận ranh giới.

### G06 Chuyển người xử lý và làm việc ngoài giờ

FLOW §16–18,59 mô tả routing/handoff; DB §65–67 có queue nhưng chưa có giờ làm việc, sự hiện diện nhân viên, thời gian chờ, người dự phòng, trường hợp hai người cùng nhận. D07 cần quy định ai nhận và lời hẹn ngoài giờ. Kỹ thuật xử lý khóa giao dịch để chỉ một người nhận; AI lỗi không được chặn handoff.

### G07 Các chức năng giao diện chưa có hợp đồng dữ liệu/API riêng

UI §109–111 và FLOW §75/FLOW 73 có Saved Views nhưng DB/API chưa đặc tả riêng cách lưu và chia sẻ. Notes có DB §89, UI và FLOW §110,184–185 nhưng API chưa mô tả endpoint notes; Audit mới có trong nhóm tổng hợp API §201, chưa đủ route/schema đọc nhật ký. Bulk assign/tag, khôi phục Contact/Lead, quản lý consent/DNC, một số thống kê cũng cần hợp đồng cụ thể. Saved Views chia sẻ, bulk và segments có thể hoãn; Note, audit và consent tối thiểu phải bổ sung cho mốc có sử dụng.

### G08 Chống trùng tin nhắn và chống mất sự kiện

DB §132 đưa index thường cho `(channel_id, external_message_id)`; API §124 yêu cầu unique. DB §155 đã yêu cầu không nhân đôi nên đây là thiếu ràng buộc trong ví dụ schema, không phải thiếu nguyên tắc. Cần unique thích hợp, quy tắc ID rỗng, phân biệt retry của cùng sự kiện và hai sự kiện khác nhau cho một message. API §176–178 đề xuất outbox nhưng chưa thuộc schema DB; kỹ thuật cần đảm bảo sự kiện Timeline/handoff không mất khi worker khởi động lại.

### G09 Bộ lọc tri thức và dữ liệu AI phải nhất quán

API §130 yêu cầu lọc trước vector retrieval; sơ đồ §207 và FLOW §55/FLOW 53 còn có Metadata Filter sau Vector Search. Có thể là lọc nhiều tầng, chưa đủ căn cứ kết luận sai quyền; cần đặc tả điểm lọc tenant/quyền/hiệu lực ngay tại truy vấn tìm kiếm. DB §77 lưu insight dùng chung entity, nhưng chưa quy định insight sinh cho quản lý có được trả lại cho sales không. Kiểm tra quyền khi sinh, lưu, đọc lại, mở nguồn và khi quyền thay đổi; không đưa bản tóm tắt chứa dữ liệu cấm cho người khác.

### G10 Định nghĩa các con số báo cáo

UI §93–97 có Won Revenue, Forecast, Win Rate, Bot Resolution, Conversion nhưng chưa thống nhất mẫu số, khoảng ngày, tiền tệ và cách loại dữ liệu thử. Won value không mặc nhiên là tiền đã thu. Đề xuất công thức MVP ở tài liệu kế hoạch; D09 xác nhận mục tiêu kinh doanh, kỹ thuật hiện công thức và truy xuống bản ghi.

### G11 Mức tải tốc độ và chất lượng AI chưa có ngưỡng

UI §147, API §143,183–186 nêu hiệu năng/kiểm thử nhưng không có số người đồng thời, dữ liệu, thời gian đáp ứng hoặc bộ đáp án nghiệp vụ. Đề xuất bộ tải và ngưỡng đo ở tài liệu nghiệm thu, ghi rõ là mục tiêu thử nghiệm chờ chốt D09, không phải cam kết khả năng đã có.

### G12 Nhập dữ liệu và vận hành chưa có đầu vào cụ thể

FLOW §73/FLOW 71 mô tả import; chưa có tệp mẫu, số lượng, chủ sở hữu hồ sơ, cách xử lý dòng lỗi, dữ liệu nào cần mang sang. DB §161–162 có retention/backup nhưng chưa có thời hạn lưu, mức mất dữ liệu chấp nhận, thời gian khôi phục hoặc người trực lỗi. D10–D12 cần chốt trước pilot; quy định quyền riêng tư cần người phụ trách doanh nghiệp xác nhận, báo cáo này không kết luận nghĩa vụ pháp lý cụ thể.

### G13 Mô tả API và schema chưa phải đặc tả có thể thực thi

API §188 yêu cầu request/response/error schemas nhưng phần lớn endpoint hiện mới là tên đường dẫn; DB nhiều trường chưa chốt required/default/check constraint. Chưa có hợp đồng lỗi cho trùng, chuyển trạng thái sai, sửa cùng lúc, gửi lặp và truy cập hết quyền. Đây là việc Codex/kỹ thuật phải hoàn thiện theo từng mốc; không yêu cầu Giám đốc sản phẩm viết OpenAPI hay thiết kế khóa ngoại.

## Những điểm thống nhất nên giữ

- Cùng Organization/Contact/Conversation, không tạo danh bạ riêng cho Chatbot hoặc AI: PRD §3, DB §2–3, UI §161, FLOW §1, API §1.
- Đổi kênh không bắt buộc cùng một Conversation: FLOW §176/FLOW 174 nói rõ tạo Conversation mới nhưng cùng Contact/Customer 360. Không xem “One Conversation History” là yêu cầu gộp mọi kênh vào một bản ghi.
- Không phải mỗi tin nhắn tạo một Activity: DB §112, FLOW §153/FLOW 151. Nên nhóm tương tác có ý nghĩa.
- CRM vẫn hoạt động khi AI/kênh lỗi: UI §126–127, API §194–195.
- Giao diện ẩn nút không thay thế kiểm tra quyền ở máy chủ: UI §107, FLOW §71–72, API §126–129.
- AI tạo nháp và gửi tin là hai bước; bot công khai chỉ được dùng dữ liệu được phép: DB §158–160, API §64,131.

## Thứ tự giải quyết

| Trước mốc | Cần hoàn thành | Người quyết định/xử lý |
|---|---|---|
| M0 | R01–02, G01–02; chốt D01–D06 và nguyên tắc D07–D08 | Giám đốc sản phẩm + Codex ghi lại |
| M1 | R03; tiêu chí giao diện và luồng chính | Codex đề xuất, người dùng thử nghiệm thu |
| M2 | R04 phần CRM, R10, R14; quyền, chuyển Lead, chuẩn hóa, ownership | Codex/kỹ thuật dựa trên D04–D05 |
| M3 | R06, R11, G03–04, G06–08; kênh thật và quyền công khai | Codex/kỹ thuật + người quản lý kênh |
| M4 | R05 handoff, R07–08, R12–13; tri thức và bot | Codex/kỹ thuật + người duyệt nội dung |
| M5 | R05 AI, R09, G05, G09–11; AI và báo cáo | Codex/kỹ thuật + người nghiệm thu nghiệp vụ |
| M6 | G11–13, D09–D12, mọi lỗi chặn pilot | Chủ sản phẩm + người phụ trách kỹ thuật/vận hành |

Phát hiện nêu trên là danh sách vấn đề triển khai được từ việc đọc nguồn, không phải chứng nhận tài liệu đã đầy đủ cho mọi tình huống có thể phát sinh. Các thay đổi nguồn sau 18/09/2026 phải được đối chiếu lại bằng manifest.
