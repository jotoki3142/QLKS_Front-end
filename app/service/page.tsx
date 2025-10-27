"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ConfirmPopup from "@/components/ConfirmPopup";
import { toast } from "react-toastify";

interface Service {
    serviceId: number;
    name: string;
    type: string;
    status: string;
    price: number;
}

interface BackendService {
    serviceId: number;
    tenDichVu: string;
    loaiDichVu: "PER_USE" | "PER_HOUR" | "PER_DAY" | "CONSUMABLE" | string;
    trangThai: "ACTIVE" | "INACTIVE" | "TEMPORARY_OUT" | string;
    gia: number;
}

function mapService(s: BackendService): Service {
    const typeMap: Record<string, string> = {
        PER_USE: "Tính theo lần",
        PER_HOUR: "Tính theo giờ",
        PER_DAY: "Tính theo ngày",
        CONSUMABLE: "Tiêu hao",
    };

    const statusMap: Record<string, string> = {
        ACTIVE: "Đang hoạt động",
        INACTIVE: "Ngừng hoạt động",
        TEMPORARY_OUT: "Tạm thời hết",
    };

    return {
        serviceId: s.serviceId,
        name: s.tenDichVu,
        type: typeMap[s.loaiDichVu] ?? s.loaiDichVu,
        status: statusMap[s.trangThai] ?? s.trangThai,
        price: s.gia || 0,
    };
}

// Convert localized strings back to enum when sending filters if necessary (we already use enum values in selects)

