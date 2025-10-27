"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";

interface ServiceUsage {
    serviceUsageId: number;
    bookingId: number;
    service: {
        serviceId: number;
        tenDichVu: string;
    };
    quantity: number;
    usageDate: string;
}

export default function EditServiceUsePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [formData, setFormData] = useState({
        bookingId: "",
        serviceId: "",
        quantity: "",
        usageDate: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadServiceUsage();
    }, [id]);

    const loadServiceUsage = async () => {
        try {
            const res = await fetch(`/api/service-usage/api/${id}`);
            if (!res.ok) {
                toast.error("Không tìm thấy dữ liệu!");
                router.push("/serviceuse");
                return;
            }
            const data: ServiceUsage = await res.json();
            setFormData({
                bookingId: String(data.bookingId),
                serviceId: String(data.service.serviceId),
                quantity: String(data.quantity),
                usageDate: data.usageDate,
            });
            setLoadingData(false);
        } catch (e) {
            console.error("Failed to load service usage", e);
            toast.error("Có lỗi xảy ra!");
            router.push("/serviceuse");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bookingId || !formData.serviceId || !formData.quantity || !formData.usageDate) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (parseInt(formData.quantity) <= 0) {
            toast.error("Số lượng phải lớn hơn 0!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                bookingId: parseInt(formData.bookingId),
                serviceId: parseInt(formData.serviceId),
                quantity: parseInt(formData.quantity),
                usageDate: formData.usageDate,
            };

            const res = await fetch(`/api/service-usage/api/edit/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            toast.success("Cập nhật thành công!");
            router.push("/serviceuse");
        } catch (error: any) {
            console.error("Error updating:", error);
            toast.error(error.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div>
                        <h1 className={styles.pageTitle}>Cập nhật sử dụng dịch vụ</h1>
                        <p className={styles.pageSubtitle}>Cập nhật thông tin sử dụng dịch vụ</p>
                    </div>
                    <Link href="/serviceuse" className={styles.backButton}>
                        Quay lại
                    </Link>
                </div>
            </section>

            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Mã đặt phòng <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.bookingId}
                            onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Mã dịch vụ <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.serviceId}
                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Số lượng <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            min="1"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Ngày sử dụng <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.usageDate}
                            onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnSubmit} disabled={loading}>
                            Cập nhật sử dụng dịch vụ
                        </button>
                        <button type="button" className={styles.btnCancel} onClick={() => router.push("/serviceuse")}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}