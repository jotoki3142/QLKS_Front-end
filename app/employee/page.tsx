"use client";

import styles from "./page.module.css";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getEmployees, Employee as ApiEmployee, deleteEmployee } from "@/utils/api";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";

// Use Employee type from API
type Employee = ApiEmployee;

export default function EmployeePage() {
    const [filters, setFilters] = useState({ name: "", position: "", email: "" });
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<"name" | "salary" | "employeeId" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<{ employeeId: number; name: string } | null>(null);

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
            setFilteredEmployees(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
            toast.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = () => {
        const filtered = employees.filter(emp => {
            if (filters.name && !emp.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
            if (filters.position && emp.position !== filters.position) return false;
            if (filters.email && !emp.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
            return true;
        });
        setFilteredEmployees(filtered);
        setCurrentPage(1);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({ name: "", position: "", email: "" });
        setFilteredEmployees(employees);
        setCurrentPage(1);
    };

    // Sorting
    const handleSort = (field: "name" | "salary" | "employeeId") => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field && sortOrder === "asc") newOrder = "desc";
        setSortField(field);
        setSortOrder(newOrder);

        const sorted = [...filteredEmployees].sort((a, b) => {
            let cmp = 0;
            if (field === "name") {
                cmp = a.name.localeCompare(b.name, "vi", { sensitivity: "base", numeric: true });
            } else {
                const aValue = a[field] as number;
                const bValue = b[field] as number;
                cmp = aValue - bValue;
            }
            return newOrder === "asc" ? cmp : -cmp;
        });
        setFilteredEmployees(sorted);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
    const paginated = useMemo(
        () => filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filteredEmployees, currentPage]
    );
    const handlePageChange = (p: number) => setCurrentPage(p);

    const handleDelete = (employeeId: number, name: string) => {
        setEmployeeToDelete({ employeeId, name });
        setIsPopupOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        const { employeeId, name } = employeeToDelete;

        try {
            await deleteEmployee(employeeId);
            toast.success(`Đã xóa nhân viên ${name} thành công!`);
            loadEmployees(); // Reload list
        } catch (error) {
            console.error('Lỗi khi xóa nhân viên:', error);
            toast.error('Không thể xóa nhân viên');
        } finally {
            setIsPopupOpen(false);
            setEmployeeToDelete(null);
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
                            className={styles.search}
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
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>Tìm kiếm</button>
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
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
                    Hiển thị {paginated.length}/{employees.length} nhân viên (Trang {currentPage}/{Math.max(totalPages, 1)})
                </span>
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                    <tr>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("employeeId")}>
                            Mã NV
                            <span className={styles.sortIcon}>
                                {sortField === "employeeId" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                        </th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("name")}>
                            Họ tên
                            <span className={styles.sortIcon}>
                                {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                        </th>
                        <th className={styles.th}>Chức vụ</th>
                        <th className={styles.th}>SĐT</th>
                        <th className={styles.th}>Email</th>
                        <th className={styles.th}>Ca làm việc</th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("salary")}>
                            Lương
                            <span className={styles.sortIcon}>
                                {sortField === "salary" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                            </span>
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
                            <tr key={e.employeeId} className={styles.tr}>
                                <td className={styles.td} style={{ fontWeight: 600 }}>{e.employeeId}</td>
                                <td className={styles.td}>{e.name}</td>
                                <td className={styles.td}>{e.position ? getRoleDisplay(e.position) : '-'}</td>
                                <td className={styles.td}>{e.phoneNumber ? String(e.phoneNumber).padStart(10, '0') : '-'}</td>
                                <td className={styles.td}>{e.email}</td>
                                <td className={styles.td}>{e.shift ? getShiftDisplay(e.shift) : '-'}</td>
                                <td className={styles.td}>{e.salary ? e.salary.toLocaleString('vi-VN') + ' VNĐ' : '-'}</td>
                                <td className={`${styles.td} ${
                                      e.employeeStatus === "WORKING"
                                        ? styles.statusWorking
                                        : styles.statusResigned
                                    }`}>
                                    {e.employeeStatus ? getStatusDisplay(e.employeeStatus) : '-'}
                                </td>
                                <td className={`${styles.td} ${styles.center}`}>
                                    <Link href={`/employee/edit/${e.employeeId}`} className={styles.btnUpdate}>Cập nhật</Link>
                                    <button className={styles.btnDelete} onClick={() => handleDelete(e.employeeId, e.name)}>Xóa</button>
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
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageButtonActive : ""}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === totalPages} onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>&rsaquo;</button>
                        <button className={`${styles.pageButton} ${styles.pageArrow}`} disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
                    </div>
                </div>
            )}
            
            <ConfirmPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onConfirm={confirmDelete}
                title={employeeToDelete ? `Bạn có chắc muốn xóa nhân viên ${employeeToDelete.name}?` : ""}
            />
        </main>
    );
}
