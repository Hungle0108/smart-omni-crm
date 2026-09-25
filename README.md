## Cập nhật 24/09/2026 — Phân quyền kênh

Admin/subadmin vào **Kênh kết nối → Phân quyền kênh theo người dùng** để chọn nhiều người, tìm/lọc/phân trang và đặt quyền chỉ xem hoặc xem/gửi. Chọn 0 người ở chế độ chỉ định không mở quyền cho ai. Đã kiểm thử máy chủ; một số kiểm tra giao diện còn giới hạn do công cụ trình duyệt. Xem [hướng dẫn và bàn giao](docs/planning/35_PHAN_QUYEN_KENH_BAN_GIAO.md).

## Cập nhật 24/09/2026 — Danh bạ theo đơn vị

Đã có dạng xem đơn vị mở rộng, liên hệ có sẵn/tạo mới, gỡ giữ lịch sử và hồ sơ liên hệ. Mở http://127.0.0.1:3000/#/customers. Xem [hướng dẫn và kiểm thử](docs/planning/32_DANH_BA_DON_VI_BAN_GIAO.md).

## Cập nhật 24/09/2026 — Super Admin riêng

Mở **http://127.0.0.1:3000/platform** để quản trị nền tảng. Lần đầu, đăng nhập admin iViTech hiện có rồi tự đặt tài khoản/mật khẩu Super Admin riêng tại trang này. CRM công ty vẫn ở http://127.0.0.1:3000/. Xem [hướng dẫn Super Admin](docs/planning/28_SUPER_ADMIN_LOCALHOST.md).

## Cập nhật 23/09/2026 — bản thử SaaS 0.5

Đã có nhiều công ty với dữ liệu riêng, admin/subadmin, phân kênh theo người dùng, nguồn cung/đối tác của sản phẩm và tìm kiếm/lọc nhiều lựa chọn. Xem [hướng dẫn và nghiệm thu](docs/planning/27_SAAS_CONG_TY_PHAN_KENH.md). Mã công ty hiện có: **ivitech**. Đây vẫn là bản localhost, chưa thu phí hoặc mở dịch vụ qua Internet.

# Smart Omni CRM — bản thử localhost

Cập nhật 23/09/2026: **Tải mẫu báo giá Word** cho trưởng nhóm/admin, có xem trước và gán phần tự điền; **Thêm kênh kết nối** với cấu hình API, riêng **VNPT SIP** theo đường truyền công ty đang có. Xem [hướng dẫn tải mẫu Word](docs/planning/25_TAI_MAU_BAO_GIA_WORD.md) và [kênh API/VNPT SIP](docs/planning/26_KENH_KET_NOI_API_VNPT_SIP.md). Các kênh mới chưa nhận/gửi tin hoặc gọi điện trong CRM.

Bổ sung 22/09/2026: **admin tạo loại sản phẩm/dịch vụ, đơn giá, chọn hạng mục cho mẫu và tải logo công ty**. Sales chọn hạng mục, số lượng; bản in có logo và đơn giá. Xem [hướng dẫn danh mục và logo báo giá](docs/planning/20_DANH_MUC_DON_GIA_LOGO_BAO_GIA.md).

Bổ sung 22/09/2026: **cây tổ chức → đơn vị con và người liên hệ theo từng đơn vị**. Vào **Danh bạ khách hàng → mở tổ chức → Tổ chức & đơn vị con / Người liên hệ**. Xem [hướng dẫn tổ chức và cá nhân liên hệ](docs/planning/19_TO_CHUC_DON_VI_CON_NGUOI_LIEN_HE.md).

Cập nhật 22/09/2026 · bản 0.4. Đã thêm **Tiến trình khách hàng** theo ảnh tham chiếu: mẫu công việc, việc con, người phụ trách, thời hạn, lịch sử và phần trăm hoàn thành. Đã có module cấu hình Zalo OA, nhưng **OA iViTech chưa được kết nối thật** vì còn chờ tạo ứng dụng, cấp quyền và địa chỉ HTTPS nhận tin. Hội thoại mẫu và Zalo cá nhân vẫn mô phỏng; chưa có AI tạo sinh. Đây chưa phải toàn bộ MVP Omni CRM hoàn chỉnh.

