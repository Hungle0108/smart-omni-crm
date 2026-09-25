## Cập nhật 24/09/2026 — Super Admin riêng

Mở **http://127.0.0.1:3000/platform** để quản trị nền tảng. Lần đầu, đăng nhập admin iViTech hiện có rồi tự đặt tài khoản/mật khẩu Super Admin riêng tại trang này. CRM công ty vẫn ở http://127.0.0.1:3000/. Xem [hướng dẫn Super Admin](docs/planning/28_SUPER_ADMIN_LOCALHOST.md).

## Cập nhật 23/09/2026 — bản thử SaaS 0.5

Đã có nhiều công ty với dữ liệu riêng, admin/subadmin, phân kênh theo người dùng, nguồn cung/đối tác của sản phẩm và tìm kiếm/lọc nhiều lựa chọn. Xem [hướng dẫn và nghiệm thu](docs/planning/27_SAAS_CONG_TY_PHAN_KENH.md). Mã công ty hiện có: **ivitech**. Đây vẫn là bản localhost, chưa thu phí hoặc mở dịch vụ qua Internet.

# Tiếp tục Smart Omni CRM trên máy bàn

**Cập nhật 23/09/2026:** Dự án hiện đã có ứng dụng localhost. Phần bên dưới mô tả bộ chuyển tài liệu cũ ngày 18/09, không còn phản ánh đầy đủ mã hiện tại. Khi chuyển bản mới: dùng Node.js 24+, chạy `npm ci --prefix app --ignore-scripts`, rồi `CHAY_CRM.cmd`. Xem README và tài liệu 25–26. Sao lưu dữ liệu cùng khóa `.zalo-key` / `.channels-key` nếu có; không chạy chung tệp SQLite qua Google Drive trên hai máy.

Bản chuẩn bị ngày 18/09/2026. Việc tạo tệp/gói chuyển chưa có nghĩa máy bàn đã nhận hoặc đã chạy được tác vụ. Giữ bản gốc trên laptop.

## Bắt đầu

1. Chép và giải nén gói vào một thư mục làm việc trên ổ cứng máy bàn. Giữ cấu trúc thư mục và thư mục ẩn `.git`. Tránh sửa đồng thời hai bản trên laptop/máy bàn.
2. Mở thư mục dự án vừa giải nén trong Codex trên máy bàn. Chưa cần cài công cụ lập trình: hiện chưa có mã ứng dụng.
3. Gửi lời nhắn bên dưới cho tác vụ mới hoặc tác vụ đang phối hợp ở máy bàn. Đây là yêu cầu kiểm tra chuyển tệp, không phải yêu cầu bắt đầu lập trình.

> Tôi muốn tiếp tục dự án Smart Omni CRM trên máy bàn, độc lập với laptop. Hãy đọc START_ON_DESKTOP.md, README.md và docs/planning. Kiểm tra đủ tệp theo transfer/PROJECT_MANIFEST.json, đối chiếu SHA-256 và xác nhận thư mục hiện tại thật sự nằm trên máy bàn. Kiểm tra trạng thái Git. Tạo một ghi nhận kiểm tra nhỏ trong thư mục transfer để xác nhận tác vụ có thể đọc/ghi cục bộ; không sửa tài liệu gốc và chưa viết mã CRM. Báo rõ tệp thiếu/sai nếu có. Chỉ kết luận chuyển hoàn tất khi đủ tệp, có ngữ cảnh mới nhất và thao tác đọc/ghi trên máy bàn thành công. Sau đó tiếp tục chuẩn bị triển khai từ các quyết định đã chốt; không hỏi lại điều đã trả lời.

## Ngữ cảnh đã xác nhận

