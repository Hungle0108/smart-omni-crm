# Smart Omni CRM — Description: Phân quyền kênh theo người dùng

**Dành cho:** Agent Astra 6 triển khai trong CRM hiện có.  
**Ngày:** 24/09/2026.  
**Phạm vi:** Khu vực “Phân kênh cho từng người dùng” trong ảnh tham chiếu.  
**Trạng thái:** Đặc tả triển khai đề xuất, dựa trên ảnh và các nguyên tắc CRM đã có; chưa kiểm tra mã nguồn hoặc backend hiện tại.

## 1. Mục tiêu

Cho phép người có quyền quản trị phân công một hoặc nhiều người dùng sử dụng từng tài khoản kênh giao tiếp. Người được chọn chỉ thực hiện những thao tác mà vai trò hiện tại cho phép, trong phạm vi hội thoại và khách hàng được phép truy cập.

Phân quyền kênh phải tách biệt với ba việc: cấp quyền chức năng cho vai trò, giao người phụ trách khách hàng/hội thoại và kết nối kỹ thuật với nhà cung cấp.

Ví dụ: thêm một nhân viên vào Zalo OA không tự biến nhân viên đó thành quản trị viên, không tự giao tất cả hội thoại cho người đó và không cấp quyền xem toàn bộ danh bạ.

## 2. Căn cứ từ ảnh và phần bổ sung

### 2.1. Nội dung nhìn thấy trong ảnh

- Tiêu đề: **Phân kênh cho từng người dùng**.
- Mô tả: **Chọn một hoặc nhiều người. Quyền xem khách hàng vẫn theo người phụ trách/nhóm.**
- Hai dòng kênh:
  - **Zalo OA (bao gồm hội thoại mô phỏng)**.
  - **Zalo cá nhân công ty (mô phỏng)**.
- Mỗi dòng có thông tin **Theo phạm vi nhóm hiện có** và nút **Phân người dùng**.
- Thông báo cuối khối: **Phân quyền không tự kích hoạt kết nối. Zalo cá nhân và các kênh chưa có bộ nhận/gửi vẫn ở trạng thái đã ghi trên thẻ kênh.**

Ảnh chỉ xác nhận bố cục và các nhãn trên. Chưa có bằng chứng về nội dung hộp thoại, dữ liệu đã lưu hoặc cơ chế kiểm tra quyền phía backend. Các hành vi dưới đây là đề xuất hoàn thiện, cần ánh xạ vào IAM/schema/API thực tế.

### 2.2. Giới hạn công việc

- Hoàn thiện phần phân quyền kênh và điểm kiểm tra quyền liên quan.
- Tái sử dụng người dùng, vai trò, nhóm/phòng ban, tenant và phạm vi bản ghi đang có.
- Không xây lại toàn bộ IAM, không tạo danh sách người dùng riêng cho Zalo.
- Không tích hợp thêm bộ gửi/nhận Zalo thật trong nhiệm vụ này.
- Khi bổ sung kênh khác trong tương lai, dùng cùng component và cơ chế, không viết logic riêng theo tên kênh.

## 3. Mô hình quyền

### 3.1. Bốn lớp phải được phân biệt

| Lớp | Ý nghĩa | Ví dụ |
|---|---|---|
| Quyền chức năng theo vai trò | Người dùng được thực hiện hành động nào | Xem hội thoại, gửi trả lời, quản lý phân quyền |
| Quyền truy cập kênh | Người dùng được sử dụng tài khoản kênh nào | Zalo OA A hoặc Zalo OA B |
| Phạm vi hội thoại/khách hàng | Người dùng được xem bản ghi cụ thể nào | Do mình phụ trách hoặc trong nhóm được phép |
| Trạng thái kỹ thuật | Kênh có khả năng gửi/nhận thật hay chỉ mô phỏng | Đã kết nối, mất kết nối, mô phỏng |

Gán kênh không nâng quyền vai trò. Trạng thái “Được phân quyền” không có nghĩa là “Đã kết nối”. Phạm vi “Toàn bộ” nếu có chỉ nằm trong tenant hiện tại theo chính sách IAM, không phải mọi tenant.

### 3.2. Hai chế độ phân quyền rõ ràng

| Chế độ | Cách hoạt động | Cách hiển thị |
|---|---|---|
| **Theo phạm vi nhóm hiện có** | Kế thừa chính sách nhóm đang áp dụng cho kênh; chỉ tính người còn hoạt động và đủ quyền chức năng | Badge “Theo nhóm”; thông tin nhóm nếu backend xác định được |
| **Chỉ người được chỉ định** | Chỉ các người dùng được chọn có thể sử dụng kênh, đồng thời vẫn phải đủ quyền vai trò và phạm vi dữ liệu | Avatar/tên những người đã chọn và tổng số |

