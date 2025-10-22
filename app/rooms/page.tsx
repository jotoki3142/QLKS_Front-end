"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Room {
  roomId: number; // Mã phòng (PK tự tăng)
  roomNumber: string; // Số phòng (người dùng nhập)
  type: string; // Loại phòng
  price: number;
  floor?: number;
  amenities?: string;
  status: string;
  image?: string;
}

// Kiểu dữ liệu trả về từ backend Spring Boot
interface BackendRoom {
  roomId: number;
  roomNumber: string;
  roomType: "SINGLE" | "DOUBLE" | string;
  roomFloor: number;
  roomPrice: number | string;
  roomAmenities?: string;
  roomStatus: "AVAILABLE" | "RESERVED" | "OCCUPIED" | string;
  imageUrl?: string;
}

function mapRoom(r: BackendRoom): Room {
  const typeMap: Record<string, string> = { SINGLE: "Phòng đơn", DOUBLE: "Phòng đôi" };
  const statusMap: Record<string, string> = {
    AVAILABLE: "Trống",
    RESERVED: "Đã đặt",
    OCCUPIED: "Đang sử dụng",
  };
  return {
    roomId: r.roomId,
    roomNumber: r.roomNumber,
    type: typeMap[r.roomType] ?? String(r.roomType),
    price: typeof r.roomPrice === "string" ? Number(r.roomPrice) : r.roomPrice,
    floor: r.roomFloor,
    amenities: r.roomAmenities ?? "",
    status: statusMap[r.roomStatus] ?? String(r.roomStatus),
    image: r.imageUrl ?? "/pics/default-room.jpg",
  };
}

import styles from "./page.module.css";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [sortField, setSortField] = useState<"roomId" | "price" | "roomNumber" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  //Load dữ liệu phòng từ backend (proxy qua Next.js)
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/rooms/api/list", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data: BackendRoom[] = await res.json();
      const mapped = data.map(mapRoom);
      setRooms(mapped);
      setFilteredRooms(mapped);
    };
    load().catch((e) => {
      console.error(e);
    });
  }, []);

  // Tìm kiếm
  const handleSearch = () => {
    const keyword = search.toLowerCase();
    const filtered = rooms.filter(
      (room) =>
        (room.roomNumber.toLowerCase().includes(keyword) ||
          room.status.toLowerCase().includes(keyword)) &&
        (roomTypeFilter === "" || room.type === roomTypeFilter) &&
        (floorFilter === "" || (room.floor && room.floor.toString() === floorFilter))
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearch("");
    setRoomTypeFilter("");
    setFloorFilter("");
    setFilteredRooms(rooms);
    setCurrentPage(1);
  };

// Sắp xếp
const handleSort = (field: "roomId" | "price" | "roomNumber") => {
    let newOrder: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filteredRooms].sort((a, b) => {
      let cmp = 0;
      if (field === "roomNumber") {
        cmp = a.roomNumber.localeCompare(b.roomNumber, "vi", { numeric: true, sensitivity: "base" });
      } else {
        const aValue = a[field] as number;
        const bValue = b[field] as number;
        cmp = aValue - bValue;
      }
      return newOrder === "asc" ? cmp : -cmp;
    });
    setFilteredRooms(sorted);
  };

  // Phân trang
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Xóa phòng (gọi BE)
  const handleDelete = async (roomId: number, displayNumber: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phòng ${displayNumber}?`)) return;
    const res = await fetch(`/api/rooms/api/delete/${roomId}`, { method: "POST" });
    if (!res.ok) {
      alert("Xóa phòng thất bại");
      return;
    }
    // Reload list
    const reload = await fetch("/api/rooms/api/list", { cache: "no-store" });
    if (reload.ok) {
      const data: BackendRoom[] = await reload.json();
      const mapped = data.map(mapRoom);
      setRooms(mapped);
      setFilteredRooms(mapped);
    }
    alert(`✅ Đã xóa phòng ${displayNumber} thành công!`);
  };

  return (
    <main className={styles.main}>
      {/* Banner header */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div>
            <h1 className={styles.pageTitle}>Quản lý phòng</h1>
            <p className={styles.pageSubtitle}>Quản lý phòng trong khách sạn</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tìm kiếm phòng</label>
            <input
              type="text"
              placeholder="Nhập số phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Loại phòng</label>
            <select
              className={styles.select}
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="">Tất cả loại</option>
              <option value="Phòng đơn">Phòng đơn</option>
              <option value="Phòng đôi">Phòng đôi</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tầng</label>
            <input
              className={styles.input}
              placeholder="Nhập tầng..."
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            />
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>Tìm kiếm</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
        </div>
        <div className={styles.filterRight}>
          <Link href="/rooms/add" className={styles.addLink}>
            +Thêm phòng mới
          </Link>
        </div>
      </div>

      {/* Info line */}
      <div className={styles.listInfo}>
        <span className={styles.infoDot}>i</span>
        <span>Hiển thị {paginatedRooms.length}/{rooms.length} phòng (Trang {currentPage}/{Math.max(totalPages, 1)})</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("roomId")}>
                Mã Phòng
                <span className={styles.sortIcon}>
                  {sortField === "roomId" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Ảnh phòng</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("roomNumber")}>
                Số phòng
                <span className={styles.sortIcon}>
                  {sortField === "roomNumber" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Loại phòng</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("price")}>
                Giá
                <span className={styles.sortIcon}>
                  {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Tầng</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th}>Tiện nghi</th>
              <th className={`${styles.th} ${styles.center}`}>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRooms.length === 0 ? (
              <tr>
                <td colSpan={9} className={`${styles.td} ${styles.center}`}>
                  Không tìm thấy phòng nào phù hợp...
                </td>
              </tr>
            ) : (
              paginatedRooms.map((room) => (
                <tr key={room.roomId} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{room.roomId}</td>
                  <td className={styles.td}>
                    <Image src={room.image || "/pics/default-room.jpg"} width={80} height={64} className={styles.roomImage} alt="room" />
                  </td>
                  <td className={styles.td}>{room.roomNumber}</td>
                  <td className={styles.td}>{room.type}</td>
                  <td className={styles.td}>
                    <div className={styles.priceBox}>
                      <div className={styles.priceValue}>{room.price.toLocaleString()}VND</div>
                      <div className={styles.priceNight}>Đêm</div>
                    </div>
                  </td>
                  <td className={styles.td}>{room.floor || "-"}</td>
                  <td className={`${styles.td} ${
                      room.status === "Trống"
                        ? styles.statusAvailable
                        : room.status === "Đang sử dụng"
                        ? styles.statusOccupied
                        : styles.statusReserved
                    }`}>
                    {room.status}
                  </td>
                  <td className={styles.td} style={{ color: "#374151" }}>{room.amenities || "-"}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/rooms/edit/${room.roomId}`} className={styles.btnUpdate}>
                      Cập nhật
                    </Link>
                    <button onClick={() => handleDelete(room.roomId, room.roomNumber)} className={styles.btnDelete}>
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
    </main>
  );
}
