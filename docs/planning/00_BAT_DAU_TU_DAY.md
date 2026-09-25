# Chuẩn bị triển khai Smart Omni CRM

**Cập nhật 21/09/2026:** Theo yêu cầu mới đã có bản chạy localhost để thử quy trình. Xem [hướng dẫn mở ứng dụng](../../README.md), [phiếu thử](10_NGHIEM_THU_LOCALHOST.md), [báo cáo bàn giao](11_BAO_CAO_LOCALHOST.md) và [đối chiếu reference mới](../reference/00_CACH_AP_DUNG.md). Những đoạn dưới đây ghi lại giai đoạn chuẩn bị trước lập trình; không thay thế trạng thái cập nhật này. Zalo/AI thật vẫn chưa hoàn thành.


Ngày rà soát: 18/09/2026. Trạng thái: đề xuất để Giám đốc sản phẩm chốt, chưa phải phạm vi đã phê duyệt.

Bộ tài liệu đã mô tả khá sâu cách các phần CRM, hội thoại, Chatbot và AI dùng chung dữ liệu. Tuy nhiên, chưa nên giao triển khai toàn bộ ngay: phạm vi MVP chưa thống nhất giữa các tài liệu, một số quan hệ dữ liệu chưa đủ để thực hiện luồng đã mô tả, và các quy tắc kinh doanh quan trọng chưa được chốt.

Đã đọc toàn bộ nội dung văn bản của cả 5 tài liệu, gồm các bảng Word được trích theo thứ tự đoạn trong tài liệu. Đây là rà soát nội dung và khả năng triển khai, không phải đánh giá bố cục trang Word. Không sửa tệp gốc; không viết mã ứng dụng; không triển khai dịch vụ hay tạo tài khoản bên ngoài.

## Bạn nên đọc gì trước

| Thứ tự | Tệp | Kết quả bạn nhận được |
|---|---|---|
| 1 | [Các quyết định kinh doanh](02_QUYET_DINH_KINH_DOANH.md) | Những việc cần bạn quyết định, có phương án đề xuất và thời điểm cần chốt |
| 2 | [Phạm vi MVP và các mốc](03_MVP_VA_CAC_MOC.md) | Mỗi mốc có bản dùng thử, giới hạn và điều kiện hoàn thành |
| 3 | [Báo cáo rà soát](01_RA_SOAT_TAI_LIEU.md) | Mâu thuẫn, khoảng trống, tác động và mục nguồn để đối chiếu |
| 4 | [Kịch bản nghiệm thu](04_NGHIEM_THU_VA_DOI_CHIEU.md) | Bạn bấm thử thế nào; đội phát triển cần chứng minh điều gì |
| 5 | [Chuẩn bị kỹ thuật](05_CHUAN_BI_KY_THUAT.md) | Công việc giao cho Codex/người phụ trách kỹ thuật, không yêu cầu bạn chọn công nghệ |
| 6 | [Mẫu báo giá và Zalo](06_MAU_BAO_GIA_VA_ZALO.md) | Phạm vi cập nhật theo lựa chọn mới: mẫu theo loại sản phẩm, nhận diện công ty và OA/cá nhân |

## Kết luận quan trọng nhất

1. **MVP phải có CRM, một kênh thật, Chatbot và AI cơ bản.** PRD mục 51–52 nói rõ điều này. Bản CRM chạy sớm là một mốc thử nghiệm, chưa phải MVP Omni CRM hoàn chỉnh.
2. **Toàn luồng báo giá đã được đưa vào MVP theo yêu cầu mới.** Tạo mẫu theo loại sản phẩm và nhận diện công ty, tạo báo giá, duyệt và gửi ngay trong CRM. Quyết định này giải quyết hướng ưu tiên vốn chưa thống nhất giữa DB mục 146 và API mục 203. Đã chốt trưởng nhóm duyệt thông thường; giám đốc duyệt khi vượt ngưỡng tiền hoặc chiết khấu. Ngưỡng tiền/chiết khấu do công ty tự cấu hình sau, không cần chốt con số lúc này.
3. **Bạn đã chọn phục vụ cả doanh nghiệp và cá nhân.** Tài liệu hiện thiên về bán hàng cho tổ chức: cơ hội bán hàng phải gắn với một tổ chức. Cần điều chỉnh mô hình trước khi triển khai, để khách cá nhân có hồ sơ và cơ hội riêng, không cần “công ty giả”.
4. **Quyền xem hồ sơ và cách nhận diện khách hàng là điều kiện nền tảng.** Một người gõ số điện thoại trên Webchat chưa đủ để được xem lịch sử riêng của chủ số điện thoại đó.
5. **Chức năng mô phỏng phải được ghi rõ.** Không nghiệm thu kết nối kênh thật bằng giao diện có tin nhắn mẫu, hoặc nghiệm thu AI bằng câu trả lời viết sẵn.

