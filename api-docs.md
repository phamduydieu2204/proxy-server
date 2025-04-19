Tài liệu API
Tài liệu này mô tả API của hệ thống quản lý giao dịch, sử dụng một endpoint proxy để giao tiếp với Google Apps Script. Tất cả các yêu cầu được gửi đến endpoint /api/proxy, với hành động cụ thể được xác định trong phần thân yêu cầu.
URL Cơ sở
https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy

Xác thực

Các yêu cầu được xác thực bằng SCRIPT_AUTH_TOKEN, được gửi dưới dạng tham số truy vấn (authToken) bởi máy chủ proxy (server.js) đến Google Apps Script.
Token được cấu hình trong tệp .env (cục bộ) và Config Vars của Heroku (SCRIPT_AUTH_TOKEN), và phải khớp với SECRET_TOKEN được lưu trong PropertiesService của Google Apps Script.

Endpoint: POST /api/proxy
Mô tả
Endpoint /api/proxy chuyển tiếp các yêu cầu đến Google Apps Script, xử lý các hành động như đăng nhập người dùng, quản lý giao dịch, và lấy danh sách phần mềm. Trường action trong phần thân yêu cầu xác định hành động cần thực hiện.
Tiêu đề yêu cầu

Content-Type: application/json

Các hành động
Các hành động sau được hỗ trợ, mỗi hành động có định dạng yêu cầu và phản hồi cụ thể.

1. Đăng nhập (Login)
Xác thực người dùng dựa trên mã nhân viên và mật khẩu.
Phần thân yêu cầu
{
  "action": "login",
  "code": "string", // Mã nhân viên (ví dụ: "NV001")
  "password": "string" // Mật khẩu
}

Phản hồi

200 Thành công{
  "status": "success",
  "tenNhanVien": "string", // Tên nhân viên
  "maNhanVien": "string", // Mã nhân viên
  "vaiTro": "string" // Vai trò (ví dụ: "admin", "nhanvien")
}


200 Lỗi{
  "status": "fail",
  "message": "string" // Thông báo lỗi (ví dụ: "Mã nhân viên không tồn tại", "Sai mật khẩu", "Tài khoản đã bị khóa")
}



Ghi chú

Sau 5 lần đăng nhập thất bại, tài khoản sẽ bị khóa (message: "Tài khoản đã bị khóa do đăng nhập sai quá 5 lần").
Phản hồi được lưu trong sessionStorage dưới dạng employeeInfo bởi login.js.


2. Thêm giao dịch (Add Transaction)
Tạo một giao dịch mới trong sheet GiaoDich và tùy chọn chia sẻ tệp Google Drive.
Phần thân yêu cầu
{
  "action": "addTransaction",
  "transactionType": "string", // Loại giao dịch (ví dụ: "Bán hàng", "Hoàn Tiền", "Dùng thử", "Nhập hàng")
  "transactionDate": "string", // Định dạng: YYYY/MM/DD
  "customerName": "string", // Tên khách hàng
  "customerEmail": "string", // Email khách hàng
  "customerPhone": "string", // Số điện thoại khách hàng
  "duration": number, // Số tháng đăng ký
  "startDate": "string", // Định dạng: YYYY/MM/DD
  "endDate": "string", // Định dạng: YYYY/MM/DD
  "deviceCount": number, // Số thiết bị
  "softwareName": "string", // Tên phần mềm
  "softwarePackage": "string", // Gói phần mềm
  "accountName": "string", // Tên tài khoản
  "revenue": number, // Doanh thu
  "note": "string", // Ghi chú
  "tenNhanVien": "string", // Tên nhân viên
  "maNhanVien": "string", // Mã nhân viên
  "originalTransactionId": "string" // Bắt buộc cho giao dịch "Hoàn Tiền"
}

Phản hồi

