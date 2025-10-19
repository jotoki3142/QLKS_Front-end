"use client";
import { useState } from "react";
import Link from "next/link";

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  status: string;
}

export default function RoomList() {
  const [rooms] = useState<Room[]>([
    { id: 1, name: "P001", type: "Phòng đơn", price: 300000, status: "Trống" },
    { id: 2, name: "P002", type: "Phòng đôi", price: 500000, status: "Đã thuê" },
  ]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex justify-between mb-4">
        <input
          placeholder="Tìm kiếm phòng..."
          className="border rounded-lg px-3 py-2 w-1/3"
        />
        <Link href="/rooms/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Thêm phòng mới
        </Link>
      </div>

      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Số phòng</th>
            <th className="p-2 border">Loại</th>
            <th className="p-2 border">Giá</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="p-2 border">{r.name}</td>
              <td className="p-2 border">{r.type}</td>
              <td className="p-2 border">{r.price.toLocaleString()} VND</td>
              <td className="p-2 border">{r.status}</td>
              <td className="p-2 border">
                <Link href={`/rooms/edit/${r.id}`} className="text-blue-500 mr-3">Sửa</Link>
                <button className="text-red-500">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}