Không dùng danh sách rỗng để diễn đạt cả hai chế độ. Trong chế độ “Chỉ người được chỉ định”, chọn 0 người nghĩa là không có người dùng nghiệp vụ nào được cấp qua danh sách này; không tự quay lại kế thừa nhóm hoặc mở cho toàn bộ nhân viên.

Người có quyền quản lý phân quyền vẫn có thể mở cấu hình để sửa theo IAM. Quyền quản lý cấu hình không tự cho phép đọc hoặc gửi hội thoại. Nếu dự án có cơ chế quản trị truy cập đặc biệt đã được duyệt, phải giữ và mô tả rõ cơ chế đó, không thêm đường bỏ qua mới.

Mỗi chế độ hoạt động độc lập; không âm thầm cộng quyền từ danh sách chỉ định cũ khi đang ở chế độ theo nhóm. Việc chuyển chế độ phải cho người quản trị thấy phạm vi thay đổi trước khi lưu.

## 4. Giao diện danh sách phân quyền kênh

Giữ khối nội dung như ảnh; có thể dùng tiêu đề rõ hơn là **Phân quyền kênh theo người dùng**. Không đổi bố cục toàn bộ trang.

Mô tả đề xuất:

> Chọn người được sử dụng từng kênh. Quyền thao tác theo vai trò; quyền xem hội thoại và khách hàng vẫn theo phạm vi được phân công.

Mỗi dòng kênh gồm:

1. **Nhận diện kênh:** icon, tên tài khoản/kênh. Nếu có nhiều Zalo OA, thể hiện tên OA đủ phân biệt, dùng ID tài khoản kênh làm khóa.
2. **Trạng thái kỹ thuật:** badge lấy trực tiếp từ dữ liệu kênh, giữ rõ nhãn “Mô phỏng” và không tự suy trạng thái từ việc được phân quyền.
3. **Chế độ phân quyền:** “Theo nhóm” hoặc “Chỉ người được chỉ định”.
4. **Người được phân quyền:** ở chế độ chỉ định, hiện tối đa 3 avatar/tên và “+N người”; nếu chưa chọn ai, ghi “Chưa phân người dùng”. Ở chế độ nhóm, không hiển thị số đếm nếu backend chưa cung cấp đủ dữ liệu.
5. **Hành động:** nút “Phân người dùng” khi chưa có danh sách chỉ định hoặc “Chỉnh phân quyền” khi đã cấu hình. Chỉ người có quyền quản lý mới thao tác được.

Các dòng có đường phân cách rõ; tên kênh đậm hơn mô tả. Màu nền khối trắng trên nền trang xám xanh nhạt. Badge xanh dương biểu thị chế độ chỉ định; badge trung tính biểu thị theo nhóm; trạng thái mô phỏng có nhãn riêng. Không dùng dấu tích màu xanh giống trạng thái kết nối thật chỉ vì đã lưu phân quyền.

Giữ thông báo cuối khối:

> Phân quyền không tự kích hoạt kết nối. Kênh mô phỏng hoặc chưa có bộ gửi/nhận vẫn giữ nguyên trạng thái hiện tại.

## 5. Hộp thoại “Phân người dùng”

### 5.1. Bố cục

- Tiêu đề: **Phân quyền người dùng — [Tên tài khoản kênh]**.
- Dòng phụ: tên loại kênh và trạng thái hiện tại.
- Chọn chế độ bằng radio: “Theo phạm vi nhóm hiện có” / “Chỉ người được chỉ định”.
- Khu vực chọn người hiển thị khi chọn chế độ chỉ định.
- Footer có “Hủy” và nút chính “Lưu phân quyền”.
- Desktop dùng modal/drawer hiện có; mobile chuyển thành sheet hoặc toàn màn hình, có vùng cuộn và footer dễ thao tác.

### 5.2. Danh sách người dùng

| Thành phần | Hành vi |
|---|---|
| Tìm kiếm | Theo tên hoặc email của người dùng trong tenant và phạm vi người quản trị được quản lý |
| Lọc | Nhóm/phòng ban, trạng thái được chọn; dùng danh mục hiện có |
| Checkbox | Chọn một hoặc nhiều người; hỗ trợ trạng thái chọn một phần ở cấp danh sách |
| Thông tin mỗi người | Avatar, họ tên, email, nhóm/phòng ban; tên vai trò nếu phù hợp |
| Quyền chức năng | Có thể hiển thị nhãn chỉ đọc như “Có quyền xem”, “Có quyền trả lời”, “Chưa có quyền sử dụng hộp thư” theo policy thực tế |
| Tổng số đã chọn | Luôn phản ánh toàn bộ lựa chọn, kể cả người không nằm ở trang/kết quả tìm kiếm hiện tại |
| Người không còn hoạt động | Không cho gán mới; nếu đã tồn tại trong cấu hình thì hiển thị cảnh báo và không tính là người có quyền hiệu lực |

