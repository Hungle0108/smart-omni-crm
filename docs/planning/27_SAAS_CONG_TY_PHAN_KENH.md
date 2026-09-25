# Bản thử nhiều công ty, nguồn cung và phân kênh — 23/09/2026

## Các quyết định đã xác nhận

- Smart Omni CRM phục vụ nội bộ iViTech và hướng tới cho thuê dịch vụ SaaS.
- Mỗi công ty có admin. Subadmin quản lý danh mục, người dùng thường và phân kênh trong công ty; không tạo/sửa admin, không quản lý công ty khác hoặc gói thuê.
- Sản phẩm/dịch vụ có thể do công ty tự cung cấp, hợp tác hoặc phân phối cho đối tác.
- Có tìm kiếm và lọc nhiều lựa chọn tại các mục chức năng.
- Admin cấu hình kênh và phân người dùng; subadmin được phân người dùng nhưng không sửa mã API.

## Cách dùng bản cập nhật

### 1. Tạo công ty và người dùng

Đăng nhập công ty **ivitech**, tài khoản **admin** hiện có → **Người dùng** → **Thêm công ty**. Nhập mã, tên công ty, mục đích dùng và admin ban đầu. Mã công ty dùng ở màn hình đăng nhập.

Mỗi công ty mới bắt đầu với một admin và một nhóm kinh doanh trống. Không sao chép khách, sản phẩm, mẫu báo giá, nội dung bot hay các tài khoản mẫu của iViTech. Quy trình bán hàng cơ bản và lịch làm việc chưa xác nhận là cấu hình mặc định, có thể chỉnh tiếp.

Đăng nhập admin của công ty mới → tạo nhóm, trưởng nhóm, sales, giám đốc hoặc subadmin. Admin có thể đổi cấp giữa admin/subadmin cho tài khoản quản trị khác. Không tự hạ quyền, không đổi cấp chủ nền tảng; cần giữ ít nhất một admin hoạt động.

Chỉ **chủ nền tảng** nhìn thấy danh sách công ty và nút thêm/tạm dừng/mở lại công ty. Ở dữ liệu iViTech hiện có, quyền này được gán một lần cho admin đầu tiên đang hoạt động. Tạo thêm admin trong công ty không tự có quyền chủ nền tảng.

Tạm dừng công ty giữ dữ liệu, chặn đăng nhập, thu hồi các phiên hiện có và dừng xử lý webhook/hàng đợi mới. Một yêu cầu đã chuyển tới nhà cung cấp trước khi tạm dừng không thể thu hồi. Mở lại yêu cầu đăng nhập lại. Chưa có xóa vĩnh viễn công ty.

Phạm vi nghiệp vụ đã chốt vẫn giữ: sales chỉ khách được giao, trưởng nhóm trong nhóm; giám đốc duyệt theo lượt. Quyền quản trị cấu hình không tự biến thành quyền đọc toàn bộ hội thoại khách.

### 2. Nguồn cung sản phẩm/dịch vụ

**Mẫu & nhận diện → Thêm/Sửa sản phẩm/dịch vụ → Hình thức cung cấp**:

- Công ty tự cung cấp.
- Hợp tác với đối tác: bắt buộc tên đối tác.
- Phân phối cho đối tác: bắt buộc tên đối tác.
- Chưa xác định: giữ cho dữ liệu cũ chưa được xác nhận.

Thông tin nguồn cung được lưu trong bản danh mục của báo giá mới. Sửa đối tác/giá ở danh mục không sửa các báo giá đã tạo. Chưa có quản lý hợp đồng đối tác, giá vốn hay hoa hồng; chưa tự đưa tên đối tác lên bản báo giá gửi khách.

### 3. Phân kênh theo người

**Kênh kết nối → Phân kênh cho từng người dùng → Phân người dùng**.

| Lựa chọn | Hiệu lực |
|---|---|
| Theo phạm vi nhóm hiện có | Giữ cách truy cập đang dùng, không làm gián đoạn khi nâng cấp |
| Chỉ những người được chọn | Danh sách cho phép riêng của kênh |
| Không cấp | Không được xem hội thoại trên kênh |
| Chỉ xem | Đọc hội thoại trong phạm vi khách, không gửi/tiếp nhận/chuyển bot/đổi trạng thái |
| Xem và gửi / thao tác | Thao tác trong phạm vi khách đã có quyền |

Chọn nhiều người bằng các dòng trong hộp thoại; có ô tìm theo tên/tài khoản. Với kênh API bổ sung, chọn người thuộc nhóm phụ trách của kênh. Danh sách trống ở chế độ chọn riêng nghĩa là chưa cấp cho người dùng thường nào. Admin/subadmin quản lý phân quyền, không mặc nhiên được đọc khách.

Quyền này áp dụng cả danh sách và đường dẫn trực tiếp/API, gồm gửi tin OA. Cấu hình phân quyền không tự kích hoạt kết nối: Zalo cá nhân vẫn mô phỏng; Thoại/VNPT SIP, Messenger, WhatsApp, Viber hiện lưu cấu hình/kiểm tra tài khoản theo khả năng của bộ kết nối, chưa nhận/gửi hay gọi điện trong CRM.

