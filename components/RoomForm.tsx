"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";

export default function RoomForm() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    status: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Thêm phòng:", form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md max-w-md">
      <label className="block mb-2">Số phòng</label>
      <input name="name" value={form.name} onChange={handleChange} className="border w-full mb-3 px-3 py-2 rounded" />

      <label className="block mb-2">Loại phòng</label>
      <input name="type" value={form.type} onChange={handleChange} className="border w-full mb-3 px-3 py-2 rounded" />

      <label className="block mb-2">Giá</label>
      <input name="price" value={form.price} onChange={handleChange} className="border w-full mb-3 px-3 py-2 rounded" />

      <label className="block mb-2">Trạng thái</label>
      <input name="status" value={form.status} onChange={handleChange} className="border w-full mb-3 px-3 py-2 rounded" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Lưu phòng
      </button>
    </form>
  );
}
