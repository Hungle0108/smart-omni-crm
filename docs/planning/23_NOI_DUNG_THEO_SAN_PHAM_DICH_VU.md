# Mô tả và điều kiện thương mại theo sản phẩm / dịch vụ

Cập nhật 22/09/2026 theo yêu cầu chuyển Giới thiệu/Mô tả và Điều kiện thương mại khỏi phần tạo mẫu báo giá.

## Cách sử dụng

1. Đăng nhập admin, vào **Mẫu & nhận diện**.
2. Chọn **+ Loại sản phẩm / dịch vụ** hoặc **Sửa** loại đã có. Nhập **Giới thiệu / Mô tả mặc định** và **Điều kiện thương mại mặc định**.
3. Chọn **+ Sản phẩm / dịch vụ** hoặc **Sửa** sản phẩm. Nhập mô tả và điều kiện riêng của sản phẩm nếu có. Từng mục để trống sẽ lấy mặc định tương ứng của loại.
4. Tạo mẫu báo giá: chỉ chọn tên mẫu, loại, hạng mục và logo. Không cần nhập lại giới thiệu hoặc điều kiện.
5. Sales lập báo giá, chọn hạng mục và số lượng. Phần **Mô tả & điều kiện theo hạng mục đã chọn** hiển thị nội dung để kiểm tra. Lưu trước khi xem bản in.

Ví dụ: loại Tư vấn có điều kiện “Thanh toán trong 30 ngày”; sản phẩm A để trống thì dùng điều kiện đó, sản phẩm B nhập “Thanh toán trước 50%” thì dùng điều kiện riêng. Không cộng ghép hai điều kiện cho cùng một hạng mục. Quy tắc kế thừa áp dụng độc lập cho mô tả và điều kiện.

## Báo giá và dữ liệu cũ

- Bản in báo giá mới có mô tả dưới tên từng sản phẩm, và phần điều kiện thương mại tách theo từng hạng mục đã chọn.
- Mô tả, điều kiện và giá được giữ theo danh mục lúc tạo báo giá. Thay danh mục chỉ áp dụng cho báo giá tạo sau đó; các bản nháp đã lập và phiên bản tiếp nối giữ nội dung đã chốt.
- Báo giá có trước lần cập nhật giữ mô tả/điều kiện từ mẫu cũ; bản đã duyệt/gửi giữ nguyên bản đã lưu. Muốn áp dụng nội dung mới thì lập báo giá mới.
- Mô tả sản phẩm cũ được chuyển từ trường mô tả/phạm vi cung cấp. Nội dung từ mẫu cũ được đưa vào mặc định của loại nếu các mẫu cùng loại thống nhất nội dung. Mẫu cũ vẫn có phần đọc lại để tham khảo, không phải nơi chỉnh nội dung mới.
- Nếu các mẫu trong một loại khác nhau về một mục, hệ thống không tự chọn thay công ty: mặc định mục đó để trống, các bản gốc vẫn giữ ở phần tham khảo. Lúc cập nhật dữ liệu hiện tại không có loại nào gặp trường hợp này.
- Cả loại và sản phẩm đều để trống thì báo giá ghi chưa khai báo nội dung tương ứng; hệ thống không tự đặt điều kiện thương mại.
- Quyền quản lý danh mục vẫn thuộc admin; sales chọn hạng mục, không sửa lén mô tả/điều kiện qua yêu cầu lưu báo giá.

## Kiểm tra và bảo trì

- 6 nhóm kiểm tra mới đạt trong `app/test-service-content.js`: nhập và phân quyền; kế thừa từng mục; báo giá nhiều sản phẩm với nội dung khác nhau; không nhận nội dung giả từ sales; nháp/bản duyệt/phiên bản giữ nội dung; lưu qua khởi động lại.
- Hồi quy đạt: danh mục/giá/logo 8 nhóm, chức năng mở rộng 13 nhóm, lưu trữ/khôi phục 10 nhóm. Kiểm tra đào tạo nay xác minh điều kiện tại hạng mục dịch vụ thay vì mẫu.
- Kiểm tra giao diện trên dữ liệu riêng: tạo loại có hai trường mới → tạo sản phẩm có mô tả/điều kiện riêng → tạo mẫu không có hai trường cũ → sales chọn sản phẩm → lưu → bản in thể hiện đúng nội dung. Đã xem bố cục mô tả và điều kiện trên bản in. Không gửi báo giá ra ngoài.
- Sau cập nhật đã đối chiếu các cột cũ của 33 bảng với bản sao: dữ liệu cũ giữ nguyên; nhật ký đăng nhập mới phát sinh được loại khỏi phép so sánh. Nội dung mẫu của các báo giá cũ đã được giữ riêng. Bản sao: `app/backups/before-service-content-20260922/crm.db`.
- Migration `catalog-service-content-v1`: thêm `description`, `terms` cho loại/sản phẩm; thêm `content_source`, `legacy_template_content` cho báo giá. Không thay đổi dòng hạng mục hoặc JSON bản duyệt cũ.
- Tệp thay đổi: `app/catalog.js`, `app/catalog-ui.js`, `app/catalog.css`, `app/features.js`, `app/features-ui.js`; kiểm tra mới và cập nhật kiểm tra điều kiện đào tạo. API loại/sản phẩm nhận thêm `description` (tối đa 5.000 ký tự), `terms` (10.000 ký tự). API mẫu không yêu cầu nội dung này; nội dung cũ chỉ giữ để tương thích lịch sử.
- Tiếp tục kiến trúc SQLite localhost hiện có; không thêm kết nối hoặc tác vụ nền. Nội dung mẫu tham chiếu cũ không bị xóa. Kết quả kiểm tra mới: `app/test-output/service-content-results.json`.
