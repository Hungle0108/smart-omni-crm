# Bàn giao hệ thống màu CRM — 24/09/2026

## Thay đổi trong mã nguồn

| Tệp | Nội dung |
|---|---|
| `app/workspace.css` | Tập trung bảng màu vào semantic tokens; ánh xạ tên biến cũ; bổ sung style có phạm vi `.crm-theme` cho workspace, đăng nhập và dialog. Nền, sidebar, thẻ, tiêu đề nhóm, bảng, chữ, input và trạng thái tương tác cùng dùng một bộ màu. |
| `app/app.html` | Bỏ bảng màu gốc trùng lặp, thêm class `crm-theme` trên body. |
| `app/workspace-ui.js` | Tách nhãn ưu tiên khỏi trạng thái và chỉ báo quá hạn; nhóm nội dung chi tiết công việc thành khách hàng, thời hạn, người thực hiện, mô tả. Không sửa API hoặc mô hình dữ liệu. |
| `app/test-theme-colors.cjs` | Kiểm tra 31 cặp màu semantic: chữ ≥4,5:1; viền input/focus ≥3:1. |

Không thay đổi dữ liệu, phân quyền hoặc các hành động nghiệp vụ. Công việc vẫn gom theo đúng customer_id. Quá hạn vẫn được tính từ thời hạn, không trở thành trạng thái lưu trong dữ liệu.

## Bộ màu dùng chung

- Bề mặt: `--surface-page` #F1F5F9; `--surface-card` #FFFFFF; `--surface-subtle` #F8FAFC; `--surface-heading` #E2EAF4.
- Chữ: `--text-primary` #172033; `--text-secondary` #526176.
- Viền: `--border-default` #CBD5E1; `--border-input` #7B8AA0.
- Hành động: `--action-primary` #1D4ED8; `--action-hover` #1E40AF; `--action-text` #FFFFFF.
- Tương tác: `--surface-hover` #EFF6FF; `--surface-selected` #DBEAFE; `--focus-ring` #2563EB.
- Sidebar: `--nav-bg` #14243D; `--nav-text` #E2E8F0; `--nav-muted` #B8C6D9; `--nav-hover` #223B5D; `--nav-active` #1D4ED8; `--nav-indicator` #BFDBFE.
- Trạng thái: các nhóm `--success-*`, `--info-*`, `--warning-*`, `--danger-*`, `--neutral-*`, `--sent-*` gồm nền/chữ/viền.
- Disabled: `--disabled-bg` #E2E8F0, `--disabled-text` #526176, opacity 1 để vẫn đọc được.
- Các biến cũ `--paper`, `--bg`, `--ink`, `--sub`, `--line`, `--brand`, `--soft`, `--good`, `--warn`, `--bad` trỏ vào semantic tokens để màn hình hiện có dùng thống nhất.

Sidebar có chữ sáng riêng. Tab đang chọn có cả nền xanh, chữ đậm và gạch chân; dòng đang focus có nền và vạch bên trái. Lỗi có khung, biểu tượng và thông báo; input không hợp lệ có viền đỏ. Dữ liệu thiếu vẫn dùng chữ/trạng thái trung tính.

## Ảnh đối chiếu

Ảnh gốc được lưu tại `docs/design/color-review/`. Mở [trang so sánh](../design/color-review/comparison.html).

| Màn hình | Trước | Sau |
|---|---|---|
| Công việc | [Ảnh trước](../design/color-review/tasks-before.png) | [Ảnh sau](../design/color-review/tasks-after.png) |
| Danh bạ | [Ảnh trước](../design/color-review/customers-before.png) | [Ảnh sau](../design/color-review/customers-after.png) |

Có thêm ảnh mobile, tablet, chi tiết công việc, hồ sơ khách hàng, lỗi nhập người liên hệ và bảng kiểm trạng thái trong cùng thư mục. Bảng kiểm trạng thái `states.html` là mẫu giao diện dùng CSS thật, không nối cơ sở dữ liệu.

## Kiểm chứng

- `node app/test-theme-colors.cjs`: **31/31 cặp đạt**. Chữ thấp nhất **5,12:1**; viền input/focus đạt ≥3:1. Chi tiết: `token-contrast.json`.
- Kiểm tra cú pháp `workspace-ui.js`: đạt.
- Đo các phần tử chữ hiển thị từ màu tính toán thực tế trên trình duyệt: Công việc **111 mẫu**, Danh bạ **128 mẫu**, cùng thấp nhất **5,20:1**, không có mẫu dưới 4,5:1. Hồ sơ tổ chức: **98 mẫu**, thấp nhất **5,76:1**.
- Rà soát bổ sung ở vai trò trưởng nhóm: Tổng quan, Tiến trình, Báo giá, Cơ hội, Hộp thư, Mẫu, Kênh và Cấu hình. Sau khi sửa chữ trong thanh bước báo giá, không còn cặp chữ thiếu tương phản trong phần được đo. `other-screens-contrast.json` giữ lần rà soát đầu; `extra-screens-contrast.json` chứa lần xác nhận báo giá đã sửa.
- Responsive: danh sách Công việc và Danh bạ được đo ở **390 px** và **768 px**; chiều rộng tài liệu không vượt viewport. Bảng danh bạ vẫn cuộn ngang trong thẻ ở mobile theo bố cục hiện có. Hồ sơ tổ chức và form công việc ở 390 px không tràn ngang; dialog cuộn dọc khi dài.
- Thực tế trong CRM: chọn tab Cá nhân/Tất cả; mở chi tiết công việc; mở form sửa rồi hủy; chuyển tab hồ sơ; mở form người liên hệ; gửi form thiếu tên để kiểm tra thông báo lỗi rồi hủy. Không lưu bản ghi thử.
- Trên mẫu trạng thái dùng CSS thật: nút chính hover #1E40AF; focus outline #2563EB; selected #DBEAFE kèm chỉ báo; disabled vẫn có tương phản; lỗi có viền #991B1B và chữ. Có ảnh desktop/mobile và `states-contrast.json`.
- Không ghi nhận lỗi JavaScript ở lần kiểm tra cuối.

## Giới hạn kiểm chứng

- Đây là kiểm tra tương phản màu CSS và bố cục mẫu; chưa phải kiểm toán WCAG toàn diện, chưa kiểm tra mọi tổ hợp dữ liệu/quyền hoặc công nghệ hỗ trợ.
- Bộ đo DOM không đo chữ được vẽ trong ảnh/canvas, chữ trong pseudo-element hoặc sự pha màu của lớp backdrop; màu nhập liệu/disabled/trạng thái được kiểm tra thêm bằng 31 cặp token và mẫu riêng.
- Giao diện trước thay đổi đã bị `workspace.css` cố định `color-scheme: light`, không có bộ chọn dark mode hoạt động. Giữ nguyên chế độ sáng hiện tại; chưa triển khai hoặc kiểm thử dark mode riêng.
- Không thêm lịch sử công việc mới trong dialog: dữ liệu lịch sử hiện có vẫn nằm trong hồ sơ khách hàng/luồng hiện tại.
- Chưa kiểm tra bản in/PDF, mọi biến thể báo giá đã tải lên, các màn hình chỉ có ở admin/giám đốc và trang Super Admin riêng. Các quy tắc trình bày mới được đặt trong media screen để hạn chế ảnh hưởng bản in.
