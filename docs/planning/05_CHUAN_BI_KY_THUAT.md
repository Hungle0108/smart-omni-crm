# Công việc chuẩn bị giao cho Codex và người phụ trách kỹ thuật

Ngày: 18/09/2026. Đây là danh sách thiết kế/chuẩn bị tiếp theo, không phải mã hoặc cấu hình đã triển khai. Người dùng đã chọn nội bộ iViTech, cả khách doanh nghiệp và cá nhân, Zalo thật đầu tiên và tạo/duyệt/gửi báo giá theo mẫu sản phẩm/nhận diện công ty.

## Nguyên tắc điều phối

Yêu cầu mới của Giám đốc sản phẩm được ưu tiên hơn giả định trong tài liệu gốc. Khi nguồn mâu thuẫn, ghi cách giải quyết vào nhật ký, không tự im lặng chọn tài liệu tiện nhất. Đề xuất: UI làm chuẩn mã màn hình, API làm cơ sở endpoint, DB làm cơ sở tên bảng/trường, PRD làm cơ sở mục tiêu; **bất kỳ xung đột phạm vi nào vẫn phải được quyết định rõ**, không áp thứ tự này máy móc.

Không yêu cầu Giám đốc sản phẩm chọn database index, framework, version field hay queue. Chỉ đưa ra câu hỏi kinh doanh nếu nó ảnh hưởng người dùng, quy trình, ngân sách hoặc ràng buộc vận hành.

## T01 Điều chỉnh mô hình khách hàng cho doanh nghiệp và cá nhân

**Bắt buộc trước M2.** Nguồn DB §25,32 và API §23 hiện không đủ cho D02.

Đề xuất kỹ thuật để đánh giá: một lớp khách hàng chung có loại tổ chức/cá nhân, tham chiếu Organization hoặc người tương ứng. Cơ hội liên kết đến khách mua thực tế; Contact tiếp tục thể hiện người liên hệ. Chưa chốt tên bảng hoặc schema cuối trong lượt chuẩn bị này.

Đặc tả phải giải quyết:

- Hồ sơ, danh sách, bộ lọc và Customer 360 cho cả hai loại.
- Lead Convert không bắt buộc tạo tổ chức cho B2C; chọn đúng khách đã có và không nhân bản một người không cần thiết.
- Một người mua cá nhân đồng thời đại diện doanh nghiệp: phân biệt vai trò và bên mua, không trộn quyền xem hoặc lịch sử giao dịch.
- Opportunity, Task, Meeting, Conversation, Note, File, AI Insight và báo cáo tham chiếu đúng bên mua; Quote đã thuộc MVP và phải hỗ trợ cá nhân.
- Dùng chung nhận diện người qua kênh, nhưng xác định ngữ cảnh hội thoại/cơ hội bằng liên kết có kiểm soát. Không tự suy “cùng số = cùng giao dịch”.
- Quy tắc một Contact rời công ty và bảo toàn lịch sử liên hệ tại thời điểm giao dịch.

Bàn giao trước triển khai: sơ đồ quan hệ, hai luồng B2B/B2C bằng ngôn ngữ nghiệp vụ, danh sách thay đổi so với DB/API cũ, tiêu chí U03/U05/U18/U21/U22. Mở rộng này là yêu cầu đã xác nhận, không phải tính năng sau MVP.

## T02 Kiểm tra điều kiện Zalo trước khi cam kết mốc tích hợp

**D03/D03a cập nhật 19/09/2026:** bắt buộc nhận/gửi thật cả OA và Zalo cá nhân ngay trong CRM. Kiểm chứng riêng từng loại ở M0; chưa xác minh cơ chế tích hợp tài khoản cá nhân hoặc quyền tài khoản cụ thể. Không tự cài plugin hoặc đăng ký dịch vụ trong bước chuẩn bị.

