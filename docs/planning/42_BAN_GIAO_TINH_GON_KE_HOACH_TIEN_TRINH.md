# Bàn giao: Kế hoạch tiếp xúc và Tiến trình khách hàng

Ngày 24/09/2026. Đã cập nhật và khởi động lại bản dùng thử tại http://127.0.0.1:3000.

## Kết quả rà soát

Hai màn hình trước đây đã dùng chung bảng `tasks`; phần trùng nằm ở danh sách, form và thống kê hiển thị. Không tạo kho công việc mới. Bảng đối chiếu trước khi sửa nằm trong [41_TINH_GON_KE_HOACH_TIEN_TRINH.md](41_TINH_GON_KE_HOACH_TIEN_TRINH.md).

## Những gì đã tinh gọn

| Thành phần | Sau cập nhật |
|---|---|
| Kế hoạch tiếp xúc | Một nút tạo, một bộ lọc, danh sách theo Quá hạn / Hôm nay / Sắp tới / Chưa có thời hạn; mỗi việc chỉ thuộc một nhóm |
| Việc hoàn thành | Không xuất hiện trong mặc định Đang mở; chọn Hoàn thành để tra cứu |
| Hồ sơ khách hàng | Không lặp tên khách trong từng dòng; danh sách toàn công ty vẫn có cột khách |
| Chi tiết kế hoạch | Dùng chung form sửa/đổi lịch, đổi người thực hiện theo quyền, kết quả và hoàn thành |
| Kết quả tiếp xúc | Nhập kết quả chính, phản hồi, bước tiếp theo; giữ trong lịch sử công việc gốc |
| Bước tiếp theo | Chỉ mở form điền sẵn khi chọn; phải bấm Lưu mới tạo việc. Bấm Hủy không sinh bản ghi |
| Tiến trình | Chỉ ba vùng: trạng thái hiện tại, một thẻ bước tiếp theo, các mốc nghiệp vụ |
| Trạng thái | Phân biệt quan hệ khách hàng, giai đoạn từng cơ hội và trạng thái công việc; không suy ra khách hoàn thành từ tỷ lệ việc |
| Mốc nghiệp vụ | Kết quả tiếp xúc, thay đổi nhu cầu mới, trao đổi có kết quả, lịch sử cơ hội, gửi báo giá; bỏ sửa tiêu đề/đổi hạn khỏi dòng mốc chính |
| Mẫu, công việc con, lưu trữ | Giữ trong Công cụ mở rộng hoặc chi tiết công việc; lưu trữ không xóa kết quả |
| Điều hướng | Cùng khách hàng, cơ hội, đầu mối và bộ lọc được giữ khi chuyển hai mục/hồ sơ 360 và tải lại trong cùng phiên trình duyệt |
| Điện thoại | Bộ lọc mở khi cần; bảng chuyển thành các thẻ việc; không tràn ngang ở kích thước kiểm tra |

Thẻ tiếp theo ưu tiên việc quá hạn, sau đó hạn gần nhất; nếu cùng hạn, ưu tiên mức Cao rồi mã việc. Việc không đặt hạn xếp sau việc có hạn. Mỗi cơ hội lọc riêng; việc chưa gắn cơ hội chỉ có trong phạm vi toàn khách hàng.

## Dữ liệu và an toàn cập nhật

- Thêm `outcome`, `feedback`, `next_step`, `request_key` vào lịch sử `task_updates`; thêm `creation_key` vào `tasks`. Các khóa duy nhất ngăn gửi lại yêu cầu tạo/lưu kết quả sinh bản ghi trùng.
- Tiến trình đọc kết quả từ nguồn gốc, không sao chép thành một tương tác hoặc công việc khác. Mốc cập nhật nhu cầu sử dụng audit hiện có, chỉ ghi khi giá trị thực sự đổi.
- Giữ kiểm tra quyền khách hàng, nhóm, người thực hiện, đầu mối, cơ hội và công ty. Quyền quản trị không tự mở quyền xem hồ sơ bán hàng.
- Sao lưu trước cập nhật: `app/backups/before-workflow-2026-09-24T15-37-38-083Z`.
- Đối chiếu mã bản ghi trước/sau: không thiếu mã cũ nào trong các bảng có cột `id`. Số lượng dữ liệu chính có tăng trong thời gian làm việc, nên không khẳng định cơ sở dữ liệu hoàn toàn không thay đổi. Không khôi phục đè lên dữ liệu phát sinh. Chi tiết: `app/test-output/workflow-data-check.json`.
- Các thao tác kiểm thử tạo/sửa/hoàn thành sử dụng cơ sở dữ liệu thử riêng. Trên bản chính chỉ kiểm tra đọc, đăng nhập và khởi động lại server.