Thử ngay: đăng nhập **hoa → [Tiến trình khách hàng](http://127.0.0.1:3000/#/progress) → chọn khách → Áp dụng mẫu**. Xem [hướng dẫn tiến trình](docs/planning/16_TIEN_TRINH_KHACH_HANG.md), [hướng dẫn kết nối OA](docs/planning/15_KET_NOI_ZALO_OA.md) và [bàn giao 0.4](docs/planning/17_BAN_GIAO_0.4.md).

Đối chiếu mới với hai file iVier CRM: [báo cáo yêu cầu và khoảng thiếu](docs/planning/18_DOI_CHIEU_REQUIREMENTS_IVIER_CRM.md). Bản 0.4 chưa đạt toàn bộ MVP trong hai file; báo cáo cũng ghi nhận lỗi giới hạn mẫu sáu cấp cần sửa.

## Mở ứng dụng

1. Nhấp đúp **CHAY_CRM.cmd** trong thư mục dự án.
2. Mở [Smart Omni CRM](http://127.0.0.1:3000) bằng trình duyệt.
3. Giữ cửa sổ chạy ứng dụng trong lúc test. Để dừng, nhấn Ctrl+C trong cửa sổ đó. Mở lại không xoá dữ liệu.

Nếu ứng dụng đã chạy, tệp khởi động mở trang hiện có. Nếu máy báo cổng đang được sử dụng mà trang không mở, gửi lại thông báo lỗi; không xoá cơ sở dữ liệu để xử lý lỗi này.

Cách chạy bằng cửa sổ dòng lệnh tại thư mục dự án:

```text
node app/server.js
```

Dùng Node.js 24 trở lên. Thư viện đọc Word được khóa phiên bản; CHAY_CRM.cmd cài khi thiếu (cần Internet lần đầu). Mã và dữ liệu nằm trên máy đang mở. Thư mục này ở Documents, chưa có tính năng đồng bộ dữ liệu CRM với PC. Không đặt tệp cơ sở dữ liệu đang chạy vào thư mục Google Drive để chạy đồng thời trên hai máy.

## Tài khoản thử

Mật khẩu mẫu của cả năm tài khoản: **123456**. Đây chỉ là tài khoản cho bản localhost. Admin có thể đổi mật khẩu ở **Người dùng**.

| Tài khoản | Vai trò | Dùng để thử |
|---|---|---|
| `admin` | Quản trị | Cấu hình giờ làm, mẫu/nhận diện, kênh kết nối và tài khoản |
| `hoa` | Trưởng nhóm | Giao khách, gợi ý sales, duyệt báo giá thông thường, soạn FAQ |
| `lan` | Sales Smart iVier | Xử lý khách được giao, báo giá giải pháp |
| `minh` | Sales đào tạo AI | Xử lý khách được giao, báo giá đào tạo |
| `duc` | Giám đốc | Duyệt báo giá thuộc cấp giám đốc; duyệt nội dung cho bot |

Bấm **Đổi tài khoản** ở góc trên bên phải, chọn vai trò trong **Chọn tài khoản để test** và bấm **Đăng nhập**. Bạn cũng có thể gõ tên vào ô Tài khoản. Đã sửa lỗi trước đây làm ô tài khoản không nhận phím gõ/xoá. Mật khẩu vẫn được kiểm tra bình thường; danh sách chọn không bỏ qua đăng nhập. Nếu nhập sai mật khẩu, màn hình giữ tên tài khoản đã chọn để bạn sửa lại. Dữ liệu hiện có được giữ lại, không thay bằng dữ liệu của bài test tự động.

## Thử nhanh giao diện mới

1. Đăng nhập `hoa`, mở **Danh bạ khách hàng**, chọn một khách để xem hồ sơ. Thử các thẻ Lịch sử tương tác, Cơ hội & báo giá, Kế hoạch, Ghi chú.
2. Bấm **Lên lịch** trong hồ sơ, chọn Cuộc gọi/Demo/Cuộc họp, thời gian và người thực hiện. Mở **Kế hoạch tiếp xúc → Lịch tuần** để xem việc vừa tạo đúng khách, đúng giờ.
3. Mở **Hộp thư Zalo**: chọn khách bên trái, trao đổi ở giữa, xem hồ sơ bên phải. **Ghi chú nội bộ** lưu vào hồ sơ; **Trả lời qua Zalo** lưu tin gửi thử trong hội thoại. Nút **Tin nhắn thử nghiệm** dùng để giả lập tin khách.
4. Mở **Cơ hội bán hàng**, chọn một thẻ rồi bấm **Lập báo giá** để báo giá gắn với cơ hội. Trên màn hình nhỏ, kéo ngang bảng để xem đủ 7 bước.
5. Dùng **Tìm kiếm nhanh** ở đầu trang để mở khách/cơ hội/báo giá/kế hoạch trong phạm vi tài khoản. Đổi sang `lan` hoặc `minh` để kiểm tra sales chỉ thấy khách được giao.

Lịch tuần hiện lưu kế hoạch trong CRM, chưa đồng bộ Google Calendar hay gửi lời mời họp. Xem [bàn giao giao diện 0.3](docs/planning/13_BAN_GIAO_GIAO_DIEN_0.3.md) để biết phạm vi và kết quả kiểm tra.

## Thử theo thứ tự này

1. **admin → Cấu hình:** Lưu lịch làm việc. **hoa → Mẫu & nhận diện → Thiết lập duyệt báo giá:** đặt ngưỡng tiền/chiết khấu theo loại và sản phẩm. Nếu chưa đủ ngưỡng, báo giá không được gửi duyệt.
2. **hoa → Hộp thư Zalo:** Mở khách chưa được giao, xem gợi ý theo chuyên môn rồi số khách cần xử lý, chọn sales. Khách có người phụ trách tiếp tục thuộc người đó.
3. **lan/minh → Danh bạ khách hàng:** Mở hồ sơ, ghi chú, tạo cơ hội, kế hoạch tiếp xúc, báo giá hoặc hội thoại thử.
4. **Sales → Báo giá:** Chọn khách, mẫu dịch vụ, hạng mục rồi Lưu & gửi duyệt. Gói 2/3/4 cần hồ sơ đã đăng ký Gói 1; chọn Gói 1 trong cùng báo giá chưa đủ. AI 05/10/20 là các phương án chọn một. Không cộng trọn bộ cùng gói thành phần.
5. **hoa/duc:** Duyệt theo cấp đang hiển thị. Sales mở lại để xem bản in, lưu PDF hoặc gửi qua kênh thử. Bản gửi thử lưu trong hộp thư và lịch sử báo giá; chưa chuyển đến Zalo.
6. **hoa → Nội dung bot:** Sửa/lưu/gửi duyệt nội dung. **duc** duyệt. **minh → Hộp thư Zalo cá nhân:** tạo tin khách thử, thử ngoài giờ, tiếp nhận và chuyển lại cho bot. Bot chỉ tra FAQ được duyệt, không tự giảm giá.
7. **Cơ hội:** Thắng cần xác nhận hai bên ký, giá trị và ngày chốt. Thua cần lý do. Mở lại cơ hội thua cần lý do; lịch sử được giữ.
8. **hoa → Khách hàng → Nhập CSV:** Tải tệp mẫu, xem trước rồi xác nhận nhập. Dùng mẫu trước. Chỉ nhập nhóm khách thật sau khi bạn đã kiểm tra và chọn danh sách phù hợp.

Trong ứng dụng cũng có mục **Hướng dẫn test**. Xem [kịch bản nghiệm thu bản localhost](docs/planning/10_NGHIEM_THU_LOCALHOST.md) để ghi kết quả.

## Đã chạy và giới hạn

| Đã có thể thao tác và lưu dữ liệu | Phần còn thiếu hoặc mô phỏng |
|---|---|
| Khách tổ chức/cá nhân, ghi chú, phân công và phân quyền | Chưa có mô hình nhiều doanh nghiệp, nhiều bộ phận đầy đủ |
| Cơ hội, lịch sử bước, lịch tiếp xúc theo tuần, số liệu tổng quan | Chưa đồng bộ lịch ngoài, gửi lời mời họp, quản lý hợp đồng/thanh toán hoặc báo cáo tuỳ chỉnh |
| Mẫu/nhận diện, tạo–duyệt–gửi thử báo giá, phiên bản và bản in | Chưa có trình thiết kế mẫu kéo thả, gửi file PDF thật hoặc ký số |
| Hộp thư thử, module OA có webhook và hàng đợi gửi văn bản, gợi ý sales, tiếp nhận/chuyển bot | Chưa nghiệm thu OA thật; Zalo cá nhân còn mô phỏng; chưa gửi tệp/báo giá thật hay xác nhận đã đọc |
| Tiến trình khách, mẫu/việc con, phân công, thời hạn, lịch sử, lưu trữ/khôi phục | Chưa có trọng số tiến độ, nhiều người phụ trách một việc hoặc bộ phận triển khai riêng |
| Nội dung FAQ có người duyệt và phiên bản, thử ngoài giờ | Chưa có RAG, mô hình AI, Copilot, trình thiết kế bot/workflow hay thông báo bên ngoài |
| Nhập CSV xem trước, cấu hình, thêm/khóa tài khoản, nhóm, lưu trữ/khôi phục dữ liệu, nhật ký | Chưa có vai trò tùy chỉnh, chuyển nhóm của tài khoản cũ, xuất diện rộng, gộp hoặc xóa vĩnh viễn khách |

Giá và điều kiện mặc định lấy từ tài liệu bạn gửi, cần công ty rà lại trước khi gửi khách thật. Thuế suất chưa xác định. Dịch vụ đào tạo tính 12 tháng từ ngày kích hoạt, không lấy ngày báo giá thay thế.

## Tài liệu và kiểm tra

- [Ngưỡng duyệt theo loại/sản phẩm](docs/planning/24_NGUONG_DUYET_THEO_SAN_PHAM.md): trưởng nhóm thiết lập ngay tại Mẫu & nhận diện, chính sách riêng theo nhóm và bảo toàn các báo giá đang chờ.

- [Mô tả và điều kiện theo sản phẩm/dịch vụ](docs/planning/23_NOI_DUNG_THEO_SAN_PHAM_DICH_VU.md): nội dung mặc định theo loại, nội dung riêng theo sản phẩm, cách đưa vào báo giá và giữ nội dung cũ.

- [Thêm, lưu trữ và khôi phục dữ liệu](docs/planning/22_THEM_LUU_TRU_KHOI_PHUC.md): hướng dẫn thao tác, quyền từng chức năng, giới hạn và kiểm tra ngày 22/09/2026.

- [Áp dụng file tham chiếu CLAUDE.md](docs/reference/00_CACH_AP_DUNG.md): giữ nguyên bản gốc và ghi rõ sai khác kiến trúc.
- [Báo cáo bàn giao kỹ thuật](docs/planning/11_BAO_CAO_LOCALHOST.md): phạm vi, kiểm thử, migration và phần chưa xác minh.
- [Hiệu chỉnh theo prototype](docs/planning/12_HIEU_CHINH_THEO_PROTOTYPE.md): cách áp dụng giao diện và đối chiếu các quy tắc đã chốt.
- [Bàn giao giao diện 0.3](docs/planning/13_BAN_GIAO_GIAO_DIEN_0.3.md): tính năng mới và kết quả kiểm tra của lần hiệu chỉnh này.
- [Bộ kế hoạch sản phẩm](docs/planning/00_BAT_DAU_TU_DAY.md): rà soát nguồn, quyết định, MVP và các mốc.
- `docs/source-original`, `docs/source-text`: tài liệu nguồn; `docs/quotation-references`: báo giá tham chiếu; `docs/design`: thiết kế trước lập trình.

Dữ liệu chính: `app/crm.db` và các tệp `crm.db-wal`, `crm.db-shm` nếu đang chạy. Bản sao trước lần hiệu chỉnh giao diện nằm trong `app/backups/before-prototype-adaptation-20260921`; bản sao mốc trước vẫn nằm trong `app/backups/before-localhost-20260921`. Không ghi đè bằng bản sao cũ nếu đã nhập thêm dữ liệu. Để sao lưu thủ công, dừng ứng dụng hoàn toàn rồi sao chép cả thư mục `app` sang vị trí sao lưu riêng.

Kiểm tra cho người phụ trách kỹ thuật:

```text
node app/test.js
node app/test-features.js
node app/test-progress.js
node app/test-zalo.js
node app/test-lifecycle.js
node app/test-ui.cjs
```

Mốc 0.3: đã chạy đạt 12 nhóm nghiệp vụ và 13 nhóm bổ sung. Kiểm tra giao diện mới bằng trình duyệt trong Codex trên cơ sở dữ liệu riêng, gồm gõ/xoá tài khoản, đổi vai trò, lịch tuần, hồ sơ, hộp thư, tìm kiếm và luồng duyệt–gửi báo giá. Danh sách cụ thể nằm trong báo cáo 13. Kết quả 8 nhóm Edge của báo cáo 11 thuộc mốc 0.2; chưa chạy lại toàn bộ tệp `test-ui.cjs` sau lần đổi giao diện này. Tệp đó đã được cập nhật thao tác gõ phím để bắt lại lỗi tài khoản.

Bài test trình duyệt cần Playwright có sẵn trong runtime Codex của máy này; máy khác đặt `PLAYWRIGHT_PATH` tới thư viện Playwright của máy đó. Kết quả nằm trong `app/test-output`, dữ liệu test tách riêng với dữ liệu dùng thử.
