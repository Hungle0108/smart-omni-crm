# SPRINT COMPLETION REPORT — bản localhost 0.2.0

Ngày: 21/09/2026. Phạm vi được giao: làm web localhost để người dùng kiểm thử quy trình từ tài liệu/quyết định đã có; sau đó dùng file CLAUDE.md mới làm reference. Đây là báo cáo mốc chạy thử, **không phải xác nhận hoàn thành Sprint 00–18 hoặc MVP tích hợp thật**.

Đường dẫn bản đang kiểm tra: **http://127.0.0.1:3000**. Máy có một tiến trình khác lắng nghe cổng 3000 qua IPv6, trả trang cũ khi gọi `localhost/health`; dùng địa chỉ IPv4 trên để mở đúng bản. Không dừng tiến trình khác đó hoặc xoá dữ liệu để xử lý xung đột.

## 1. Implemented — đã triển khai

- Kế thừa mã ứng dụng và dữ liệu hiện có, mở rộng trên cùng hồ sơ khách hàng. Giữ 5 tài khoản mẫu, khách, cơ hội, báo giá và lịch sử đã có.
- Đăng nhập thực bằng máy chủ, kiểm tra quyền khi gọi API; sales chỉ khách được giao, trưởng nhóm chỉ nhóm mình. Admin quản trị cấu hình; giám đốc đọc báo giá thuộc lượt duyệt của mình, không mặc nhiên đọc toàn bộ khách hàng.
- Tạo/sửa khách tổ chức và cá nhân, ghi chú, cờ cần xử lý/không liên hệ, phân công và gợi ý theo chuyên môn rồi số khách cần xử lý. Khách cũ giữ người phụ trách.
- Cơ hội, 7 bước đã chốt, lịch sử đổi bước; Thắng cần hai bên ký + giá trị + ngày; Thua và mở lại cần lý do. Công việc có kiểm tra quyền theo khách.
- Báo giá theo mẫu dịch vụ/nhận diện; lưu nội dung, giá, mẫu và nhận diện lúc duyệt; cấp duyệt theo ngưỡng; sửa sau duyệt mất hiệu lực; phiên bản mới giữ bản cũ; bản in có thể lưu PDF từ trình duyệt.
- Áp dụng điều kiện **đã đăng ký Gói 1** cho gói bán kèm. Bổ sung Gói 1 trong cùng bản nháp không thay điều kiện này. Không cộng trọn bộ với gói thành phần, không cộng AI05/10/20 như nhiều hạng mục.
- OA và tài khoản Zalo cá nhân công ty ở chế độ mô phỏng: lưu tin, gửi thử báo giá vào đúng hội thoại, chống trùng theo mã lần gửi. Không ghi nhận là đã giao tới Zalo.
- FAQ có từ khóa, phiên bản, người soạn/người duyệt và lịch sử; bản nháp mới không thay nội dung đã duyệt. Thu hồi ngừng sử dụng. Bot dừng khi nhân viên tiếp nhận; chỉ chủ động chuyển lại mới hoạt động.
- Lịch làm việc linh hoạt theo ngày, nhiều khung giờ và ngày nghỉ; thử trả lời ngoài giờ không hứa giờ gọi lại cụ thể. Không trả lời đề nghị tự giảm giá bằng cam kết mới.
- Admin sửa mẫu/nhận diện, ngưỡng, lịch, chuyên môn, trạng thái và mật khẩu tài khoản hiện có. Nhập CSV có xem trước/xác nhận, không nhập dở dang khi một dòng sai hoặc trùng số điện thoại.

## 2. Database migrations — thay đổi dữ liệu

Nâng cấp bổ sung trong `app/features.js`, đánh dấu `schema_migrations: local-v2`. Có bảng `notes`, `knowledge`, `knowledge_history`, `quote_templates`, `quote_history`; thêm policy/template_id cho báo giá, cờ trạng thái khách, client_key/metadata cho tin; chỉ mục duy nhất chống trùng tin trong hội thoại. Bổ sung 2 mẫu báo giá, FAQ nháp, cấu hình mặc định chưa xác nhận và hội thoại cá nhân mẫu nếu chưa có.

