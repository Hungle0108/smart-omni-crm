# Áp dụng tài liệu kỹ thuật tham chiếu

Ngày tiếp nhận: 21/09/2026. Nguồn: file người dùng gửi và yêu cầu “hãy dùng file .md này làm reference”. Bản gốc được giữ nguyên trong [CLAUDE.reference.md](CLAUDE.reference.md).

Tài liệu này hướng dẫn kỹ thuật; các quyết định nghiệp vụ người dùng đã xác nhận trong hội thoại và `docs/planning/02_QUYET_DINH_KINH_DOANH.md` tiếp tục có hiệu lực. Không xem tên file CLAUDE là yêu cầu đổi công cụ, xoá mã hoặc khởi động lại dự án.

## Mốc hiện tại: bản localhost để kiểm thử quy trình

Người dùng đã yêu cầu viết web localhost để test. Khi nhận reference, dự án đã có ứng dụng và dữ liệu SQLite; đang kiểm tra phần mở rộng. Mốc này không đồng nghĩa đã hoàn thành Sprint 00–18 trong reference hay toàn bộ MVP có tích hợp thật.

Phạm vi còn lại của mốc: đối chiếu quy tắc, sửa lỗi, kiểm thử trên trình duyệt, lưu hướng dẫn và báo cáo. Không tự mở mốc triển khai Internet hoặc kết nối tài khoản thật.

Kế hoạch kiểm tra khi nhận reference:

| Mục | Cách thực hiện |
|---|---|
| Tệp ảnh hưởng | `app/server.js`, `app/features.js`, `app/app.html`, `app/features-ui.js`, bộ test và hướng dẫn |
| Dữ liệu | Giữ dữ liệu hiện có; thay đổi bổ sung được ghi ở `schema_migrations`; không reset. Đã sao lưu trước nâng cấp trong `app/backups/before-localhost-20260921` |
| API | Đăng nhập, khách, cơ hội, công việc, hội thoại thử, báo giá, nội dung bot, cấu hình, tài khoản, nhật ký |
| Màn hình | Kiểm tra từng vai trò; đi hết luồng lập/duyệt/gửi báo giá và duyệt FAQ/bàn giao bot |
| Tác vụ nền | Chưa triển khai; không có gửi tin ra nhà cung cấp hoặc lập chỉ mục AI |
| Kiểm thử | Quy tắc nghiệp vụ, quyền truy cập trực tiếp API, lưu dữ liệu qua khởi động lại, thao tác trình duyệt và bản in |
| Bảo vệ dữ liệu | API kiểm tra vai trò và phạm vi bản ghi; máy chủ chỉ lắng nghe localhost; dữ liệu test tự động dùng cơ sở dữ liệu riêng |
| Rủi ro | Chưa có kiến trúc vận hành đa công ty, kiểm thử tải hay tích hợp Zalo thật; phải đối chiếu trước mốc triển khai chính thức |

## SPEC DEVIATION — cơ sở dữ liệu

- Original requirement: PostgreSQL, UUID, tenant-aware, TIMESTAMPTZ, NUMERIC/DECIMAL, tiền tệ tường minh.
- Proposed change: Giữ SQLite với ID số, một doanh nghiệp, thời gian ISO và tiền VND dạng số nguyên cho bản thử đang có.
- Technical reason: Mở bản thử ngay trên laptop bằng Node đã cài; tránh phá dữ liệu có sẵn khi nhận thêm reference.
- Impact: Không đạt nền tảng đa doanh nghiệp của reference; không sử dụng bản này làm máy chủ Internet hoặc hệ thống vận hành chính thức.
- Migration/backward compatibility impact: Mốc nền tảng cần schema PostgreSQL đúng v2.0, ánh xạ ID, tenant lấy từ đăng nhập, đối soát số lượng/lịch sử/tiền. Không đổi hoặc xoá SQLite trong mốc hiện tại. Chưa xác nhận tương thích chuyển đổi.

## SPEC DEVIATION — tổ chức mã và hạ tầng

- Original requirement: Modular monolith, controller/service/repository rõ ràng; worker, outbox, adapter, cache/query và realtime.
- Proposed change: Bản thử hiện dùng Node HTTP + SQL với tệp mở rộng chức năng, giao diện HTML/JavaScript; chưa tách đầy đủ các lớp/domain.
- Technical reason: Kế thừa ứng dụng localhost hiện có để kiểm tra các quyết định nghiệp vụ.
- Impact: Chưa đạt quy chuẩn kiến trúc, khả năng mở rộng và tích hợp của bản chính thức. Tải danh sách còn ở trình duyệt; chưa có phân trang/cursor/realtime.
- Migration/backward compatibility impact: Cần tách từng domain, giữ và chạy lại test nghiệp vụ, chuyển truy vấn sang phân trang và bổ sung sự kiện/adapter trước kết nối thật.

## SPEC DEVIATION — API và quy trình bán hàng