Không thêm checkbox sửa vai trò quản trị trong hộp thoại này. Những quyền “Xem”, “Trả lời”, “Quản lý” nếu chưa được hỗ trợ theo từng kênh phải là thông tin tính từ IAM, không tự tạo một ma trận quyền song song.

Nếu người được chọn không đủ quyền chức năng, thông báo rõ: **Người này chưa có quyền sử dụng hộp thư theo vai trò hiện tại. Phân kênh không tự bổ sung quyền đó.**

“Chọn tất cả” nếu có phải ghi rõ “Chọn tất cả trên trang này”. Không tự hiểu là mọi người trong tenant hoặc mọi kết quả trên các trang chưa tải. Đổi bộ lọc không làm mất lựa chọn đang có.

### 5.3. Luồng lưu

1. Mở hộp thoại và tải cấu hình hiện tại từ nguồn dữ liệu chính.
2. Giữ một bản nháp cục bộ; chọn/bỏ chọn chưa làm thay đổi quyền thực tế.
3. Khi chuyển chế độ, hiển thị giải thích phạm vi mới. Khi xóa toàn bộ người trong chế độ chỉ định, nêu rõ sẽ không có người dùng nghiệp vụ nào được cấp qua danh sách này.
4. Trước khi lưu, hiển thị tóm tắt ngắn: chế độ cũ/mới, số người thêm và số người gỡ. Không cần thêm nhiều lớp xác nhận cho cùng một thay đổi.
5. Bấm “Lưu phân quyền”: backend kiểm tra quyền người thực hiện, tenant, đối tượng và phiên bản cấu hình.
6. Chỉ khi lưu thành công mới đóng hộp thoại, cập nhật dòng kênh và thông báo **Đã cập nhật phân quyền cho [Tên kênh]**.
7. Nếu lỗi, giữ bản nháp, hiển thị nguyên nhân phù hợp và cho thử lại; không hiện thành công giả.
8. “Hủy” không lưu. Nếu đóng khi có thay đổi, dùng cơ chế nhắc thay đổi chưa lưu của ứng dụng.

## 6. Hành vi sau khi cấp hoặc thu hồi quyền

### 6.1. Khi cấp quyền

- Người được chỉ định chỉ thấy kênh trong bộ chọn sử dụng/hộp thư nếu có quyền chức năng tương ứng và đáp ứng chính sách phạm vi.
- Không thay đổi owner/assignee của khách hàng, công việc hay hội thoại đang có.
- Không tự gửi tin, kết nối tài khoản, tạo token, kết nối lại kênh hoặc kích hoạt bộ gửi/nhận.
- Kênh mô phỏng tiếp tục mô phỏng, có nhãn rõ trong các màn hình liên quan.

### 6.2. Khi gỡ quyền hoặc khóa người dùng

- Quyền mới phải được kiểm tra ở các yêu cầu tiếp theo; không dựa duy nhất vào danh sách quyền đã tải khi đăng nhập.
- Nếu người bị thu hồi đang mở hội thoại, ngăn các thao tác tiếp theo không còn được phép và hiện thông báo phù hợp; không xóa hội thoại hay tin nhắn.
- Hủy/thu hẹp đăng ký realtime không còn hợp lệ để tránh tiếp tục đẩy dữ liệu của kênh bị thu hồi.
- Với lệnh gửi tin còn nằm trong hàng đợi, kiểm tra lại quyền trước khi chuyển cho nhà cung cấp theo cơ chế hiện có. Không hứa thu hồi được tin đã gửi ra bên ngoài.
- Gỡ quyền kênh không tự chuyển người phụ trách các hội thoại. Nếu có hội thoại đang được giao cho người bị gỡ, cảnh báo và dẫn sang luồng phân công hiện có.
- Nếu người đó vẫn có quyền qua cơ chế khác được dự án cho phép, hiển thị nguồn quyền hiệu lực; không báo “đã chặn hoàn toàn” sai thực tế. Trong mô hình hai chế độ đề xuất, không cộng ngầm quyền từ chế độ đang không hoạt động.

## 7. Yêu cầu dữ liệu và backend

### 7.1. Kiểm tra quyền thực sự