200 Thành công{
  "status": "success",
  "transactionId": "string", // Mã giao dịch được tạo (ví dụ: "GD00001")
  "transactionDate": "string",
  "transactionType": "string",
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "duration": number,
  "startDate": "string",
  "endDate": "string",
  "deviceCount": number,
  "softwareName": "string",
  "softwarePackage": "string",
  "accountName": "string",
  "accountSheetId": "string",
  "orderInfo": "string",
  "revenue": number,
  "note": "string",
  "tenNhanVien": "string",
  "maNhanVien": "string"
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Thiếu thông tin bắt buộc", "Không tìm thấy giao dịch gốc")
}



Ghi chú

Các trường bắt buộc: transactionType, customerName, customerEmail, customerPhone, softwareName, softwarePackage, duration, startDate, endDate, revenue, deviceCount.
Đối với giao dịch Hoàn Tiền, cần cung cấp originalTransactionId để liên kết với giao dịch gốc.
Nếu có accountSheetId và customerEmail, tệp sẽ được chia sẻ qua Google Drive (cho Bán hàng hoặc Dùng thử).


3. Cập nhật giao dịch (Update Transaction)
Cập nhật một giao dịch hiện có trong sheet GiaoDich.
Phần thân yêu cầu
{
  "action": "updateTransaction",
  "transactionId": "string", // Mã giao dịch (ví dụ: "GD00001")
  "transactionType": "string",
  "transactionDate": "string", // Định dạng: YYYY/MM/DD
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "duration": number,
  "startDate": "string", // Định dạng: YYYY/MM/DD
  "endDate": "string", // Định dạng: YYYY/MM/DD
  "deviceCount": number,
  "softwareName": "string",
  "softwarePackage": "string",
  "accountName": "string",
  "revenue": number,
  "note": "string",
  "tenNhanVien": "string", // Tên nhân viên gốc
  "maNhanVien": "string", // Mã nhân viên gốc
  "editorTenNhanVien": "string", // Tên người chỉnh sửa
  "editorMaNhanVien": "string" // Mã người chỉnh sửa
}

Phản hồi

200 Thành công{
  "status": "success"
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Không tìm thấy giao dịch")
}



Ghi chú

Các thay đổi được ghi vào trường note với dấu thời gian và thông tin người chỉnh sửa.
Các trường bắt buộc tương tự như addTransaction.


4. Xóa giao dịch (Delete Transaction)
Xóa một giao dịch khỏi sheet GiaoDich và tùy chọn thu hồi quyền truy cập tệp Google Drive.
Phần thân yêu cầu
{
  "action": "deleteTransaction",
  "transactionId": "string", // Mã giao dịch (ví dụ: "GD00001")
  "maNhanVien": "string", // Mã nhân viên
  "vaiTro": "string" // Vai trò (ví dụ: "admin", "nhanvien")
}

Phản hồi

200 Thành công{
  "status": "success"
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Không tìm thấy giao dịch", "Bạn không có quyền xóa giao dịch này")
}



Ghi chú

Người dùng không phải admin chỉ có thể xóa giao dịch của chính họ (maNhanVien phải khớp).
Nếu có accountSheetId và customerEmail, quyền truy cập tệp sẽ được thu hồi.


5. Lấy danh sách giao dịch (Get Transactions)
Lấy tất cả giao dịch của một người dùng từ sheet GiaoDich.
Phần thân yêu cầu
{
  "action": "getTransactions",
  "maNhanVien": "string", // Mã nhân viên
  "vaiTro": "string" // Vai trò (ví dụ: "admin", "nhanvien")
}

Phản hồi

200 Thành công{
  "status": "success",
  "data": [
    {
      "transactionId": "string",
      "transactionDate": "string",
      "transactionType": "string",
      "customerName": "string",
      "customerEmail": "string",
      "customerPhone": "string",
      "duration": number,
      "startDate": "string",
      "endDate": "string",
      "deviceCount": number,
      "softwareName": "string",
      "softwarePackage": "string",
      "accountName": "string",
      "accountSheetId": "string",
      "orderInfo": "string",
      "revenue": number,
      "note": "string",
      "tenNhanVien": "string",
      "maNhanVien": "string"
    },
    ...
  ]
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Không tìm thấy cột 'Mã giao dịch'")
}