- Original requirement: `/api/v1`, phong bì kết quả có request_id, DTO/schema và OpenAPI đầy đủ; pipeline cấu hình từ dữ liệu.
- Proposed change: Giữ API `/api` hiện có và 7 bước bán hàng người dùng đã duyệt cho bản thử.
- Technical reason: Không đổi giao thức đang chạy trong lúc kiểm tra bổ sung.
- Impact: Chưa tuân thủ API contract hoặc pipeline configurable của reference. Danh mục endpoint trong báo cáo không thay thế OpenAPI.
- Migration/backward compatibility impact: Mốc nền tảng phải bổ sung API v1, ánh xạ lỗi/DTO, contract tests và migration danh mục bước; không tự đổi ý nghĩa các bước đã chốt.

## SPEC CONFLICT — điều kiện Gói 1

- Requirement A: Người dùng đã chốt Gói 3 và Gói 4 chỉ bán kèm khi khách **đã đăng ký Gói 1**.
- Requirement B: Mã và bài test cũ cho phép chỉ cần có Gói 1 trong cùng báo giá, dù khách chưa đăng ký.
- Technical impact: Có thể lập và duyệt báo giá không đúng điều kiện bán kèm đã chốt.
- Recommended resolution: Áp dụng yêu cầu A; đánh dấu hồ sơ đã đăng ký Gói 1 mới cho thêm Gói 3/4. Việc chọn Gói 1 trong bản nháp không phải bằng chứng đã đăng ký. Gói 2 giữ điều kiện nền tảng theo tài liệu báo giá; trọn bộ là một gói riêng, không cộng gói thành phần.

## Các phần áp dụng ngay

- Kiểm tra quyền ở máy chủ; sales chỉ khách được giao, trưởng nhóm trong nhóm. Admin quản lý cấu hình; giám đốc được đọc báo giá thuộc lượt duyệt của mình. Quyền rộng hơn chưa mặc nhiên cấp.
- Một hồ sơ khách dùng chung cho hội thoại, cơ hội, báo giá, công việc và ghi chú; không có kho khách riêng cho bot.
- Thay đổi bước lưu lịch sử; Thắng yêu cầu hai bên ký, giá trị và ngày chốt; Thua/mở lại cần lý do.
- Duyệt FAQ có phiên bản; chỉ nội dung đã duyệt được dùng. Tiếp nhận dừng bot và phải chủ động chuyển lại.
- Lưu nội dung báo giá tại lúc duyệt; sửa nội dung phải duyệt lại; gửi thử có chống trùng, không giả trạng thái Zalo đã giao.
- Không reset dữ liệu, không tự gộp khách, không gọi AI từ trình duyệt, không đưa khóa tài khoản vào mã.

## Chưa có/chưa kiểm chứng

Chưa có `06_Master_Prompt_Implementation_Roadmap.md` như reference mong đợi. Năm tài liệu nguồn thực tế nằm trong `docs/source-original` và bản trích tại `docs/source-text`; không tạo tài liệu “đã duyệt” thay người dùng.

Tại mốc 0.2/0.3: Zalo OA/cá nhân thật, RAG/LLM/Copilot, chữ ký webhook, adapter nhà cung cấp, queue/outbox, tenant isolation, OpenAPI, rollback migration và kiểm thử tải chưa triển khai. Cập nhật mốc 0.4 bên dưới thay thế hiện trạng của riêng phần OA.

Mức tiền/chiết khấu vẫn để công ty nhập. Cơ sở so ngưỡng có lựa chọn trong cấu hình; trường hợp trưởng nhóm tự lập được đưa giám đốc duyệt để thử, là giả định triển khai tạm đã hiển thị trên màn hình, chưa phải quy chế chính thức.

## Cập nhật mốc 0.4 — 22/09/2026

Theo yêu cầu người dùng đã xác nhận, bổ sung module OA trong CRM và tiến trình công việc theo từng khách. Đã tách adapter nhà cung cấp, nhận webhook có kiểm tra chữ ký, chống trùng và outbox SQLite; kiểm tra ngoại tuyến đạt, **chưa xác minh OA thật**. Tiến trình tái sử dụng bảng công việc và quyền truy cập khách hiện có, không cấp thêm quyền xem khách theo việc được giao. Chi tiết tại `docs/planning/15_KET_NOI_ZALO_OA.md`, `16_TIEN_TRINH_KHACH_HANG.md`, `17_BAN_GIAO_0.4.md`.

Các phần bổ sung này không có nghĩa toàn bộ reference đã được đáp ứng: vẫn là bản SQLite nội bộ một công ty, chưa chuyển PostgreSQL/Redis, chưa tenant isolation, OpenAPI, rollback tự động, triển khai production hoặc kiểm thử tải. Zalo cá nhân thật và RAG/LLM/Copilot chưa được triển khai.


## Cập nhật mốc 0.5 — 23/09/2026

Người dùng đã yêu cầu phát triển SaaS và xác nhận phạm vi subadmin. Đã bổ sung cách ly nhiều công ty bằng SQLite riêng, registry nền tảng, phiên riêng, admin/subadmin và phân kênh theo người dùng; kiểm thử cách ly và quyền truy cập đạt. Phần mô tả một công ty ở mốc 0.4 không còn là hiện trạng. Đây là bước thử cục bộ; vẫn chưa PostgreSQL/Redis, thanh toán, triển khai production hoặc kiểm thử tải. Xem `docs/planning/27_SAAS_CONG_TY_PHAN_KENH.md`.
