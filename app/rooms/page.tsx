"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
const [sortField, setSortField] = useState<"roomId" | "price" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🧩 Load dữ liệu phòng từ backend (proxy qua Next.js)
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

  // 🔍 Tìm kiếm
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

  // 🔁 Sắp xếp
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

  // 📄 Phân trang
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  // 🗑 Xóa phòng (gọi BE)
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
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900 text-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">Quản lý phòng</h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-5 py-3 w-full sm:w-80 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link href="/rooms/add">
            <button className="bg-blue-600 text-white text-lg px-5 py-3 rounded hover:bg-blue-700 transition">
              + Thêm phòng mới
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border-collapse text-lg">
          <thead className="bg-gray-100 text-gray-700 text-lg">
            <tr>
              <th
                className="py-4 px-5 text-left border-b cursor-pointer"
                onClick={() => handleSort("roomId")}
              >
                Mã phòng (roomId)
                <span className="text-base ml-1">
                  {sortField === "roomId" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className="py-4 px-5 text-left border-b">Ảnh phòng</th>
              <th className="py-4 px-5 text-left border-b">Số phòng (roomNumber)</th>
              <th className="py-4 px-5 text-left border-b">Loại phòng</th>
              <th
                className="py-4 px-5 text-left border-b cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Giá (VNĐ){" "}
                <span className="text-base">
                  {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
              <th className="py-4 px-5 text-left border-b">Tầng</th>
              <th className="py-4 px-5 text-left border-b">Trạng thái</th>
              <th className="py-4 px-5 text-left border-b">Tiện nghi</th>
              <th className="py-4 px-5 text-center border-b">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRooms.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500 italic text-lg">
                  Không tìm thấy phòng nào phù hợp...
                </td>
              </tr>
            ) : (
              paginatedRooms.map((room) => (
                <tr key={room.roomId} className="border-b hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-5 font-semibold">{room.roomId}</td>
                  <td className="py-3 px-5">
                    <img
                      src={room.image || "/default-room.jpg"}
                      alt={room.name}
                      className="w-20 h-16 object-cover rounded-md border"
                    />
                  </td>
                  <td className="py-3 px-5">{room.roomNumber}</td>
                  <td className="py-3 px-5">{room.type}</td>
                  <td className="py-3 px-5">{room.price.toLocaleString()}</td>
                  <td className="py-3 px-5">{room.floor || "-"}</td>
                  <td
                    className={`py-3 px-5 font-semibold ${
                      room.status === "Trống"
                        ? "text-green-600"
                        : room.status === "Đang thuê"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {room.status}
                  </td>
                  <td className="py-3 px-5 text-gray-700">{room.amenities || "-"}</td>
                  <td className="py-3 px-5 text-center">
                    <Link
                      href={`/rooms/edit/${room.roomId}`}
                      className="text-blue-600 hover:underline mx-3 text-lg"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(room.roomId, room.roomNumber)}
                      className="text-red-600 hover:underline mx-3 text-lg"
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
        <div className="flex justify-center mt-8 gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded border text-lg ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}