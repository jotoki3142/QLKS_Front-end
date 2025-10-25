"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import { Decimal } from 'decimal.js';

type BillForm = {
  bookingId: string;
  roomFee: string;
  serviceFee: string;
  createdAt: string; // datetime-local ("YYYY-MM-DDTHH:mm")
  total: string; // computed: (roomFee + serviceFee) * 1.1
  status: string;
};

const toEnumStatus = (v: string) => {
  if (v === "Đã thanh toán") return "PAID";
  if (v === "Đã hủy") return "CANCELLED";
  return "UNPAID";
};

export default function AddBillPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [bill, setBill] = useState<BillForm>({
    bookingId: "",
    roomFee: "",
    serviceFee: "",
    createdAt: "",
    total: "",
    status: "Chưa thanh toán",
  });

  // xử lý input chung
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBill((b) => ({ ...b, [name]: value }));
    
    // Auto calculate total when fees change (tax = 10%)
    if (name === "roomFee" || name === "serviceFee") {
      const updatedBill = { ...bill, [name]: value } as BillForm;
      const roomFee = new Decimal(updatedBill.roomFee || "0");
      const serviceFee = new Decimal(updatedBill.serviceFee || "0");
      const total = roomFee.plus(serviceFee).times(1.1);
      setBill((b) => ({ ...b, [name]: value, total: total.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const bookingIdNum = Number(bill.bookingId);
    const roomFeeNum = Number(bill.roomFee);
    const serviceFeeNum = Number(bill.serviceFee);
    const createdAtStr = bill.createdAt?.trim();

    if (!bill.bookingId || isNaN(bookingIdNum) || bookingIdNum <= 0) {
      toast.error("Vui lòng nhập Mã Booking hợp lệ.");
      return;
    }
    if (!bill.roomFee || isNaN(roomFeeNum) || roomFeeNum < 0) {
      toast.error("Vui lòng nhập Tiền phòng hợp lệ (>= 0).");
      return;
    }
    if (!bill.serviceFee || isNaN(serviceFeeNum) || serviceFeeNum < 0) {
      toast.error("Vui lòng nhập Tiền dịch vụ hợp lệ (>= 0).");
      return;
    }

    setSaving(true);
    try {
      const ensureSeconds = (s: string) => (s && s.length === 16 ? `${s}:00` : s);
      const payload = {
        bookingId: bookingIdNum,
        roomFee: roomFeeNum,
        serviceFee: serviceFeeNum,
        billStatus: toEnumStatus(bill.status),
        createdAt: ensureSeconds(createdAtStr)
      };

      const res = await fetch("/api/bills/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      toast.success("Thêm hóa đơn thành công!");
      router.push("/bill");
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi khi lưu hóa đơn. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Thêm hóa đơn mới</h1>
          <Link href="/bill" className={styles.backButton}>
            ← Quay lại
          </Link>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Mã booking */}
          <div>
            <label className={styles.label}>Mã Booking</label>
            <input
              name="bookingId"
              type="number"
              value={bill.bookingId}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: 1, 2, 3..."
              required
            />
          </div>

          {/* Tiền phòng */}
          <div>
            <label className={styles.label}>Tiền phòng (VNĐ)</label>
            <input
              name="roomFee"
              type="number"
              value={bill.roomFee}
              onChange={handleChange}
              className={styles.input}
              min={0}
              step={"0.01"}
              required
            />
          </div>

          {/* Tiền dịch vụ */}
          <div>
            <label className={styles.label}>Tiền dịch vụ (VNĐ)</label>
            <input
              name="serviceFee"
              type="number"
              value={bill.serviceFee}
              onChange={handleChange}
              className={styles.input}
              min={0}
              step={"0.01"}
              required
            />
          </div>

          {/* Ngày lập */}
          <div>
            <label className={styles.label}>Ngày lập</label>
            <input
              name="createdAt"
              type="datetime-local"
              value={bill.createdAt}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          {/* Tổng tiền (readonly) */}
          {/* Tổng tiền (readonly) */}
          <div>
            <label className={styles.label}>Tổng tiền (VNĐ)</label>
            <input
              name="total"
              type="number"
              value={bill.total}
              className={`${styles.input} ${styles.readonly}`}
              readOnly
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className={styles.label}>Trạng thái</label>
            <select
              name="status"
              value={bill.status}
              onChange={handleChange}
              className={`${styles.select} ${
                bill.status === "Đã thanh toán"
                  ? styles.statusPaid
                  : bill.status === "Chưa thanh toán"
                  ? styles.statusUnpaid
                  : styles.statusCancelled
              }`}
            >
              <option>Chưa thanh toán</option>
              <option>Đã thanh toán</option>
              <option>Đã hủy</option>
            </select>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              className={`${styles.submitButton} ${saving ? styles.saving : ""}`}
            >
              {saving ? "Đang lưu..." : "Lưu hóa đơn"}
            </button>
            <Link href="/bill" className={styles.cancelButton}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}