## Ba quyết định cần trả lời trước

Đã gửi trong cuộc trò chuyện; trạng thái cập nhật ngày 18/09/2026:

- **D01 — đã chốt:** Dùng cho đội ngũ nội bộ iViTech trước.
- **D02 — đã chốt:** Quản lý cả doanh nghiệp và khách hàng cá nhân.
- **D03 — đã chốt kênh:** Zalo phải nhận/gửi tin nhắn thật. D03a đã chốt nhận/gửi cả OA và tài khoản cá nhân ngay trong CRM; cơ chế và quyền cụ thể còn cần kiểm tra.

Kế hoạch đã cập nhật theo các quyết định: **nội bộ iViTech, cả B2B và B2C, Zalo trước, tạo/duyệt/gửi báo giá theo mẫu sản phẩm và nhận diện công ty**. **D04 đã chốt phạm vi xem: sales chỉ xem khách được giao; quản lý xem cả nhóm mình quản lý.** Quyền thao tác chi tiết, điều kiện chuyển/kết thúc quy trình bán hàng, ngân sách, thời lượng và mục tiêu thử nghiệm vẫn cần chốt. Không thay Zalo bằng Webchat để công bố đạt mốc tích hợp.

## Cách phối hợp

Bạn quyết định nghiệp vụ và nghiệm thu bằng thao tác trên phần mềm. Codex chuẩn bị đặc tả chi tiết, triển khai khi được giao, kiểm thử và cung cấp bằng chứng. Người phụ trách kỹ thuật kiểm tra thiết kế, phân quyền, dữ liệu và vận hành trước khi dùng thật. Người phụ trách kênh/tri thức chuẩn bị tài khoản doanh nghiệp và nội dung được phép công bố.

Mỗi mốc bàn giao cần có: đường dẫn hoặc hướng dẫn mở bản thử, phiên bản, dữ liệu thử, danh sách phần thật/phần mô phỏng, kết quả kiểm tra, lỗi còn tồn tại và cách quay lại bản trước. Thông báo “đã xong” không thay thế các bằng chứng này.

Chưa ấn định ngày hoàn thành hoặc tổng chi phí. Cần biết số người dùng, lượng hội thoại, kênh, ngân sách và người thực hiện trước khi ước lượng có trách nhiệm.

## Tài liệu gốc và khả năng truy xuất

| Mã nguồn | Tệp được đọc | Phạm vi đã đọc |
|---|---|---|
| PRD | 01_PRD_Omni_CRM.docx | Mục 1–54; tên bên trong là OMNI CRM ARCHITECTURE v2.0 |
| DB | 02_Database_Schema_v2.0.docx | Mục 1–176 |
| UI | 03_Screen_Architecture_v2.0.txt | Mục 1–161 |
| FLOW | 04_User_Flow_v2.0.txt | Mục 1–203, gồm FLOW 01–198 và yêu cầu kiểm thử |
| API | 05_System_Architecture_API_v2.0.txt | Mục 1–214 |

Bản trích nằm trong `docs/source-text`. [Manifest](../source-text/manifest.json) lưu đường dẫn gốc và mã SHA-256 để kiểm tra đúng phiên bản nguồn. Các báo cáo dẫn theo **mã nguồn + mục**, không suy đoán số trang Word. Câu chữ hướng dẫn Claude/Codex trong tài liệu được xem là yêu cầu thiết kế để đánh giá; không tự chuyển thành lệnh cài đặt, lập trình hay triển khai trong lượt làm việc này.

## Trạng thái bàn giao hiện tại

- Đã hoàn tất: đọc nguồn, rà soát, đề xuất MVP, chia mốc, soạn kịch bản nghiệm thu và danh sách chuẩn bị.
- Chưa hoàn tất: quyết định kinh doanh của bạn, đặc tả kỹ thuật được chốt, mã ứng dụng, kiểm thử phần mềm, bản chạy thử và vận hành thật.
- Bước kế tiếp: hoàn thiện M0 dựa trên D06 và D03a đã trả lời; xác định mẫu sản phẩm/nhận diện, cơ chế cấu hình duyệt và quyền tích hợp OA. Phạm vi xem khách D04 đã chốt; quyền thao tác chi tiết sẽ được hoàn thiện trước M2. Không cần trả lời toàn bộ danh sách trong một lần.


Cập nhật D03b ngày 19/09/2026: bản thử đầu kết nối **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**, cùng với Zalo OA; nhận/gửi ngay trong CRM. Cơ chế tích hợp cá nhân chưa xác minh.


