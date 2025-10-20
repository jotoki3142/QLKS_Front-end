"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Dữ liệu trả về từ BE
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

const toEnumType = (v: string) => (v === "Phòng đôi" ? "DOUBLE" : "SINGLE");
const toEnumStatus = (v: string) => {
  if (v === "Đang sử dụng") return "OCCUPIED";
  if (v === "Đã đặt") return "RESERVED";
  return "AVAILABLE";
};
const fromEnumType = (v: string) => (v === "SINGLE" ? "Phòng đơn" : v === "DOUBLE" ? "Phòng đôi" : v);
const fromEnumStatus = (v: string) =>
  v === "AVAILABLE" ? "Trống" : v === "OCCUPIED" ? "Đang sử dụng" : v === "RESERVED" ? "Đã đặt" : v;

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const backendId = String(params?.id ?? "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Phòng đơn",
    price: "",
    floor: "",
    status: "Trống",
    amenities: "",
    imageFile: null as File | null,
    imageFileData: "" as string | undefined,
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/rooms/api/${backendId}`, { cache: "no-store" });
      const data: BackendRoom = await res.json();
      setForm({
        name: data.roomNumber,
        type: fromEnumType(String(data.roomType)),
        price: String(typeof data.roomPrice === "string" ? Number(data.roomPrice) : data.roomPrice ?? ""),
        floor: String(data.roomFloor ?? ""),
        status: fromEnumStatus(String(data.roomStatus)),
        amenities: data.roomAmenities ?? "",
        imageFile: null,
        imageFileData: data.imageUrl || undefined,
      });
      setLoading(false);
    };
    load().catch((e) => {
      console.error(e);
      setError("Không tải được dữ liệu phòng");
      setLoading(false);
    });
  }, [backendId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: string; value: string };
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file?: File | null) => {
    if (!file) {
      setForm((r) => ({ ...r, imageFile: null, imageFileData: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((r) => ({ ...r, imageFile: file, imageFileData: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const priceNum = Number(form.price);
    const floorNum = Number(form.floor);
    if (!form.name.trim()) return setError("⚠️ Mã/Số phòng không được để trống!");
    if (!priceNum || priceNum <= 0) return setError("⚠️ Giá phòng phải lớn hơn 0!");
    if (!floorNum || floorNum <= 0) return setError("⚠️ Tầng phải là số dương!");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("roomNumber", form.name.trim());
      fd.append("roomType", toEnumType(form.type));
      fd.append("roomFloor", String(floorNum));
      fd.append("roomPrice", String(priceNum));
      fd.append("roomAmenities", form.amenities?.trim() || "");
      fd.append("roomStatus", toEnumStatus(form.status));
      if (form.imageFile) fd.append("imageFile", form.imageFile);
      else fd.append("imageFile", new Blob([]), "");

      const res = await fetch(`/api/rooms/api/edit/${backendId}`, { method: "POST", body: fd });
      if (res.status === 409) {
        setError("⚠️ Số phòng đã tồn tại. Vui lòng chọn số khác.");
        return;
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Request failed");
      }
      alert("✅ Cập nhật phòng thành công!");
      router.push("/rooms");
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi cập nhật phòng");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-700 text-lg">Đang tải dữ liệu...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900 text-lg">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Chỉnh sửa phòng</h1>

        {error && (
          <p className="text-red-600 font-semibold mb-4 border border-red-200 bg-red-50 p-3 rounded">{error}</p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">Mã/Số phòng</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Loại phòng</label>
            <select name="type" value={form.type} onChange={handleChange} className="border rounded w-full px-4 py-2">
              <option value="Phòng đơn">Phòng đơn</option>
              <option value="Phòng đôi">Phòng đôi</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Giá (VNĐ)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className="border rounded w-full px-4 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-2">Tầng</label>
            <input type="number" name="floor" value={form.floor} onChange={handleChange} className="border rounded w-full px-4 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-2">Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} className="border rounded w-full px-4 py-2">
              <option value="Trống">Trống</option>
              <option value="Đang sử dụng">Đang sử dụng</option>
              <option value="Đã đặt">Đã đặt</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Tiện nghi</label>
            <input
              type="text"
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="border rounded w-full px-4 py-2"
              placeholder="VD: View biển, Bồn tắm, Wifi..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Ảnh phòng (tùy chọn)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} className="w-full" />
            {form.imageFileData && (
              <img src={form.imageFileData} alt="Preview" className="mt-3 w-48 h-32 object-cover rounded border" />
            )}
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition text-lg font-semibold">
            {saving ? "Đang lưu..." : "Cập nhật phòng"}
          </button>
        </form>
      </div>
    </main>
  );
}
