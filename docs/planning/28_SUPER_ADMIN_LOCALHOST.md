# Super Admin riêng trên localhost — 24/09/2026

## Hai địa chỉ dùng thử

- Quản trị nền tảng: http://127.0.0.1:3000/platform
- CRM của từng công ty: http://127.0.0.1:3000/

Cùng một ứng dụng localhost, có hai màn hình đăng nhập và hai loại tài khoản riêng.

## Thiết lập Super Admin lần đầu

1. Đăng nhập CRM bằng tài khoản admin iViTech đang giữ quyền chủ nền tảng cũ. Mã công ty là `ivitech`.
2. Mở **Quản trị nền tảng — Super Admin** từ màn hình Người dùng hoặc mở địa chỉ `/platform` ở trên, trên cùng trình duyệt và cùng tên miền `127.0.0.1`.
3. Màn hình **Khởi tạo Super Admin riêng** yêu cầu mật khẩu admin iViTech hiện tại để xác nhận quyền khởi tạo.
4. Nhập tên đăng nhập Super Admin, họ tên và mật khẩu mới ít nhất 12 ký tự; nhập lại mật khẩu rồi bấm **Khởi tạo và mở Quản trị nền tảng**.

Chị tự đặt mật khẩu trực tiếp trong ứng dụng, không cần gửi vào cuộc trò chuyện. Không có mật khẩu Super Admin mặc định. Tài khoản admin công ty hiện có vẫn giữ nguyên mật khẩu và quyền quản trị công ty.

Chỉ được khởi tạo một lần. Khi đã có Super Admin, trang này trở thành màn hình đăng nhập Super Admin thông thường. Tài khoản admin/subadmin của công ty không dùng được API quản lý nền tảng, kể cả công ty iViTech.

## Chức năng hiện có

- Xem tổng số công ty, số đang hoạt động và tạm dừng.
- Tìm không dấu theo tên/mã công ty; chọn nhiều trạng thái và mục đích sử dụng.
- Tạo công ty riêng kèm một admin ban đầu. Công ty mới không có khách hoặc tài khoản mẫu iViTech.
- Tạm dừng/mở lại công ty thuê. Tạm dừng giữ dữ liệu và thu hồi phiên công ty; mở lại yêu cầu người dùng đăng nhập lại. iViTech nội bộ được giữ hoạt động ở bản thử này.
- Xem 200 sự kiện nền tảng gần nhất; có ghi nhận tạo công ty, tạm dừng/mở lại, khởi tạo/đăng nhập Super Admin.
- Đăng xuất riêng khỏi nền tảng. Phiên Super Admin hết hạn sau 8 giờ hoặc khởi động lại máy chủ.

Super Admin quản lý đơn vị sử dụng dịch vụ, **không được cấp quyền đọc khách hàng, báo giá hay hội thoại của công ty**. Chưa có cơ chế đăng nhập thay người dùng của công ty.

## Thay đổi so với bản ngày 23/09

Danh sách công ty và nút Thêm công ty đã chuyển khỏi màn hình Người dùng của CRM sang Quản trị nền tảng. Cờ chủ nền tảng cũ chỉ dùng để xác nhận khởi tạo lần đầu; không còn cho phép quản lý các công ty bằng phiên admin CRM.

Danh mục công ty và lịch sử cũ giữ nguyên trong registry. Tài khoản Super Admin được lưu riêng ở bảng `platform_users` trong `app/crm.db.platform.db`, mật khẩu chỉ lưu dạng băm. Phiên và cookie khác hoàn toàn với tài khoản CRM công ty. Không đổi cấu trúc dữ liệu khách/báo giá do thay đổi này.

## Kiểm tra đã thực hiện

- Khởi tạo cần đúng tài khoản chủ nền tảng cũ và mật khẩu; chặn khởi tạo lại.
- Chặn admin công ty đọc/ghi quản trị nền tảng; chặn phiên Super Admin đọc API dữ liệu CRM.
- Tạo, tạm dừng, mở lại công ty; giữ dữ liệu; ghi lịch sử không chứa mật khẩu.
- Chặn nguồn ngoài, giới hạn đăng nhập sai; thu hồi phiên khi đăng xuất/khởi động lại.
- Kiểm thử cách ly SaaS, nghiệp vụ và vòng đời dữ liệu hiện có đạt.
- Kiểm tra trình duyệt: đăng nhập Super Admin bằng tài khoản thử đã tạo trên dữ liệu riêng, tìm/lọc nhiều lựa chọn, biểu mẫu tạo công ty và nhật ký.

## Phạm vi còn lại

Đây vẫn là bản localhost, chưa vận hành cho thuê trên Internet. Chưa có bảng giá/gói thuê, thu phí/gia hạn tự động, khôi phục mật khẩu Super Admin hoặc quản lý nhiều Super Admin. Các chức năng này cần làm trước khi cung cấp dịch vụ thật theo chính sách kinh doanh được chốt.

Sao lưu cần bao gồm `crm.db`, `crm.db.platform.db`, thư mục `crm.db.companies` nếu có và các khóa kênh đi kèm. Không xóa registry để thiết lập lại tài khoản vì registry còn chứa danh sách và đường dẫn dữ liệu các công ty.
