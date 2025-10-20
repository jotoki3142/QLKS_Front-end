"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Room {
  id: number; // Số phòng
  name: string; // Mã phòng
  type: string; // Loại phòng
  price: number;
  floor?: number;
  amenities?: string;
  status: string;
  image?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"id" | "price" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🧩 Load dữ liệu phòng
  useEffect(() => {
    const saved = localStorage.getItem("rooms");
    if (saved) {
      const data = JSON.parse(saved);
      setRooms(data);
      setFilteredRooms(data);
    } else {
      const defaultRooms = [
        {
          id: 101,
          name: "MP101",
          type: "Phòng đơn",
          price: 500000,
          floor: 1,
          amenities: "Wifi, TV, Máy lạnh",
          status: "Trống",
          image: "/default-room.jpg",
        },
        {
          id: 102,
          name: "MP102",
          type: "Phòng đôi",
          price: 800000,
          floor: 2,
          amenities: "Bồn tắm, View biển",
          status: "Đang thuê",
          image: "/default-room.jpg",
        },
        {
          id: 103,
          name: "MP103",
          type: "Phòng đơn",
          price: 600000,
          floor: 3,
          amenities: "Ban công, Máy lạnh",
          status: "Đang dọn",
          image: "/default-room.jpg",
        },
      ];
      setRooms(defaultRooms);
      setFilteredRooms(defaultRooms);
      localStorage.setItem("rooms", JSON.stringify(defaultRooms));
    }
  }, []);

  // 🔍 Tìm kiếm
  useEffect(() => {
    const keyword = search.toLowerCase();
    const filtered = rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(keyword) ||
        room.type.toLowerCase().includes(keyword) ||
        room.status.toLowerCase().includes(keyword)
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [search, rooms]);

  // 🔁 Sắp xếp
  const handleSort = (field: "id" | "price") => {
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

  // 🗑 Xóa phòng
  const handleDelete = (id: number) => {
    if (confirm(`Bạn có chắc muốn xóa phòng ${id}?`)) {
      const updated = rooms.filter((room) => room.id !== id);
      setRooms(updated);
      localStorage.setItem("rooms", JSON.stringify(updated));
      setFilteredRooms(updated);
      alert(`✅ Đã xóa phòng ${id} thành công!`);
    }
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
              <th className="py-4 px-5 text-left border-b">Mã phòng</th>
              <th className="py-4 px-5 text-left border-b">Ảnh phòng</th>
              <th
                className="py-4 px-5 text-left border-b cursor-pointer"
                onClick={() => handleSort("id")}
              >
                Số phòng{" "}
                <span className="text-base">
                  {sortField === "id" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </th>
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
                <tr key={room.id} className="border-b hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-5 font-semibold">{room.name}</td>
                  <td className="py-3 px-5">
                    <img
                      src={room.image || "/default-room.jpg"}
                      alt={room.name}
                      className="w-20 h-16 object-cover rounded-md border"
                    />
                  </td>
                  <td className="py-3 px-5">{room.id}</td>
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
                      href={`/rooms/edit/${room.id}`}
                      className="text-blue-600 hover:underline mx-3 text-lg"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(room.id)}
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