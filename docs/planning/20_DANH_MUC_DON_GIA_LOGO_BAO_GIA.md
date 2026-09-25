# Danh mục sản phẩm, đơn giá và logo báo giá

Cập nhật 22/09/2026. Đã triển khai trong bản localhost hiện tại.

## Admin chuẩn bị

Vào **Mẫu & nhận diện** theo thứ tự sau:

1. **+ Loại sản phẩm / dịch vụ**: nhập tên loại, ví dụ Tư vấn doanh nghiệp. Có thể sửa tên loại. Hai loại Smart iVier và Đào tạo AI hiện có được giữ lại.
2. **+ Sản phẩm / dịch vụ**: chọn loại, nhập tên, mã sản phẩm, đơn vị tính, đơn giá VNĐ trước thuế, phí gia hạn nếu có, mô tả và trạng thái đang bán. Mã được gợi ý tự động và có thể sửa trước khi tạo.
3. **+ Thêm mẫu** hoặc **Sửa mẫu**: nhập tên, chọn loại, tick các hạng mục sales được phép chọn, điền giới thiệu và điều kiện thương mại.
4. **Nhận diện công ty → Logo công ty**: chọn ảnh từ máy, xem trước rồi bấm **Lưu nhận diện**. Trong cửa sổ tạo/sửa mẫu cũng có **Logo riêng cho mẫu** nếu muốn dùng ảnh khác. Không chọn ảnh riêng thì mẫu dùng logo chung.

Logo nhận PNG, JPG hoặc WebP, tối đa 300 KB. Giao diện kiểm tra ảnh đọc được và kích thước không quá 4.096 pixel mỗi chiều. Ảnh được lưu tại bản CRM trên máy; không gửi tới nhà cung cấp ảnh bên ngoài. Đổi/bỏ ảnh cần lưu để có hiệu lực.

Đơn giá cần là số nguyên VNĐ, từ 0 đến 10 tỷ/đơn vị. Phí gia hạn để trống nghĩa là **chưa xác định**, nhập 0 nghĩa là **không thu**. Thuế vẫn chưa được tự xác định; đây không phải hệ thống xuất hóa đơn.

## Sales sử dụng

1. Vào **Báo giá & phê duyệt → Lập báo giá**, chọn khách và mẫu.
2. Tick các hạng mục, nhập số lượng nguyên từ 1 đến 1.000. Tổng tiền cập nhật ngay theo đơn giá đã chốt khi lập báo giá; sales không tự ghi đè đơn giá.
3. Bấm **Lưu nội dung** hoặc **Lưu & gửi duyệt** theo quy trình hiện có.
4. **Xem bản in / lưu PDF** có logo, đơn vị tính, số lượng, đơn giá, thành tiền, mô tả hạng mục và phí gia hạn. Trước khi mở bản in, cần lưu các thay đổi đang nhập.

Ví dụ thử trên dữ liệu riêng: 1.250.000đ/buổi × 3 buổi = 3.750.000đ trước giảm giá và thuế.

## Cách áp dụng thay đổi

- Giá, tên, đơn vị tính và phạm vi của hạng mục được chốt vào danh mục của báo giá lúc tạo. Admin sửa danh mục sau đó chỉ tác động tới báo giá mới. Muốn dùng giá mới, sales lập báo giá mới; chưa có nút tự đồng bộ lại giá trên bản cũ.
- Tạo phiên bản mới từ một báo giá hiện có tiếp tục giữ danh mục giá của bản gốc.
- Bản đã duyệt giữ nguyên nội dung, giá, logo và nhận diện tại lần duyệt; bản đã gửi không sửa đè. Thay đổi nội dung sau duyệt vẫn phải duyệt lại như trước.
- Mẫu mới có danh sách hạng mục được chọn rõ ràng. Các mẫu cũ chưa từng chọn hạng mục tiếp tục dùng toàn bộ sản phẩm đang bán trong cùng loại; khi sửa và lưu danh sách, mẫu sẽ chỉ dùng các mã đã tick.
- Ngừng bán một sản phẩm chặn việc đưa nó vào báo giá tạo mới. Báo giá đã lập vẫn giữ hạng mục và giá cũ để duyệt/tra cứu theo quy trình hiện có. Không xóa sản phẩm đã dùng.
- Mẫu không có hạng mục đang bán vẫn có thể lưu để chuẩn bị, nhưng không thể dùng lập báo giá cho đến khi admin bổ sung.
- Mã loại và mã sản phẩm không đổi sau khi tạo. Không chuyển mã sản phẩm hoặc mẫu đã có sang một loại khác; tạo mã/mẫu mới khi cần.
- Giữ quy tắc Gói 1 và gói bán kèm, trọn bộ không cộng trùng, nhóm Đào tạo AI chọn một phương án và tính 12 tháng từ kích hoạt. Các loại mới do admin tạo có thể chọn nhiều hạng mục.

