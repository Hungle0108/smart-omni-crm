# Smart Omni CRM — Description: Xem liên hệ theo doanh nghiệp/đơn vị

**Dành cho:** Agent Astra 6 triển khai trong CRM hiện có.  
**Ngày:** 24/09/2026.  
**Mục tiêu:** Từ Danh bạ, người dùng nhìn thấy rõ một doanh nghiệp/đơn vị có những cá nhân, đầu mối liên hệ nào, theo cách mở rộng từng đơn vị như ảnh 2.

> Đây là đặc tả triển khai dựa trên hai ảnh người dùng cung cấp và yêu cầu hiện tại. Nội dung ảnh đã được quan sát; mã nguồn, schema và API chưa được kiểm tra trong lần viết này. Các hành vi bổ sung ngoài ảnh là đề xuất cần ánh xạ vào hệ thống đang có.

## 1. Hiện trạng và kết quả mong muốn

**Ảnh 1 — danh bạ hiện tại:** Bảng phẳng có các cột Khách hàng, Liên hệ, Dịch vụ quan tâm, Chăm sóc và Phụ trách. Bản ghi cá nhân, doanh nghiệp, chi nhánh và cơ quan hành chính xuất hiện trong cùng danh sách. Trong vùng ảnh hiển thị chưa thấy danh sách cá nhân bên trong từng doanh nghiệp.

**Ảnh 2 — cách xem mong muốn:** Mỗi đơn vị là một khối có thể mở rộng/thu gọn. Header chứa tên đơn vị, địa chỉ, nhãn số liên hệ và mũi tên. Khi mở, có phần Thông tin đơn vị, nút Sửa, phần Đầu mối liên hệ, nút Thêm liên hệ và bảng chi tiết các đầu mối.

**Yêu cầu chính:** Bổ sung dạng xem “Theo doanh nghiệp/đơn vị” để người dùng mở một doanh nghiệp và xem các liên hệ trực tiếp trong Danh bạ; không bắt buộc điều hướng sang một màn hình khác mới biết doanh nghiệp đó có những ai.

Giữ dạng bảng hiện tại bằng lựa chọn “Danh sách”. Hai dạng xem dùng cùng hồ sơ và cùng quan hệ dữ liệu. Nếu ứng dụng đã có dạng xem nhóm tương đương thì hoàn thiện ngay trên component đó, không tạo màn hình trùng chức năng.

## 2. Phạm vi

- Áp dụng cho doanh nghiệp và các hồ sơ tổ chức tương đương đang có: cơ quan hành chính, đơn vị, chi nhánh nếu mô hình hỗ trợ.
- “Doanh nghiệp/đơn vị” là tên chung của hồ sơ tổ chức trong description này; không tạo entity mới chỉ vì nhãn UI khác nhau.
- Giữ cá nhân chưa liên kết với tổ chức trong danh bạ. Không tạo một tổ chức giả để chứa họ.
- Dùng lại hồ sơ 360°, công việc, lịch sử và phân quyền hiện có.
- Không xây lại IAM, Inbox hoặc module bán hàng trong nhiệm vụ này.

## 3. Chuyển đổi dạng xem

Trên toolbar Danh bạ, bổ sung lựa chọn:

- **Danh sách:** giữ bảng hiện tại.
- **Theo doanh nghiệp/đơn vị:** hiển thị các khối đơn vị mở rộng như ảnh 2.

Khi người dùng lọc riêng doanh nghiệp/tổ chức và chọn dạng xem nhóm, giữ lựa chọn đó theo cơ chế UI preferences hiện có. Không áp dụng thay đổi này cho tài khoản khác.

Ở dạng xem nhóm, các cá nhân không có tổ chức có thể nằm trong khu vực riêng **Cá nhân chưa liên kết đơn vị**, hoặc truy cập bằng tab/lọc Cá nhân đã có. Phải bảo đảm không làm các hồ sơ này biến mất khỏi trải nghiệm danh bạ.

Các bộ lọc hiện có về dịch vụ quan tâm, chăm sóc và người phụ trách vẫn hoạt động. Không thay đổi ý nghĩa của các trường hoặc số liệu tổng quan chỉ vì đổi cách hiển thị.

## 4. Khối doanh nghiệp/đơn vị

### 4.1. Header khi thu gọn

Mỗi khối gồm:

