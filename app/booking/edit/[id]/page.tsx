import styles from "./page.module.css";
import Link from "next/link";

export default async function EditBooking({ params }: { params: Promise<{ id: string }> }) {
  await params;

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>Cập nhật đặt phòng</h1>
              <p className={styles.headerSubtitle}>Chỉnh sửa thông tin đặt phòng hiện tại</p>
            </div>
          </div>
          <Link href="/booking" className={styles.backBtn}>← Quay lại</Link>
        </div>
      </section>

      <section className={styles.card}>
        <form className={styles.form}>
          <div className={styles.formGrid}>

            {/* Khách hàng */}
            <div className={styles.field}>
              <label className={styles.label}>
                Mã KH <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Nhập mã khách hàng..."
                required
              />
            </div>

            {/* Phòng */}
            <div className={styles.field}>
              <label className={styles.label}>
                Mã phòng <span className={styles.required}>*</span>
              </label>
              <select className={styles.select} defaultValue="">
                <option value="" disabled>Mã phòng</option>
                <option value="Phòng 101">Phòng 101</option>
                <option value="Phòng 102">Phòng 102</option>
                <option value="Phòng 201">Phòng 201</option>
                <option value="Phòng 202">Phòng 202</option>
              </select>
            </div>

            {/* Ngày nhận phòng */}
            <div className={styles.field}>
              <label className={styles.label}>
                Ngày nhận phòng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="date"
                required
              />
            </div>

            {/* Ngày trả phòng */}
            <div className={styles.field}>
              <label className={styles.label}>
                Ngày trả phòng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="date"
                required
              />
            </div>

            {/* Trạng thái */}
            <div className={styles.field}>
              <label className={styles.label}>
                Trạng thái <span className={styles.required}>*</span>
              </label>
              <select className={styles.select} defaultValue="">
                <option value="" disabled>Chọn trạng thái</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đang ở">Đang ở</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>
              Cập nhật đặt phòng
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