## Triển khai và kiểm tra

Phạm vi: `catalog.js`, `catalog-ui.js`, `catalog.css`, tích hợp các luồng báo giá trong `features.js`, `features-ui.js`, `workspace-ui.js`, và tải tài nguyên qua `server.js`/`app.html`. Không thêm tác vụ nền hoặc dịch vụ bên ngoài.

Migration cộng thêm `catalog-prices-logo-v1`: bảng `product_categories`; đơn vị/trạng thái sản phẩm; danh sách mã và logo mẫu; danh mục giá lưu trên báo giá; đơn vị/mô tả trên dòng báo giá. Chuyển dữ liệu cũ giữ giá các dòng đã lưu, không sửa snapshot của bản đã duyệt.

Tiếp tục sử dụng SQLite và các quy ước của bản localhost đã có. Đây chưa phải chuyển đổi sang kiến trúc PostgreSQL, đa công ty hoặc kho tệp sản xuất trong tài liệu tham chiếu. Logo nhỏ được lưu cùng cấu hình và snapshot cho bản thử, thay vì triển khai kho tệp bên ngoài trong thay đổi này.

API mới, đều cần đăng nhập:

| API | Quyền và dữ liệu |
|---|---|
| GET `/api/product-categories` | Đọc danh sách `{id,name}` |
| POST `/api/product-categories` | Admin; `{id,name}`, trả `{id}`; chặn mã/tên trùng |
| PUT `/api/product-categories/:id` | Admin; `{name}`, trả `{ok:true}` |
| PUT `/api/products/:code` | Admin; `{name,family,unit,first_year,renewal,note,active}`, trả `{ok:true}` |
| PUT `/api/templates/:id` | Admin; thêm `product_codes` (tối đa 40, đúng loại), `logo` (data URL ảnh hoặc chuỗi rỗng) vào các trường mẫu hiện có |
| PUT `/api/brand` | Admin; thêm `logo`, giữ logo cũ nếu không truyền trường này |
| GET `/api/quotes/:id` | Giữ phạm vi khách hàng; thêm `catalog` chứa hạng mục và đơn giá đã chốt |

Lỗi: 401 khi chưa đăng nhập; 403 khi không có quyền; 400 khi nội dung, giá, loại hoặc ảnh không hợp lệ; giới hạn nội dung JSON chung 2 MB trả 413. Máy chủ kiểm tra chữ ký PNG/JPEG/WebP, kích thước tệp và quyền admin; không chấp nhận SVG hay URL ảnh ngoài. Thao tác lưu danh mục, loại, mẫu và nhận diện được ghi audit. Giao dịch lưu báo giá tiếp tục kiểm tra quyền khách, hạng mục, số lượng và quy tắc gói ở máy chủ.

Kết quả thực chạy: **8 nhóm danh mục/logo**, **13 nhóm chức năng CRM**, **12 nhóm nghiệp vụ nền tảng** đạt. Trình duyệt đã thử tạo loại → sản phẩm → mẫu có ảnh tải từ máy → đăng nhập sales → chọn mẫu → nhập 3 buổi → lưu → xác nhận logo và bảng giá trên trang bản in. Chưa kiểm tra in ra giấy hoặc xuất tệp PDF qua hộp thoại hệ điều hành.

Bản sao trước cập nhật: `app/backups/before-catalog-20260922/crm.db`. Dữ liệu kiểm tra và ảnh LOGO TEST nằm riêng trong `app/test-output`, không được đưa vào dữ liệu đang dùng.

Chạy lại: `node app/test-catalog.js`. Kết quả: `app/test-output/catalog-results.json`.
