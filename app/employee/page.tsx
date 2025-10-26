"use client";

import styles from "./page.module.css";
import { useMemo, useState } from "react";
import Link from "next/link";

type Employee = {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: string;
  salary: number;
  status: string;
};

export default function EmployeePage() {
  const [filters, setFilters] = useState({ name: "", position: "", email: "" });

  // Data (empty placeholder for now)
  const employees: Employee[] = [];
  let filtered = employees; // TODO: apply filters when wiring backend

  // Sorting (name, salary)
  const [sortField, setSortField] = useState<"name" | "salary" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name, "vi", { sensitivity: "base", numeric: true });
      } else {
        cmp = a.salary - b.salary;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );
  const handlePageChange = (p: number) => setCurrentPage(p);

  const handleSort = (field: "name" | "salary") => {
    let newOrder: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    setSortField(field);
    setSortOrder(newOrder);
  };
  return (
    <main className={styles.main}>
      {/* Header banner */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div>
            <h1 className={styles.pageTitle}>Quản lý nhân viên</h1>
            <p className={styles.pageSubtitle}>Quản lý nhân viên trong khách sạn</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className={styles.filters}>
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
              <option value="">Tất cả chức vụ</option>
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
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>Tìm kiếm</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setFilters({ name: "", position: "", email: "" })}>Xóa bộ lọc</button>
          </div>
        </div>
        <div className={styles.filterRight}>
          <Link href="/employee/add" className={styles.addLink}>+ Thêm NV mới</Link>
        </div>
      </div>

      {/* Info line */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>
          Hiển thị {paginated.length}/{employees.length} nhân viên (Trang {currentPage}/{totalPages})
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã NV</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("name")}>Họ tên
                <span className={styles.sortIcon}>{sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th className={styles.th}>Chức vụ</th>
              <th className={styles.th}>SDT</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Ca làm việc</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("salary")}>Lương
                <span className={styles.sortIcon}>{sortField === "salary" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>

            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className={`${styles.td} ${styles.center}`}>Không có nhân viên phù hợp...</td>
              </tr>
            ) : (
              paginated.map((e: any) => (
                <tr key={e.id}>
                  {/* Replace with real fields when wiring backend */}
                </tr>
              ))
            )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pagerGroup}>
            <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
            <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === 1} onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>&lsaquo;</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageButtonActive : ""}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
            ))}
            <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === totalPages} onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>&rsaquo;</button>
            <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
          </div>
        </div>
      )}
