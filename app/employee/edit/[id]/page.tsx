import styles from "./page.module.css";
import Link from "next/link";

export default function EditEmployee({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>Cập nhật nhân viên</h1>
              <p className={styles.headerSubtitle}>Cập nhật thông tin nhân viên</p>
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
              <input className={styles.input} type="text" defaultValue="Thuy Hien" placeholder="Nhập họ tên..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Chức vụ <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="Bảo vệ">
                <option value="Quản lý">Quản lý</option>
                <option value="Lễ tân">Lễ tân</option>
                <option value="Buồng phòng">Buồng phòng</option>
                <option value="Bảo vệ">Bảo vệ</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" defaultValue="0123456789" placeholder="Nhập SDT..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input className={styles.input} type="email" defaultValue="nvu@gmail.com" placeholder="Nhập email..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ca làm việc <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="Sáng">
                <option value="Sáng">Ca sáng</option>
                <option value="Chiều">Ca chiều</option>
                <option value="Tối">Ca tối</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lương <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" defaultValue="1000" placeholder="Nhập lương..." required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Trạng thái <span className={styles.required}>*</span></label>
              <select className={styles.select} defaultValue="Nghỉ">
                <option value="Đang làm">Đang làm</option>
                <option value="Nghỉ">Nghỉ</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>Cập nhật nhân viên</button>
            <Link href="/employee" className={styles.cancelBtn}>× Hủy</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