Không reset, không sửa tài liệu gốc. Trước nâng cấp đã sao lưu mã, test và cơ sở dữ liệu vào `app/backups/before-localhost-20260921`. Nâng cấp có tính lặp lại; các thao tác ghi API dùng transaction.

Đối chiếu cơ sở dữ liệu trước/sau tại thời điểm kiểm tra: users 5→5, customers 3→3, opportunities 2→2, opp_history 7→7, tasks 1→1, quotes 1→1, quote_items 4→4, products 8→8, audit 23→23. `PRAGMA integrity_check`: ok; `foreign_key_check`: không có lỗi. Bằng chứng: `app/test-output/migration-results.json`.

Đây chưa phải cơ chế migration PostgreSQL theo schema v2.0. Một phần DDL SQLite vẫn nằm ở khởi động; chưa kiểm chứng rollback/downgrade. Không phục hồi bản sao cũ đè lên dữ liệu mới; cần đối soát trước mọi lần phục hồi.

## 3. API endpoints

API hiện dùng `/api`, xác thực bằng cookie HttpOnly. Các nhóm đang hoạt động:

| Nhóm | Endpoint chính |
|---|---|
| Phiên | POST `/login`, `/logout`; GET `/me` |
| Khách | GET/POST `/customers`; GET/PUT `/customers/:id`; POST `/:id/assign`; GET/POST `/:id/notes`; POST `/customers/import` |
| Cơ hội | GET/POST `/opportunities`; GET `/opportunities/:id`; POST `/opportunities/:id/stage` |
| Công việc | GET/POST `/tasks`; POST `/tasks/:id/done`, `/tasks/:id/reopen` |
| Hội thoại | GET/POST `/conversations`; GET `/conversations/:id`, `/:id/suggest`; POST `/:id/assign`, `/:id/messages`, `/:id/incoming`, `/:id/bot`, `/:id/status` |
| Báo giá | GET `/products`, `/quotes`, `/quotes/pending`; POST `/quotes`; GET/PUT `/quotes/:id`; POST `/:id/submit`, `/:id/approve`, `/:id/send`, `/:id/revise`; GET `/:id/document` |
| Tri thức | GET/POST `/knowledge`; GET/PUT `/knowledge/:id`; POST `/:id/submit`, `/:id/review`, `/:id/withdraw`; POST `/bot/preview` |
| Quản trị | GET `/templates`; PUT `/templates/:id`, `/brand`; GET/PUT `/settings`; GET `/users`, `/admin/users`; PUT `/admin/users/:id`; GET `/audit` |
| Tổng quan | GET `/home`, `/capabilities`; GET `/health` ngoài tiền tố API |

Các hậu tố `/:id` trong bảng thuộc tài nguyên tương ứng. Đây là danh mục thực thi, **chưa thay thế OpenAPI hoặc schema request/response/DTO**. API v1 và phong bì request_id của reference chưa triển khai.

## 4. Screens/components

Đăng nhập; tổng quan; khách hàng và hồ sơ; nhập CSV; bảng cơ hội và chi tiết lịch sử; công việc; hộp thư và hội thoại; danh sách/soạn/duyệt/bản in báo giá; nội dung bot và màn hình duyệt; mẫu/nhận diện; cấu hình; người dùng; nhật ký; hướng dẫn test. Có biểu mẫu chung giữ dữ liệu khi lỗi, thông báo kết quả, menu theo vai trò, giao diện thích ứng màn hình hẹp.

Khung giao diện được kiểm tra bằng Edge ở 1440×980 và trang tổng quan tại 390×844. Đã xem ảnh hồ sơ, hộp thư, báo giá, trang tổng quan và bản màn hình hẹp. Các bảng rộng có vùng cuộn riêng. Chưa kiểm tra mọi kích thước/trình duyệt hoặc tiêu chuẩn accessibility đầy đủ.

