# Rà soát trước khi tinh gọn

Hai màn hình đọc cùng bảng tasks. Tiến trình còn đọc task_updates, customer_delivery và task_templates; Kế hoạch đọc tasks qua API kiểm tra quyền. Không có hai kho công việc độc lập. Phần trùng là giao diện danh sách, form tạo/sửa và thống kê theo khách.

| Thành phần hiện tại | Nơi giữ chính | Tinh gọn ở nơi còn lại | Nguồn chung |
|---|---|---|---|
| Danh sách việc, việc con, hạn/người thực hiện | Kế hoạch tiếp xúc | Một thẻ bước tiếp theo | tasks |
| Form tạo/sửa, kết quả/hoàn thành | Kế hoạch tiếp xúc | Gọi lại cùng form | tasks, task_updates |
| Phần trăm việc hoàn thành gắn nhãn cho toàn khách | Bỏ ở Tiến trình | Không coi trạng thái công việc là trạng thái khách | customers, opportunities |
| Thông tin nền tảng/dịch vụ | Thông tin mở rộng của khách | Không lặp ở từng dòng công việc | customer_delivery |
| Trạng thái quan hệ và cơ hội | Tiến trình | Chỉ liên kết từ công việc | customers, opportunities |
| Lịch sử chi tiết sửa việc | Chi tiết công việc | Không đưa vào dòng mốc nghiệp vụ | task_updates, audit |
| Kết quả tiếp xúc | Nhập một lần ở hoàn thành việc | Mốc đọc bản ghi kết quả gốc | task_updates |
| Mẫu công việc | Công cụ mở rộng tại Kế hoạch | Bỏ khỏi Tiến trình | task_templates |

Không xóa lịch sử hoặc đổi trạng thái nghiệp vụ. Bổ sung trường kết quả có cấu trúc và khóa chống gửi lặp vào task_updates vì ghi chú văn bản tự do hiện chưa đủ để phân biệt mốc kết quả và chống trùng khi gửi lại.
