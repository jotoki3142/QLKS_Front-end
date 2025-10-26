// app/service/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";

type ServiceForm = {
    name: string;
    price: string;
    unit: string;      // loaiDichVu
    status: string;    // trangThai
    description: string; // moTa
};

export default function AddServicePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [service, setService] = useState<ServiceForm>({
        name: "",
        price: "",
        unit: "",
        status: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setService((s) => ({ ...s, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        const priceNum = Number(service.price);

        if (!service.name || service.name.trim().length < 1) {
            toast.error("Vui lòng nhập TÊN DỊCH VỤ.");
            return;
        }
        if (isNaN(priceNum) || priceNum < 0) {
            toast.error("Vui lòng nhập GIÁ dịch vụ hợp lệ (>= 0).");
            return;
        }
        if (!service.unit || service.unit.trim().length < 1) {
            toast.error("Vui lòng nhập LOẠI DỊCH VỤ.");
            return;
        }
        if (!service.status || service.status.trim().length < 1) {
            toast.error("Vui lòng chọn TRẠNG THÁI.");
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                tenDichVu: service.name.trim(),
                moTa: service.description?.trim() || "",
                gia: priceNum,
                loaiDichVu: service.unit.trim(),
                trangThai: service.status,
            };

            const res = await fetch("/api/services", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Request failed");
            }

            toast.success("Thêm dịch vụ thành công!");
            router.push("/service");
        } catch (err) {
            console.error(err);
            toast.error("Đã có lỗi khi lưu dịch vụ. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div className={styles.headerLeft}>
                        <span className={styles.plus}>+</span>
                        <div>
                            <h1 className={styles.headerTitle}>Thêm dịch vụ mới</h1>
                            <p className={styles.headerSubtitle}>Thêm dịch vụ mới vào danh sách</p>
                        </div>
                    </div>
                    <Link href="/service" className={styles.backBtn}>← Quay lại</Link>
                </div>
            </section>

            <div className={styles.container}>

                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Hàng 1 */}
                    <div className={styles.inputRow}>
                        {/* Tên dịch vụ */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Tên dịch vụ *</label>
                            <input name="name" type="text" value={service.name} onChange={handleChange} className={styles.input} placeholder="Nhập tên dịch vụ..." required />
                        </div>

                        {/* Loại dịch vụ */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Loại dịch vụ *</label>
                            <input name="unit" type="text" value={service.unit} onChange={handleChange} className={styles.input} placeholder="Nhập loại dịch vụ..." required />
                        </div>
                    </div>

                    {/* Hàng 2 */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Mô tả *</label>
                            <input name="description" type="text" value={service.description} onChange={handleChange} className={styles.input} placeholder="Nhập mô tả..." required />
                        </div>

                        {/* Trạng thái */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Trạng thái *</label>
                            <select name="status" value={service.status} onChange={handleChange} className={styles.select} required>
                                <option value="" disabled>Chọn trạng thái</option>
                                <option value="Đang hoạt động">Đang hoạt động</option>
                                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    {/* Hàng 3 (Giá) */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Giá *</label>
                            <input name="price" type="number" value={service.price} onChange={handleChange} className={styles.input} min={0} placeholder="Nhập giá dịch vụ..." required />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" disabled={saving} className={styles.submit}>
                            {saving ? "Đang lưu..." : "+ Thêm dịch vụ mới"}
                        </button>
                        <Link href="/service" className={styles.cancel}>x Hủy</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}