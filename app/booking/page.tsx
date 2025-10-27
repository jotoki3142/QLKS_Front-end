"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";

interface Booking {
  bookingId: number;
  customerId: number;
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  status: string;
}

interface BackendBooking {
  bookingId: number;
  customerId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
}

function mapBooking(b: BackendBooking): Booking {
  const statusMap: Record<string, string> = {
    PENDING: "Đang chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
  };
  return {
    bookingId: b.bookingId,
    customerId: b.customerId,
    roomId: b.roomId,
    checkIn: new Date(b.checkIn),
    checkOut: new Date(b.checkOut),
    status: statusMap[b.status] ?? String(b.status),
  };
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({ customerId: "", status: "", roomId: "" });
  const [sortField, setSortField] = useState<"checkIn" | "checkOut" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<{ bookingId: number; displayId: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.roomId.trim()) params.set("roomId", String(Number(filters.roomId)));
        if (filters.customerId.trim()) params.set("customerId", String(Number(filters.customerId)));
        if (filters.status.trim()) {
          const toEnum = (v: string) => {
            if (v === "Đã xác nhận") return "CONFIRMED";
            if (v === "Đã hủy") return "CANCELLED"; 
            if (v === "Đang chờ xác nhận") return "PENDING";
            return "";
          };
          const st = toEnum(filters.status);
          if (st) params.set("status", st);
        }
        const url = `/api/booking/api/list${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.error('Failed to fetch bookings:', res.status, res.statusText);
          setBookings([]);
          setFiltered([]);
          return;
        }
        const data: BackendBooking[] = await res.json();
        console.log('Loaded bookings:', data);
        const mapped = data.map(mapBooking);
        setBookings(mapped);
        setFiltered(mapped);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
        setFiltered([]);
      }
    };
    load();
  }, [filters.roomId, filters.customerId, filters.status]);

  // Add a separate effect to reload data when component mounts or page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reload data when page becomes visible (e.g., navigating back)
        setFilters(prev => ({ ...prev })); // This will trigger the above useEffect
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSearch = () => {
    // Since we're using useEffect with dependency on filters, search is automatic
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ customerId: "", status: "", roomId: "" });
    setCurrentPage(1);
  };

  // Sorting
  const handleSort = (field: "checkIn" | "checkOut") => {
    let newOrder: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[field] as number;
      const bValue = b[field] as number;
      const cmp = aValue - bValue;
      return newOrder === "asc" ? cmp : -cmp;
    });
    setFiltered(sorted);
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const shown = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );

  const handlePageChange = (p: number) => setCurrentPage(p);

  // Delete booking
  const handleDelete = (bookingId: number, displayId: string) => {
    setBookingToDelete({ bookingId, displayId });
    setIsPopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;

    const { bookingId, displayId } = bookingToDelete;

    try {
      const res = await fetch(`/api/booking/api/delete/${bookingId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Xóa đặt phòng thất bại");
        setIsPopupOpen(false);
        setBookingToDelete(null);
        return;
      }
      
      // Reload list
      const reload = await fetch(`/api/booking/api/list`, { cache: "no-store" });
      if (reload.ok) {
        const data: BackendBooking[] = await reload.json();
        const mapped = data.map(mapBooking);
        setBookings(mapped);
        setFiltered(mapped);
      }
      toast.success(`Đã xóa đặt phòng ${displayId} thành công!`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error("Có lỗi xảy ra khi xóa đặt phòng");
    } finally {
      setIsPopupOpen(false);
      setBookingToDelete(null);
    }
  };

  return (
    <main className={styles.main}>
      {/* Banner header */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div>
            <h1 className={styles.pageTitle}>Quản lý đặt phòng</h1>
            <p className={styles.pageSubtitle}>Quản lý đặt phòng trong khách sạn</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm đặt phòng</label>
            <input
              className={styles.search}
              type="text"
              placeholder="Nhập mã đặt phòng..."
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Trạng thái</label>
            <select
              className={styles.select}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option>Đang chờ xác nhận</option>
              <option>Đã xác nhận</option>
              <option>Đã hủy</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Mã phòng</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã phòng..."
              value={filters.roomId}
              onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>Tìm kiếm</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
        </div>
        <div className={styles.filterRight}>
          <Link href="/booking/add" className={styles.addLink}>
            + Thêm đặt phòng mới
          </Link>
        </div>
      </div>

      {/* Info line */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>Hiển thị {shown.length}/{bookings.length} đặt phòng (Trang {currentPage}/{Math.max(totalPages, 1)})</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã đặt phòng</th>
              <th className={styles.th}>Mã KH</th>
              <th className={styles.th}>Mã phòng</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("checkIn")}>
                Check in
                <span className={styles.sortIcon}>
                  {sortField === "checkIn" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("checkOut")}>
                Check out
                <span className={styles.sortIcon}>
                  {sortField === "checkOut" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${styles.td} ${styles.center}`}>
                  Không tìm thấy đặt phòng nào phù hợp...
                </td>
              </tr>
            ) : (
              shown.map((b) => (
                <tr key={b.bookingId} className={styles.tr}>
                  <td className={styles.td}>{String(b.bookingId).padStart(3, "0")}</td>
                  <td className={styles.td}>{b.customerId}</td>
                  <td className={styles.td}>{b.roomId}</td>
                  <td className={styles.td}>{b.checkIn.toLocaleDateString("vi-VN")}</td>
                  <td className={styles.td}>{b.checkOut.toLocaleDateString("vi-VN")}</td>
                  <td className={`${styles.td} ${
                      b.status === "Đã xác nhận"
                        ? styles.statusConfirmed
                        : b.status === "Đã hủy"
                        ? styles.statusCancelled
                        : styles.statusPending
                    }`}>
                    {b.status}
                  </td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/booking/edit/${b.bookingId}`} className={styles.btnUpdate}>
                      Cập nhật
                    </Link>
                    <button onClick={() => handleDelete(b.bookingId, String(b.bookingId).padStart(3, "0"))} className={styles.btnDelete}>
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
        title={bookingToDelete ? `Bạn có chắc muốn xóa đặt phòng ${bookingToDelete.displayId}?` : ""}
      />
    </main>
  );
}
