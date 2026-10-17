# SKILL: WEBSITE DEVELOPMENT & UI/UX DESIGN GUIDELINES

## 1. TỔ CHỨC DỰ ÁN & CẤU TRÚC THƯ MỤC
- **Công nghệ**: Chỉ sử dụng HTML5 thuần, CSS3 thuần và JavaScript thuần (Vanilla JS). KHÔNG sử dụng thư viện hoặc framework bên ngoài (như Bootstrap, jQuery, React,...).
- **Phân tách file**: CSS và JS phải luôn được tách ra thành các file external riêng biệt.
- **Cấu trúc thư mục chuẩn**:
  ├── .skill/
  │   └── skill.md
  ├── css/
  │   └── style.css
  ├── js/
  │   └── script.js
  ├── images/
  ├── video/
  └── index.html

## 2. PHONG CÁCH THIẾT KẾ (UI/UX)
- **Phong cách chủ đạo**: Glassmorphism (Giao diện kính mờ).
- **Thuộc tính CSS bắt buộc**: Sử dụng `backdrop-filter: blur(...)`, nền màu bán trong suốt (semi-transparent background), viền mờ sáng nhẹ (subtle light border), và đổ bóng mềm.
- **Tương tác**: Đáp ứng đầy đủ các hiệu ứng Hover (di chuột) và Active (khi nhấn) mượt mà cho các nút bấm, ô nhập liệu và thành phần tương tác.
- **Responsive**: Đảm bảo hiển thị đẹp trên cả Desktop (bố cục hàng ngang) và Mobile (bố cục xếp chồng dọc).

## 3. QUY TRÌNH LÀM VIỆC & NGUYÊN TẮC BẮT BUỘC
- **Lập kế hoạch trước**: Luôn đề xuất kế hoạch/kiến trúc chi tiết trước khi bắt đầu viết code hoặc thực hiện thay đổi.
- **Xác nhận từ người dùng**: Khi có bất kỳ sự thay đổi, điều chỉnh hoặc lựa chọn phương án nào, PHẢI đưa ra các lựa chọn cho người dùng quyết định trước khi tiến hành.

## 4. QUY TẮC QUẢN LÝ DỮ LIỆU & DANH SÁCH (LIST MANAGEMENT)
Đối với tất cả các thành phần hiển thị danh sách trong dự án, BẮT BUỘC phải tích hợp đầy đủ 4 tính năng sau:
1. **Tìm kiếm (Search)**: Tìm kiếm theo tiêu đề/tên.
2. **Bộ lọc (Filter)**: Lọc danh sách theo trạng thái/tiêu chí.
3. **Sắp xếp (Sort)**: Sắp xếp theo tiêu đề (A-Z, Z-A) hoặc thời gian.
4. **Phân trang (Pagination)**: Hỗ trợ chuyển trang với các tùy chọn số lượng mục trên mỗi trang: `10`, `20`, `50`, hoặc `All` (Tất cả).