Đối với sử dụng kênh/hội thoại, kiểm tra đồng thời:

**Đăng nhập hợp lệ → đúng tenant → có quyền hành động → được dùng tài khoản kênh → đúng phạm vi hội thoại/bản ghi liên quan.**

Đối với mở hồ sơ khách hàng từ hội thoại, vẫn áp dụng quyền đọc contact/organization và phạm vi bản ghi của CRM. Quyền kênh không tự mở toàn bộ hồ sơ 360°, hội thoại lịch sử hoặc dữ liệu của tổ chức liên quan.

Nếu chính sách hội thoại chưa gắn khách hàng hoặc chính sách giao thoa giữa quyền Inbox và quyền CRM chưa có, ghi nhận điểm cần quyết định; không tự mở dữ liệu ngoài phạm vi. Tiếp tục các phần độc lập đã có policy rõ ràng.

Endpoint thay đổi phân quyền phải có quyền quản trị tương ứng. Người dùng thường không được tự thêm mình, gán người ở tenant khác hoặc tự tạo ngoại lệ bằng cách sửa request. Tenant lấy từ ngữ cảnh xác thực, không tin giá trị tenant do client gửi.

Tái sử dụng giới hạn ủy quyền/quản trị theo nhóm của IAM: được quản lý một nhóm không đồng nghĩa được cấp quyền cho mọi nhân viên hoặc mọi kênh của tenant.

### 7.2. Dữ liệu cần ánh xạ

Agent kiểm tra schema hiện có để xác định:

- Tài khoản kênh và tenant sở hữu.
- Chế độ phân quyền: kế thừa nhóm hoặc chỉ định.
- Danh sách user ID được chỉ định và ràng buộc chống trùng.
- Nguồn nhóm đang được kế thừa; không suy từ tên kênh.
- Người/thời điểm cập nhật, phiên bản cấu hình hoặc cơ chế chống ghi đè tương ứng.
- Audit ghi chế độ và danh sách thay đổi trước/sau.

Đây là các khái niệm nghiệp vụ, không phải tên cột hoặc endpoint bắt buộc. Tái sử dụng bảng quan hệ và policy engine đã có. Nếu cần migration, phải theo Database Schema/ADR và bảo toàn cấu hình cũ; đặc biệt không biến dữ liệu rỗng trước đây thành quyền mở rộng ngoài ý định.

### 7.3. API và nhất quán

- Cần các năng lực: đọc cấu hình kênh; tìm người có thể được gán; lưu cấu hình; kiểm tra quyền hiệu lực cho người đang đăng nhập.
- Dùng API version và contract của dự án; frontend không ghi database trực tiếp.
- Lưu chế độ và danh sách người trong một thao tác nguyên tử, kèm audit theo cơ chế hiện hành.
- Nếu có cập nhật đồng thời, báo xung đột và cho tải cấu hình mới; không âm thầm ghi đè thay đổi của quản trị viên khác.
- Làm mới cache cấu hình và quyền liên quan sau khi lưu; trạng thái kênh kỹ thuật giữ nguyên.
- Áp dụng cùng quyền cho API, tìm kiếm, số đếm, xuất dữ liệu, tệp đính kèm và realtime; không chỉ ẩn nút hoặc dòng trên UI.
- Không đưa nội dung tin nhắn hay credential/token kênh vào audit phân quyền.

Nếu repository chỉ là prototype, triển khai qua adapter/state mô phỏng đang có và ghi rõ giới hạn. Không tuyên bố bảo vệ dữ liệu nhiều người dùng bằng frontend/localStorage.

## 8. Trạng thái UI cần có

| Trạng thái | Hiển thị/hành vi |
|---|---|
| Đang tải | Skeleton danh sách hoặc spinner trong hộp thoại |
| Chưa có người được chỉ định | “Chưa phân người dùng”; không đánh đồng với chế độ theo nhóm |
| Không tìm được người | Thông báo không có kết quả; cho xóa bộ lọc |
| Không có quyền quản trị | Chỉ đọc hoặc ẩn cấu hình theo policy; không hiển thị dữ liệu người dùng vượt quyền |
| Người dùng bị khóa | Nhãn cảnh báo, không có quyền hiệu lực |
| Đang lưu | Vô hiệu hóa nút gửi lặp, giữ nội dung |
| Lưu thất bại | Giữ lựa chọn và báo lỗi tại hộp thoại |
| Xung đột cập nhật | Nêu có cấu hình mới; yêu cầu đối chiếu trước khi ghi lại |
| Không có nhóm hợp lệ để kế thừa | Thông báo cần cấu hình nhóm; không mở quyền cho mọi người |