1. Mũi tên mở rộng/thu gọn có tên truy cập rõ ràng.
2. Avatar/logo hoặc chữ viết tắt.
3. Tên doanh nghiệp/đơn vị, chữ đậm.
4. Loại hồ sơ nếu cần phân biệt: doanh nghiệp, cơ quan hành chính, chi nhánh.
5. Địa chỉ rút gọn; nếu thiếu thì không tạo thông tin giả.
6. Badge **[N] liên hệ** theo dữ liệu người đang xem được phép truy cập.
7. Liên kết/nút **Mở hồ sơ 360°**, tách biệt với nút mở rộng để tránh bấm nhầm.

Bấm vùng header mở/đóng nội dung; bấm nút hồ sơ 360° chỉ điều hướng, không kích hoạt thêm thao tác mở/đóng. Cho phép mở nhiều đơn vị khi cần đối chiếu, trừ khi pattern hiện tại yêu cầu chỉ mở một khối.

Badge 0 liên hệ hiển thị trung tính, không coi đây là lỗi. Không hiển thị tổng số liên hệ người dùng không được quyền biết.

### 4.2. Nội dung khi mở rộng

Chia thành hai vùng giống logic của ảnh 2:

**A. THÔNG TIN ĐƠN VỊ**

- Tên doanh nghiệp/đơn vị.
- Địa chỉ.
- Điện thoại/email chung, người phụ trách và thông tin bổ sung nếu có trong hồ sơ hiện tại.
- Nút **Sửa thông tin đơn vị** nếu người dùng có quyền.

Không lấy điện thoại/email của một cá nhân bất kỳ thay cho thông tin liên lạc chung của tổ chức.

**B. ĐẦU MỐI LIÊN HỆ**

- Tiêu đề và số liên hệ được phép xem.
- Nút **+ Thêm liên hệ** nếu có quyền.
- Bảng cá nhân/đầu mối thuộc đơn vị.
- Tìm kiếm trong liên hệ của đơn vị khi danh sách đủ lớn; dùng chung component và query mechanism đang có.

## 5. Bảng đầu mối liên hệ

Ảnh 2 có các nhãn Loại, Đơn vị, Phòng, Chức danh, Tên, Điện thoại, Zalo ID, Email, Ghi chú và Thông tin khác, cùng icon sửa/gỡ ở cuối dòng.

Ánh xạ vào CRM theo ý nghĩa dữ liệu thực tế; không sao chép các nhãn gây nhầm lẫn giữa một cá nhân và một tổ chức. Bộ cột đề xuất:

| Cột | Nội dung/hành vi |
|---|---|
| Họ tên | Avatar/chữ viết tắt và tên cá nhân; bấm mở hồ sơ cá nhân 360° |
| Đơn vị trực thuộc | Chi nhánh/bộ phận tổ chức con nếu schema có; không mặc định mọi contact đều là một tổ chức con |
| Phòng/Ban | Phòng ban tại đơn vị này, ví dụ Kinh doanh hoặc Kế toán |
| Chức danh | Chức danh của cá nhân trong quan hệ với đơn vị |
| Vai trò liên hệ | Đầu mối chính, người quyết định, kỹ thuật… chỉ nếu hệ thống đã có trường/danh mục này |
| Điện thoại | Số liên hệ theo dữ liệu và quyền xem trường |
| Zalo ID | Định danh từ mô hình kênh hiện có nếu người dùng có quyền; không suy từ số điện thoại |
| Email | Địa chỉ email; xử lý giá trị dài không phá bố cục |
| Ghi chú | Nội dung ngắn; mở rộng/xem chi tiết nếu dài |
| Thông tin khác | Chỉ hiển thị khi có trường phù hợp và dữ liệu cần thiết |
| Thao tác | Xem hồ sơ, sửa, gỡ liên kết theo quyền |

Ưu tiên hiển thị Họ tên, Chức danh, Phòng/Ban, Điện thoại và Email. Có thể ẩn các cột phụ theo cấu hình bảng hoặc trên màn hình hẹp. Không bắt buộc thêm cột trống chỉ để đủ số cột của ảnh 2.

Nếu hồ sơ tổ chức có đầu mối chính, dùng nhãn **Đầu mối chính** và sắp xếp lên đầu theo quy tắc hiện có; không tự chọn cá nhân đầu tiên làm đầu mối chính.

Nếu dữ liệu chỉ hỗ trợ cá nhân liên kết trực tiếp, hiển thị danh sách phẳng bên trong đơn vị. Chỉ thêm cây tổ chức con → cá nhân khi schema/API thực sự hỗ trợ, không tự suy cấu trúc nhiều tầng từ ảnh.

## 6. Thao tác thêm, sửa và gỡ liên hệ

### 6.1. Thêm liên hệ có sẵn

Nút “+ Thêm liên hệ” mở hộp thoại có hai lựa chọn rõ ràng:

