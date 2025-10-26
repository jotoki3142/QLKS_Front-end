"use client";

import styles from "./page.module.css";
import { useState } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [filters, setFilters] = useState({
      customerId: "",
      status: "",
      roomId: "" });

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
          <h1 className={styles.pageTitle}>Quản lý đặt phòng</h1>
          <p className={styles.pageSubtitle}>Quản lý đặt phòng trong khách sạn</p>
        </div>
      </section>

      {/* Filters box */}
      <form className={styles.filters} onSubmit={handleSearch}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm đặt phòng</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập họ tên KH..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })
              }
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Trạng thái</label>
            <select
              className={styles.select}
              value={filters.position}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang chờ">Đang chờ</option>
              <option value="Còn trống">Còn trống</option>
              <option value="Đã nhận">Đã nhận</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Mã phòng</label>
            <input
              className={styles.input}
              type="email"
              placeholder="Nhập mã phòng..."
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
            />
          </div>

          <div className={styles.filterActions}>
            <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}>Tìm kiếm</button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => setFilters({ customerId: "", status: "", roomId: "" })}
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
          Hiển thị {shown}/{total} đặt phòng (Trang {currentPage}/{Math.ceil(total / pageSize)})
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Link href="/booking/add" className={styles.addLink}>
          + Thêm đặt phòng mới</Link>
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã đặt phòng</th>
              <th className={styles.th}>Mã KH</th>
              <th className={styles.th}>Mã phòng</th>
              <th className={styles.th}>Check in</th>
              <th className={styles.th}>Check out</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Demo row to match screenshot */}
            <tr>
              <td className={styles.td}>001</td>
              <td className={styles.td}>001</td>
              <td className={styles.td}>001</td>
              <td className={styles.td}>2025-10-10</td>
              <td className={styles.td}>2025-11-10</td>
              <td className={styles.td}>Đang chờ</td>
              <td className={`${styles.td} ${styles.center}`}>
                <Link href="/booking/edit/001" className={styles.updateBtn}>
                Cập nhật</Link>
                <button className={styles.deleteBtn}>
                Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.pagerGroup}>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>
          &laquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>
          &lsaquo;</button>
          {[1,2,3,4,5].map((p) => (
            <button key={p} className={`${styles.pageButton} ${
                p === 3 ? styles.pageButtonActive : ""}`}>{p}</button>
          ))
      }
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>
          &rsaquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>
          &raquo;</button>
        </div>
      </div>
    </main>
  );
}