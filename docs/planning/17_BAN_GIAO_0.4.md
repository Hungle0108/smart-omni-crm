# Bàn giao bản 0.4 — tiến trình khách hàng và module OA

22/09/2026. Mở ứng dụng tại http://127.0.0.1:3000. Mã và dữ liệu nằm trong thư mục dự án trên máy này.

## Kết quả sử dụng

**Tiến trình khách hàng** đã có thẻ thu gọn/mở rộng theo ảnh tham chiếu, nền tảng/địa chỉ/dịch vụ, mẫu công việc dùng lại, việc con, người phụ trách, bắt đầu/hạn hoàn thành, trạng thái, lịch sử và lưu trữ/khôi phục. Tỷ lệ hoàn thành tính theo việc cuối cùng, không cộng thêm việc cha. Việc dùng chung với lịch và hồ sơ khách. Xem [hướng dẫn thao tác](16_TIEN_TRINH_KHACH_HANG.md).

**Zalo OA** đã có module nhận/gửi văn bản, cấu hình quản trị, bảo vệ thông tin kết nối, chống trùng, làm mới quyền, hàng đợi gửi và phân biệt hội thoại thật/mẫu. Hiện chưa có thông tin OA thật; chức năng này **chưa được nghiệm thu hai chiều với Zalo**. Bước tiếp theo là tạo ứng dụng Zalo, cấp quyền OA và chuẩn bị đường HTTPS nhận sự kiện. Xem [hướng dẫn OA](15_KET_NOI_ZALO_OA.md).

Giá báo giá vẫn cập nhật ngay theo lựa chọn/chiết khấu, giữ kiểm tra điều kiện Gói 1, trọn bộ và các phương án đào tạo. Không thay đổi quy chế duyệt công ty đã để cấu hình.

## Kiểm tra đã thực hiện

| Kiểm tra | Kết quả |
|---|---|
| `node app/test.js` | 12 nhóm đạt: vai trò, phân quyền, cơ hội, báo giá, gửi thử và đăng nhập |
| `node app/test-features.js` | 13 nhóm đạt: giờ làm, nội dung duyệt, bot, phiên bản báo giá, lịch, nhập CSV, bảo vệ phiên và lưu dữ liệu |
| `node app/test-progress.js` | 7 nhóm đạt: phạm vi khách, mẫu/việc con, tự cập nhật việc cha, chặn bỏ qua từ lịch, phân công, ngày giờ, lưu trữ/khôi phục |
| `node app/test-zalo.js` | 12 nhóm đạt bằng nhà cung cấp giả lập: chữ ký, phân quyền, bảo vệ mã, chống trùng, lỗi/timeout, dừng bot, echo, làm mới token và cổng webhook riêng |
| Giao diện qua trình duyệt Codex, DB riêng | Tạo thông tin triển khai, áp dụng 4 việc, thêm việc con có ngày giờ, ghi tiến độ, kiểm tra 25/50/75/100%, tạo mẫu có việc con, đổi hoa/admin và mở cấu hình OA |
| Màn hình nhỏ 390 × 844 | Đã xem thẻ khách và danh sách việc; sửa bố cục để tên/người phụ trách không bị ép hẹp; kiểm tra lại sau sửa |

Không chạy lại tệp giao diện tự động `test-ui.cjs` trong mốc này. Kiểm tra Zalo không gọi tài khoản thật; chưa kiểm thử tải, mất mạng dài hạn, điều kiện gửi/hạn mức thực tế hoặc hạ tầng HTTPS công khai.

## Bảo toàn dữ liệu và khởi động

Đã tạo bản sao SQLite nhất quán trước cập nhật tại `app/backups/before-oa-progress-20260922/crm.db`. Đây là bản sao **cơ sở dữ liệu**, không phải ảnh chụp toàn bộ mã nguồn trước mốc 0.4.

Đối chiếu các cột cũ trước/sau cập nhật: 3 khách, 2 cơ hội, 5 công việc, 2 báo giá, 13 tin nhắn và 3 hội thoại giữ nguyên dữ liệu. Kết quả trong `app/test-output/v04-data-preservation.json`. Không đưa dữ liệu thử giao diện vào cơ sở dữ liệu chính. Mẫu bốn bước được thêm vào danh sách mẫu, chưa tự áp dụng cho khách.

Migration cộng thêm dữ liệu/khả năng: `customer-progress-v1`, `zalo-oa-v1`. Dùng bảng tasks chung, thêm liên kết cha/thời gian/lưu trữ và các bảng tiến trình, mẫu, lịch sử; OA thêm bảng cấu hình, ánh xạ người dùng, sự kiện, echo và outbox. Không reset DB.

Đã khởi động lại bản hiện tại ở `127.0.0.1:3000`. Những lần sau dùng `CHAY_CRM.cmd`. Main CRM vẫn chỉ trên máy; cổng nhận webhook riêng là 3001 mặc định, chưa mở ra Internet. Không công bố cổng 3000.

Trước khi khôi phục bản sao, dừng ứng dụng và sao lưu dữ liệu hiện tại để không mất những thay đổi phát sinh sau mốc. Chưa có công cụ rollback tự động. Khi đã lưu thông tin OA, phải sao lưu cả khóa `app/crm.db.zalo-key` ở nơi có kiểm soát truy cập; bản sao DB cũ này chưa chứa cấu hình/khóa OA thật.

## Phần cần nghiệm thu tiếp

Chị thử tiến trình trên khách mẫu theo tài liệu 16. Các nhãn dịch vụ chưa thay thế hợp đồng hay điều kiện báo giá; mỗi việc có một người phụ trách, không phải danh sách nhiều người như ảnh gốc. Cách tính tỷ lệ hiện bằng nhau giữa các việc cuối cùng.

OA chỉ hoàn tất nghiệm thu sau khi tin của tài khoản thử xuất hiện trong CRM và câu trả lời tới đúng tài khoản đó trên Zalo, đồng thời kiểm tra bàn giao bot, phân quyền và lỗi gửi. Gửi tệp/báo giá thật, Zalo cá nhân thật, đăng nhập OAuth một nút, hạ tầng chạy liên tục và mô hình nhiều doanh nghiệp vẫn ngoài phần đã hoàn thành.