- **Chọn liên hệ có sẵn**.
- **Tạo liên hệ mới**.

Với liên hệ có sẵn:

1. Tìm theo tên, số điện thoại hoặc email trong phạm vi người dùng được phép.
2. Đánh dấu những liên hệ đã thuộc đơn vị; không cho tạo quan hệ trùng.
3. Hiển thị đơn vị đích ở đầu hộp thoại.
4. Nhập chức danh/phòng ban/vai trò nếu schema hỗ trợ.
5. Lưu liên kết bằng ID; không sao chép hồ sơ cá nhân.
6. Cập nhật bảng liên hệ, số đếm, hồ sơ cá nhân và hồ sơ tổ chức 360° liên quan.

### 6.2. Tạo liên hệ mới trong đơn vị

- Dùng lại form tạo contact của CRM, điền sẵn đơn vị theo ngữ cảnh.
- Trường bắt buộc, chuẩn hóa phone/email và kiểm tra trùng phải theo DTO/identity service hiện hành.
- Nếu phát hiện hồ sơ có thể trùng, cho người dùng xem và chọn liên kết hồ sơ sẵn có theo quyền; không tự gộp hoặc tự tạo thêm bản sao.
- Việc tạo cá nhân và liên kết với đơn vị phải có tính nhất quán; không báo hoàn tất nếu contact đã tạo nhưng liên kết thất bại.
- Sau lưu thành công, giữ đơn vị đang mở và hiển thị liên hệ mới; nếu bộ lọc khiến bản ghi không xuất hiện thì thông báo rõ thay vì báo mất dữ liệu.

### 6.3. Sửa liên hệ

- Icon bút mở form hiện có và giữ ngữ cảnh đơn vị.
- Phân biệt thông tin cá nhân dùng chung (họ tên, số điện thoại…) với thông tin thuộc quan hệ (phòng ban, chức danh tại đơn vị này).
- Nếu một cá nhân có nhiều quan hệ tổ chức, sửa chức danh ở đơn vị A không làm thay đổi chức danh ở đơn vị B.
- Tôn trọng mô hình hiện hành: nếu chỉ có một tổ chức/contact, không tự chuyển sang nhiều–nhiều để thực hiện màn hình này.

### 6.4. Gỡ liên kết

- Nếu dùng icon thùng rác như ảnh, tooltip và hộp xác nhận phải ghi **Gỡ liên hệ khỏi đơn vị**, không ghi chung chung “Xóa”.
- Thông báo rõ cá nhân và lịch sử vẫn được giữ trong CRM.
- Gỡ quan hệ không xóa contact, hội thoại, công việc hoặc giao dịch.
- Nếu cần chuyển contact từ đơn vị này sang đơn vị khác, sử dụng luồng chuyển riêng theo schema; không âm thầm đổi nơi liên kết khi thêm.
- Thao tác xóa hẳn hồ sơ cá nhân, nếu hệ thống có, là chức năng khác và cần quyền riêng.

## 7. Liên kết với hồ sơ 360° và Công việc

- Tên doanh nghiệp mở hồ sơ tổ chức; tên cá nhân mở hồ sơ cá nhân. Hai hồ sơ dùng dữ liệu thật và quan hệ ID chung.
- Các liên hệ bên trong khối doanh nghiệp phải trùng với tab Người liên hệ trong hồ sơ 360°, trong cùng phạm vi quyền và bộ lọc tương ứng.
- Có thể tái sử dụng hành động **Tạo công việc** từ dòng liên hệ nếu đã có. Form điền sẵn contact và tổ chức đang xem; không tạo task bản sao riêng cho danh bạ.
- Sửa tên doanh nghiệp/cá nhân cập nhật cách hiển thị ở mọi nơi bằng quan hệ ID, không thay đổi liên kết lịch sử.
- Không gom hoặc di chuyển mọi hội thoại/giao dịch của cá nhân sang tổ chức mới chỉ vì thay đổi đơn vị làm việc.
- Một contact xuất hiện ở nhiều tổ chức khi mô hình cho phép vẫn là cùng một hồ sơ, không phải nhiều khách hàng trùng.

## 8. Tìm kiếm, số đếm và tải dữ liệu

