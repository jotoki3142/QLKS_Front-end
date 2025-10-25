"use client";

import styles from "./page.module.css";
import { useState } from "react";
import Link from "next/link";

export default function EmployeePage() {
  const [filters, setFilters] = useState({ name: "", position: "", email: "" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend search
    console.log("Searching with filters:", filters);
  };

  // Demo paging numbers for the UI
  const total = 50;
  const pageSize = 10;
  const currentPage = 1;
  const shown = 10;

  return (
    <main className={styles.main}>
      {/* Header banner */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Quản lý nhân viên</h1>
          <p className={styles.pageSubtitle}>Quản lý nhân viên trong khách sạn</p>
        </div>
      </section>

      {/* Filters box */}
      <form className={styles.filters} onSubmit={handleSearch}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm nhân viên</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập họ tên..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Chức vụ</label>
            <select
              className={styles.select}
              value={filters.position}
              onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            >
              <option value="">Chức vụ</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Lễ tân">Lễ tân</option>
              <option value="Buồng phòng">Buồng phòng</option>
              <option value="Bảo vệ">Bảo vệ</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="Nhập email..."
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Tìm kiếm</button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => setFilters({ name: "", position: "", email: "" })}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </form>

      {/* Info line */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>
          Hiển thị {shown}/{total} nhân viên (Trang {currentPage}/{Math.ceil(total / pageSize)})
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Link href="/employee/add" className={styles.addLink}>+ Thêm NV mới</Link>
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã NV</th>
              <th className={styles.th}>Họ tên</th>
              <th className={styles.th}>Chức vụ</th>
              <th className={styles.th}>SDT</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Ca làm việc</th>
              <th className={styles.th}>Lương</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Demo row to match screenshot */}
            <tr>
              <td className={styles.td}>001</td>
              <td className={styles.td}>Nhung Vũ</td>
              <td className={styles.td}>Bảo vệ</td>
              <td className={styles.td}>0123456789</td>
              <td className={styles.td}><a href="#">nvu@gmail.com</a></td>
              <td className={styles.td}>Sáng</td>
              <td className={styles.td}>1000</td>
              <td className={styles.td} style={{ color: "#dc2626", fontWeight: 600 }}>Nghỉ</td>
              <td className={`${styles.td} ${styles.center}`}>
                <Link href="/employee/edit/001" className={styles.updateBtn}>Cập nhật</Link>
                <button className={styles.deleteBtn}>Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.pagerGroup}>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&laquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&lsaquo;</button>
          {[1,2,3,4,5].map((p) => (
            <button key={p} className={`${styles.pageButton} ${p === 3 ? styles.pageButtonActive : ""}`}>{p}</button>
          ))}
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&rsaquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&raquo;</button>
        </div>
      </div>
    </main>
  );
}
