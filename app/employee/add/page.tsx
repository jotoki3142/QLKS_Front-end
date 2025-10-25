import styles from "./page.module.css";
import Link from "next/link";

export default function AddEmployee() {
  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <span className={styles.plus}>+</span>
            <div>
              <h1 className={styles.headerTitle}>Thêm nhân viên mới</h1>
              <p className={styles.headerSubtitle}>Thêm nhân viên mới vào danh sách</p>
            </div>
          </div>
          <Link href="/employee" className={styles.backBtn}>← Quay lại</Link>
        </div>
      </section>

      <section className={styles.card}>
        <form className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Họ tên <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" placeholder="Nhập họ tên..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Chức vụ <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="">
                <option value="" disabled>Chọn chức vụ</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Lễ tân">Lễ tân</option>
                <option value="Buồng phòng">Buồng phòng</option>
                <option value="Bảo vệ">Bảo vệ</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" placeholder="Nhập SDT..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input className={styles.input} type="email" placeholder="Nhập email..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ca làm việc <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="">
                <option value="" disabled>Chọn ca làm việc</option>
                <option value="Ca sáng">Ca sáng</option>
                <option value="Ca chiều">Ca chiều</option>
                <option value="Ca tối">Ca tối</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lương <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" placeholder="Nhập lương..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Trạng thái <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="">
                <option value="" disabled>Chọn trạng thái</option>
                <option value="Đang làm">Đang làm</option>
                <option value="Nghỉ">Nghỉ</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>Thêm nhân viên mới</button>
            <Link href="/employee" className={styles.cancelBtn}>× Hủy</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