- Tìm kiếm danh bạ theo tên đơn vị hoặc liên hệ phải trả đúng đơn vị có liên hệ phù hợp, trong phạm vi quyền hiện tại.
- Nếu tìm theo tên cá nhân, đánh dấu liên hệ khớp trong đơn vị. Nếu chỉ tải các kết quả khớp, ghi rõ **Đang hiển thị X liên hệ phù hợp**, không diễn đạt thành toàn bộ liên hệ của đơn vị; có hành động **Xem tất cả liên hệ được phép** khi phù hợp.
- Không bỏ bộ lọc người phụ trách/nhóm khi mở rộng một đơn vị.
- Phân trang danh sách cha theo đơn vị; phân trang hoặc tải thêm liên hệ riêng bên trong. Không dùng số contact để phân trang organization.
- Số liên hệ là số contact liên kết hợp lệ, loại trùng theo ID, sau khi áp dụng quyền và định nghĩa trạng thái đang sử dụng. Ghi rõ bộ lọc đang tác động nếu số đếm theo bộ lọc.
- Tải thông tin header trước; chỉ tải chi tiết khi mở hoặc theo cache. Không tải tất cả liên hệ của mọi đơn vị ngay từ lần đầu.
- API nên trả số đếm cùng danh sách đơn vị để tránh một yêu cầu riêng cho mỗi đơn vị; tái sử dụng endpoint/query aggregate đã có.
- Giữ khối đang mở, bộ lọc, trang và vị trí cuộn khi quay về từ hồ sơ 360° hoặc sau khi sửa.
- Không để dữ liệu cache của tài khoản trước xuất hiện sau khi đổi người dùng/tenant.

## 9. Phân quyền và tính toàn vẹn dữ liệu

Danh bạ vẫn tuân thủ tenant, quyền chức năng và phạm vi bản ghi hiện hành. Có quyền xem tổ chức không tự động được xem mọi contact bên trong tổ chức đó.

- Lọc liên hệ và số đếm phía server, kể cả tìm kiếm và lookup chọn người có sẵn.
- Chỉ hiển thị điện thoại/email/định danh kênh khi người dùng có quyền với dữ liệu đó.
- Người chỉ có quyền đọc không sửa, thêm hoặc gỡ liên kết được qua UI hoặc API trực tiếp.
- Kiểm tra contact và organization cùng tenant, có quyền liên kết và chưa tồn tại quan hệ trùng.
- Không tự tạo quan hệ bằng cách so chuỗi tên công ty, đuôi email hoặc số điện thoại. Dữ liệu cũ chỉ chứa tên công ty dạng văn bản cần quy trình đối chiếu rõ ràng trước khi chuyển thành quan hệ ID.
- Audit các thay đổi liên kết/phụ trách theo cơ chế hiện có; không lưu bản sao dữ liệu đầy đủ không cần thiết.
- Phần phân quyền kênh theo người dùng được mô tả trong tài liệu riêng không làm mở rộng quyền danh bạ này.

## 10. Giao diện và trạng thái

Kế thừa hệ thống màu CRM đang chỉnh: nền trang xám xanh nhạt, header đơn vị trắng, vùng mở rộng có nền phụ nhẹ; bảng liên hệ có header màu khác và đường phân cách rõ.

- Tên đơn vị nổi bật hơn địa chỉ; tên cá nhân nổi bật hơn thông tin bổ sung.
- Không dùng cùng một nền cho trang, header đơn vị và bảng con khiến các cấp thông tin hòa lẫn.
- Mũi tên phản ánh đúng trạng thái mở/đóng và hỗ trợ bàn phím; dùng thuộc tính truy cập tương ứng.
- Trên mobile, header xuống dòng hợp lý; liên hệ có thể chuyển thành thẻ với thông tin chính và nút xem thêm. Nếu bảng cần cuộn ngang thì chỉ cuộn vùng bảng, không làm tràn toàn trang.
- Icon sửa/gỡ phải có tooltip/tên truy cập và vùng bấm đủ rõ.

| Trạng thái | Hiển thị đề xuất |
|---|---|
| Chưa có liên hệ | “Chưa có liên hệ trong đơn vị này” và nút thêm nếu được phép |
| Không có kết quả tìm kiếm | “Không có liên hệ phù hợp với bộ lọc” và hành động xóa lọc |
| Không có liên hệ được phép xem | “Không có liên hệ khả dụng trong phạm vi truy cập của bạn”; không tiết lộ tên/số lượng ngoài quyền |
| Đang tải | Skeleton trong khối đang mở, không làm nhảy toàn trang |
| Lỗi tải | Lỗi ngay trong khối, có nút thử lại |
| Lỗi lưu | Giữ form và thông tin đã nhập, không hiện thành công giả |
| Hồ sơ không còn khả dụng | Thông báo phù hợp và đường quay về Danh bạ |

## 11. Tiêu chí nghiệm thu