Ghi chú

Người dùng không phải admin chỉ thấy giao dịch của họ.
Người dùng admin (vaiTro: "admin") thấy tất cả giao dịch.


6. Tìm kiếm giao dịch (Search Transactions)
Tìm kiếm giao dịch trong sheet GiaoDich dựa trên các điều kiện.
Phần thân yêu cầu
{
  "action": "searchTransactions",
  "maNhanVien": "string", // Mã nhân viên
  "vaiTro": "string", // Vai trò (ví dụ: "admin", "nhanvien")
  "conditions": {
    "transactionType": "string",
    "transactionDate": "string", // Định dạng: YYYY/MM/DD
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "duration": number,
    "startDate": "string", // Định dạng: YYYY/MM/DD
    "endDate": "string", // Định dạng: YYYY/MM/DD
    "deviceCount": number,
    "softwareName": "string",
    "softwarePackage": "string",
    "accountName": "string",
    "accountSheetId": "string",
    "orderInfo": "string",
    "revenue": number,
    "note": "string",
    "maNhanVien": "string"
  }
}

Phản hồi

200 Thành công{
  "status": "success",
  "data": [
    {
      "transactionId": "string",
      "transactionDate": "string",
      "transactionType": "string",
      "customerName": "string",
      "customerEmail": "string",
      "customerPhone": "string",
      "duration": number,
      "startDate": "string",
      "endDate": "string",
      "deviceCount": number,
      "softwareName": "string",
      "softwarePackage": "string",
      "accountName": "string",
      "accountSheetId": "string",
      "orderInfo": "string",
      "revenue": number,
      "note": "string",
      "tenNhanVien": "string",
      "maNhanVien": "string"
    },
    ...
  ]
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Không thể tìm kiếm giao dịch")
}



Ghi chú

Đối tượng conditions là tùy chọn; chỉ các trường được cung cấp sẽ được sử dụng để lọc.
Người dùng không phải admin chỉ có thể tìm kiếm giao dịch của họ.


7. Lấy danh sách phần mềm (Get Software List)
Lấy danh sách phần mềm từ sheet PhanMem.
Phần thân yêu cầu
{
  "action": "getSoftwareList"
}

Phản hồi

200 Thành công{
  "status": "success",
  "data": [
    {
      "softwareName": "string",
      "softwarePackage": "string",
      "price": number,
      "accountName": "string",
      "allowedUsers": number,
      "activeUsers": number,
      "accountSheetId": "string",
      "orderInfo": "string",
      "secret": "string",
      "otpRequestLink": "string"
    },
    ...
  ]
}


200 Lỗi{
  "status": "error",
  "message": "string" // Thông báo lỗi (ví dụ: "Lỗi khi lấy danh sách phần mềm")
}



Ghi chú

Không yêu cầu xác thực bổ sung ngoài SCRIPT_AUTH_TOKEN.
Được sử dụng để điền danh sách phần mềm vào các dropdown trong giao diện người dùng.


Xử lý lỗi

400 Yêu cầu không hợp lệ: JSON không hợp lệ hoặc thiếu trường action.{
  "status": "error",
  "message": "Dữ liệu không hợp lệ"
}


401 Không được phép: Token authToken không hợp lệ hoặc thiếu.{
  "status": "error",
  "message": "Unauthorized"
}


500 Lỗi máy chủ nội bộ: Lỗi từ Google Apps Script hoặc máy chủ proxy.{
  "error": "Lỗi khi gọi Google Apps Script",
  "details": "string"
}



Ghi chú

Tất cả yêu cầu được chuyển tiếp qua server.js đến Google Apps Script, đảm bảo tương thích CORS với giao diện người dùng (https://phamduydieu2204.github.io).
SCRIPT_AUTH_TOKEN được xử lý phía máy chủ và không lộ ra giao diện người dùng.
Nhật ký được lưu trong sheet DebugLog để gỡ lỗi, với các dữ liệu nhạy cảm (customerEmail, customerPhone, password) đã được lọc bỏ.