## 5. Tests run — kiểm tra đã thực chạy

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| `node app/test.js` | PASS: 12 nhóm nghiệp vụ/quyền API | Mã kiểm tra và kết quả chạy trong tác vụ |
| `node app/test-features.js` | PASS: 11 nhóm bổ sung | `app/test-output/api-results.json` |
| `node app/test-ui.cjs` | PASS: 8 nhóm thao tác Edge, không có pageerror/requestfailed | `app/test-output/ui-results.json`, ảnh và PDF thử |
| `node --check` cho server.js, features.js, features-ui.js, test-ui.cjs | PASS: cú pháp JavaScript | Kết quả chạy trong tác vụ |
| Khởi động bằng `app/start-local.ps1` | PASS: kiểm tra Node và chạy máy chủ | /health trả JSON tại 127.0.0.1:3000 |
| SQLite nâng cấp/khởi động lại | PASS: dữ liệu được giữ, không lỗi khóa ngoại/toàn vẹn | `migration-results.json`; bài test khởi động lại |
| Lint chuyên dụng | NOT VERIFIED | Chưa cấu hình công cụ lint; kiểm tra cú pháp không được gọi là lint |
| Typecheck | NOT VERIFIED | JavaScript hiện không có bộ kiểm tra kiểu/TypeScript |
| Build | Không áp dụng | HTML/JavaScript và Node chạy trực tiếp, không có bước biên dịch |
| Unit test tách riêng khỏi DB | NOT VERIFIED | Quy tắc đã thử qua API + DB, chưa có bộ unit test độc lập theo domain |

Tổng cộng **31 nhóm test tự động** (12 + 11 + 8), không phải 31 tính năng riêng hoặc bằng chứng kết nối nhà cung cấp. Test dùng cơ sở dữ liệu riêng. UI lần đầu vấp bộ chọn văn bản của test vì ghi chú chứa thêm tên/ngày; đã đối chiếu ảnh, sửa bộ chọn và chạy lại đủ 8 nhóm đạt.

## 6. Security checks

- Đã thử truy cập khách ngoài sales/ngoài nhóm, khách chưa giao ở nhóm khác, quyền công việc, quyền nhập khách, quyền admin và cấp duyệt báo giá/nội dung.
- Kiểm tra trạng thái duyệt ở máy chủ, chặn gửi sai khách, gửi trùng, sửa bản gửi, giá/chiết khấu không hợp lệ và cờ không liên hệ.
- JSON không hợp lệ hoặc sai kiểu bị từ chối; giới hạn kích thước body 2 MB và CSV giao diện 1 MB/500 dòng; truy vấn dùng tham số.
- Chỉ lắng nghe 127.0.0.1; kiểm tra Host/Origin; cookie HttpOnly + SameSite Strict, thời hạn 8 giờ. Đổi mật khẩu làm phiên cũ hết hiệu lực (đã thử). Khóa tạm sau 20 lần nhập sai trong 10 phút (đã thử). Thời điểm hết 8 giờ chưa mô phỏng bằng đồng hồ giả.
- Header chống đóng khung, nosniff và CSP cơ bản; chưa loại bỏ inline script/style. Không phục vụ tệp DB qua static route. Lỗi nội bộ không trả câu SQL cho người dùng.
- Mật khẩu mẫu được băm bằng scrypt trong DB, dùng rõ cho localhost. Không có khóa API/token Zalo/AI thật. Các mật khẩu mẫu trong hướng dẫn/mã seed không phải thông tin xác thực vận hành.
- Chưa kiểm chứng tenant isolation, webhook signatures, quyền AI/RAG, tải tệp nhị phân hoặc kiểm thử thâm nhập vì các phần tương ứng chưa được xây dựng.

## 7. Known limitations

Zalo OA/cá nhân chưa kết nối thật; FAQ là tìm từ khóa trong nội dung được duyệt, chưa là RAG/LLM. Không có thông báo tự động ra ngoài hay đồng bộ realtime giữa nhiều cửa sổ. Nhu cầu được lưu trong hội thoại/ghi chú, chưa có trình chatbot thu thập thông tin theo luồng.

Chưa có lịch họp, leads riêng, quản lý hợp đồng/thanh toán, file đính kèm thật, đa kênh ngoài hai loại Zalo thử, trình automation, Copilot hoặc báo cáo tùy chỉnh. Hồ sơ liên kết dữ liệu nhưng chưa có timeline tổng hợp mọi loại sự kiện theo PRD. Giao diện sản phẩm/số lượng báo giá đang theo các gói nguồn, chưa là trình quản trị danh mục tùy ý.

