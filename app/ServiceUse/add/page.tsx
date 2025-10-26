"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";

export default function AddServiceUsePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bookingId: "",
    serviceId: "",
    quantity: "",
    usageDate: "",
  });
  const [loading, setLoading] = useState(false);

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

      const res = await fetch("/api/service-usage/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      toast.success("Thêm sử dụng dịch vụ thành công!");
      router.push("/ServiceUse");
    } catch (error: any) {
      console.error("Error adding service usage:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div>
            <h1 className={styles.pageTitle}>Thêm sử dụng dịch vụ mới</h1>
            <p className={styles.pageSubtitle}>Thêm sử dụng dịch vụ mới vào danh sách</p>
          </div>
          <Link href="/ServiceUse" className={styles.backButton}>
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
              placeholder="Nhập mã đặt phòng..."
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
              placeholder="Nhập mã dịch vụ..."
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
              placeholder="Nhập số lượng...."
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
              placeholder="Nhập ngày sử dụng..."
              value={formData.usageDate}
              onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              Thêm sử dụng dịch vụ mới
            </button>
            <button type="button" className={styles.btnCancel} onClick={() => router.push("/ServiceUse")}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
