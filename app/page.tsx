"use client";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Tiêu đề */}
      <h1 className={styles.title}>CHÀO MỪNG ĐẾN VỚI WEB HOTEL MANAGEMENT</h1>

      {/* Mô tả nhỏ */}
      <p className={styles.subtitle}>Quản lý khách sạn nhanh gọn, tiện lợi.</p>
    </main>
  );
}