Quy tắc trưởng nhóm lập thì giám đốc duyệt và cơ sở so ngưỡng tiền là lựa chọn tạm để test; đã hiển thị ở cấu hình, chưa thay thế quy chế công ty. Ngưỡng tiền/chiết khấu chưa được tự áp thành quy định iViTech. Chưa có dòng xử lý nhân viên nghỉ việc/tái phân công khách cũ.

Ứng dụng lưu dữ liệu trên laptop này, chưa có đồng bộ PC/laptop hoặc cơ chế backup theo lịch. Chưa dùng để vận hành nhiều người qua Internet. Giá/điều kiện mẫu cần rà soát trước việc gửi báo giá thật.

## 8. Spec deviations

Đã lưu nguyên văn [CLAUDE.reference.md](../reference/CLAUDE.reference.md), SHA256 `9C1D5F76F90B3E34C0AFB18F5A7E20F1578A998AF9DEDB56477D7F06BAA036B0`. Xem [bảng áp dụng và sai khác](../reference/00_CACH_AP_DUNG.md) có mẫu SPEC CONFLICT / SPEC DEVIATION.

Các sai khác chính: SQLite/ID số/đơn doanh nghiệp thay PostgreSQL/UUID/tenant; tổ chức mã chưa đủ lớp/domain; chưa queue/outbox/adapter/realtime; API `/api` chưa `/api/v1`/OpenAPI; danh sách chưa phân trang máy chủ; bước cơ hội còn cố định theo 7 bước đã chốt. **Không công bố bản này đã tuân thủ toàn bộ reference.**

Xung đột điều kiện Gói 1 giữa mã cũ và quyết định người dùng đã được sửa theo quyết định người dùng. Không hỏi lại một điều kiện kinh doanh đã được xác nhận.

## 9. Files changed

- Sửa `app/server.js`, `app/app.html`, `app/test.js`, `app/package.json`, `.gitignore`, `README.md` và thêm cập nhật đầu `docs/planning/00_BAT_DAU_TU_DAY.md`.
- Thêm `app/features.js`, `app/features-ui.js`, `app/test-features.js`, `app/test-ui.cjs`, `app/start-local.ps1`, `CHAY_CRM.cmd`.
- Thêm `docs/reference/CLAUDE.reference.md`, `docs/reference/00_CACH_AP_DUNG.md`, `docs/planning/10_NGHIEM_THU_LOCALHOST.md` và báo cáo này.
- Bằng chứng kiểm thử nằm ở `app/test-output`, bản sao ở `app/backups`, đã loại khỏi Git. Không tạo PR/commit hoặc ghi đè tài liệu nguồn.

## 10. Unverified items

**NOT VERIFIED:** gửi/nhận thật Zalo OA, cá nhân; trạng thái giao/đọc/retry; xác thực webhook, chuẩn hóa nhà cung cấp; AI tool permissions, AI/RAG, prompt rollback; PostgreSQL/tenant migration, restore hoàn chỉnh; OpenAPI contract; kiểm thử tải, accessibility đầy đủ; quyền công ty với tài khoản tích hợp; nghiệm thu của 2 sales và trưởng nhóm trên dữ liệu thật.

Test tự động đã đạt không biến các mục này thành hoàn thành. Đây là phần công việc còn lại trước khi có bản MVP dùng thực tế.

## 11. Recommended next step

Giám đốc sản phẩm dùng [phiếu thử 20 tình huống](10_NGHIEM_THU_LOCALHOST.md), ghi lỗi/cách dùng muốn điều chỉnh. Sau khi chốt trải nghiệm, làm mốc nền tảng theo reference và mốc xác minh tích hợp Zalo OA + 1 tài khoản cá nhân công ty. Nội dung bot do trưởng nhóm chuẩn bị, giám đốc duyệt. Không tự mở mốc tiếp theo hoặc kết nối tài khoản bên ngoài trong lần bàn giao này.
