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
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number; display: string } | null>(null);

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
    } catch (e: any) {
      console.error("Load data error:", e);
      toast.error(e.message || "Không thể tải dữ liệu");
    }
  };

  const filtered = useMemo(() => {
    const bid = bookingIdFilter.trim();
    const sid = serviceIdFilter.trim();
    return usages.filter((u) => {
      const matchBooking = !bid || u.bookingId.toString().includes(bid);
      const matchService = !sid || u.serviceId.toString().includes(sid);
      return matchBooking && matchService;
    });
  }, [usages, bookingIdFilter, serviceIdFilter]);

  const clearFilters = () => {
    setBookingIdFilter("");
    setServiceIdFilter("");
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
      await loadData();
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
            <label className={styles.filterLabel}>Tìm kiếm sử dụng dịch vụ</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã đặt..."
              value={bookingIdFilter}
              onChange={(e) => setBookingIdFilter(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập mã dịch vụ..."
              value={serviceIdFilter}
              onChange={(e) => setServiceIdFilter(e.target.value)}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
              Tìm kiếm
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>Hiển thị {paginated.length}/{filtered.length} khách hàng (Trang {currentPage}/{totalPages})</span>
        <span className={styles.grow} />
        <Link href="/ServiceUse/add" className={styles.addLink}>+Thêm SDDV mới</Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã SDDV</th>
              <th className={styles.th}>Mã đặt phòng</th>
              <th className={styles.th}>Mã dịch vụ</th>
              <th className={styles.th}>Số lượng</th>
              <th className={styles.th}>Ngày sử dụng</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${styles.td} ${styles.center}`}>
                  Không có dữ liệu...
                </td>
              </tr>
            ) : (
              paginated.map((usage) => (
                <tr key={usage.id}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    {String(usage.id).padStart(3, "0")}
                  </td>
                  <td className={styles.td}>{String(usage.bookingId).padStart(3, "0")}</td>
                  <td className={styles.td}>{String(usage.serviceId).padStart(3, "0")}</td>
                  <td className={styles.td}>{usage.quantity}</td>
                  <td className={styles.td}>{usage.usageDate}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/ServiceUse/edit/${usage.id}`} className={styles.updateBtn}>
                      Cập nhật
                    </Link>
                    <button onClick={() => requestDelete(usage)} className={styles.deleteBtn}>
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

