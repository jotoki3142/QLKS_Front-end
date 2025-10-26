// app/service/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";

interface BackendService {
    id: number;
    tenDichVu: string;
    moTa?: string;
    gia: number;
    loaiDichVu?: string; // Loại dịch vụ
    trangThai?: string;
}

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const backendId = String(params?.id ?? "");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "", // tenDichVu
        description: "", // moTa
        price: "", // gia
        unit: "", // loaiDichVu
        status: "", // trangThai
    });

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/services/${backendId}`, { cache: "no-store" });
            const data: BackendService = await res.json();
            setForm({
                name: data.tenDichVu,
                description: data.moTa ?? "",
                price: String(data.gia ?? ""),
                unit: data.loaiDichVu ?? "",
                status: data.trangThai ?? "",
            });
            setLoading(false);
        };
        if (backendId) {
            load().catch((e) => {
                console.error(e);
                toast.error("Không tải được dữ liệu dịch vụ");
                setLoading(false);
            });
        }
    }, [backendId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as { name: string; value: string };
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const priceNum = Number(form.price);

        if (!form.name.trim()) return toast.error("Tên dịch vụ không được để trống!");
        if (isNaN(priceNum) || priceNum < 0) return toast.error("Giá dịch vụ phải hợp lệ (>= 0)!");
        if (!form.unit.trim()) return toast.error("Loại dịch vụ không được để trống!");
        if (!form.status.trim()) return toast.error("Trạng thái không được để trống!");


        setSaving(true);
        try {
            const dataToSend: Partial<BackendService> = {
                tenDichVu: form.name.trim(),
                moTa: form.description?.trim() || "",
                gia: priceNum,
                loaiDichVu: form.unit.trim(),
                trangThai: form.status,
            };

            const res = await fetch(`/api/services/${backendId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Request failed");
            }

            toast.success("Cập nhật dịch vụ thành công!");
            router.push("/service");
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi khi cập nhật dịch vụ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className={styles.main}>Đang tải dữ liệu...</p>;

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Cập nhật dịch vụ</h1>
                    <Link href="/service" className={styles.backButton}>
                        ← Quay lại
                    </Link>
                </div>

                <form onSubmit={handleUpdate} className={styles.form}>

                    {/* Hàng 1 */}
                    <div className={styles.inputRow}>
                        {/* Tên dịch vụ */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Tên dịch vụ *</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} />
                        </div>

                        {/* Loại dịch vụ */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Loại dịch vụ *</label>
                            <input type="text" name="unit" value={form.unit} onChange={handleChange} className={styles.input} />
                        </div>
                    </div>

                    {/* Hàng 2 */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Mô tả *</label>
                            <input type="text" name="description" value={form.description} onChange={handleChange} className={styles.input} />
                        </div>

                        {/* Trạng thái */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Trạng thái *</label>
                            <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
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
                            <input type="number" name="price" value={form.price} onChange={handleChange} className={styles.input} />
                        </div>
                    </div>


                    <div className={styles.actions}>
                        <button type="submit" disabled={saving} className={styles.submit}>
                            {saving ? "Đang lưu..." : "Cập nhật dịch vụ mới"}
                        </button>
                        <Link href="/service" className={styles.cancel}>x Hủy</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}