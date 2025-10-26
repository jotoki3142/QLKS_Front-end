"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { toast } from "react-toastify";

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
    if (saving) return;

    const priceNum = Number(room.price);
    const floorNum = Number(room.floor);

    if (!room.name || room.name.trim().length < 1) {
      toast.error("Vui lòng nhập SỐ PHÒNG.");
      return;
    }
    if (!room.price || isNaN(priceNum) || priceNum <= 0) {
      toast.error("Vui lòng nhập GIÁ phòng hợp lệ (> 0).");
      return;
    }
    if (!room.floor || isNaN(floorNum) || floorNum <= 0) {
      toast.error("Tầng phải là số dương (>= 1).");
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
        toast.error("Số phòng đã tồn tại. Vui lòng chọn số khác hoặc chỉnh sửa phòng hiện có.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      toast.success("Thêm phòng thành công!");
      router.push("/rooms");
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi khi lưu phòng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <span className={styles.plus}>+</span>
            <div>
              <h1 className={styles.headerTitle}>Thêm phòng mới</h1>
              <p className={styles.headerSubtitle}>Thêm phòng mới vào danh sách</p>
            </div>
          </div>
          <Link href="/rooms" className={styles.backBtn}>← Quay lại</Link>
        </div>
      </section>

      <div className={styles.container}>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Số phòng  */}
          <div>
            <label className={styles.label}>Số phòng</label>
            <input
              name="name"
              type="text"
              value={room.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: 101 hoặc MP101"
              required
            />
          </div>

          {/* Loại phòng */}
          <div>
            <label className={styles.label}>Loại phòng</label>
            <select
              name="type"
              value={room.type}
              onChange={handleChange}
              className={styles.select}
            >
              <option>Phòng đơn</option>
              <option>Phòng đôi</option>
            </select>
          </div>

          {/* Giá */}
          <div>
            <label className={styles.label}>Giá (VNĐ)</label>
            <input
              name="price"
              type="number"
              value={room.price}
              onChange={handleChange}
              className={styles.input}
              min={0}
              required
            />
          </div>

          {/* Tầng */}
          <div>
            <label className={styles.label}>Tầng</label>
            <input
              name="floor"
              type="number"
              value={room.floor}
              onChange={handleChange}
              className={styles.input}
              min={1}
              placeholder="Ví dụ: 1, 2, 3..."
              required
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className={styles.label}>Trạng thái</label>
            <select
              name="status"
              value={room.status}
              onChange={handleChange}
              className={`${styles.select} ${
                room.status === "Trống"
                  ? styles.statusAvailable
                  : room.status === "Đang sử dụng"
                  ? styles.statusOccupied
                  : styles.statusReserved
              }`}
            >
              <option>Trống</option>
              <option>Đang sử dụng</option>
              <option>Đã đặt</option>
            </select>
          </div>

          {/* Tiện nghi (nhập text) */}
          <div>
            <label className={styles.label}>Tiện nghi</label>
            <input
              name="amenities"
              type="text"
              value={room.amenities}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: Bồn tắm, View biển, Wifi..."
            />
          </div>

          {/* Ảnh: upload file (tùy chọn) */}
          <div>
            <label className={styles.label}>Upload ảnh (tùy chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className={styles.file}
            />
          </div>

          {/* Preview ảnh nếu có */}
          <div>
            <p className={styles.label}>Preview ảnh</p>
            <div className={styles.previewBox}>
              <Image
                src={room.imageFileData ?? "/pics/default-room.jpg"}
                alt="preview"
                width={192}
                height={144}
                className={styles.previewImage}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving} className={styles.submit}>
              {saving ? "Đang lưu..." : "Lưu phòng"}
            </button>
            <Link href="/rooms" className={styles.cancel}>Hủy</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
