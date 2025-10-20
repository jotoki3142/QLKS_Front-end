"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white text-center"
      style={{
        backgroundImage: "url('/background-hotel.jpg')", // Ảnh nền trong thư mục public
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Tiêu đề */}
      <h1 className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg">
        CHÀO MỪNG ĐẾN VỚI WEB HOTEL MANAGEMENT
      </h1>

      {/* Mô tả nhỏ */}
      <p className="text-lg sm:text-xl drop-shadow-md">
        Quản lý khách sạn nhanh gọn, tiện lợi.
      </p>
    </main>
  );
} 