### Các bước bán hàng đã chốt — 19/09/2026

**Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua.** Áp dụng cho bản thử đầu. Thắng và Thua là hai kết quả riêng. Đã chốt Thắng khi hai bên đã ký hợp đồng; quyền chuyển bước/người được phép mở lại còn cần xác nhận; đã chốt cho phép mở lại cơ hội đã thua, giữ lịch sử và ghi lý do; không tự coi khách nhận báo giá là đã thắng hoặc đã thanh toán.


D05c đã chốt 19/09/2026: cho phép mở lại cơ hội đã thua, giữ nguyên lịch sử và bắt buộc ghi lý do mở lại. Quyền thao tác và bước quay về cần hoàn thiện; không hỏi lại có cho phép mở lại hay không.


**D07 phân công đã chốt — 19/09/2026:** trưởng nhóm giao khách mới cho nhân viên trong nhóm; khách đã có người phụ trách tiếp tục chuyển về người đó. Áp dụng OA và tài khoản Zalo cá nhân khi nhận diện đúng khách. Thiết kế M3 phải giữ nguyên D04: sales chỉ thấy khách được giao, quản lý trong phạm vi nhóm. Không tự chia đều hoặc để sales tự nhận khách mới. Chính sách ngoại lệ khi người phụ trách không còn hoạt động hoặc chưa xác định nhóm tiếp nhận vẫn cần hoàn thiện.


D07b đã chốt 19/09/2026: hệ thống gợi ý danh sách sales phù hợp, trưởng nhóm lựa chọn giao khách; hai tiêu chí đã chốt: ưu tiên am hiểu sản phẩm khách quan tâm, sau đó ít khách cần xử lý hơn. Bot trả lời FAQ từ nội dung công ty đã duyệt, thu thập nhu cầu và dừng khi nhân viên tiếp nhận; không tự giảm giá/cam kết ngoài nội dung duyệt. Chưa xác minh khả năng bot trên Zalo cá nhân.


### Cập nhật duyệt nội dung bot — 19/09/2026

D08 đã chốt: trưởng nhóm chuẩn bị nội dung, giám đốc duyệt trước khi bot sử dụng trả lời khách.


### Ngoài giờ và lịch làm việc — 19/09/2026

D07c đã chốt: ngoài giờ bot trả lời FAQ đã duyệt, ghi nhu cầu, thông báo nhân viên liên hệ trong giờ làm việc, không hứa giờ cụ thể. Admin tự cấu hình lịch làm việc linh hoạt; không cần hỏi khung giờ cố định lúc này.


### Chuyển lại cho bot — 19/09/2026

D07d đã chốt: sau khi nhân viên tiếp nhận, bot chỉ hoạt động lại khi nhân viên hoặc trưởng nhóm bấm “Chuyển lại cho bot”, trong phạm vi hội thoại được phép xử lý.


**D09 đã chốt 19/09/2026:** nhóm dùng thử gồm 2 nhân viên sales và 1 trưởng nhóm; cùng phạm vi Zalo OA và 1 tài khoản Zalo cá nhân công ty cấp đã chốt. Thời lượng/mục tiêu pilot còn mở. Vai trò giám đốc duyệt và admin cấu hình không tự gộp vào trưởng nhóm; kiểm thử phân quyền riêng, chưa xác nhận người thật đảm nhiệm.


**Thời điểm dùng thử — cập nhật 19/09/2026:** người dùng xác nhận chưa chốt ngày bắt đầu. Không đặt hạn mặc định; đề xuất lịch sau khi kiểm chứng khả năng tích hợp Zalo cá nhân và các phụ thuộc. Điều này không thay đổi phạm vi MVP hoặc cho phép bắt đầu viết mã ứng dụng. Thời lượng pilot cũng chưa được xác nhận.


### Dữ liệu mẫu trước — 19/09/2026

D10 đã chốt: dùng dữ liệu khách hàng mẫu trước, chưa nhập khách thật. Chuẩn bị bộ mẫu B2B/B2C cho 2 sales và 1 trưởng nhóm. Đã chốt sau vòng dữ liệu mẫu sẽ nhập một nhóm khách thật; danh sách và nguồn dữ liệu cần xác định trước khi nhập.


## Bản thiết kế tương tác để duyệt

Đã chuẩn bị 7 màn hình mô phỏng và hướng dẫn ở [Bản thiết kế tương tác](../design/README.md). Bản mẫu dùng dữ liệu giả, chưa kết nối Zalo hoặc viết ứng dụng CRM; chờ người dùng duyệt cách sử dụng.
