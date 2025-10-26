"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

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
    PENDING: "Đang chờ",
    CONFIRMED: "Đã nhận",
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (filters.roomId.trim()) params.set("roomId", String(Number(filters.roomId)));
      if (filters.customerId.trim()) params.set("customerId", String(Number(filters.customerId)));
      if (filters.status.trim()) {
        const toEnum = (v: string) => (v === "Đã nhận" ? "CONFIRMED" : v === "Đã hủy" ? "CANCELLED" : v === "Đang chờ" ? "PENDING" : "");
        const st = toEnum(filters.status);
        if (st) params.set("status", st);
      }
      const url = `/api/booking/api/list${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setBookings([]);
        setFiltered([]);
        return;
      }
      const data: BackendBooking[] = await res.json();
      const mapped = data.map(mapBooking);
      setBookings(mapped);
      setFiltered(mapped);
      setCurrentPage(1);
    };
    load().catch(() => {});
  }, [filters.roomId, filters.customerId, filters.status]);

  const clearFilters = () => setFilters({ customerId: "", status: "", roomId: "" });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const shown = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );

  const handlePageChange = (p: number) => setCurrentPage(p);

  return (
    <main className={styles.main}>
      {/* Header banner */}
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
            <label className={styles.filterLabel}>Mã KH</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã KH..."
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
              <option>Đang chờ</option>
              <option>Đã nhận</option>
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
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setFilters({ ...filters })}>Tìm kiếm</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
        </div>
        <div className={styles.filterRight}>
          <Link href="/booking/add" className={styles.addLink}>+ Thêm đặt phòng mới</Link>
        </div>
      </div>

      {/* Info line */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>
          Hiển thị {shown.length}/{bookings.length} đặt phòng (Trang {currentPage}/{totalPages})
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã đặt phòng</th>
              <th className={styles.th}>Mã KH</th>
              <th className={styles.th}>Mã phòng</th>
              <th className={styles.th}>Check in</th>
              <th className={styles.th}>Check out</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${styles.td} ${styles.center}`}>Không có đặt phòng phù hợp...</td>
              </tr>
            ) : (
              shown.map((b) => (
                <tr key={b.bookingId}>
                  <td className={styles.td}>{String(b.bookingId).padStart(3, "0")}</td>
                  <td className={styles.td}>{b.customerId}</td>
                  <td className={styles.td}>{b.roomId}</td>
                  <td className={styles.td}>{b.checkIn.toISOString().slice(0,10)}</td>
                  <td className={styles.td}>{b.checkOut.toISOString().slice(0,10)}</td>
                  <td className={styles.td}>{b.status}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/booking/edit/${b.bookingId}`} className={styles.updateBtn}>Cập nhật</Link>
                    <button className={styles.deleteBtn}>Xóa</button>
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
