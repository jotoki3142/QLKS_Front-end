"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Service {
    serviceId: number;
    name: string;
    type: string;
    status: string;
}

interface BackendService {
    serviceId: number;
    name: string;
    serviceType: "ONCE" | "HOURLY" | "DAILY" | "CONSUMABLE" | string;
    serviceStatus: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | string;
}

function mapService(s: BackendService): Service {
    const typeMap: Record<string, string> = {
        ONCE: "Tính theo lần",
        HOURLY: "Tính theo giờ",
        DAILY: "Tính theo ngày",
        CONSUMABLE: "Tiêu hao",
    };

    const statusMap: Record<string, string> = {
        ACTIVE: "Đang hoạt động",
        INACTIVE: "Ngừng hoạt động",
        OUT_OF_STOCK: "Tạm thời hết",
    };

    return {
        serviceId: s.serviceId,
        name: s.name,
        type: typeMap[s.serviceType] ?? s.serviceType,
        status: statusMap[s.serviceStatus] ?? s.serviceStatus,
    };
}

export default function ServicePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [filtered, setFiltered] = useState<Service[]>([]);
    const [filters, setFilters] = useState({ name: "", type: "", status: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const load = async () => {
            const params = new URLSearchParams();
            if (filters.name.trim()) params.set("name", filters.name);
            if (filters.type.trim()) params.set("type", filters.type);
            if (filters.status.trim()) params.set("status", filters.status);

            const url = `/api/service/api/list${params.toString() ? `?${params}` : ""}`;
            const res = await fetch(url, { cache: "no-store" });

            if (!res.ok) {
                setServices([]);
                setFiltered([]);
                return;
            }

            const data: BackendService[] = await res.json();
            const mapped = data.map(mapService);

            setServices(mapped);
            setFiltered(mapped);
            setCurrentPage(1);
        };

        load().catch(() => {});
    }, [filters.name, filters.type, filters.status]);

    const clearFilters = () => setFilters({ name: "", type: "", status: "" });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const shown = useMemo(
        () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filtered, currentPage]
    );

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
                            <option value="ONCE">Tính theo lần</option>
                            <option value="HOURLY">Tính theo giờ</option>
                            <option value="DAILY">Tính theo ngày</option>
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
                            <option value="OUT_OF_STOCK">Tạm thời hết</option>
                        </select>
                    </div>

                    <div className={styles.filterActions}>
                        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
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
                        <th className={styles.th}>Tên dịch vụ</th>
                        <th className={styles.th}>Loại dịch vụ</th>
                        <th className={styles.th}>Trạng thái</th>
                        <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shown.length === 0 ? (
                        <tr>
                            <td colSpan={5} className={`${styles.td} ${styles.center}`}>
                                Không có dịch vụ phù hợp...
                            </td>
                        </tr>
                    ) : (
                        shown.map((s) => (
                            <tr key={s.serviceId}>
                                <td className={styles.td}>{String(s.serviceId).padStart(3, "0")}</td>
                                <td className={styles.td}>{s.name}</td>
                                <td className={styles.td}>{s.type}</td>
                                <td className={styles.td}>{s.status}</td>
                                <td className={`${styles.td} ${styles.center}`}>
                                    <Link href={`/service/edit/${s.serviceId}`} className={styles.updateBtn}>
                                        Cập nhật
                                    </Link>
                                    <button className={styles.deleteBtn}>Xóa</button>
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
            )}
        </main>
    );
}
