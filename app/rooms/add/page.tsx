"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RoomForm = {
  name: string; // roomNumber
  type: string;
  price: string;
  floor: string;
  status: string;
  amenities: string;
  imageFile?: File | null; // file upload thực tế
  imageFileData?: string; // preview
};

const toEnumType = (v: string) => (v === "Phòng đôi" ? "DOUBLE" : "SINGLE");
const toEnumStatus = (v: string) => {
  if (v === "Đang sử dụng") return "OCCUPIED";
  if (v === "Đã đặt") return "RESERVED";
  return "AVAILABLE";
};

export default function AddRoomPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [room, setRoom] = useState<RoomForm>({
    name: "",
    type: "Phòng đơn",
    price: "",
    floor: "",
    status: "Trống",
    amenities: "",
    imageFile: null,
    imageFileData: undefined,
  });

  // xử lý input chung
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoom((r) => ({ ...r, [name]: value }));
  };

  // xử lý upload file -> preview dataURL
  const handleFileChange = (file?: File | null) => {
    if (!file) {
      setRoom((r) => ({ ...r, imageFile: null, imageFileData: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRoom((r) => ({ ...r, imageFile: file, imageFileData: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (saving) return;

    const priceNum = Number(room.price);
    const floorNum = Number(room.floor);

    if (!room.name || room.name.trim().length < 1) {
      setError("⚠️ Vui lòng nhập SỐ PHÒNG.");
      return;
    }
    if (!room.price || isNaN(priceNum) || priceNum <= 0) {
      setError("⚠️ Vui lòng nhập GIÁ phòng hợp lệ (> 0).");
      return;
    }
    if (!room.floor || isNaN(floorNum) || floorNum <= 0) {
      setError("⚠️ Tầng phải là số dương (>= 1).");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("roomNumber", room.name.trim());
      form.append("roomType", toEnumType(room.type));
      form.append("roomFloor", String(floorNum));
      form.append("roomPrice", String(priceNum));
      form.append("roomAmenities", room.amenities?.trim() || "");
      form.append("roomStatus", toEnumStatus(room.status));
      // luôn gửi part imageFile (rỗng nếu không có) để Spring binding không lỗi
      if (room.imageFile) {
        form.append("imageFile", room.imageFile);
      } else {
        form.append("imageFile", new Blob([]), "");
      }

      const res = await fetch("/api/rooms/api/add", {
        method: "POST",
        body: form,
      });

      if (res.status === 409) {
        setError("⚠️ Số phòng đã tồn tại. Vui lòng chọn số khác hoặc chỉnh sửa phòng hiện có.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      alert("✅ Thêm phòng thành công!");
      router.push("/rooms");
    } catch (err) {
      console.error(err);
      setError("Đã có lỗi khi lưu phòng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900 text-base">
      <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
        <h1 className="text-2xl font-bold mb-4">Thêm phòng mới</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Số phòng  */}
          <div>
            <label className="block font-medium mb-1">Mã/Số phòng</label>
            <input
              name="name"
              type="text"
              value={room.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="VD: 101 hoặc MP101"
              required
            />
          </div>

          {/* Loại phòng */}
          <div>
            <label className="block font-medium mb-1">Loại phòng</label>
            <select
              name="type"
              value={room.type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>Phòng đơn</option>
              <option>Phòng đôi</option>
            </select>
          </div>

          {/* Giá */}
          <div>
            <label className="block font-medium mb-1">Giá (VNĐ)</label>
            <input
              name="price"
              type="number"
              value={room.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min={0}
              required
            />
          </div>

          {/* Tầng */}
          <div>
            <label className="block font-medium mb-1">Tầng</label>
            <input
              name="floor"
              type="number"
              value={room.floor}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min={1}
              placeholder="Ví dụ: 1, 2, 3..."
              required
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block font-medium mb-1">Trạng thái</label>
            <select
              name="status"
              value={room.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>Trống</option>
              <option>Đang sử dụng</option>
              <option>Đã đặt</option>
            </select>
          </div>

          {/* Tiện nghi (nhập text) */}
          <div>
            <label className="block font-medium mb-1">Tiện nghi</label>
            <input
              name="amenities"
              type="text"
              value={room.amenities}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="VD: Bồn tắm, View biển, Wifi..."
            />
          </div>

          {/* Ảnh: upload file (tùy chọn) */}
          <div>
            <label className="block font-medium mb-1">Upload ảnh (tùy chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="w-full"
            />
          </div>

          {/* Preview ảnh nếu có */}
          <div>
            <p className="block font-medium mb-1">Preview ảnh</p>
            <div className="w-48 h-36 border rounded overflow-hidden">
              <img
                src={room.imageFileData ?? "/default-room.jpg"}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Thêm phòng"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