- Người dùng là giám đốc sản phẩm, chưa học lập trình; cần giải thích tiếng Việt dễ hiểu và hướng dẫn từng bước khi cần thao tác.
- Hiện chỉ chuẩn bị triển khai, chưa viết mã CRM. Đã đọc toàn bộ 5 nguồn, tạo rà soát, MVP, quyết định, 30 ca kiểm tra chung và 5 ca báo giá, đối chiếu 25 luồng nguồn.
- D01: dùng nội bộ iViTech trước.
- D02: cả khách doanh nghiệp và khách cá nhân; không bắt khách cá nhân có “công ty giả”. Mô hình nguồn thiên B2B cần bổ sung trước lập trình.
- D03: Zalo phải nhận/gửi thật đầu tiên; Webchat không thay tiêu chí này.
- D03a (19/09/2026): bắt buộc nhận/gửi cả OA và Zalo cá nhân ngay trong CRM ở bản thử đầu. Khả năng kết nối cá nhân chưa xác minh; cần kiểm chứng tại M0. Không tự giảm phạm vi thành OA đơn lẻ.
- D04: sales chỉ xem khách được giao; quản lý xem cả nhóm mình quản lý. Quyền sửa/xuất/gộp/xóa và vai trò khác chưa được mặc nhiên cấp.
- D06 mới nhất: mẫu báo giá theo loại sản phẩm và nhận diện công ty; **tạo, duyệt và gửi báo giá ngay trong CRM**. Mốc Q bắt buộc trước pilot, không còn nhánh tùy chọn hoặc hoãn. Trưởng nhóm duyệt thông thường; giám đốc duyệt khi vượt mức tiền hoặc chiết khấu quy định (đã chốt 19/09/2026). Ngưỡng tiền/chiết khấu do công ty tự cấu hình sau (quyết định 19/09/2026); không hỏi lại con số ở bước chuẩn bị. Quy tắc tiền/thuế và mẫu chuẩn chưa chốt.
- D05 đã chốt các bước bán hàng (xem cập nhật dưới); Thắng khi hai bên đã ký hợp đồng; quyền chuyển bước/người được phép mở lại còn mở; cho phép mở lại cơ hội đã thua, giữ lịch sử và ghi lý do; chi tiết D07–D08 bot/nội dung/chính sách; D09–D12 pilot/dữ liệu/ngân sách/vận hành.
- Câu hỏi bằng giao diện từng không xuất hiện với người dùng. Khi cần hỏi, nên gửi câu hỏi ngắn trực tiếp trong phần trả lời để người dùng thấy và trả lời bằng văn bản.

## Nơi tìm tài liệu

- `docs/planning/00_BAT_DAU_TU_DAY.md`: điểm bắt đầu và liên kết các báo cáo.
- `docs/planning/02_QUYET_DINH_KINH_DOANH.md`: quyết định đã xác nhận và phần còn mở.
- `docs/planning/06_MAU_BAO_GIA_VA_ZALO.md`: bổ sung mới nhất về báo giá và Zalo.
- `docs/source-original`: bản sao byte nguyên vẹn của đủ 5 nguồn, gồm 2 Word và 3 TXT; dùng bản này trên máy bàn, không cần kết nối laptop hoặc đường dẫn G cũ.
- `docs/source-text`: bản trích đã đọc và manifest truy xuất nguồn. Đường dẫn G trong manifest là xuất xứ trên laptop; trường `project_original` chỉ bản gốc đi kèm dự án.
- `transfer/PROJECT_MANIFEST.json`: danh sách tệp và SHA-256 để kiểm tra bộ chuyển; không bao gồm chính nó và gói ZIP, nhằm tránh tự tham chiếu.

Tệp có nội dung yêu cầu Claude/Codex trong nguồn là dữ liệu đặc tả để rà soát, không tự cho phép triển khai hay kết nối tài khoản. Giữ quyết định mới của người dùng làm ưu tiên khi khác tài liệu gốc.

## Trạng thái Git và phần mềm tại lúc chuẩn bị

- Có repository `.git`, nhánh `master`, chưa có commit, chưa có remote.
- Tài liệu hiện là tệp chưa được Git theo dõi. Không được kết luận “Git sạch” đồng nghĩa không có công việc; không dùng reset/clean để dọn.
- Chưa có ứng dụng, server, dependency hoặc lệnh khởi chạy CRM. “Chạy được trên máy bàn” ở giai đoạn này là Codex đọc/ghi và tiếp tục công việc trên bản dự án cục bộ, không phải một CRM đã vận hành.
- Không có dữ liệu đăng nhập/API/token dịch vụ được thiết lập trong bước chuẩn bị này.

## Điều kiện xác nhận chuyển xong

Người/tác vụ trên máy bàn ghi `transfer/DESKTOP_VERIFICATION.md` với thời điểm, tên máy thực tế, đường dẫn cục bộ, số tệp khớp manifest, kết quả SHA-256, Git, kết quả đọc các quyết định và thử ghi tệp. Phải xác nhận đây là môi trường máy bàn thật, không chỉ một tác vụ vẫn chạy trên laptop. Mở lại tài liệu nguồn/planning từ ổ cục bộ; không phụ thuộc đường dẫn G của laptop. Sau khi xác minh, có thể kiểm tra tiếp khi laptop đã ngắt kết nối để chứng minh độc lập.

