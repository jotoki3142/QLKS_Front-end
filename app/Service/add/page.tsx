"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function AddService() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        tenDichVu: "",
        moTa: "",
        gia: "",
        loaiDichVu: "",
        trangThai: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        if (!form.tenDichVu.trim()) { toast.error("Vui lòng nhập tên dịch vụ"); return; }
        if (form.tenDichVu.trim().length < 2) { toast.error("Tên dịch vụ phải có ít nhất 2 ký tự"); return; }
        if (!form.gia || Number(form.gia) <= 0) { toast.error("Vui lòng nhập giá dịch vụ hợp lệ (> 0)"); return; }
        if (!form.loaiDichVu) { toast.error("Vui lòng chọn loại dịch vụ"); return; }
        if (!form.trangThai) { toast.error("Vui lòng chọn trạng thái"); return; }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.set("tenDichVu", form.tenDichVu.trim());
            if (form.moTa) formData.set("moTa", form.moTa.trim());
            formData.set("gia", form.gia);
            formData.set("loaiDichVu", form.loaiDichVu);
            formData.set("trangThai", form.trangThai);

            const res = await fetch("/api/service/api/add", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (res.status >= 400) {
                const msg = await res.text();
                throw new Error(msg || `HTTP ${res.status}`);
            }
            toast.success("Thêm dịch vụ thành công!");
            router.push("/service");
        } catch (err: any) {
            console.error(err);
            const errorMsg = err?.message || "Có lỗi khi thêm dịch vụ";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={styles.main}>
            {/* Tiêu đề trang */}
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div className={styles.headerLeft}>
                        <span className={styles.plus}>+</span>
                        <div>
                            <h1 className={styles.headerTitle}>Thêm dịch vụ mới</h1>
                            <p className={styles.headerSubtitle}>Tạo thông tin dịch vụ mới</p>
                        </div>
                    </div>
                    <Link href="/service" className={styles.backBtn}>
                        ← Quay lại
                    </Link>
                </div>
            </section>

            {/* Form nhập dữ liệu */}
            <section className={styles.card}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Tên dịch vụ <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="text"
                                name="tenDichVu"
                                value={form.tenDichVu}
                                onChange={handleChange}
                                placeholder="Nhập tên dịch vụ..."
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Mô tả</label>
                            <textarea
                                className={styles.input}
                                name="moTa"
                                value={form.moTa}
                                onChange={handleChange}
                                placeholder="Nhập mô tả dịch vụ (tuỳ chọn)"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Giá dịch vụ (VNĐ) <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="number"
                                step="0.01"
                                min={0}
                                name="gia"
                                value={form.gia}
                                onChange={handleChange}
                                placeholder="Nhập giá..."
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Loại dịch vụ <span className={styles.required}>*</span>
                            </label>
                            <select className={styles.select} name="loaiDichVu" value={form.loaiDichVu} onChange={handleChange} required>
                                <option value="" disabled>Chọn loại dịch vụ</option>
                                <option value="PER_USE">Tính theo lần</option>
                                <option value="PER_HOUR">Tính theo giờ</option>
                                <option value="PER_DAY">Tính theo ngày</option>
                                <option value="CONSUMABLE">Tiêu hao</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Trạng thái <span className={styles.required}>*</span>
                            </label>
                            <select className={styles.select} name="trangThai" value={form.trangThai} onChange={handleChange} required>
                                <option value="" disabled>Chọn trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="INACTIVE">Ngừng hoạt động</option>
                                <option value="TEMPORARY_OUT">Tạm thời hết</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryBtn} disabled={saving}>
                            {saving ? "Đang lưu..." : "Thêm dịch vụ mới"}
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
