"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";

// Backend response type
interface BackendServiceUsage {
    serviceUsageId: number;
    bookingId: number;
    service: {
        serviceId: number;
        tenDichVu: string;
        gia: number;
    };
    quantity: number;
    usageDate: string;
}

// Frontend display type
interface ServiceUsage {
    id: number;
    bookingId: number;
    serviceId: number;
    serviceName: string;
    quantity: number;
    usageDate: string;
}

function mapServiceUsage(data: BackendServiceUsage): ServiceUsage {
    return {
        id: data.serviceUsageId,
        bookingId: data.bookingId,
        serviceId: data.service.serviceId,
        serviceName: data.service.tenDichVu,
        quantity: data.quantity,
        usageDate: data.usageDate,
    };
}

export default function ServiceUsePage() {
    const [usages, setUsages] = useState<ServiceUsage[]>([]);
    const [filtered, setFiltered] = useState<ServiceUsage[]>([]);
    const [bookingIdFilter, setBookingIdFilter] = useState("");
    const [serviceIdFilter, setServiceIdFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; display: string } | null>(null);

    // Sorting state
    type SortField = 'quantity' | 'usageDate' | '';
    type SortDirection = 'asc' | 'desc' | '';

    const [sortConfig, setSortConfig] = useState<{
        field: SortField;
        direction: SortDirection;
    }>({ field: '', direction: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch("/api/service-usage/api/list", { cache: "no-store" });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend error:", errorText);
                throw new Error(`Server error: ${res.status} - ${errorText}`);
            }
            const data: BackendServiceUsage[] = await res.json();
            const mapped = data.map(mapServiceUsage);
            setUsages(mapped);
            setFiltered(mapped);
        } catch (e: any) {
            console.error("Load data error:", e);
            toast.error(e.message || "Không thể tải dữ liệu");
        }
    };

    const handleSearch = () => {
        const bid = bookingIdFilter.trim();
        const sid = serviceIdFilter.trim();

        const result = usages.filter((u) => {
            const matchBooking = !bid || u.bookingId.toString().includes(bid);
            const matchService = !sid || u.serviceId.toString().includes(sid);
            return matchBooking && matchService;
        });
        setFiltered(result);
        setCurrentPage(1);
    };


    const handleSort = (field: SortField) => {
        let newOrder: 'asc' | 'desc' = 'asc';
        if (sortConfig.field === field && sortConfig.direction === 'asc') newOrder = 'desc';
        setSortConfig({ field, direction: newOrder });

        const sorted = [...filtered].sort((a, b) => {
            let cmp = 0;
            if (field === 'quantity') {
                cmp = a.quantity - b.quantity;
            } else if (field === 'usageDate') {
                cmp = new Date(a.usageDate).getTime() - new Date(b.usageDate).getTime();
            }
            return newOrder === 'asc' ? cmp : -cmp;
        });
        setFiltered(sorted);
    };

    const clearFilters = () => {
        setBookingIdFilter("");
        setServiceIdFilter("");
        setFiltered(usages);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = useMemo(
        () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filtered, currentPage]
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    const requestDelete = (usage: ServiceUsage) => {
        setToDelete({ id: usage.id, display: `SDDV #${usage.id}` });
        setIsPopupOpen(true);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        const { id, display } = toDelete;
        try {
            const res = await fetch(`/api/service-usage/api/delete/${id}`, { method: "POST" });
            if (!res.ok) {
                toast.error("Xóa thất bại");
                setIsPopupOpen(false);
                setToDelete(null);
                return;
            }
            const reload = await fetch("/api/service-usage/api/list", { cache: "no-store" });
            if (reload.ok) {
                const data: BackendServiceUsage[] = await reload.json();
                const mapped = data.map(mapServiceUsage);
                setUsages(mapped);
                setFiltered(mapped);
            }
            toast.success(`Đã xóa ${display} thành công!`);
            setIsPopupOpen(false);
            setToDelete(null);
        } catch (e) {
            console.error(e);
            toast.error("Có lỗi xảy ra");
            setIsPopupOpen(false);
            setToDelete(null);
        }
    };

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <h1 className={styles.pageTitle}>Quản lý sử dụng dịch vụ</h1>
                    <p className={styles.pageSubtitle}>Quản lý sử dụng dịch vụ trong khách sạn</p>
                </div>
            </section>

            <div className={styles.filters}>
                <div className={styles.filterLeft}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Mã đặt phòng</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Nhập mã đặt..."
                            value={bookingIdFilter}
                            onChange={(e) => setBookingIdFilter(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Mã dịch vụ</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Nhập mã dịch vụ..."
                            value={serviceIdFilter}
                            onChange={(e) => setServiceIdFilter(e.target.value)}
                        />
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
                    <Link href="/serviceuse/add" className={styles.addLink}>
                        + Thêm SDDV mới
                    </Link>
                </div>
            </div>

            <div className={styles.listInfo}>
                <span className={styles.infoDot}>i</span>
                <span>Hiển thị {paginated.length}/{usages.length} sử dụng dịch vụ (Trang {currentPage}/{totalPages})</span>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}>Mã SDDV</th>
                        <th className={styles.th}>Mã đặt phòng</th>
                        <th className={styles.th}>Mã dịch vụ</th>
                        <th className={styles.th}>Tên dịch vụ</th>
                        <th
                            className={`${styles.th} ${styles.clickable}`}
                            onClick={() => handleSort('quantity')}
                        >
                            Số lượng
                            <span className={styles.sortIcon}>
                                {sortConfig.field === 'quantity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                        </th>
                        <th
                            className={`${styles.th} ${styles.clickable}`}
                            onClick={() => handleSort('usageDate')}
                        >
                            Ngày sử dụng
                            <span className={styles.sortIcon}>
                                {sortConfig.field === 'usageDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                        </th>
                        <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={7} className={`${styles.td} ${styles.center}`}>
                                Không có dữ liệu...
                            </td>
                        </tr>
                    ) : (
                        paginated.map((usage) => (
                            <tr key={usage.id} className={styles.tr}>
                                <td className={styles.td}>
                                    {String(usage.id).padStart(3, "0")}
                                </td>
                                <td className={styles.td}>{String(usage.bookingId).padStart(3, "0")}</td>
                                <td className={styles.td}>{String(usage.serviceId).padStart(3, "0")}</td>
                                <td className={styles.td}>{usage.serviceName}</td>
                                <td className={styles.td}>{usage.quantity}</td>
                                <td className={styles.td}>{usage.usageDate}</td>
                                <td className={`${styles.td} ${styles.center}`}>
                                    <Link href={`/serviceuse/edit/${usage.id}`} className={styles.btnUpdate}>
                                        Cập nhật
                                    </Link>
                                    <button onClick={() => requestDelete(usage)} className={styles.btnDelete}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <div className={styles.pagerGroup}>
                        <button
                            className={`${styles.pageButton} ${styles.pageArrow}`}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(1)}
                        >
                            &laquo;
                        </button>
                        <button
                            className={`${styles.pageButton} ${styles.pageArrow}`}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        >
                            &lsaquo;
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageButtonActive : ""}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className={`${styles.pageButton} ${styles.pageArrow}`}
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        >
                            &rsaquo;
                        </button>
                        <button
                            className={`${styles.pageButton} ${styles.pageArrow}`}
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(totalPages)}
                        >
                            &raquo;
                        </button>
                    </div>
                </div>
            )}

            <ConfirmPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onConfirm={confirmDelete}
                title={toDelete ? `Bạn có chắc muốn xóa ${toDelete.display}?` : ""}
            />
        </main>
    );
}