"use client";

import styles from "./page.module.css";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getEmployees, Employee as ApiEmployee, deleteEmployee } from "@/utils/api";

// Use Employee type from API
type Employee = ApiEmployee;

export default function EmployeePage() {
  const [filters, setFilters] = useState({ name: "", position: "", email: "" });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees from API
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      console.log('Employee data from API:', data);
      if (data.length > 0) {
        console.log('First employee:', data[0]);
      }
      setEmployees(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      alert("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  let filtered = employees.filter(emp => {
    if (filters.name && !emp.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.position && emp.position !== filters.position) return false;
    if (filters.email && !emp.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
    return true;
  });

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

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    
    try {
      await deleteEmployee(id);
      alert('Xóa nhân viên thành công!');
      loadEmployees(); // Reload list
    } catch (error) {
      console.error('Lỗi khi xóa nhân viên:', error);
      alert('Không thể xóa nhân viên');
    }
  };

  const getRoleDisplay = (role: string) => {
    const roles: Record<string, string> = {
      'MANAGER': 'Quản lý',
      'RECEPTIONIST': 'Lễ tân',
      'HOUSEKEEPING': 'Buồng phòng',
      'SECURITY': 'Bảo vệ'
    };
    return roles[role] || role;
  };

  const getShiftDisplay = (shift: string) => {
    const shifts: Record<string, string> = {
      'MORNING': 'Ca sáng',
      'AFTERNOON': 'Ca chiều',
      'NIGHT': 'Ca tối'
    };
    return shifts[shift] || shift;
  };

  const getStatusDisplay = (status: string) => {
    const statuses: Record<string, string> = {
      'WORKING': 'Đang làm',
      'RESIGNED': 'Nghỉ việc'
    };
    return statuses[status] || status;
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
              <option value="MANAGER">Quản lý</option>
              <option value="RECEPTIONIST">Lễ tân</option>
              <option value="HOUSEKEEPING">Buồng phòng</option>
              <option value="SECURITY">Bảo vệ</option>
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
            {loading ? (
              <tr>
                <td colSpan={9} className={`${styles.td} ${styles.center}`}>Đang tải...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className={`${styles.td} ${styles.center}`}>Không có nhân viên phù hợp...</td>
              </tr>
            ) : (
              paginated.map((e: Employee) => (
                <tr key={e.employeeId}>
                  <td className={styles.td}>{e.employeeId}</td>
                  <td className={styles.td}>{e.name}</td>
                  <td className={styles.td}>{e.position ? getRoleDisplay(e.position) : '-'}</td>
                  <td className={styles.td}>{e.phoneNumber}</td>
                  <td className={styles.td}>{e.email}</td>
                  <td className={styles.td}>{e.shift ? getShiftDisplay(e.shift) : '-'}</td>
                  <td className={styles.td}>{e.salary ? e.salary.toLocaleString('vi-VN') + ' VNĐ' : '-'}</td>
                  <td className={styles.td}>{e.employeeStatus ? getStatusDisplay(e.employeeStatus) : '-'}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/employee/edit/${e.employeeId}`} className={styles.btnEdit}>Cập nhật</Link>
                    <button className={styles.btnDelete} onClick={() => handleDelete(e.employeeId)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </main>
  );
}