### 4. Tìm kiếm và nhiều lựa chọn

Đầu mỗi mục có **Tìm trong mục này**, **Lọc nhiều loại / trạng thái**, **Xóa bộ lọc**. Hỗ trợ từ khóa không dấu. Chọn nhiều giá trị lấy các mục khớp ít nhất một giá trị; từ khóa được áp dụng đồng thời. Bộ lọc riêng vốn có của màn hình vẫn áp dụng. Số tổng quan/thống kê không đổi theo bộ lọc danh sách bổ sung.

Ở cấu hình, tổng quan và hướng dẫn, tìm theo nội dung từng khối. Ở danh sách nghiệp vụ, tìm trong các bản ghi được phép xem. Cây tổ chức tạm ẩn khi lọc danh sách khách để tránh hiểu nhầm là cây đã được lọc. Xóa bộ lọc để xem lại cây.

## Nghiệm thu đề nghị

1. Tạo công ty thử; đăng nhập bằng mã mới. Không có khách/sản phẩm/tài khoản mẫu iViTech.
2. Tạo admin/subadmin/sales. Subadmin thêm sales và sản phẩm được, không tạo admin hoặc sửa API được.
3. Hai công ty cùng có tài khoản tên `sales` vẫn chỉ thấy dữ liệu riêng. Đổi mã công ty cần đăng nhập đúng công ty; tab cũ bị chặn nếu phiên đã đổi sang công ty khác.
4. Tạo sản phẩm “Phân phối”, bỏ tên đối tác: không lưu được. Nhập tên: lưu và mở lại thấy đúng.
5. Phân Zalo OA cho sales ở quyền chỉ xem: đọc được khách của mình, không gửi. Đổi sang xem/gửi: được thao tác; khách của sales khác vẫn bị chặn.
6. Thu hồi quyền kênh: danh sách và URL hội thoại bị chặn ngay. Lưu đồng thời hai cửa sổ được phát hiện để tránh ghi đè phân quyền.
7. Chọn hai vai trò trong bộ lọc Người dùng và nhập tên không dấu; chỉ còn kết quả khớp. Xóa lọc phục hồi danh sách.
8. Khởi động lại: công ty, người dùng, đối tác và phân quyền còn nguyên.

## Hiện trạng kỹ thuật và giới hạn SaaS

Bản 0.5 là **bản thử SaaS trên localhost**, chưa triển khai dịch vụ cho khách ngoài Internet. Mỗi công ty có một SQLite riêng, bộ phiên riêng, khóa mã hóa kênh riêng; registry nền tảng chỉ chứa thông tin quản lý công ty. Công ty được chọn để định tuyến; quyền truy cập được quyết định bằng phiên đã xác thực của chính công ty đó, không bằng mã công ty gửi lên.

Dữ liệu iViTech giữ tại `app/crm.db`. Registry tại `app/crm.db.platform.db`. Các công ty mới ở `app/crm.db.companies/<mã nội bộ>/crm.db` cùng các khóa kênh đi kèm. Đường dẫn công ty mới lưu tương đối để có thể chuyển cả bộ thư mục sang máy khác.

Sao lưu phải gồm cả các cơ sở dữ liệu, registry và khóa `.zalo-key`/`.channels-key`; sao chép khi ứng dụng đã dừng hoặc dùng công cụ sao lưu SQLite phù hợp, không chỉ lấy riêng `crm.db`. Không đưa dữ liệu/khóa thật vào Git.

Trước cho thuê thật còn cần: chốt gói thuê và cách thu phí, triển khai HTTPS/tên miền, cơ chế khôi phục mật khẩu và xác thực phù hợp, sao lưu/khôi phục có diễn tập, giám sát vận hành, giới hạn tài nguyên mỗi công ty, kiểm thử tải và hoàn thiện các bộ nhận/gửi thật. Chưa chuyển sang PostgreSQL/Redis theo kiến trúc đích; các quyết định giá thuê chưa được tự đặt thay công ty.

## Kiểm chứng

- `app/test-saas.js`: kiểm thử hai công ty, phân quyền, nguồn cung, thu hồi phiên và khởi động lại.
- Các bộ kiểm thử hồi quy khách/tổ chức, tiến trình, báo giá/danh mục, Word, OA, vòng đời dữ liệu và ngưỡng duyệt đều đạt trên dữ liệu thử riêng.
- Đã thao tác giao diện với admin, subadmin, trưởng nhóm; thử tìm không dấu/lọc nhiều vai trò và mở các biểu mẫu công ty, nguồn cung, phân kênh. Không gửi tin hoặc gọi điện thật.


## Cập nhật 24/09/2026

Chức năng chủ nền tảng đã được tách sang tài khoản Super Admin và màn hình `/platform` riêng. Hướng dẫn tạo công ty bằng admin iViTech trong bản 23/09 ở trên được thay thế bằng [hướng dẫn mới](28_SUPER_ADMIN_LOCALHOST.md). Admin/subadmin của các công ty không quản lý nền tảng.