Người quản lý kênh cung cấp OA cụ thể, người quản trị và mục đích dùng. Đã đọc [nguồn chính thức Zalo OA OpenAPI](https://oa.zalo.me/home/function/extension) ngày 18/09/2026: có khả năng tích hợp hệ thống doanh nghiệp qua các nhóm quyền nhắn tin và webhook. Đây là thông tin cấp nền tảng, không chứng minh tài khoản iViTech đã có quyền. Người kỹ thuật tiếp tục kiểm tra quyền thực tế và chi phí/ràng buộc theo tài khoản, gồm:

- Cách xác thực ứng dụng/tài khoản và xử lý token hết hạn.
- Quyền nhận webhook, cách xác minh sự kiện, ID người gửi trong phạm vi tài khoản kênh.
- Quyền gửi phản hồi/chủ động, điều kiện template, nội dung/file được hỗ trợ, giới hạn tần suất và trạng thái giao/đọc có thực.
- Cách thử hai chiều với tài khoản khách được phép và tách thử nghiệm khỏi khách thật.
- Cách xử lý khi quyền chưa được cấp hoặc tài khoản không hỗ trợ nhu cầu.

Đầu ra là bảng Có / Không / Chưa xác minh cho từng năng lực, kèm nguồn chính thức và kết quả kiểm tra tài khoản. Khả năng cụ thể trên tài khoản iViTech **chưa xác minh**. Nguồn OA không xác lập khả năng API cho hộp thư cá nhân; không dùng tự động hóa giao diện Zalo cá nhân như connector chính thức mặc nhiên chấp nhận, và không hứa đồng bộ lịch sử cũ khi chưa kiểm tra. Hướng gửi PDF/đường dẫn báo giá từ CRM cũng phải có bài thử trên OA thật.

Trong thời gian chờ quyền, có thể thiết kế adapter và bài kiểm tra mô phỏng; mốc nhận/gửi thật vẫn chưa hoàn thành. Không thay Zalo bằng Webchat để đạt mốc.

## T03 Tổ chức tài liệu và lịch sử thay đổi

Đã tạo:

- `docs/source-text`: bản trích đầy đủ nguồn, manifest và mục lục tra cứu.
- `docs/planning`: rà soát, quyết định, phạm vi, mốc và nghiệm thu.

Việc tiếp theo khi được giao:

- Lưu bản gốc hoặc bản chụp nguồn theo chính sách dự án; giữ dấu vết phiên bản và ngày.
- Lưu đặc tả được chốt riêng, không sửa nội dung trích nguồn để khiến mâu thuẫn biến mất.
- Dùng lịch sử phiên bản cho tài liệu và mã; dự án hiện có thư mục `.git`, chưa đánh giá cấu hình remote và quy trình lưu phiên bản. Không tạo lại kho hoặc đẩy dữ liệu ra ngoài chỉ vì thấy thư mục này.
- Chuẩn bị README hướng dẫn mở bản thử và tệp hướng dẫn làm việc dự án khi bắt đầu giai đoạn triển khai. Chưa tạo AGENTS.md có hiệu lực trong lượt này để tránh biến đề xuất chưa chốt thành quy tắc tự động.

## T04 Chốt đặc tả vừa đủ theo từng mốc

Mỗi chức năng cần một bản ngắn: người dùng, mục tiêu, dữ liệu bắt buộc, quyền, trạng thái, luồng thành công, lỗi/trùng/xung đột, tác động Timeline/audit, API, ca nghiệm thu. Làm theo mốc đã chốt, không viết toàn bộ API của chức năng sau MVP trước.

Các hợp đồng cần bổ sung sớm:

- Danh mục trạng thái thống nhất, nhãn tiếng Việt, quy tắc chuyển và mapping PRD/DB/UI.
- Quyền theo vai trò và phạm vi; chính sách bot và public data riêng nhân viên.
- Customer 360 cá nhân; chuyển Lead không có Organization; liên kết Conversation–Opportunity.
- Notes, audit đọc, consent cho Lead/Contact, unread từng người hay trạng thái dùng chung, link lại hội thoại và merge.
- Lưu đúng phiên bản flow/prompt/config và nguồn tri thức; publish khác với xử lý xong.
- Idempotency cho chuyển Lead, gửi tin, nhận handoff và thực thi AI; handling khi kết quả gửi chưa chắc chắn.
- Cơ chế không mất sự kiện sau khi dữ liệu đã lưu; đảm bảo audit bắt buộc không bị bỏ qua vì worker lỗi.
- Thư viện mẫu báo giá theo loại sản phẩm và nhận diện công ty, phiên bản mẫu, snapshot báo giá, chính sách duyệt và gửi đúng bản được duyệt. Xem đặc tả bổ sung `06_MAU_BAO_GIA_VA_ZALO.md`; không để các tài liệu cũ xếp Quote ở P1 làm bỏ sót yêu cầu mới.

## T05 Kiến trúc kỹ thuật đề xuất để đánh giá

Giữ định hướng API §3: một ứng dụng chia module rõ ràng, tác vụ nền và adapter kênh. DB đề xuất PostgreSQL, vector search khởi đầu bằng pgvector; file ở kho lưu trữ riêng. Đây là kế thừa nguồn, không phải kết quả so sánh/kiểm tra phiên bản công nghệ mới nhất.

Đội kỹ thuật chọn một phương án backend nhất quán từ các lựa chọn API §197, đối chiếu khả năng hỗ trợ/vận hành và chi phí. Không bắt người dùng chọn NestJS hay FastAPI. Trước khi cài đặt, xác minh phiên bản và tương thích cần dùng. Chưa cài dependency hoặc tạo skeleton trong lượt này.

CRM không phụ thuộc bắt buộc vào AI. Một dịch vụ nhận diện, một dịch vụ gửi tin, cùng quyền và audit được dùng bởi nhân viên, bot và công cụ AI. Không để luồng bot gửi thẳng ra provider vượt kiểm tra gửi chung.

## T06 Môi trường tài khoản và dữ liệu

| Hạng mục | Người chịu trách nhiệm | Khi cần |
|---|---|---|
| Phạm vi, quy trình sales, quyền, người nghiệm thu | Giám đốc sản phẩm | M0–M2 |
| Zalo và quyền quản trị/tích hợp | Người quản lý kênh + kỹ thuật | Kiểm tra từ M0, sẵn sàng M3 |
| FAQ/bảng giá/chính sách được phép công bố | Người phụ trách nội dung do iViTech chỉ định | Trước M4 |
| Tài khoản AI và mức chi được chấp nhận | Chủ tài khoản doanh nghiệp + kỹ thuật | Trước M4–M5 |
| Máy chủ, database, file, tên miền nếu cần | Người phụ trách kỹ thuật theo D11 | Trước bản thử được chia sẻ |
| Dữ liệu nhập, ánh xạ chủ sở hữu, đối soát | Chủ dữ liệu nghiệp vụ | Trước M6 |
| Theo dõi lỗi, sao lưu/khôi phục, chuyển giao | Người vận hành được chỉ định | Trước M6 |

Tên miền/máy chủ/tài khoản chưa được mua hoặc tạo. Tài khoản và tài sản nên do iViTech sở hữu. Bí mật kết nối được thiết lập qua cơ chế bảo mật phù hợp, không ghi vào nguồn mã hay tài liệu kế hoạch.

Dữ liệu mẫu và dữ liệu thật được tách. Không dùng seed khách demo trong production; không chạy kiểm tra bot gây gửi tin hoặc tạo hồ sơ trên hệ thống thật mặc định. Tiêu chí vận hành/retention do D12 quyết định, không sao chép nguyên ví dụ thành chính sách doanh nghiệp.

## T07 Mẫu công việc giao cho Codex sau khi chốt M0

Ví dụ cho giai đoạn sau, chưa phải yêu cầu thực hiện ngay trong lượt này:

> Triển khai mốc M2 theo kế hoạch đã được chốt. Hỗ trợ khách doanh nghiệp và cá nhân, không yêu cầu khách cá nhân có Organization. Tuân theo ma trận quyền và quy tắc pipeline đã xác nhận. Bàn giao bản mở được, dữ liệu thử, hướng dẫn thao tác U02–U08, kết quả kiểm thử và các giới hạn còn lại. Giải thích bằng tiếng Việt dễ hiểu. Không tự coi kết nối Zalo hoặc AI đã hoàn thành khi mới có dữ liệu mô phỏng.

Mỗi công việc giới hạn theo một phần có thể nghiệm thu. Các thay đổi nghiệp vụ mới phải cập nhật quyết định, đặc tả và ca kiểm tra liên quan, thay vì chỉ thay code theo từng câu chat.

## T08 Bàn giao trước pilot

Người kỹ thuật cung cấp bằng chứng: phân quyền server và AI, Zalo thật, chống trùng/mất dữ liệu, bộ chất lượng AI, đo tải, sao lưu khôi phục, lỗi còn lại và cách quay lại bản trước. Người sản phẩm xác nhận luồng B2B/B2C và mục tiêu thử nghiệm. Người quản lý kênh/nội dung xác nhận tài khoản và nguồn tri thức.

Nếu không có người phụ trách kỹ thuật/vận hành được chỉ định, vẫn có thể tiếp tục tạo bản mẫu và đặc tả, nhưng chưa có đầu mối đủ rõ để đưa dữ liệu khách thật vào vận hành. Cần chốt người chịu trách nhiệm ở D12, không mặc định Codex thay thế vai trò vận hành doanh nghiệp.

## Kiểm chứng Zalo cá nhân trước cam kết triển khai (19/09/2026)

Lập bảng bằng chứng cho nhận/gửi, định danh tài khoản, kết nối lại, trạng thái tin và phân quyền; chỉ rõ nguồn cơ chế kết nối, điều kiện sử dụng, chi phí và giới hạn. Kiểm tra số tài khoản, quyền sử dụng và phạm vi hội thoại công việc trước kết nối. Không cần mật khẩu/token trong chat. Nếu chưa có phương án kiểm chứng được, ghi chưa xác minh; không tuyên bố hoàn thành bằng kết nối OA hay thao tác thủ công.


### Đầu vào kiểm chứng đã xác nhận — 19/09/2026

Bản thử đầu dùng **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**. Dùng phạm vi này để đánh giá phương án tích hợp, chi phí và phân quyền; không tiếp tục hỏi số lượng hoặc nguồn sở hữu tài khoản cá nhân. Quyền kết nối thực tế, người phụ trách và phạm vi nhập lịch sử vẫn cần xác định khi chuẩn bị kết nối. Chưa có kết nối hoặc kiểm thử thực tế.


**D07 phân công đã chốt — 19/09/2026:** trưởng nhóm giao khách mới cho nhân viên trong nhóm; khách đã có người phụ trách tiếp tục chuyển về người đó. Áp dụng OA và tài khoản Zalo cá nhân khi nhận diện đúng khách. Thiết kế M3 phải giữ nguyên D04: sales chỉ thấy khách được giao, quản lý trong phạm vi nhóm. Không tự chia đều hoặc để sales tự nhận khách mới. Chính sách ngoại lệ khi người phụ trách không còn hoạt động hoặc chưa xác định nhóm tiếp nhận vẫn cần hoàn thiện.


### Thiết kế gợi ý sales và kiểm soát bot (19/09/2026)

Bổ sung gợi ý sales vào phân công M3: lọc theo nhóm/quyền và trạng thái hoạt động; chỉ xếp hạng theo tiêu chí nghiệp vụ được xác nhận. Hiển thị đề xuất để trưởng nhóm quyết định, không tự thay owner; không cấp quyền cho ứng viên trước giao. Hai tiêu chí đã chốt: am hiểu sản phẩm khách quan tâm là ưu tiên đầu, số khách đang cần xử lý ít hơn là ưu tiên tiếp theo. Không thay số khách cần xử lý bằng tổng số hồ sơ lịch sử. Không cần chọn mô hình AI ở bước này. Bot M4 chỉ dùng nội dung đã duyệt; kiểm tra trạng thái bàn giao ngay trước gửi để chặn câu trả lời đang xử lý sau khi nhân viên tiếp nhận. Khả năng tự động hóa trên Zalo cá nhân cần xác minh độc lập.


### Cập nhật duyệt nội dung bot — 19/09/2026

D08/M4: phân quyền trưởng nhóm soạn/gửi duyệt, giám đốc duyệt; gắn phê duyệt với đúng phiên bản nội dung. Chỉ nạp nội dung đã duyệt, có hiệu lực và đúng phạm vi vào bot. Việc xử lý/index tài liệu thành công không thay thế bước giám đốc duyệt. Không suy ra mọi tài liệu nội bộ đều được phép trả lời khách.


### Ngoài giờ và lịch làm việc — 19/09/2026

D07c: bổ sung cấu hình lịch làm việc do admin quản lý và dùng chung khi xác định trong/ngoài giờ. Đề xuất hỗ trợ ngày/khung giờ, múi giờ, ngoại lệ và audit; chưa gán lịch thật của công ty. Bot ngoài giờ chỉ dùng nội dung đã duyệt, thu nhu cầu, thông báo liên hệ trong giờ làm việc, không tự hứa giờ. Kiểm tra trạng thái người xử lý trước gửi; lịch không được tự bật bot đã bàn giao.


### Chuyển lại cho bot — 19/09/2026

D07d: trạng thái bàn giao cho người phải được lưu bền vững. Chỉ hành động “Chuyển lại cho bot” của nhân viên/trưởng nhóm có quyền mới cho bot hoạt động lại; job lịch, reconnect, tin mới và đóng/mở hội thoại không thay thế hành động này. Kiểm tra quyền và trạng thái ngay trước gửi, xử lý thao tác đồng thời, không gửi phản hồi cũ bị hủy.


### Dữ liệu mẫu trước — 19/09/2026

D10: chuẩn bị dữ liệu tổng hợp có nhãn mẫu; không sao chép dữ liệu khách thật. Dùng người nhận thử được phép cho kiểm chứng OA/cá nhân, kiểm soát đích gửi; không lấy số điện thoại giả ngẫu nhiên làm đích gửi thật. Chưa nhập dữ liệu cũ hoặc lịch sử hội thoại thật. Chỉ là kế hoạch, chưa viết mã tạo dữ liệu.
