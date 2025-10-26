"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";

export default function ServiceUsePage() {
  const [filters, setFilters] = useState({ bookingCode: "", serviceCode: "" });
  const total = 0;
  const shown = 0;
  const currentPage = 0;
  const pageSize = 10;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching with filters:", filters);
  };

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Quản lý sử dụng dịch vụ</h1>
          <p className={styles.pageSubtitle}>Quản lý sử dụng dịch vụ trong khách sạn</p>
        </div>
      </section>

      <form className={styles.filters} onSubmit={handleSearch}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm sử dụng dịch vụ</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã đặt phòng..."
              value={filters.bookingCode}
              onChange={(e) => setFilters({ ...filters, bookingCode: e.target.value })}
            />
          </div>

          <div className={styles.filterGroup}>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã dịch vụ..."
              value={filters.serviceCode}
              onChange={(e) => setFilters({ ...filters, serviceCode: e.target.value })}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Tìm kiếm</button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => setFilters({ bookingCode: "", serviceCode: "" })}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </form>

      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>Hiển thị {shown}/{total} khách hàng (Trang {currentPage}/{Math.ceil(total / pageSize) || 0})</span>
        <span className={styles.grow} />
        <Link href="/ServiceUse/add" className={styles.addLink}>+Thêm SDDV mới</Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã SDDV</th>
              <th className={styles.th}>Mã đặt phòng</th>
              <th className={styles.th}>Mã dịch vụ</th>
              <th className={styles.th}>Số lượng</th>
              <th className={styles.th}>Ngày sử dụng</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pagerGroup}>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&laquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&lsaquo;</button>
          {[1,2,3,4,5].map((p) => (
            <button key={p} className={`${styles.pageButton}`}>{p}</button>
          ))}
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&rsaquo;</button>
          <button className={`${styles.pageButton} ${styles.pageArrow}`}>&raquo;</button>
        </div>
      </div>
    </main>
  );
}