## Kiểm thử đã chạy

38 nhóm kiểm tra tự động đạt:

| Bộ kiểm tra | Số nhóm | Kết quả |
|---|---:|---|
| `node app/test-workflow.js` | 11 | Tạo chống trùng, đổi lịch/người phụ trách, nhu cầu, kết quả một lần, không tự sinh việc, nhiều cơ hội, quyền, công việc con, lưu trữ, khởi động lại, mẫu theo cơ hội, thứ tự ưu tiên |
| `node app/test-customer-360.js` | 5 | Hồ sơ, hoạt động, liên kết, quyền kênh, giữ dữ liệu |
| `node app/test-directory.js` | 6 | Danh bạ, liên hệ, kế hoạch theo khách, quyền và tách công ty |
| `node app/test-channel-access.js` | 8 | Phân quyền kênh, thu hồi quyền, không mở rộng phạm vi khách |
| `node app/test-progress.js` | 8 | Mẫu, việc con, trạng thái cha, thời gian, lưu trữ/khôi phục và quyền |

Đã thử trực tiếp bằng trình duyệt trên dữ liệu riêng: tạo cuộc gọi từ Tiến trình với cơ hội chọn sẵn; đổi lịch trong Kế hoạch; quay lại thấy hạn mới; hoàn thành kèm kết quả; mở form bước tiếp theo điền sẵn rồi Hủy; thấy 0 việc mở và một mốc kết quả; tải lại không nhân đôi; lọc Hoàn thành vẫn tìm được việc; chuyển vào hồ sơ 360 giữ bộ lọc/cơ hội. Không có lỗi JavaScript được ghi nhận trên màn hình chính lúc kiểm tra.

Đã kiểm tra responsive với cấu hình viewport 390×844; chiều rộng nội dung DOM bằng chiều rộng hiển thị (375px trong trình duyệt kiểm tra), không tràn ngang. Hai tab không còn các khối tổng quan lặp trước danh sách. Đây là kiểm tra giả lập, chưa thử trên điện thoại vật lý.

## Giới hạn cần biết

- Chưa có module hợp đồng/thanh toán. Xác nhận ký vẫn theo quy tắc giai đoạn cơ hội hiện hành; không dựng dữ liệu thanh toán giả.
- Chưa có trạng thái Hủy riêng; dùng Lưu trữ và Khôi phục hiện có.
- Ghi chú tự do và việc hoàn thành cũ không có kết quả có cấu trúc không được tự suy diễn thành mốc tiếp xúc. Lịch sử cũ vẫn còn.
- Bộ lọc được giữ trong phiên trình duyệt theo công ty/người dùng/khách hàng; chưa đồng bộ bộ lọc giữa các thiết bị.
- Chưa kiểm thử tải lớn hoặc mọi tổ hợp nghiệp vụ báo giá; các thay đổi này không bổ sung kết nối tin nhắn thật.

## File ứng dụng đã sửa

- `app/customer-360.js`: kết quả, khóa chống trùng, dữ liệu mốc, đọc bản ghi đã lưu trữ có quyền, liên kết mẫu/việc con.
- `app/customer-360-ui.js`: các component kế hoạch/tiến trình dùng chung và điều hướng hồ sơ.
- `app/customer-360.css`: danh sách, ba vùng tiến trình, hiển thị điện thoại.
- `app/workspace-ui.js`: giữ cơ hội khi tạo kế hoạch từ màn hình cơ hội.
- `app/test-workflow.js`, `app/package.json`: bộ kiểm thử luồng mới.

## Ảnh trước/sau

Kế hoạch trước:

![Kế hoạch trước](../design/workflow-review/before-planning.png)

Kế hoạch sau:

![Kế hoạch sau](../design/workflow-review/after-planning.png)

Tiến trình trước:

![Tiến trình trước](../design/workflow-review/before-progress.png)

Tiến trình sau — trạng thái:

![Tiến trình sau](../design/workflow-review/after-progress.png)

Tiến trình sau — bước tiếp theo và các mốc:

![Bước tiếp theo và mốc](../design/workflow-review/after-progress-detail.png)

Ảnh kiểm tra điện thoại trong cùng thư mục: `mobile-planning.png`, `mobile-progress.png`.
