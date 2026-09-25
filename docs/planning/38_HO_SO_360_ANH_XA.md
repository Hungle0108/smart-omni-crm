# Hồ sơ khách hàng 360° — ánh xạ trước triển khai

## Nguồn dữ liệu và quyền

| Đối tượng | Nguồn hiện có | Liên kết |
|---|---|---|
| Khách hàng/tổ chức | customers, organization_details | customers.id; tổ chức mẹ qua parent_org_id, không mở rộng quyền |
| Người liên hệ | contacts | organization_id; chỉ liên hệ đang gắn đúng tổ chức được chọn cho hoạt động mới |
| Công việc/lịch hẹn | tasks, task_updates | customer_id; thêm contact_id và opp_id tùy chọn, không sao chép công việc |
| Hội thoại | conversations, messages | customer_id; quyền khách hàng và quyền kênh cùng áp dụng |
| Cơ hội | opportunities, opp_history | customer_id; nhiều cơ hội độc lập, thêm contact_id tùy chọn |
| Báo giá | quotes, quote_history | customer_id, opp_id |
| Ghi chú | notes | customer_id |
| Ghi nhận trao đổi | customer_interactions (bổ sung) | Bản ghi gốc cuộc gọi/cuộc gặp, customer_id, contact_id, opp_id; không phải bản sao tin nhắn |
| Hợp đồng/thanh toán | Chưa có module riêng | contract_signed trên cơ hội chỉ là xác nhận đã ký; không suy ra đã thanh toán |

## Quyết định triển khai

- Hồ sơ là lớp tổng hợp trên các API đã kiểm tra quyền. Không tạo bảng sao chép khách hàng hoặc toàn bộ dòng thời gian.
- Giữ trạng thái quan hệ, giai đoạn cơ hội và trạng thái công việc riêng. Không đổi pipeline đã duyệt.
- Hoạt động cũ không có người liên hệ/cơ hội thì giữ chưa liên kết; không tự suy đoán.
- Không tổng hợp hội thoại cá nhân qua quan hệ liên hệ. Đơn vị con có hồ sơ và quyền riêng.
- Các tab chưa có chức năng hợp đồng, thanh toán, tài liệu tải lên sẽ thông báo rõ.
- Lưu ngữ cảnh theo công ty/người dùng/khách; mở module sâu có đường quay lại. Không tự tạo bước tiếp theo.

## Tệp dự kiến

`app/customer-360.js`, `app/customer-360-ui.js`, `app/customer-360.css`; tích hợp trong `crm-server.js`, `app.html`; tái sử dụng biểu mẫu, API và bộ kiểm tra của ứng dụng.
