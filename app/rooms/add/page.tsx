"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RoomForm = {
  id: string;
  name: string;
  type: string;
  price: string;
  floor: string;
  status: string;
  amenities: string;
  imageUrl: string; // nếu người dùng nhập URL
  imageFileData?: string; // dataURL nếu upload file
};

export default function AddRoomPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [room, setRoom] = useState<RoomForm>({
    id: "",
    name: "",
    type: "Phòng đơn",
    price: "",
    floor: "",
    status: "Trống",
    amenities: "",
    imageUrl: "",
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
      setRoom((r) => ({ ...r, imageFileData: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRoom((r) => ({ ...r, imageFileData: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  // helper: lấy ảnh để lưu (ưu tiên fileData nếu có, ngược lại dùng imageUrl, nếu cả 2 không có trả undefined)
  const resolveImageToSave = () => {
    if (room.imageFileData) return room.imageFileData;
    if (room.imageUrl && room.imageUrl.trim() !== "") return room.imageUrl.trim();
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (saving) return;

    const idNum = Number(room.id);
    const priceNum = Number(room.price);
    const floorNum = room.floor === "" ? undefined : Number(room.floor);

    // Validation cơ bản
    if (!room.id || isNaN(idNum) || !Number.isFinite(idNum)) {
      setError("⚠️ Vui lòng nhập SỐ PHÒNG hợp lệ (số).");
      return;
    }
    if (idNum <= 0) {
      setError("⚠️ Số phòng phải là số dương.");
      return;
    }
    if (!room.name || room.name.trim().length < 1) {
      setError("⚠️ Vui lòng nhập MÃ PHÒNG (không để trống).");
      return;
    }
    if (!room.price || isNaN(priceNum) || priceNum <= 0) {
      setError("⚠️ Vui lòng nhập GIÁ phòng hợp lệ (> 0).");
      return;
    }
    if (floorNum !== undefined && (isNaN(floorNum) || floorNum < 0)) {
      setError("⚠️ Tầng phải là số hợp lệ (>= 0).");
      return;
    }

    // Lấy dữ liệu hiện có
    const saved = localStorage.getItem("rooms");
    const rooms = saved ? JSON.parse(saved) : [];

    // Kiểm tra trùng SỐ PHÒNG (id)
    if (rooms.some((r: any) => Number(r.id) === idNum)) {
      setError("⚠️ Số phòng này đã tồn tại. Vui lòng chọn số khác.");
      return;
    }

    // Kiểm tra trùng MÃ PHÒNG (name) - case-insensitive
    const nameTrim = room.name.trim().toLowerCase();
    if (rooms.some((r: any) => (r.name || "").toString().trim().toLowerCase() === nameTrim)) {
      setError("⚠️ Mã phòng này đã tồn tại. Vui lòng đổi mã khác.");
      return;
    }

    // Nếu OK thì tạo object mới và lưu
    setSaving(true);
    try {
      const imageToSave = resolveImageToSave() ?? "/default-room.jpg";
      const newRoom = {
        id: idNum,
        name: room.name.trim(),
        type: room.type,
        price: priceNum,
        floor: floorNum ?? null,
        status: room.status,
        amenities: room.amenities?.trim() || "",
        image: imageToSave,
      };

      rooms.push(newRoom);
      localStorage.setItem("rooms", JSON.stringify(rooms));

      // thành công -> reset hoặc chuyển về danh sách
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
          {/* Số phòng */}
          <div>
            <label className="block font-medium mb-1">Số phòng</label>
            <input
              name="id"
              type="number"
              value={room.id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min={1}
              required
            />
          </div>

          {/* Mã phòng */}
          <div>
            <label className="block font-medium mb-1">Mã phòng</label>
            <input
              name="name"
              type="text"
              value={room.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
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
              min={0}
              placeholder="Ví dụ: 1, 2, 3..."
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

          {/* Ảnh: input URL */}
          <div>
            <label className="block font-medium mb-1">Ảnh phòng (URL)</label>
            <input
              name="imageUrl"
              type="text"
              value={room.imageUrl}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="/default-room.jpg hoặc https://..."
            />
            <p className="text-sm text-gray-500 mt-1">Hoặc upload file ảnh bên dưới để preview và lưu ảnh nội bộ.</p>
          </div>

          {/* Ảnh: upload file (dataURL) */}
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
                src={room.imageFileData ?? (room.imageUrl ? room.imageUrl : "/default-room.jpg")}
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