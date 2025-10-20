export default function Home() {
  return (
    <div>
      <header className="navbar">
        <div className="logo">Hotel Management</div>
        <ul className="nav-links">
          <li><a href="#">Quản lí phòng</a></li>
          <li><a href="#" className="active">Khách hàng</a></li>
          <li><a href="#">Đặt phòng</a></li>
          <li><a href="#">Nhân viên</a></li>
          <li><a href="#">Dịch vụ</a></li>
          <li><a href="#">Sử dụng dịch vụ</a></li>
          <li><a href="#">Hóa đơn</a></li>
        </ul>
      </header>

      <section className="title-section">
        <h1>Quản lý khách hàng</h1>
        <p>Quản lý Khách hàng trong khách sạn</p>
      </section>

      <section className="search-section">
        <h3>Tìm kiếm khách hàng</h3>
        <div className="search-box">
          <input type="text" placeholder="Nhập họ tên" />
          <input type="text" placeholder="Nhập CCCD" />
          <input type="text" placeholder="Nhập SĐT" />
          <button id="btnSearch">Tìm kiếm</button>
        </div>
        <button id="btnClear">Xóa bộ lọc</button>
      </section>

      <section className="table-section">
        <div className="table-header">
          <span><strong>Hiển thị 10/50 khách hàng (Trang 1/5)</strong></span>
          <button className="btn-add">+ Thêm KH mới</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ tên</th>
              <th>CCCD</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Quốc tịch</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>Thúy Hiền</td>
              <td>012345678912</td>
              <td>0123456789</td>
              <td>hien@gmail.com</td>
              <td>Việt Nam</td>
              <td>Hà Đông</td>
              <td>
                <button className="btn-update">Cập nhật</button>
                <button className="btn-delete">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <button>&laquo;</button>
          <button>&lt;</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>&gt;</button>
          <button>&raquo;</button>
        </div>
      </section>

      <footer>
        <p>© 2025 Hotel Management. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}