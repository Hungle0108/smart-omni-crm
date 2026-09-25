# Tiến trình công việc cho từng khách hàng

Bản 0.4 · 22/09/2026. Đã triển khai trên localhost theo ảnh tham chiếu chị gửi.

## Thử trong 5 bước

1. Mở [Tiến trình khách hàng](http://127.0.0.1:3000/#/progress). Đăng nhập **hoa** để thử vai trò trưởng nhóm. Nếu trang đang mở từ trước, lưu nội dung đang nhập rồi tải lại trang.
2. Bấm tên khách để mở thẻ. **Sửa thông tin** để điền nền tảng, địa chỉ triển khai và các dịch vụ; mỗi dòng là một dịch vụ.
3. Bấm **Áp dụng mẫu**, chọn mẫu và người phụ trách mặc định. Mẫu có sẵn gồm: Thử nghiệm; Báo cáo kết quả thử nghiệm; Dự toán kinh phí năm đầu và 5 năm; Tờ trình kinh phí. Đây là gợi ý theo ảnh, công ty có thể sửa tên/bước.
4. Bấm **Sửa** tại từng việc để nhập ngày bắt đầu, hạn hoàn thành, người phụ trách, mức ưu tiên và kết quả cần đạt. Bấm **Tiến độ xử lý · Công việc con** để thêm việc con hoặc **Ghi nhận tiến độ**.
5. Thay trạng thái sang Chưa bắt đầu, Đang thực hiện, Đang vướng mắc hoặc Hoàn thành. Thẻ khách cập nhật phần trăm ngay và lưu để mở lại lần sau.

Khách hiện có không tự được gắn thêm bốn việc mẫu. Chỉ bấm Áp dụng mẫu khi muốn tạo thêm tiến trình. Các dữ liệu dùng để kiểm tra giao diện nằm trong cơ sở dữ liệu thử riêng.

## Cách tính tiến độ

Mỗi việc cuối cùng trong cây công việc có trọng số bằng nhau. Việc cha có việc con không được cộng thêm vào mẫu số.

- Bốn việc độc lập, hoàn thành một việc: **25%**.
- Nếu việc Thử nghiệm có hai việc con, tổng sẽ có năm việc cuối cùng: hai việc con và ba việc chính còn lại.
- Việc cha tự chuyển Hoàn thành khi tất cả việc con đang hoạt động hoàn thành. Muốn mở lại, đổi trạng thái việc con tương ứng.
- Việc lưu trữ không tính vào tiến độ; khôi phục sẽ đưa trở lại phép tính. Chưa có việc thì hiển thị 0%.

Chưa có trọng số theo chi phí hoặc tỷ lệ nhập tay. Tiến độ công việc độc lập với bước bán hàng: hoàn thành công việc không tự chuyển cơ hội sang Thắng hoặc xác nhận ký hợp đồng.

## Mẫu dùng lại và quyền thao tác

Trưởng nhóm chọn **Mẫu công việc → Tạo mẫu mới/Sửa mẫu**. Mỗi dòng là một việc; thụt hai dấu cách để tạo việc con dưới dòng trên. Hỗ trợ tối đa sáu cấp. Áp dụng mẫu tạo bản công việc riêng cho khách; sửa mẫu sau đó không thay đổi những tiến trình đã tạo.

Sales chỉ thấy và xử lý khách được giao. Trưởng nhóm thấy khách trong nhóm. Người phụ trách một việc là sales đang phụ trách khách hoặc trưởng nhóm; việc chưa giao cá nhân thuộc nhóm hiện tại. Cần giao khách cho sales trước khi giao việc cho người đó. Bản này chưa cho chọn nhiều người cùng phụ trách hoặc tạo bộ phận triển khai riêng.

Các dịch vụ CQS, XHS, KTS hoặc tên khác được nhập như nhãn mô tả. Nhãn này không tự thay giá báo giá, không xác nhận khách đã mua Gói 1 và không thay dữ liệu hợp đồng.

## Lịch sử và lưu trữ

Ghi nhận tiến độ lưu nội dung, người cập nhật và thời gian. Lịch sử công việc cũng xuất hiện ở hồ sơ khách. Công việc dùng chung với Kế hoạch tiếp xúc; lịch tuần hiển thị theo hạn hoàn thành, chưa phải biểu đồ kéo dài suốt khoảng bắt đầu–kết thúc.

**Lưu trữ** yêu cầu lý do, cất cả nhánh công việc. Mở **Việc đã lưu trữ → Khôi phục** để đưa nhánh trở lại. Không xóa vĩnh viễn lịch sử. Sửa việc đã lưu trữ cần khôi phục trước.

## Tiêu chí nghiệm thu

| Thao tác | Kết quả cần thấy |
|---|---|
| Áp dụng mẫu có sẵn một lần | Tạo đúng bốn việc cho đúng khách |
| Thêm việc con | Xuất hiện dưới đúng việc cha; không chuyển sang khách khác |
| Hoàn tất lần lượt bốn việc cuối | Tiến độ 25%, 50%, 75%, 100% |
| Việc con chưa xong | Không thể đánh dấu việc cha hoàn tất trực tiếp từ lịch |
| Ghi nhận tiến độ, tải lại | Nội dung, người và giờ cập nhật còn nguyên |
| Lưu trữ rồi khôi phục | Cả nhánh trở lại và lịch sử được giữ |
| Đổi từ hoa sang sales | Chỉ thấy khách sales được giao |
| Sửa mẫu | Các tiến trình đã tạo trước đó giữ nguyên |
