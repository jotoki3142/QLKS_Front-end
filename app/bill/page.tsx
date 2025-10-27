"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";
import Decimal from 'decimal.js';
import { format } from 'date-fns';

interface Bill {
    billId: number;
    bookingId: number;
    roomFee: Decimal;
    serviceFee: Decimal;
    tax: Decimal;
    total: Decimal;
    createdAt: Date;
    updatedAt: Date;
    status: string;
}

// Kiểu dữ liệu trả về từ backend Spring Boot
interface BackendBill {
    billId: number;
    bookingId: number;
    roomFee: string | number;
    serviceFee: string | number;
    tax: string | number;
    total: string | number;
    createdAt: string;
    updatedAt: string;
    status: "UNPAID" | "PAID" | "CANCELLED" | string;
}

// Helper function to format ID with leading zeros
function formatId(id: number): string {
    return id.toString().padStart(3, '0');
}

function mapBill(b: BackendBill): Bill {
    const statusMap: Record<string, string> = {
        UNPAID: "Chưa thanh toán",
        PAID: "Đã thanh toán",
        CANCELLED: "Đã hủy",
    };
    return {
        billId: b.billId,
        bookingId: b.bookingId,
        roomFee: new Decimal(b.roomFee.toString()),
        serviceFee: new Decimal(b.serviceFee.toString()),
        tax: new Decimal(b.tax.toString()),
        total: new Decimal(b.total.toString()),
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
        status: statusMap[b.status] ?? String(b.status)
    };
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
    const [bookingSearch, setBookingSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [createdDate, setCreatedDate] = useState("");
    const [sortField, setSortField] = useState<"billId" | "total" | "createdAt" | null>("billId");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState<{ billId: number; displayNumber: string } | null>(null);

    // Load dữ liệu hóa đơn từ backend (proxy qua Next.js)
    useEffect(() => {
        const load = async () => {
            const res = await fetch("/api/bills/api/list?size=1000", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch bills");
            const data = await res.json();
            const billsData: BackendBill[] = data.content || data;
            const mapped = billsData.map(mapBill);
            const sorted = [...mapped].sort((a, b) => a.billId - b.billId);
            setBills(sorted);
            setFilteredBills(sorted);
        };
        load().catch((e) => {
            console.error(e);
        });
    }, []);

    // Tìm kiếm
    const handleSearch = async () => {
        const params = new URLSearchParams();
        params.set("size", "1000");
        if (bookingSearch.trim()) {
            const bid = Number(bookingSearch.trim());
            if (!Number.isNaN(bid)) params.set("bookingId", String(bid));
        }
        const toEnumStatus = (v: string) => v === "Đã thanh toán" ? "PAID" : v === "Đã hủy" ? "CANCELLED" : v === "Chưa thanh toán" ? "UNPAID" : "";
        const statusEnum = toEnumStatus(statusFilter);
        if (statusEnum) params.set("status", statusEnum);
        if (createdDate) {
            params.set("startDate", `${createdDate}T00:00:00`);
            params.set("endDate", `${createdDate}T23:59:59`);
        }
        const res = await fetch(`/api/bills/api/list?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const billsData: BackendBill[] = data.content || data;
        const mapped = billsData.map(mapBill);
        // Apply current sort order to search results
        const sorted = [...mapped].sort((a, b) => {
            let cmp = 0;
            if (sortField === "total") {
                cmp = a.total.comparedTo(b.total);
            } else if (sortField === "createdAt") {
                cmp = a.createdAt.getTime() - b.createdAt.getTime();
            } else {
                cmp = a.billId - b.billId;
            }
            return sortOrder === "asc" ? cmp : -cmp;
        });
        setFilteredBills(sorted);
        setBills(sorted);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setBookingSearch("");
        setStatusFilter("");
        setCreatedDate("");
        setFilteredBills(bills);
        setCurrentPage(1);
    };

    // Sắp xếp
    const handleSort = (field: "billId" | "total" | "createdAt") => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field) {
            newOrder = sortOrder === "asc" ? "desc" : "asc";
        } else {
            // When switching to a new field, use ascending as default for billId, descending for others
            newOrder = field === "billId" ? "asc" : "desc";
        }
        setSortField(field);
        setSortOrder(newOrder);

        const sorted = [...filteredBills].sort((a, b) => {
            let cmp = 0;
            if (field === "total") {
                cmp = a.total.comparedTo(b.total);
            } else if (field === "createdAt") {
                cmp = a.createdAt.getTime() - b.createdAt.getTime();
            } else {
                cmp = a.billId - b.billId;
            }
            return newOrder === "asc" ? cmp : -cmp;
        });
        setFilteredBills(sorted);
    };

    // Phân trang
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    // Xóa hóa đơn (gọi BE)
    const handleDelete = (billId: number, displayNumber: string) => {
        setBillToDelete({ billId, displayNumber });
        setIsPopupOpen(true);
    };

    const confirmDelete = async () => {
        if (!billToDelete) return;

        const { billId, displayNumber } = billToDelete;

        const res = await fetch(`/api/bills/api/delete/${billId}`, { method: "DELETE" });
        if (!res.ok) {
            const msg = await res.text();
            toast.error(msg || "Xóa hóa đơn thất bại");
            setIsPopupOpen(false);
            setBillToDelete(null);
            return;
        }
        // Reload list
        const reload = await fetch("/api/bills/api/list", { cache: "no-store" });
        if (reload.ok) {
            const data = await reload.json();
            const billsData: BackendBill[] = data.content || data;
            const mapped = billsData.map(mapBill);
            // Sort by billId ascending by default (001, 002, 003...)
            const sorted = [...mapped].sort((a, b) => a.billId - b.billId);
            setBills(sorted);
            setFilteredBills(sorted);
        }
        toast.success(`Đã xóa hóa đơn ${displayNumber} thành công!`);
        setIsPopupOpen(false);
        setBillToDelete(null);
    };

    return (
        <main className={styles.main}>
            {/* Banner header */}
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div>
                        <h1 className={styles.pageTitle}>Quản lý hóa đơn</h1>
                        <p className={styles.pageSubtitle}>Quản lý hóa đơn thanh toán của khách sạn</p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterLeft}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Mã đặt</label>
                        <input
                            type="number"
                            placeholder="Nhập mã đặt..."
                            value={bookingSearch}
                            onChange={(e) => setBookingSearch(e.target.value)}
                            className={styles.search}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ngày lập</label>
                        <input
                            type="date"
                            placeholder="Nhập ngày lập..."
                            value={createdDate}
                            onChange={(e) => setCreatedDate(e.target.value)}
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
                            <option value="">Tất cả trạng thái</option>
                            <option value="Chưa thanh toán">Chưa thanh toán</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                            <option value="Đã hủy">Đã hủy</option>
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
                    <Link href="/bill/add" className={styles.addLink}>
                        + Tạo hóa đơn mới
                    </Link>
                </div>
            </div>

            {/* Info line */}
            <div className={styles.listInfo}>
                <span className={styles.infoDot}>i</span>
                <span>Hiển thị {paginatedBills.length}/{bills.length} hóa đơn (Trang {currentPage}/{Math.max(totalPages, 1)})</span>
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("billId")}>
                                Mã Hóa Đơn
                                <span className={styles.sortIcon}>
                                    {sortField === "billId" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </span>
                            </th>
                            <th className={styles.th}>Mã Booking</th>
                            <th className={styles.th}>Tiền phòng</th>
                            <th className={styles.th}>Tiền dịch vụ</th>
                            <th className={styles.th}>Thuế</th>
                            <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("total")}>
                                Tổng tiền
                                <span className={styles.sortIcon}>
                                    {sortField === "total" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </span>
                            </th>
                            <th className={styles.th}>Trạng thái</th>
                            <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("createdAt")}>
                                Ngày tạo
                                <span className={styles.sortIcon}>
                                    {sortField === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </span>
                            </th>
                            <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedBills.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={`${styles.td} ${styles.center}`}>
                                    Không tìm thấy hóa đơn nào phù hợp...
                                </td>
                            </tr>
                        ) : (
                            paginatedBills.map((bill) => (
                                <tr key={bill.billId} className={styles.tr}>
                                    <td className={styles.td} style={{ fontWeight: 600 }}>{formatId(bill.billId)}</td>
                                    <td className={styles.td}>{formatId(bill.bookingId)}</td>
                                    <td className={styles.td}>
                                        <div className={styles.priceBox}>
                                            <div className={styles.priceValue}>
                                                {bill.roomFee.toNumber().toLocaleString()}₫
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.priceBox}>
                                            <div className={styles.priceValue}>
                                                {bill.serviceFee.toNumber().toLocaleString()}₫
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.priceBox}>
                                            <div className={styles.priceValue}>
                                                {bill.tax.toNumber().toLocaleString()}₫
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.totalBox}>
                                            <div className={styles.totalValue}>
                                                {bill.total.toNumber().toLocaleString()}₫
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`${styles.td} ${
                                        bill.status === "Đã thanh toán"
                                            ? styles.statusPaid
                                            : bill.status === "Chưa thanh toán"
                                            ? styles.statusUnpaid
                                            : styles.statusCancelled
                                    }`}>
                                        {bill.status}
                                    </td>
                                    <td className={styles.td} style={{ color: "#374151" }}>
                                        {format(bill.createdAt, 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className={`${styles.td} ${styles.center}`}>
                                        <Link href={`/bill/edit/${bill.billId}`} className={styles.btnUpdate}>
                                            Cập nhật
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                if (bill.status === "Đã thanh toán") {
                                                    toast.error("Hóa đơn đã thanh toán và không thể xóa");
                                                    return;
                                                }
                                                handleDelete(bill.billId, formatId(bill.billId));
                                            }}
                                            className={styles.btnDelete}
                                            aria-disabled={bill.status === "Đã thanh toán"}
                                            title={bill.status === "Đã thanh toán" ? "Hóa đơn đã thanh toán - không thể xóa" : undefined}
                                        >
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
                title={billToDelete ? `Bạn có chắc muốn xóa hóa đơn #${billToDelete.displayNumber}?` : ""}
            />
        </main>
    );
}