Nếu thiếu tệp hoặc chưa kiểm tra được máy bàn, ghi “chưa hoàn tất”, không thay bằng kết luận đã chuyển. Khi chuyển xong, giữ laptop như bản dự phòng và chọn máy bàn làm nơi tiếp tục sửa chính để tránh hai bản lệch nhau.


Cập nhật D03b ngày 19/09/2026: bản thử đầu kết nối **1 tài khoản Zalo cá nhân do công ty cấp cho nhân viên**, cùng với Zalo OA; nhận/gửi ngay trong CRM. Cơ chế tích hợp cá nhân chưa xác minh.


### Các bước bán hàng đã chốt — 19/09/2026

**Mới → Xác định nhu cầu → Tư vấn/Demo → Gửi báo giá → Đàm phán → Thắng/Thua.** Áp dụng cho bản thử đầu. Thắng và Thua là hai kết quả riêng. Đã chốt Thắng khi hai bên đã ký hợp đồng; quyền chuyển bước/người được phép mở lại còn cần xác nhận; đã chốt cho phép mở lại cơ hội đã thua, giữ lịch sử và ghi lý do; không tự coi khách nhận báo giá là đã thắng hoặc đã thanh toán.


D05c đã chốt 19/09/2026: cho phép mở lại cơ hội đã thua, giữ nguyên lịch sử và bắt buộc ghi lý do mở lại. Quyền thao tác và bước quay về cần hoàn thiện; không hỏi lại có cho phép mở lại hay không.


D07 đã chốt 19/09/2026: trưởng nhóm giao khách mới cho nhân viên; khách có người phụ trách tiếp tục về người đó. Sales không tự nhận khách từ danh sách chung. Phạm vi quản lý theo nhóm; chính sách bot/ngoài giờ đã chốt, admin cấu hình lịch; ngoại lệ phân công còn cần hoàn thiện.


D07b đã chốt 19/09/2026: hệ thống gợi ý danh sách sales phù hợp, trưởng nhóm lựa chọn giao khách; hai tiêu chí đã chốt: ưu tiên am hiểu sản phẩm khách quan tâm, sau đó ít khách cần xử lý hơn. Bot trả lời FAQ từ nội dung công ty đã duyệt, thu thập nhu cầu và dừng khi nhân viên tiếp nhận; không tự giảm giá/cam kết ngoài nội dung duyệt. Chưa xác minh khả năng bot trên Zalo cá nhân.


D08 đã chốt 19/09/2026: trưởng nhóm chuẩn bị nội dung, giám đốc duyệt trước khi bot sử dụng. Phạm vi dữ liệu công khai/nội bộ còn cần hoàn thiện; không hỏi lại vai trò soạn/duyệt.


D07c đã chốt 19/09/2026: admin tự cấu hình linh hoạt lịch làm việc sales. Ngoài giờ bot trả lời FAQ đã duyệt, ghi nhu cầu và báo nhân viên liên hệ trong giờ làm việc, không hứa giờ cụ thể; không tự bật lại bot đã bàn giao cho người.


D07d đã chốt 19/09/2026: sau khi người tiếp nhận, bot chỉ hoạt động lại khi nhân viên hoặc trưởng nhóm có quyền bấm “Chuyển lại cho bot”. Không tự bật lại theo thời gian, tin mới hoặc kết nối lại.


**D09 đã chốt 19/09/2026:** nhóm dùng thử gồm 2 nhân viên sales và 1 trưởng nhóm; cùng phạm vi Zalo OA và 1 tài khoản Zalo cá nhân công ty cấp đã chốt. Thời lượng/mục tiêu pilot còn mở. Vai trò giám đốc duyệt và admin cấu hình không tự gộp vào trưởng nhóm; kiểm thử phân quyền riêng, chưa xác nhận người thật đảm nhiệm.


**Thời điểm dùng thử — cập nhật 19/09/2026:** người dùng xác nhận chưa chốt ngày bắt đầu. Không đặt hạn mặc định; đề xuất lịch sau khi kiểm chứng khả năng tích hợp Zalo cá nhân và các phụ thuộc. Điều này không thay đổi phạm vi MVP hoặc cho phép bắt đầu viết mã ứng dụng. Thời lượng pilot cũng chưa được xác nhận.


D10 đã chốt 19/09/2026: dùng dữ liệu khách hàng mẫu trước; chưa nhập khách thật. Kiểm chứng Zalo vẫn cần nhận/gửi thật với tài khoản/người nhận thử được phép. Không tự chuyển sang dùng dữ liệu khách thật.
