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
    image: r.imageUrl ?? "/default-room.jpg",
  };
}

import styles from "./page.module.css";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"roomId" | "price" | null>(null);
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
  useEffect(() => {
    const keyword = search.toLowerCase();
    const filtered = rooms.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(keyword) ||
        room.type.toLowerCase().includes(keyword) ||
        room.status.toLowerCase().includes(keyword)
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [search, rooms]);

  // Sắp xếp
const handleSort = (field: "roomId" | "price") => {
    let newOrder: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filteredRooms].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      return newOrder === "asc" ? aValue - bValue : bValue - aValue;
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
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.heading}>Quản lý phòng</h1>

        <div className={styles.headerRight}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <Link href="/rooms/add">
            <button className={styles.addButton}>+ Thêm phòng mới</button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("roomId")}>
                Mã phòng (roomId)
                <span className={styles.sortIcon}>
                  {sortField === "roomId" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Ảnh phòng</th>
              <th className={styles.th}>Số phòng</th>
              <th className={styles.th}>Loại phòng</th>
              <th className={`${styles.th} ${styles.clickable}`} onClick={() => handleSort("price")}>
                Giá (VNĐ)
                <span className={styles.sortIcon}>
                  {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className={styles.th}>Tầng</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th}>Tiện nghi</th>
              <th className={`${styles.th} ${styles.center}`}>Hành động</th>
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
                    <Image src={room.image || "/default-room.jpg"} width={80} height={64} className={styles.roomImage} alt="room" />
                  </td>
                  <td className={styles.td}>{room.roomNumber}</td>
                  <td className={styles.td}>{room.type}</td>
                  <td className={styles.td}>{room.price.toLocaleString()}</td>
                  <td className={styles.td}>{room.floor || "-"}</td>
                  <td className={`${styles.td} ${
                      room.status === "Trống"
                        ? styles.statusAvailable
                        : room.status === "Đang thuê"
                        ? styles.statusOccupied
                        : styles.statusReserved
                    }`}>
                    {room.status}
                  </td>
                  <td className={styles.td} style={{ color: "#374151" }}>{room.amenities || "-"}</td>
                  <td className={`${styles.td} ${styles.center}`}>
                    <Link href={`/rooms/edit/${room.roomId}`} className="text-blue-600 hover:underline mx-3 text-lg">
                      Sửa
                    </Link>
                    <button onClick={() => handleDelete(room.roomId, room.roomNumber)} className="text-red-600 hover:underline mx-3 text-lg">
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
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageButtonActive : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