| Mã | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| ORG-01 | Chuyển từ Danh sách sang Theo đơn vị | Dùng cùng dữ liệu và bộ lọc, không tạo bản ghi mới |
| ORG-02 | Mở một đơn vị có nhiều contact | Thấy đúng danh sách bên trong như logic ảnh 2 |
| ORG-03 | Badge số liên hệ | Khớp tập contact được phép tính; không đếm trùng ID |
| ORG-04 | Thêm contact có sẵn | Tạo quan hệ đúng, không nhân bản contact |
| ORG-05 | Tạo contact từ đơn vị | Điền đúng tổ chức; danh sách và 360° cùng cập nhật |
| ORG-06 | Thêm lại contact đã liên kết | Không tạo quan hệ trùng; có thông báo phù hợp |
| ORG-07 | Gỡ khỏi đơn vị | Contact và lịch sử vẫn tồn tại; quan hệ/số đếm cập nhật |
| ORG-08 | Sửa chức danh/phòng ban | Ánh xạ đúng dữ liệu quan hệ, không sửa nhầm tổ chức khác |
| ORG-09 | Mở contact hoặc tổ chức 360° | Mở đúng hồ sơ; quay lại giữ ngữ cảnh |
| ORG-10 | Tìm theo tên contact | Thấy đúng đơn vị/liên hệ khớp, phân biệt kết quả lọc với tổng |
| ORG-11 | Cá nhân chưa có đơn vị | Vẫn tra cứu và quản lý được trong Danh bạ |
| ORG-12 | Người dùng chỉ xem hoặc bị giới hạn nhóm | Không sửa/gỡ hoặc đọc dữ liệu ngoài quyền qua UI và API |
| ORG-13 | Dữ liệu khác tenant | Không hiển thị, đếm hoặc cho liên kết |
| ORG-14 | Lỗi tải/lưu, nhiều người cùng sửa | Trạng thái rõ, giữ dữ liệu nhập, theo cơ chế xung đột hiện có |
| ORG-15 | Mobile và desktop | Kiểm tra 360/768/1440 px; đọc và thao tác được |
| ORG-16 | Hồi quy | Không hỏng bảng cũ, hồ sơ 360°, Công việc hoặc phân quyền kênh |

Dùng dữ liệu kiểm thử giả lập: một doanh nghiệp có 3 contact, một đơn vị chưa có contact và một cá nhân độc lập. Không lấy dữ liệu cá nhân thật trong ảnh để đưa vào seed/source code nếu không có yêu cầu riêng.

## 12. Prompt giao việc cho Astra 6

```text
Hãy bổ sung cho Danh bạ CRM dạng xem “Theo doanh nghiệp/đơn vị”, để người dùng
mở rộng một đơn vị và thấy ngay các đầu mối liên hệ bên trong, giống hành vi
trong ảnh 2. Giữ dạng bảng hiện tại như ảnh 1 bằng lựa chọn “Danh sách”.

Header mỗi đơn vị có tên, địa chỉ, số liên hệ và nút mở rộng. Bên trong gồm
“Thông tin đơn vị” và “Đầu mối liên hệ”, có bảng họ tên, phòng ban, chức danh,
điện thoại, Zalo ID/email và các trường phù hợp với schema hiện có.

Bổ sung “Thêm liên hệ” với hai lựa chọn: chọn contact có sẵn hoặc tạo mới.
Sửa contact dùng lại form hiện có. Gỡ khỏi đơn vị chỉ gỡ quan hệ, không xóa
contact hoặc lịch sử. Bấm tên người mở hồ sơ cá nhân; bấm mở 360° của đơn vị
mở hồ sơ tổ chức. Cập nhật thống nhất số đếm và dữ liệu liên quan sau thay đổi.

Đọc hướng dẫn repository và đặc tả trước khi sửa. Tái sử dụng entity/API,
quan hệ contact–organization, component và policy đang có. Không tạo contact
bản sao, không suy liên kết từ tên công ty/email domain, không tự đổi mô hình
quan hệ một–nhiều thành nhiều–nhiều. Ghi SPEC CONFLICT cho quyết định có xung đột.

Quyền kênh không mở rộng quyền Danh bạ. Tất cả danh sách, số đếm, tìm kiếm,
lookup và mutation phải theo tenant và phạm vi truy cập thực tế.

Thực hiện phần đã được giao, kiểm tra responsive và các luồng thêm/sửa/gỡ,
liên kết 360° và quyền truy cập. Bàn giao file đã sửa, kiểm thử thực sự đã
chạy, ảnh giao diện và những mục NOT VERIFIED. Nếu chỉ có prototype, ghi rõ
giới hạn dữ liệu và backend. Không thay đổi quyền công khai của Site.
```
