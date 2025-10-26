// app/service/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";

interface BackendService {
    id: number;
    tenDichVu: string; // Tên dịch vụ
    moTa?: string; // Mô tả
    gia: number; // Giá
    loaiDichVu?: string; // Loại dịch vụ
    trangThai?: string; // Trạng thái
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    unit: string; // loaiDichVu
    status: string; // trangThai
}

function mapService(s: BackendService): Service {
    return {
        id: s.id,
        name: s.tenDichVu,
        description: s.moTa ?? "",
        price: s.gia,
        unit: s.loaiDichVu ?? "Lần",
        status: s.trangThai ?? "Đang hoạt động",
    };
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [search, setSearch] = useState("");
    const [unitFilter, setUnitFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortField, setSortField] = useState<"id" | "price" | "name" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: number; displayName: string } | null>(null);

    const loadServices = async (page = currentPage, size = itemsPerPage) => {
        try {
            // Backend của bạn dùng query param 'page' và 'size'
            const res = await fetch(`/api/services?page=${page - 1}&size=${size}`, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch services");

            const data: { content: BackendService[], totalPages: number } = await res.json();

            const mapped = data.content.map(mapService);
            setServices(mapped);
            setFilteredServices(mapped);
            setTotalPages(data.totalPages);

        } catch (e) {
            console.error(e);
            toast.error("Không thể tải danh sách dịch vụ.");
        }
    };

    useEffect(() => {
        loadServices(1, itemsPerPage);
    }, []);

    // Tìm kiếm và Lọc
    const handleSearch = async () => {
        try {
            const keyword = search.trim();
            const apiUrl = `/api/services/search?keyword=${keyword}&page=0&size=${itemsPerPage}`;

            const res = await fetch(apiUrl, { cache: "no-store" });
            if (!res.ok) throw new Error("Search failed");

            const data: { content: BackendService[], totalPages: number } = await res.json();
            let mapped = data.content.map(mapService);

            if (statusFilter) {
                mapped = mapped.filter(s => s.status === statusFilter);
            }
            if (unitFilter) {
                mapped = mapped.filter(s => s.unit === unitFilter);
            }

            setFilteredServices(mapped);
            setTotalPages(data.totalPages);
            setCurrentPage(1);

        } catch (e) {
            console.error(e);
            toast.error("Tìm kiếm dịch vụ thất bại.");
        }
    };

    const clearFilters = () => {
        setSearch("");
        setUnitFilter("");
        setStatusFilter("");
        loadServices(1, itemsPerPage);
        setCurrentPage(1);
    };

    const handleSort = (field: "id" | "price" | "name") => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field && sortOrder === "asc") newOrder = "desc";
        setSortField(field);
        setSortOrder(newOrder);

        const sorted = [...filteredServices].sort((a, b) => {
            let cmp = 0;
            if (field === "name") {
                cmp = a.name.localeCompare(b.name);
            } else {
                const aValue = a[field] as number;
                const bValue = b[field] as number;
                cmp = aValue - bValue;
            }
            return newOrder === "asc" ? cmp : -cmp;
        });
        setFilteredServices(sorted);
    };

    // Phân trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadServices(page, itemsPerPage);
    }

    const handleDelete = (id: number, displayName: string) => {
        setServiceToDelete({ id, displayName });
        setIsPopupOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;

        const { id, displayName } = serviceToDelete;

        const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
        if (!res.ok) {
            toast.error("Xóa dịch vụ thất bại");
            setIsPopupOpen(false);
            setServiceToDelete(null);
            return;
        }

        await loadServices(currentPage, itemsPerPage);

        toast.success(`Đã xóa dịch vụ ${displayName} thành công!`);
        setIsPopupOpen(false);
        setServiceToDelete(null);
    };

    return (
        <main className={styles.main}>
            {/* Banner header */}
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div>
                        <h1 className={styles.pageTitle}>Quản lý dịch vụ</h1>
                        <p className={styles.pageSubtitle}>Quản lý các dịch vụ khách sạn cung cấp</p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterLeft}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tìm kiếm dịch vụ</label>
                        <input
                            type="text"
                            placeholder="Nhập tên hoặc loại dịch vụ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.search}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Loại/Đơn vị</label>
                        <input
                            type="text"
                            placeholder="Nhập loại/đơn vị..."
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Trạng thái</label>
                        <select
                            className={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                        </select>
                    </div>

                    <div className={styles.filterActions}>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>Tìm kiếm</button>
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
                    </div>
                </div>
                <div className={styles.filterRight}>
                    <Link href="/service/add" className={styles.addLink}>
                        +Thêm dịch vụ mới
                    </Link>
                </div>
            </div>

            {/* Info line */}
            <div className={styles.listInfo}>
                <span className={styles.infoDot}>i</span>
                <span>Hiển thị {filteredServices.length} dịch vụ (Trang {currentPage}/{Math.max(totalPages, 1)})</span>
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                    <tr>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("id")}>
                            Mã DV
                            <span className={styles.sortIcon}>{sortField === "id" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                        </th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("name")}>
                            Tên dịch vụ
                            <span className={styles.sortIcon}>{sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                        </th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("price")}>
                            Giá
                            <span className={styles.sortIcon}>{sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                        </th>
                        <th className={styles.th}>Đơn vị tính</th>
                        <th className={styles.th}>Mô tả</th>
                        <th className={styles.th}>Trạng thái</th>
                        <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredServices.length === 0 ? (
                        <tr>
                            <td colSpan={7} className={`${styles.td} ${styles.center}`}>
                                Không tìm thấy dịch vụ nào phù hợp...
                            </td>
                        </tr>
                    ) : (
                        filteredServices.map((s) => (
                            <tr key={s.id} className={styles.tr}>
                                <td className={styles.td} style={{ fontWeight: 600 }}>{s.id}</td>
                                <td className={styles.td}>{s.name}</td>
                                <td className={styles.td}>
                                    {s.price.toLocaleString()} VND / {s.unit}
                                </td>
                                <td className={styles.td}>{s.unit}</td>
                                <td className={styles.td} style={{ color: "#374151" }}>
                                    {s.description.length > 50 ? s.description.substring(0, 50) + "..." : s.description || "-"}
                                </td>
                                <td className={`${styles.td} ${
                                    s.status === "Đang hoạt động"
                                        ? styles.statusAvailable 
                                        : styles.statusReserved 
                                }`}>
                                    {s.status}
                                </td>
                                <td className={`${styles.td} ${styles.center}`}>
                                    <Link href={`/service/edit/${s.id}`} className={styles.btnUpdate}>
                                        Cập nhật
                                    </Link>
                                    <button onClick={() => handleDelete(s.id, s.name)} className={styles.btnDelete}>
                                        Xóa
                                    </button>
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
                title={serviceToDelete ? `Bạn có chắc muốn xóa dịch vụ ${serviceToDelete.displayName}?` : ""}
            />
        </main>
    );
}