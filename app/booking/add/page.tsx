"use client";

import styles from "./page.module.css";
import Link from "next/link";

export default function AddBooking() {
  return (
    <main className={styles.main}>
      {/* Tiêu đề trang */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <span className={styles.plus}>+</span>
            <div>
              <h1 className={styles.headerTitle}>Thêm đặt phòng mới</h1>
              <p className={styles.headerSubtitle}>Tạo thông tin đặt phòng mới cho khách hàng</p>
            </div>
          </div>
          <Link href="/booking" className={styles.backBtn}>
            ← Quay lại
          </Link>
        </div>
      </section>

      {/* Form nhập dữ liệu */}
      <section className={styles.card}>
        <form className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>
                Mã khách hàng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Nhập mã khách hàng..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Mã phòng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Nhập mã phòng..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ngày nhận phòng <span className={styles.required}>*</span>
              </label>
              <input className={styles.input} type="date" required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ngày trả phòng <span className={styles.required}>*</span>
              </label>
              <input className={styles.input} type="date" required />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>
              Thêm đặt phòng mới
            </button>
            <Link href="/booking" className={styles.cancelBtn}>
              × Hủy
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}