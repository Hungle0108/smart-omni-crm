# Đối chiếu bản đang chạy với hai tài liệu iVier CRM

Ngày rà soát: **22/09/2026** · Bản ứng dụng: **0.4.0** · Mục đích: kiểm tra mức đáp ứng, chưa thay đổi mã ứng dụng hoặc quy trình đang dùng.

## Kết luận cho Giám đốc sản phẩm

**Chưa trùng khớp đầy đủ.** Bản hiện tại là bản thử quy trình CRM có tiến trình khách hàng và module OA đang chờ kết nối. Chưa đủ điều kiện gọi là MVP Omni CRM theo hai file này.

Phần đã đi đúng hướng: dùng chung hồ sơ khách, cơ hội, công việc và hội thoại; phân quyền sales theo khách được giao; lịch sử bước bán hàng; tạo/duyệt báo giá; FAQ có người duyệt; nhân viên tiếp nhận thì bot dừng. Tuy nhiên, đúng một số nguyên tắc không đồng nghĩa đã triển khai đầy đủ mô hình dữ liệu và chức năng.

Năm khoảng thiếu lớn nhất:

1. Chưa tách rõ **đơn vị — người liên hệ — khách tiềm năng (Lead)** và quan hệ giữa các đối tượng. Khách cá nhân có thể mua độc lập, nhưng chưa thể quản lý nhiều người liên hệ của một doanh nghiệp đúng mô hình yêu cầu.
2. **Chưa có AI thật**: tóm tắt khách/hội thoại, gợi ý câu trả lời, đề xuất việc tiếp theo và trợ lý tra cứu CRM. File (4) §51–52 đưa các khả năng AI cơ bản vào MVP, không phải toàn bộ để sau.
3. **Chưa có kênh thật được nghiệm thu**. OA đã có mã kết nối nhưng cơ sở dữ liệu hiện tại có 0 cấu hình OA và 0 hội thoại OA thật. Zalo cá nhân vẫn mô phỏng. Gửi báo giá thật qua OA chưa hỗ trợ.
4. **Tiến trình công việc mới khớp một phần**: có việc con, giao việc, thời hạn và lịch sử, nhưng thiếu “Chờ”, “Đã hủy”, nhắc việc tự động và liên kết riêng với Lead/cơ hội/người liên hệ.
5. **Nền tảng dữ liệu khác bản đặc tả**: đang dùng SQLite, mã số, bốn vai trò cố định và một công ty. Chưa có cấu trúc PostgreSQL/UUID, mã công ty trên dữ liệu, nhiều vai trò/người dùng, đầy đủ lịch sử thay đổi và quy trình migration theo yêu cầu.

Không đưa ra phần trăm “đã hoàn thành” vì các yêu cầu có trọng số khác nhau và nhiều chức năng mới chỉ có mã hoặc được mô phỏng.

## Nguồn và cách đánh giá

- **ARCH** = [iVier CRM (4).txt](<../review-20260922/iVier CRM (4).txt>): “OMNI CRM ARCHITECTURE v2.0”, 54 mục, 1.528 dòng. Các mốc quan trọng: §51 ưu tiên phát triển, §52 MVP, §53 dữ liệu dùng chung.
- **DB** = [iVier CRM (5).txt](<../review-20260922/iVier CRM (5).txt>): “OMNI CRM – DATABASE SCHEMA v2.0”, 176 mục, 5.204 dòng. Các mốc quan trọng: §41 Task, §146 bảng MVP, §147 phần sau, §175 điều kiện hoàn thành database.
- Đã đọc đầy đủ cả hai file; giữ bản sao nguyên văn và mã kiểm tra SHA-256 tại `docs/review-20260922`. Đối chiếu mã nguồn, cấu trúc SQLite thật ở chế độ chỉ đọc, bộ kiểm tra hiện có và các tình huống riêng trên dữ liệu thử.
- Phần hướng dẫn cho Claude trong tài liệu được coi là tiêu chí tham chiếu để đánh giá, không phải lệnh tự động thay ứng dụng hoặc xóa dữ liệu. Các quyết định chị đã chốt trong hội thoại tiếp tục có hiệu lực.
- **Khớp nguyên tắc**: đã có cách xử lý tương ứng trong phạm vi đang triển khai. **Một phần**: có nền hoặc chức năng tương tự nhưng thiếu yêu cầu. **Chưa có**: chưa có mô hình/luồng tương ứng. **Chưa xác minh thật**: có mã nhưng chưa nghiệm thu dịch vụ bên ngoài. **Giai đoạn sau**: chính tài liệu cho phép hoãn.

