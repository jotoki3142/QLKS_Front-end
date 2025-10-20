"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditRoomPage() {
  const router = useRouter();
  const { id } = useParams();
  const [error, setError] = useState("");
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("rooms");
    if (saved) {
      const data = JSON.parse(saved);
      const found = data.find((r: any) => r.id === Number(id));
      setRoom(found);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoom((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const roomId = Number(room.id);
    const price = Number(room.price);
    const floor = Number(room.floor);

    if (!roomId || roomId <= 0) {
      setError("⚠️ Số phòng phải là số dương!");
      return;
    }
    if (!room.name.trim()) {
      setError("⚠️ Mã phòng không được để trống!");
      return;
    }
    if (!price || price <= 0) {
      setError("⚠️ Giá phòng phải lớn hơn 0!");
      return;
    }
    if (floor < 0) {
      setError("⚠️ Tầng không thể là số âm!");
      return;
    }

    const saved = localStorage.getItem("rooms");
    if (!saved) return;
    const rooms = JSON.parse(saved);

    const updated = rooms.map((r: any) =>
      r.id === Number(id)
        ? { ...room, id: roomId, price, floor }
        : r
    );

    localStorage.setItem("rooms", JSON.stringify(updated));
    alert("✅ Cập nhật phòng thành công!");
    router.push("/rooms");
  };

  if (!room) return <p className="p-8 text-gray-700 text-lg">Đang tải dữ liệu...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900 text-lg">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Chỉnh sửa phòng</h1>

        {error && (
          <p className="text-red-600 font-semibold mb-4 border border-red-200 bg-red-50 p-3 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">Số phòng</label>
            <input
              type="number"
              name="id"
              value={room.id}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Mã phòng</label>
            <input
              type="text"
              name="name"
              value={room.name}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Loại phòng</label>
            <select
              name="type"
              value={room.type}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            >
              <option value="Phòng đơn">Phòng đơn</option>
              <option value="Phòng đôi">Phòng đôi</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Giá (VNĐ)</label>
            <input
              type="number"
              name="price"
              value={room.price}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Tầng</label>
            <input
              type="number"
              name="floor"
              value={room.floor}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Trạng thái</label>
            <select
              name="status"
              value={room.status}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            >
              <option value="Trống">Trống</option>
              <option value="Đang thuê">Đang thuê</option>
              <option value="Đã đặt">Đã đặt</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Tiện nghi</label>
            <input
              type="text"
              name="amenities"
              value={room.amenities || ""}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
              placeholder="VD: View biển, Bồn tắm, Wifi..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Ảnh phòng (URL)</label>
            <input
              type="text"
              name="image"
              value={room.image || ""}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2 mb-3"
            />
            {room.image && (
              <img
                src={room.image}
                alt="Preview"
                className="w-48 h-32 object-cover rounded border"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition text-lg font-semibold"
          >
            Cập nhật phòng
          </button>
        </form>
      </div>
    </main>
  );
}