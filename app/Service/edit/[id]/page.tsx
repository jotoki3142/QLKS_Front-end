"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditService({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        tenDichVu: "",
        moTa: "",
        gia: "",
        loaiDichVu: "",
        trangThai: "",
    });

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/service/api/${id}`, { cache: "no-store" });
            if (!res.ok) {
                toast.error("Không tìm thấy dịch vụ");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setForm({
                tenDichVu: data.tenDichVu ?? "",
                moTa: data.moTa ?? "",
                gia: data.gia != null ? String(data.gia) : "",
                loaiDichVu: data.loaiDichVu ?? "",
                trangThai: data.trangThai ?? "",
            });
            setLoading(false);
        };
        load().catch((e) => { console.error(e); setLoading(false); });
    }, [id]);

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

            const res = await fetch(`/api/service/api/edit/${id}`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (res.status >= 400) {
                const msg = await res.text();
                throw new Error(msg || `HTTP ${res.status}`);
            }
            toast.success("Cập nhật dịch vụ thành công!");
            router.push("/service");
        } catch (err: any) {
            console.error(err);
            const errorMsg = err?.message || "Có lỗi khi cập nhật dịch vụ";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <main className={styles.main}>Đang tải dữ liệu...</main>;

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>Cập nhật dịch vụ</h1>
                        <p className={styles.pageSubtitle}>Chỉnh sửa thông tin dịch vụ hiện tại</p>
                    </div>
                    <div className={styles.headerRight}>
                        <Link href="/service" className={styles.backButton}>← Quay lại</Link>
                    </div>
                </div>
            </section>

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

                        {/* Loại dịch vụ */}
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

                        {/* Trạng thái */}
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
                            {saving ? "Đang cập nhật..." : "Cập nhật dịch vụ"}
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