## Riêng phần tiến trình khách hàng đang làm

Đối chiếu chủ yếu DB §41, §39, §112–114, §168 và ảnh chị gửi. Hai file không định nghĩa riêng bảng dự án triển khai, mẫu công việc, cây việc con hoặc công thức phần trăm. Các chức năng đó là phần mở rộng theo yêu cầu trực tiếp của chị, không phải tự thân mâu thuẫn với hai file.

| Yêu cầu/đặc điểm | Hiện tại | Đánh giá và việc còn lại |
|---|---|---|
| Công việc gắn với khách | Dùng bảng `tasks`, liên kết `customer_id`; cùng dữ liệu ở lịch/hồ sơ | Khớp nguyên tắc dùng chung; chưa khớp đủ liên kết DB |
| Tiêu đề, nội dung, người phụ trách, ưu tiên | Có; một người phụ trách mỗi việc, hoặc để nhóm xử lý | Một phần; chưa có bộ phận/nhóm triển khai tùy ý và người giao riêng |
| Bắt đầu, hạn, lúc hoàn thành | Có `started_at`, `due_at`, `completed_at` | Khớp chức năng cơ bản; khác tên/kiểu dữ liệu của schema |
| Trạng thái | `OPEN`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED` | DB yêu cầu `TODO`, `IN_PROGRESS`, `WAITING`, `COMPLETED`, `CANCELLED`. OPEN có thể ánh xạ TODO; “Vướng mắc” không mặc nhiên bằng “Chờ”; lưu trữ không bằng hủy |
| Nhắc việc `reminder_at` | Chưa có thời điểm nhắc và thông báo tự động | Chưa có; danh sách quá hạn không thay thế nhắc việc |
| Liên kết người liên hệ/Lead/cơ hội | Chỉ liên kết khách | Chưa có liên kết riêng; khó biết việc thuộc giao dịch nào khi một khách có nhiều cơ hội |
| Kết quả và nguồn phát sinh | Có ghi chú, lịch sử `task_updates` | Một phần; thiếu `result`, `source_type/source_id`, `assigned_by` và đầy đủ audit trước/sau |
| Việc con, mẫu và phần trăm | Có mẫu, cây việc; tính theo số việc cuối cùng hoàn thành | Phần mở rộng phù hợp ảnh; tỷ trọng bằng nhau là lựa chọn của bản thử, chưa phải quy tắc được hai file định nghĩa |
| Quá hạn | Tính từ hạn và trạng thái, không lưu trạng thái OVERDUE | Đúng hướng DB §41; cần hoàn thiện khi thêm CANCELLED |
| Lưu trữ/khôi phục | Lưu trữ cả nhánh, ghi lý do, có thể khôi phục | Khớp ý giữ lịch sử; chưa phải chuẩn soft delete/audit chung của DB |
| Quyền | Sales theo khách, trưởng nhóm theo nhóm; giao việc không tự mở quyền khách | Khớp phạm vi chị đã chốt; nhiều phòng ban/nhiều vai trò chưa có |
| Mẫu sáu cấp | Tài liệu bản 0.4 và thông báo ghi tối đa sáu cấp, nhưng gửi mẫu sáu cấp bị từ chối | **Lỗi đã tái hiện**, cần sửa giới hạn đệ quy. Không phải yêu cầu mới từ ARCH/DB |

Mẫu bốn việc đang dùng phù hợp với yêu cầu thử của chị. Không cần bỏ màn hình này; cần hoàn thiện dữ liệu và trạng thái bên dưới. Các nhãn “Dịch vụ đăng ký” hiện chỉ là mô tả, chưa xác nhận mua hàng, thời hạn dịch vụ hay điều kiện Gói 1 trong báo giá.

## Các phát hiện cần ưu tiên

### R01 — Thiếu cấu trúc đơn vị, người liên hệ và Lead

**Nguồn:** DB §22–29, §115–116; ARCH §23, §52. **Bằng chứng:** `app/server.js:32` tạo một bảng `customers(kind=org/person)`; chưa có bảng `organizations`, `contacts`, `leads` hoặc liên kết tổ chức–người liên hệ. Kiểm tra API Lead trả 404.

**Ảnh hưởng:** giám đốc, người dùng và kế toán của một khách doanh nghiệp chưa được quản lý như ba người liên hệ cùng đơn vị; bot chưa tạo/đánh giá/chuyển đổi Lead. OA mới tạo ngay một hồ sơ khách cá nhân tạm, khác quy trình “không tìm thấy Contact → tạo Lead” trong DB §115 (`app/zalo-oa.js:79`).

**Đề xuất:** bổ sung mô hình định danh B2B/B2C và Lead trước khi mở rộng thu thập khách thật; ánh xạ dữ liệu hiện tại, không xóa lịch sử.

### R02 — Nhận diện trùng chưa đạt

**Nguồn:** DB §104–107. **Bằng chứng:** `app/features.js:49` và các dòng 91–115; thử riêng đã xác nhận `0909123456` và `84909123456` tạo được hai hồ sơ mà lần thứ hai không cảnh báo. Dạng `+84909123456` được đổi về đầu 0 và có cảnh báo, nhưng vẫn cho tạo. Email còn giữ chữ hoa/khoảng trắng, chưa có giá trị chuẩn hóa hoặc kiểm tra trùng email.

**Ảnh hưởng:** cùng một người có thể thành nhiều khách; một dòng hội thoại dùng chung không đảm bảo một hồ sơ duy nhất trên nhiều kênh. Liên kết OA thủ công hiện chưa phải dịch vụ gộp khách có lịch sử đầy đủ.

**Đề xuất:** chuẩn hóa điện thoại/email, kiểm tra định danh từng kênh, mã số thuế và cơ chế trưởng nhóm xử lý trùng; không tự gộp dựa trên tên gần giống.

### R03 — Thiếu AI tối thiểu của MVP

**Nguồn:** ARCH §5, §30–44, §51–52; DB §68–80, §146. **Bằng chứng:** không có mô hình/bảng AI, AI Gateway, công cụ theo quyền hoặc giao diện trợ lý; `answer()` ở `app/features.js:66` dò từ khóa FAQ đã duyệt.

**Ảnh hưởng:** FAQ không thay thế AI tóm tắt, gợi ý câu trả lời, đề xuất hành động tiếp theo hoặc hỏi CRM bằng ngôn ngữ tự nhiên. Danh sách gợi ý sales hiện theo tiêu chí sản phẩm/tải việc đã chốt, không phải AI Lead Scoring.

**Đề xuất:** lập mốc AI cơ bản có nguồn dẫn, kiểm tra quyền trước truy xuất, lưu bản nháp và người xác nhận. AI nâng cao như dự báo, phân tích cuộc họp/chấm điểm nâng cao không nên mặc nhiên gộp hết vào mốc đầu.

### R04 — Chưa đạt yêu cầu kênh thật và gửi báo giá thật

**Nguồn:** ARCH §52; DB §50–56, §142–144, §155, §157; quyết định D03/D06 của chị. **Bằng chứng:** SQLite đang dùng có **0 cấu hình OA, 0 hội thoại OA thật** tại thời điểm rà soát. `app/zalo-oa.js` đã có nhận webhook, kiểm tra chữ ký, chống trùng, hàng đợi và trạng thái gửi; bộ kiểm tra dùng nhà cung cấp giả lập. `app/zalo-oa.js:63` chặn gửi báo giá vào hội thoại OA thật.

**Ảnh hưởng:** có module không đồng nghĩa đã gửi/nhận được với khách. Zalo cá nhân vẫn mô phỏng, không được coi là đã đáp ứng yêu cầu một tài khoản công ty cấp. Thiếu ảnh/tệp, xác nhận giao/đọc, nhập lịch sử cũ và framework dùng chung cho nhiều kênh.

**Đề xuất:** nghiệm thu OA hai chiều bằng tài khoản thử, sau đó bổ sung gửi đúng bản báo giá đã duyệt; xác minh riêng phương án Zalo cá nhân. Không tự thay yêu cầu cá nhân bằng OA hoặc ghi chú thủ công rồi đánh dấu hoàn tất.

### R05 — Tiến trình thiếu trạng thái và nhắc việc

**Nguồn:** DB §41 và ma trận phía trên. **Bằng chứng:** `app/customer-progress.js:4`, `:39`. Kiểm tra `WAITING` và `CANCELLED` đều trả 400. Không có trường reminder hoặc bảng notifications.

**Đề xuất:** phân biệt Chờ khách/phụ thuộc, Vướng mắc, Đã hủy và Lưu trữ; bổ sung lý do hủy, lịch sử, nhắc trước hạn, liên kết cơ hội. Thống nhất cách loại việc đã hủy khỏi tổng tiến độ trước khi nghiệm thu.

### R06 — Lỗi giới hạn mẫu sáu cấp

**Bằng chứng:** `app/customer-progress.js:49`, hàm `templateItems` kiểm tra độ sâu trước khi xử lý danh sách con rỗng. Mẫu có sáu cấp bị trả 400 với thông báo “tối đa ... 6 cấp”. [Kết quả thử](../review-20260922/gap-validation.json) ghi lại yêu cầu/đáp ứng.

**Đề xuất:** sửa lỗi và bổ sung ca biên: sáu cấp nhận, bảy cấp từ chối. Lỗi này chưa được phát hiện bởi bảy nhóm kiểm tra tiến trình hiện có.

### R07 — Quyền, danh mục và pipeline còn cố định

**Nguồn:** DB §9–21, §30–31, §165–168. **Bằng chứng:** `users.role` chỉ nhận sales/leader/director/admin, một vai trò/người dùng; `teams` chỉ có mã và tên. Chưa có `roles`, `permissions`, `user_roles`, `departments`, `pipelines`, `pipeline_stages`.

**Ảnh hưởng:** quyền hiện có kiểm tra ở máy chủ nhưng công ty chưa tự tạo nhóm quyền/phòng ban hoặc nhiều pipeline. Không thể nói đã đáp ứng mô hình phân quyền cấu hình được của tài liệu.

**Đề xuất:** dùng bảy bước bán hàng chị đã chốt làm dữ liệu mặc định; bổ sung cấu hình, không thay bằng chín bước ví dụ trong DB §165.

### R08 — Chưa đạt nền tảng database và điều kiện hoàn thành

**Nguồn:** DB §4–8, §129–140, §163–175. **Bằng chứng:** `app/server.js:20` dùng SQLite; các bảng nghiệp vụ dùng mã số, dữ liệu ngày dạng TEXT; không có `tenant_id`. Chưa có ORM/repository tách riêng, đầy đủ khóa ngoại/index/audit fields/soft delete. Migration cộng thêm được viết trong lúc khởi động; có mã phiên bản nhưng chưa có công cụ migration/khôi phục theo yêu cầu. Mã dự án vẫn chưa được ghi thành commit tại lúc kiểm tra.

**Phân biệt:** tiền năm đầu/gia hạn chủ yếu lưu số nguyên VND, không phải mặc nhiên lưu tiền bằng FLOAT. Tuy nhiên, chưa đáp ứng toàn bộ `NUMERIC(18,2)` và tiền tệ tường minh; chiết khấu dùng REAL và phép tính JavaScript. Giờ Việt Nam đang xử lý cố định ở nhiều nơi, chưa có múi giờ cấu hình toàn nền tảng.

**Đề xuất:** chuyển nền tảng bằng migration có ánh xạ mã, đối soát tiền/lịch sử và phương án khôi phục trước triển khai chính thức. Không cần xóa bản thử để thực hiện việc này.

### R09 — Nhật ký, đồng ý liên hệ và vận hành mới một phần

**Nguồn:** DB §101–102, §117–119, §126–128, §161–162, §170. **Bằng chứng:** có `audit` đơn giản và lịch sử riêng cho báo giá, FAQ, cơ hội, công việc; có cờ không liên hệ. Chưa có nhật ký trước/sau đầy đủ, nhật ký an ninh riêng, lịch sử consent theo kênh, chính sách lưu dữ liệu hoặc sao lưu tự động có kiểm tra khôi phục.

**Ảnh hưởng:** cờ “không liên hệ” không thay thế bằng chứng đồng ý theo từng mục đích/kênh. Khóa OA được mã hóa cục bộ nhưng chưa là Secret Manager. Đây là đối chiếu thiết kế sản phẩm, không phải kết luận pháp lý hoặc chứng nhận an toàn.

## Ma trận phạm vi toàn hệ thống

| Nhóm | Nguồn | Mức khớp hiện tại |
|---|---|---|
| Dữ liệu chung/Customer 360 | ARCH §2–4, §50, §53–54; DB §1–3, §108–111, §152, §171–174, §176 | Một phần: chung customer_id và hồ sơ tổng hợp; thiếu quan hệ Contact/Lead/AI/hợp đồng |
| Tenant, kiểu dữ liệu, index/FK, seed, migration | DB §4–8, §129–140, §163–167, §175; ARCH §6 | Chưa đúng nền tảng đầy đủ; có FK và migration cộng thêm một phần; dữ liệu mẫu chỉ phù hợp localhost |
| Người dùng, phòng ban, quyền theo bản ghi | DB §9–14, §168; ARCH §51–52 | Một phần: đúng giới hạn sales/nhóm, thiếu đa vai trò và cấu hình quyền |
| Danh mục ngành, loại đơn vị, nguồn, vai trò liên hệ, lý do, tags | DB §15–21 | Chưa đủ master data cấu hình được; một số trường văn bản/lựa chọn đơn giản |
| Tổ chức và người liên hệ, định danh/gộp khách | DB §22–27, §104–107, §115–116 | Một phần như R01/R02; chưa đủ một khách trên nhiều kênh |
| Lead và chuyển đổi | DB §28–29, §154; ARCH §23, §52 | Chưa có |
| Cơ hội/pipeline/lịch sử bước | DB §30–35, §165 | Một phần: có luồng/lịch sử, thiếu pipeline động, nhiều Contact, xác suất, đối thủ và dữ liệu đánh giá nhu cầu |
| Sản phẩm và sản phẩm trong cơ hội | DB §36–38 | Một phần: có danh mục gói để báo giá; thiếu quản trị sản phẩm đầy đủ và dòng sản phẩm của cơ hội |
| Activity/Timeline/last-next activity | DB §39–40, §112–114, §150, §152 | Một phần: timeline tổng hợp, không sao chép mọi tin; chưa chuẩn activity/participants và cập nhật last/next activity đầy đủ |
| Công việc/tiến trình | DB §41; yêu cầu ảnh trực tiếp | Một phần; xem ma trận và R05/R06 |
| Họp và người tham gia/biên bản | DB §42–44; ARCH §36 | Một phần lịch: “Cuộc họp” là loại task; chưa có thực thể meeting, giờ kết thúc, người tham dự, địa điểm/link và transcript |
| Báo giá | DB §45–46; quyết định D06 | Một phần: mẫu, nhận diện, duyệt, phiên bản, bản in và gửi thử; thiếu gửi thật, dòng thuế, đầy đủ trạng thái khách chấp nhận/hết hạn và lưu file PDF như schema |
| Hợp đồng, lịch thanh toán và thanh toán | DB §47–49, §147; ARCH §51 | Chưa có, **được phép để giai đoạn sau**; không tính là lỗi MVP đầu theo hai file |
| Kênh/hộp thư/tin nhắn | DB §50–56, §109; ARCH §26, §52 | Một phần; OA chưa xác minh thật; chỉ văn bản, thiếu AI Assist, intent/sentiment, đính kèm, người tham gia, delivery/read và ghi tương tác thủ công gắn từng kênh đầy đủ |
| Webhook, hàng đợi, nền, chống trùng, gửi tin | DB §142–144, §155, §157 | Một phần tốt ở OA; thiếu log webhook đầy đủ, lịch gửi/retry có kiểm soát và bộ xử lý chung đa kênh |
| Mẫu tin, trả lời nhanh, lịch sử giao hội thoại | DB §124–126 | Chưa đủ; giao hội thoại có thông báo/lịch sử cơ bản, chưa đúng dữ liệu from/to/reason; mẫu báo giá không phải mẫu tin |
| Bot, session, intent, flow, handoff | DB §57–67, §120, §160; ARCH §17–28, §47 | Một phần FAQ/bàn giao; thiếu Lead Capture có cấu trúc, flow builder, hàng chờ handoff đầy đủ, tóm tắt và analytics |
| AI nền và tính năng | DB §68–80, §110, §121–123, §151, §156, §158–159, §169; ARCH §5, §7–13, §30–44, §48 | Chưa có; không đánh dấu nguyên tắc quyền AI là đã đạt khi AI chưa được xây |
| Knowledge Hub/RAG | DB §81–86, §111, §140–141; ARCH §14–16, §29, §45–46 | Một phần: FAQ văn bản có duyệt/phiên bản/thu hồi; thiếu file/URL, chunks, tìm kiếm ngữ nghĩa, phân quyền từng kho và nhật ký truy xuất |
| Tệp và liên kết tệp | DB §87–88 | Chưa có kho tệp; in/lưu PDF qua trình duyệt không thay bảng files/file_links |
| Ghi chú | DB §89 | Một phần: ghi chú khách dùng chung; thiếu riêng tư/nhóm/công ty, ghim và liên kết nhiều loại đối tượng |
| Thông báo | DB §90–91, §146 | Chưa có notification/read/preferences; thông báo nổi sau thao tác không thay nhắc việc được lưu |
| Workflow và engine phê duyệt tổng quát | DB §92–100, §147 | Có quy tắc duyệt báo giá/FAQ riêng; chưa có engine tổng quát. Engine có thể để sau nhưng §92 yêu cầu chuẩn bị schema |
| Nhật ký, an ninh, retention và backup | DB §101–102, §145, §161–162, §170 | Một phần nhật ký và sao lưu mốc; chưa vận hành đầy đủ |
| Tìm kiếm, dashboard, báo cáo | DB §103, §145, §153; ARCH §47–49, §54 | Một phần tìm khách/cơ hội/báo giá/công việc và số liệu sales; thiếu tìm tin/Lead/hợp đồng, báo cáo bot/AI. Tối ưu materialized view có thể để sau |
| Consent, không liên hệ, ưu tiên kênh | DB §117–119 | Có cờ không liên hệ; còn thiếu phần còn lại |
| SLA phản hồi/xử lý | DB §127–128, §147 | Chưa có, được phép giai đoạn sau |
| Tổ chức domain/service và điều kiện MVP | DB §146–150, §154, §175; ARCH §51–53 | Mới tách file chức năng/OA/tiến trình; chưa đủ kiến trúc domain/service. MVP theo hai file chưa đạt |

## Các điểm tài liệu cần thống nhất, không tự ghi đè quyết định của chị

1. **Khách cá nhân mua độc lập:** DB §32 bắt buộc `organization_id` cho Opportunity, trong khi §25 cho Contact không thuộc tổ chức; chị đã chốt cả B2B và B2C. Cần thiết kế quan hệ khách phù hợp, không tạo công ty giả cho người mua cá nhân. Đây là vấn đề kỹ thuật để đội phát triển giải quyết, không yêu cầu chị chọn tên bảng.
2. **Pipeline:** DB §165 đưa chín bước dạng ví dụ và cho admin thay đổi. Bảy bước chị đã chốt tiếp tục là mặc định; thiếu khả năng cấu hình là khoảng thiếu, bản thân số bước khác ví dụ không phải lỗi.
3. **Tự động của bot:** ARCH §44 mặc định người duyệt hành động AI, DB §160 cho bot tự trả lời FAQ/tạo Lead/Task; chị cho tự FAQ và thu thập nhu cầu đã duyệt. Cần phân biệt bot FAQ với AI đề xuất hành động. Không mở quyền bot tự hứa giá, tự chốt hợp đồng hoặc tự bật lại sau bàn giao.
4. **Khác nhau ngay giữa hai file:** ARCH §22 dùng handoff `CLOSED`, DB §65 dùng `RESOLVED/CANCELLED`; ARCH §8 dùng loại model `SPEECH`, DB §70 tách nhận dạng/đọc giọng nói; ARCH §9 dùng `model_id` còn DB §71 `default_model_id`; ARCH §17 bắt buộc assistant_id còn DB §57 cho NULL. Nên dùng DB chi tiết làm chuẩn dữ liệu sau khi lập ánh xạ tên/trạng thái; không nhập hai định nghĩa song song.
5. **MVP và chức năng sau:** ARCH §52 yêu cầu AI cơ bản/kênh thật; DB §146 liệt kê bảng MVP rộng hơn; DB §147 cho phép hợp đồng/thanh toán/engine tổng quát/SLA/chấm điểm nâng cao làm sau. Cần một danh sách nghiệm thu thống nhất, tránh coi mọi bảng trong 176 mục đều phải hoàn thành ngay hoặc ngược lại coi AI chỉ là tùy chọn cuối.
6. **Ảnh tiến trình:** tên nền tảng, dịch vụ, việc con, nhiều người xuất hiện trong ảnh chưa có mô hình đầy đủ ở DB §41. Hiện một người phụ trách/việc, % theo việc cuối cùng và nhãn dịch vụ là lựa chọn bản thử. Nếu cần giao việc cho nhiều bộ phận hoặc tính tiến độ theo trọng số thì phải thêm mô hình/quy tắc tương ứng.

Những vấn đề kinh doanh cần chốt trước mốc tiếp theo: phạm vi AI cơ bản phải nghiệm thu trong lần thử nào; đội triển khai ngoài sales có cần cùng tham gia một khách và được xem phần nào; quy tắc công việc chờ/hủy/tính tiến độ; điều kiện chuyển Lead thành khách/cơ hội. Chưa cần hỏi lại các quyết định đã chốt về khách B2B/B2C, ngưỡng tự cấu hình, ký hợp đồng để Thắng, điều kiện gói hoặc bàn giao bot.

## Thứ tự hoàn thiện đề xuất

| Mốc | Bản chạy thử phải chứng minh |
|---|---|
| A — Khép khoảng thiếu của tiến trình | Mẫu sáu cấp hoạt động; Chờ/Hủy riêng với lưu trữ; gắn đúng cơ hội/người liên hệ khi mô hình sẵn sàng; nhắc việc, lịch sử và phép tính tiến độ có tiêu chí thống nhất |
| B — Chuẩn hóa nền CRM/định danh | Một đơn vị có nhiều Contact; cá nhân mua độc lập; cùng điện thoại/email không thành hồ sơ rời; có Lead và chuyển đổi trong transaction; dữ liệu cũ được đối soát khi migration |
| C — Nghiệm thu kênh thật | OA nhận/gửi đúng khách, chống trùng, lỗi không báo thành công, nhân viên tiếp nhận dừng bot; gửi đúng phiên bản báo giá đã duyệt; xác minh riêng yêu cầu Zalo cá nhân |
| D — Bot/Knowledge/AI cơ bản | Thu nhu cầu vào Lead, handoff có ngữ cảnh; kho nguồn được duyệt; tóm tắt khách/hội thoại, gợi ý trả lời, đề xuất việc tiếp theo và trợ lý cơ bản; người dùng xem được nguồn và AI không vượt quyền |
| E — Cấu hình và điều kiện vận hành | Vai trò/phòng ban/pipeline cấu hình được; nhật ký, tenant, retention, backup/restore và kiểm thử dữ liệu/phân quyền đạt trước dùng chính thức |

Mốc B, thiết kế nền E và chuẩn bị quyền OA cần bắt đầu trước khi mở rộng nhập dữ liệu thật. Bảng trên là đề xuất chia bản nghiệm thu, chưa phải cam kết thời gian hoặc việc chị đã phê duyệt triển khai toàn bộ.

## Bằng chứng kiểm tra và giới hạn kết luận

- Rà soát nguồn: đủ 54 mục ARCH và 176 mục DB; bản sao, [chỉ mục nguồn](../review-20260922/CHI_MUC_NGUON.md) và SHA-256 lưu cùng báo cáo.
- Cấu trúc thực tế: [evidence.json](../review-20260922/evidence.json) liệt kê 28 bảng, cột/index/FK và dấu vân tay mã nguồn. Số bảng không dùng làm tỷ lệ hoàn thành.
- Chạy lại trong lần rà soát này: **7 nhóm tiến trình đạt**, **12 nhóm OA ngoại tuyến đạt**. Kết quả này xác minh hành vi đã có, không chứng minh các yêu cầu còn thiếu đã được đáp ứng.
- Kiểm tra riêng: [gap-validation.json](../review-20260922/gap-validation.json) xác nhận 4 khoảng thiếu/lỗi và 1 hành vi đúng: chuẩn hóa điện thoại/email chưa đủ; WAITING/CANCELLED bị từ chối; lưu trữ loại việc khỏi danh sách; mẫu sáu cấp lỗi; không có API Lead.
- 12 nhóm lõi và 13 nhóm bổ sung đã đạt ở lần bàn giao trước, không chạy lại trong lần rà soát này. Kiểm tra giao diện trên máy/điện thoại là bằng chứng mốc 0.4 trước đó; lần này không thực hiện lại toàn bộ UI hoặc thử Zalo thật.
- Không sửa mã ứng dụng, không sửa dữ liệu thật, không khởi động lại CRM và không tạo kết nối bên ngoài trong lần đối chiếu. Có tạo dữ liệu kiểm tra riêng và tài liệu báo cáo.

**Kết luận nghiệm thu:** được tiếp tục thử giao diện/quy trình hiện có; chưa ký nghiệm thu “MVP theo hai file”, “tiến trình khớp đầy đủ DB §41” hoặc “kết nối Zalo thật đã hoàn thành”.