export default function ServicePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [filtered, setFiltered] = useState<Service[]>([]);
    const [filters, setFilters] = useState({ name: "", type: "", status: "" });
    const [sortField, setSortField] = useState<"name" | "price" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: number; displayId: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            const url = `/api/service/api/list`;
            const res = await fetch(url, { cache: "no-store" });

            if (!res.ok) {
                setServices([]);
                setFiltered([]);
                return;
            }

            const raw = await res.json();
            const data: BackendService[] = raw.content || raw;
            const mapped = data.map(mapService).sort((a, b) => a.serviceId - b.serviceId);

            setServices(mapped);
            setFiltered(mapped);
        };

        load().catch(() => {});
    }, []);

    const handleSearch = () => {
        const keyword = filters.name.trim().toLowerCase();
        const result = services.filter((s) => {
            const matchName = !keyword || s.name.toLowerCase().includes(keyword);
            const matchType = !filters.type || s.type === filters.type || mapTypeFromDisplay(filters.type) === s.type;
            const matchStatus = !filters.status || s.status === filters.status || mapStatusFromDisplay(filters.status) === s.status;
            return matchName && matchType && matchStatus;
        });
        setFiltered(result);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ name: "", type: "", status: "" });
        setFiltered(services);
        setCurrentPage(1);
    };

    const handleSort = (field: "name" | "price") => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field && sortOrder === "asc") newOrder = "desc";
        setSortField(field);
        setSortOrder(newOrder);

        const sorted = [...filtered].sort((a, b) => {
            let cmp = 0;
            if (field === "name") {
                cmp = a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
            } else if (field === "price") {
                cmp = a.price - b.price;
            }
            return newOrder === "asc" ? cmp : -cmp;
        });
        setFiltered(sorted);
    };

    // Helper functions to map display values back to enum
    function mapTypeFromDisplay(display: string): string {
        const reverseMap: Record<string, string> = {
            "Tính theo lần": "PER_USE",
            "Tính theo giờ": "PER_HOUR",
            "Tính theo ngày": "PER_DAY",
            "Tiêu hao": "CONSUMABLE",
        };
        return reverseMap[display] || display;
    }

    function mapStatusFromDisplay(display: string): string {
        const reverseMap: Record<string, string> = {
            "Đang hoạt động": "ACTIVE",
            "Ngừng hoạt động": "INACTIVE",
            "Tạm thời hết": "TEMPORARY_OUT",
        };
        return reverseMap[display] || display;
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const shown = useMemo(
        () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filtered, currentPage]
    );

    const handleDelete = (id: number) => {
        setServiceToDelete({ id, displayId: String(id).padStart(3, "0") });
        setIsPopupOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;
        try {
            const res = await fetch(`/api/service/api/delete/${serviceToDelete.id}`, { method: "POST" });
            if (res.status >= 400) {
                const msg = await res.text();
                toast.error(msg || "Xóa dịch vụ thất bại");
                return;
            }
            // reload list
            const reload = await fetch(`/api/service/api/list`, { cache: "no-store" });
            if (reload.ok) {
                const raw2 = await reload.json();
                const data: BackendService[] = raw2.content || raw2;
                const mapped = data.map(mapService).sort((a, b) => a.serviceId - b.serviceId);
                setServices(mapped);
                setFiltered(mapped);
            }
            toast.success(`Đã xóa dịch vụ ${serviceToDelete.displayId} thành công!`);
        } catch (e) {
            console.error(e);
            toast.error("Có lỗi xảy ra khi xóa dịch vụ");
        } finally {
            setIsPopupOpen(false);
            setServiceToDelete(null);
        }
    };

    return (
        <main className={styles.main}>
            {/* HEADER */}
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div>
                        <h1 className={styles.pageTitle}>Quản lý dịch vụ</h1>
                        <p className={styles.pageSubtitle}>Quản lý dịch vụ cung cấp trong khách sạn</p>
                    </div>
                </div>
            </section>

            {/* FILTER */}
            <div className={styles.filters}>
                <div className={styles.filterLeft}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tên dịch vụ</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Nhập tên dịch vụ..."
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Loại dịch vụ</label>
                        <select
                            className={styles.select}
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Tất cả</option>
                            <option value="PER_USE">Tính theo lần</option>
                            <option value="PER_HOUR">Tính theo giờ</option>
                            <option value="PER_DAY">Tính theo ngày</option>
                            <option value="CONSUMABLE">Tiêu hao</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Trạng thái</label>
                        <select
                            className={styles.select}
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">Tất cả</option>
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                            <option value="TEMPORARY_OUT">Tạm thời hết</option>
                        </select>
                    </div>

                    <div className={styles.filterActions}>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
                            Tìm kiếm
                        </button>
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                <div className={styles.filterRight}>
                    <Link href="/service/add" className={styles.addLink}>
                        + Thêm dịch vụ mới
                    </Link>
                </div>
            </div>

            {/* STATS */}
            <div className={styles.listInfo}>
                <span className={styles.infoDot}>i</span>
                <span>
          Hiển thị {shown.length}/{services.length} dịch vụ (Trang {currentPage}/{totalPages})
        </span>
            </div>

            {/* TABLE */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}>Mã DV</th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("name")}>
                            Tên dịch vụ
                            <span className={styles.sortIcon}>
                                {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                        </th>
                        <th className={styles.th}>Loại dịch vụ</th>
                        <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("price")}>
                            Giá
                            <span className={styles.sortIcon}>
                                {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                        </th>
                        <th className={styles.th}>Trạng thái</th>
                        <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shown.length === 0 ? (
                        <tr>
                            <td colSpan={6} className={`${styles.td} ${styles.center}`}>
                                Không có dịch vụ phù hợp...
                            </td>
                        </tr>
                    ) : (
                        shown.map((s) => (
                            <tr key={s.serviceId}>
                                <td className={styles.td}>{String(s.serviceId).padStart(3, "0")}</td>
                                <td className={styles.td}>{s.name}</td>
                                <td className={styles.td}>{s.type}</td>
                                <td className={styles.td}>{s.price.toLocaleString()} VNĐ</td>
                                <td className={styles.td}>{s.status}</td>
                                <td className={`${styles.td} ${styles.center}`}>
                                    <Link href={`/service/edit/${s.serviceId}`} className={styles.btnUpdate}>
                                        Cập nhật
                                    </Link>
                                    <button onClick={() => handleDelete(s.serviceId)} className={styles.btnDelete}>Xóa</button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <div className={styles.pagerGroup}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.pageButton} ${
                                    currentPage === i + 1 ? styles.pageButtonActive : ""
                                }`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onConfirm={confirmDelete}
                title={serviceToDelete ? `Bạn có chắc muốn xóa dịch vụ ${serviceToDelete.displayId}?` : ""}
            />
        </main>
    );
}
