import styles from "./page.module.css";
import Link from "next/link";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div className={styles.headerLeft}>
                        <div>
                            <h1 className={styles.headerTitle}>Cập nhật dịch vụ</h1>
                            <p className={styles.headerSubtitle}>Chỉnh sửa thông tin dịch vụ hiện tại</p>
                        </div>
                    </div>
                    <Link href="/service" className={styles.backBtn}>← Quay lại</Link>
                </div>
            </section>

            <section className={styles.card}>
                <form className={styles.form}>
                    <div className={styles.formGrid}>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Mã KH <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Nhập tên dịch vụ..."
                                required
                            />
                        </div>

                        {/* Loại dịch vụ */}
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Loại dịch vụ<span className={styles.required}>*</span>
                            </label>
                            <select className={styles.select} defaultValue="">
                                <option value="" disabled>Chọn loại dịch vụ</option>
                                <option value="Tính theo lần">Tính theo lần</option>
                                <option value="Tính theo giờ">Tính theo giờ</option>
                                <option value="Tính theo ngày">Tính theo ngày</option>
                                <option value="Tiêu hao">Tiêu hao</option>
                            </select>
                        </div>

                        {/* Trạng thái */}
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Trạng thái <span className={styles.required}>*</span>
                            </label>
                            <select className={styles.select} defaultValue="">
                                <option value="" disabled>Chọn trạng thái</option>
                                <option value="Đang hoạt động">Đang hoạt động</option>
                                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                                <option value="Tạm thời hết">Tạm thời hết</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryBtn}>
                            Cập nhật dịch vụ
                        </button>
                        <Link href="/service" className={styles.cancelBtn}>
                            × Hủy
                        </Link>
                    </div>
                </form>
            </section>
        </main>
    );
}