## 9. Tiêu chí nghiệm thu

| Mã | Tình huống | Kết quả bắt buộc |
|---|---|---|
| ACL-01 | Gán 1 hoặc nhiều người cho một kênh | Lưu/đọc lại đúng danh sách và chế độ |
| ACL-02 | Tìm kiếm, phân trang, chọn nhiều | Lựa chọn được giữ chính xác, không gán nhầm người |
| ACL-03 | Hủy khi đang chỉnh | Không thay đổi quyền đã lưu |
| ACL-04 | Chọn 0 người ở chế độ chỉ định | Không tự kế thừa nhóm hoặc mở toàn tenant |
| ACL-05 | Chuyển sang theo nhóm | Áp dụng đúng nhóm hiện có; không cộng ngầm danh sách chỉ định cũ |
| ACL-06 | Nhân viên sửa request để tự gán kênh | Backend từ chối nếu không có quyền quản lý |
| ACL-07 | Gán user hoặc channel khác tenant | Backend từ chối; không rò rỉ thông tin đối tượng |
| ACL-08 | Người có quyền xem nhưng không được trả lời | Gán kênh không làm phát sinh quyền gửi tin |
| ACL-09 | Người được gán kênh mở khách hàng ngoài phạm vi | Không được đọc hồ sơ/timeline 360° ngoài quyền CRM |
| ACL-10 | Kênh mô phỏng được phân người dùng | Vẫn mô phỏng; không thay trạng thái kết nối hoặc gọi bộ gửi thật |
| ACL-11 | Thu hồi quyền khi đang mở hội thoại | Chặn thao tác và luồng realtime không còn hợp lệ; giữ lịch sử dữ liệu |
| ACL-12 | Thu hồi quyền khi có tin đang chờ gửi | Worker áp dụng policy tại thời điểm thực thi; không gửi trái quyền |
| ACL-13 | Người dùng bị khóa hoặc rời nhóm | Quyền hiệu lực được cập nhật; cấu hình không gây quyền tồn dư |
| ACL-14 | Hai quản trị viên cùng chỉnh | Có cơ chế chống ghi đè mù |
| ACL-15 | Lưu thất bại | Không hiển thị thành công; không mất bản nháp |
| ACL-16 | Kiểm tra audit | Có người thực hiện, kênh, thời gian, chế độ và danh sách thêm/gỡ |
| ACL-17 | Kiểm tra giao diện 360/768/1440 px | Modal, danh sách, nút lưu và nhãn đọc được, thao tác được |
| ACL-18 | Hồi quy | Không đổi phân công hội thoại, quyền CRM hoặc trạng thái kết nối ngoài yêu cầu |

## 10. Prompt giao việc cho Astra 6

```text
Hãy hoàn thiện phần “Phân kênh cho từng người dùng” trong CRM hiện có theo
tài liệu này và ảnh tham chiếu. Phạm vi là cấp quyền sử dụng từng tài khoản
kênh cho người dùng, không phải xây lại toàn bộ hệ thống phân quyền.

Trước tiên đọc AGENTS.md/CLAUDE.md và các đặc tả IAM, Database Schema, API,
ADR liên quan. Xác định component, bảng quan hệ, policy và API hiện có.
Các chi tiết ngoài nội dung nhìn thấy trong ảnh là đề xuất; nếu khác đặc tả
đã duyệt, ghi rõ xung đột và không âm thầm sửa kiến trúc.

Giữ hai chế độ rõ ràng: theo phạm vi nhóm hiện có, hoặc chỉ người được chỉ
định. Xây hộp thoại chọn nhiều người, tìm kiếm/lọc, giữ lựa chọn qua phân
trang, lưu/hủy và hiển thị tóm tắt quyền trên từng dòng kênh.

Phân kênh không nâng quyền vai trò, không mở rộng phạm vi khách hàng, không
đổi người phụ trách hội thoại và không kích hoạt kết nối. Zalo cá nhân và
các kênh mô phỏng phải giữ nguyên nhãn/trạng thái kỹ thuật.

Thực thi quyền tại backend và các luồng dữ liệu liên quan, xử lý thu hồi
quyền, audit, lỗi và cập nhật đồng thời bằng cơ chế sẵn có. Nếu chỉ là
prototype, ghi rõ giới hạn và không tuyên bố bảo mật backend đã hoàn tất.

Thực hiện phần đã được giao và không xung đột. Khi bàn giao, nêu file đã
sửa, cách ánh xạ policy/schema, kiểm thử thực sự đã chạy, ảnh giao diện và
các mục NOT VERIFIED. Không thay đổi quyền truy cập/công khai Site.
```
