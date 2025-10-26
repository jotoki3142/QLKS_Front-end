"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import ConfirmPopup from "@/components/ConfirmPopup";

// Kiểu dữ liệu hiển thị ở FE
interface Customer {
  customerId: number;
  code?: string; // Mã KH hiển thị (nếu có)
  fullName: string;
  nationalId: string; // CCCD
  phone: string;
  email?: string;
  nationality?: string; // Quốc tịch
  address?: string;
}

// Kiểu dữ liệu giả định trả về từ BE (Spring Boot)
interface BackendCustomer {
  customerId: number;
  customerCode?: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  nationality?: string;
  address?: string;
}

function mapCustomer(c: BackendCustomer): Customer {
  const rawPhone = String(c.phone ?? "");
  const normalizedPhone = /^\d{9}$/.test(rawPhone) ? ("0" + rawPhone) : rawPhone;
  return {
    customerId: c.customerId,
    code: c.customerCode ?? String(c.customerId).padStart(3, "0"),
    fullName: c.fullName,
    nationalId: c.nationalId,
    phone: normalizedPhone,
    email: c.email ?? "",
    nationality: c.nationality ?? "",
    address: c.address ?? "",
  };
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);

  // bộ lọc
  const [kwName, setKwName] = useState("");
  const [kwCid, setKwCid] = useState("");
  const [kwPhone, setKwPhone] = useState("");

  const [sortField, setSortField] = useState<"code" | "fullName" | "nationality" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // popup xóa
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);

  // load dữ liệu từ BE thông qua rewrite proxy Next.js (xem next.config.ts)
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/customers/api/list", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data: BackendCustomer[] = await res.json();
      const mapped = data.map(mapCustomer);
      setCustomers(mapped);
      setFiltered(mapped);
    };
    load().catch((e) => console.error(e));
  }, []);

  // hành động lọc
  const handleSearch = () => {
    const n = kwName.trim().toLowerCase();
    const cid = kwCid.trim().toLowerCase();
    const ph = kwPhone.trim().toLowerCase();
    const result = customers.filter((c) => {
      const okName = !n || c.fullName.toLowerCase().includes(n);
      const okCid = !cid || c.nationalId.toLowerCase().includes(cid);
      const okPh = !ph || c.phone.toLowerCase().includes(ph);
      return okName && okCid && okPh;
    });
    setFiltered(result);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setKwName("");
    setKwCid("");
    setKwPhone("");
    setFiltered(customers);
    setCurrentPage(1);
  };

  // sắp xếp
  const handleSort = (field: "code" | "fullName" | "nationality") => {
    let newOrder: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filtered].sort((a, b) => {
      const av = String(a[field] ?? "");
      const bv = String(b[field] ?? "");
      const cmp = av.localeCompare(bv, "vi", { numeric: true, sensitivity: "base" });
      return newOrder === "asc" ? cmp : -cmp;
    });
    setFiltered(sorted);
  };

  // tính toán trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  // xóa
  const requestDelete = (c: Customer) => {
    setToDelete({ id: c.customerId, name: c.fullName });
    setIsPopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { id, name } = toDelete;
    const res = await fetch(`/api/customers/api/delete/${id}`, { method: "POST" });
    if (!res.ok) {
      toast.error("Xóa khách hàng thất bại");
      setIsPopupOpen(false);
      setToDelete(null);
      return;
    }
    // reload
    const reload = await fetch("/api/customers/api/list", { cache: "no-store" });
    if (reload.ok) {
      const data: BackendCustomer[] = await reload.json();
      const mapped = data.map(mapCustomer);
      setCustomers(mapped);
      setFiltered(mapped);
    }
    toast.success(`Đã xóa khách hàng ${name}!`);
    setIsPopupOpen(false);
    setToDelete(null);
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div>
            <h1 className={styles.pageTitle}>Quản lý khách hàng</h1>
            <p className={styles.pageSubtitle}>Quản lý khách hàng trong khách sạn</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm khách hàng</label>
            <input
              className={styles.search}
              placeholder="Nhập họ tên..."
              value={kwName}
              onChange={(e) => setKwName(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>CCCD</label>
            <input
              className={styles.input}
              placeholder="Nhập CCCD..."
              value={kwCid}
              onChange={(e) => setKwCid(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>SĐT</label>
            <input
              className={styles.input}
              placeholder="Nhập SĐT..."
              value={kwPhone}
              onChange={(e) => setKwPhone(e.target.value)}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>Tìm kiếm</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
        </div>
        <div className={styles.filterRight}>
          <Link href="/customer/add" className={styles.addLink}>
            + Thêm KH mới
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>Hiển thị {paginated.length}/{customers.length} khách hàng (Trang {currentPage}/{totalPages})</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("code")}>
                Mã KH <span className={styles.sortIcon}>{sortField === "code" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("fullName")}>
                Họ tên <span className={styles.sortIcon}>{sortField === "fullName" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th className={styles.th}>CCCD</th>
              <th className={styles.th}>SDT</th>
              <th className={styles.th}>Email</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("nationality")}>
                Quốc tịch <span className={styles.sortIcon}>{sortField === "nationality" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th className={styles.th}>Địa chỉ</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className={`${styles.td} ${styles.center}`}>Không có khách hàng phù hợp...</td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.customerId} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{c.code}</td>
                  <td className={styles.td}>{c.fullName}</td>
                  <td className={styles.td}>{c.nationalId}</td>
                  <td className={styles.td}>{c.phone}</td>
                  <td className={styles.td}>{c.email || "-"}</td>
                  <td className={styles.td}>{c.nationality || "-"}</td>
                  <td className={styles.td}>{c.address || "-"}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <div className={styles.actions}>
                      <Link href={`/customer/edit/${c.customerId}`} className={styles.btnUpdate}>Cập nhật</Link>
                      <button className={styles.btnDelete} onClick={() => requestDelete(c)}>Xóa</button>
                    </div>
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
              <button key={i} onClick={() => handlePageChange(i + 1)} className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageButtonActive : ""}`}>
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
        title={toDelete ? `Bạn có chắc muốn xóa khách hàng ${toDelete.name}?` : ""}
      />
    </main>
  );
}
