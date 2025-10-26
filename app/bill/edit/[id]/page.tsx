"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { toast } from "react-toastify";
import Decimal from 'decimal.js';

// Dữ liệu trả về từ BE
interface BackendBill {
  billId: number;
  bookingId: number;
  roomFee: string | number;
  serviceFee: string | number;
  tax: string | number;
  total: string | number;
  createdAt: string;
  updatedAt: string;
  status: "UNPAID" | "PAID" | "CANCELLED" | string;
}

const toEnumStatus = (v: string) => {
  if (v === "Đã thanh toán") return "PAID";
  if (v === "Đã hủy") return "CANCELLED";
  return "UNPAID";
};

const fromEnumStatus = (v: string) => {
  if (v === "PAID") return "Đã thanh toán";
  if (v === "CANCELLED") return "Đã hủy";
  return "Chưa thanh toán";
};

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const backendId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    roomFee: "",
    serviceFee: "",
    total: "",
    status: "Chưa thanh toán",
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/bills/api/${backendId}`, { cache: "no-store" });
      if (!res.ok) {
        toast.error("Không tìm thấy hóa đơn");
        setLoading(false);
        return;
      }
      const data: BackendBill = await res.json();
      setForm({
        bookingId: String(data.bookingId),
        roomFee: String(data.roomFee),
        serviceFee: String(data.serviceFee),
        total: String(data.total),
        status: fromEnumStatus(String(data.status)),
      });
      setLoading(false);
    };
    load().catch((e) => {
      console.error(e);
      toast.error("Không tải được dữ liệu hóa đơn");
      setLoading(false);
    });
  }, [backendId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Auto calculate total when fees change (tax = 10%)
    if (name === "roomFee" || name === "serviceFee") {
      const updatedForm = { ...form, [name]: value };
      const roomFee = new Decimal(updatedForm.roomFee || "0");
      const serviceFee = new Decimal(updatedForm.serviceFee || "0");
      const total = roomFee.plus(serviceFee).times(1.1);
      setForm((prev) => ({ ...prev, [name]: value, total: total.toString() }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookingIdNum = Number(form.bookingId);
    const roomFeeNum = Number(form.roomFee);
    const serviceFeeNum = Number(form.serviceFee);

    if (!form.bookingId || isNaN(bookingIdNum) || bookingIdNum <= 0) {
      toast.error("Mã Booking không hợp lệ!");
      return;
    }
    if (isNaN(roomFeeNum) || roomFeeNum < 0) {
      toast.error("Tiền phòng phải lớn hơn hoặc bằng 0!");
      return;
    }
    if (isNaN(serviceFeeNum) || serviceFeeNum < 0) {
      toast.error("Tiền dịch vụ phải lớn hơn hoặc bằng 0!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bookingId: bookingIdNum,
        roomFee: roomFeeNum,
        serviceFee: serviceFeeNum,
        billStatus: toEnumStatus(form.status)
      };

      const res = await fetch(`/api/bills/api/edit/${backendId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }
      
      toast.success("Cập nhật hóa đơn thành công!");
      router.push("/bill");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Có lỗi khi cập nhật hóa đơn");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.main}>Đang tải dữ liệu...</p>;

  const isLocked = form.status === "Đã thanh toán";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chỉnh sửa hóa đơn</h1>
          <Link href="/bill" className={styles.backButton}>
            ← Quay lại
          </Link>
        </div>

        <form onSubmit={handleUpdate} className={styles.form}>
          <div>
            <label className={styles.label}>Mã Booking</label>
            <input
              type="number"
              name="bookingId"
              value={form.bookingId}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={isLocked}
            />
          </div>

          <div>
            <label className={styles.label}>Tiền phòng (VNĐ)</label>
            <input
              type="number"
              name="roomFee"
              value={form.roomFee}
              onChange={handleChange}
              className={styles.input}
              min={0}
              step={"0.01"}
              required
              disabled={isLocked}
            />
          </div>

          <div>
            <label className={styles.label}>Tiền dịch vụ (VNĐ)</label>
            <input
              type="number"
              name="serviceFee"
              value={form.serviceFee}
              onChange={handleChange}
              className={styles.input}
              min={0}
              step={"0.01"}
              required
              disabled={isLocked}
            />
          </div>


          <div>
            <label className={styles.label}>Tổng tiền (VNĐ)</label>
            <input
              type="number"
              name="total"
              value={form.total}
              className={`${styles.input} ${styles.readonly}`}
              readOnly
            />
          </div>

          <div>
            <label className={styles.label}>Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`${styles.select} ${
                form.status === "Đã thanh toán"
                  ? styles.statusPaid
                  : form.status === "Chưa thanh toán"
                  ? styles.statusUnpaid
                  : styles.statusCancelled
              }`}
              disabled={isLocked}
            >
              <option value="Chưa thanh toán">Chưa thanh toán</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              disabled={saving || isLocked}
              className={`${styles.submitButton} ${saving ? styles.saving : ""}`}
            >
              {saving ? "Đang cập nhật..." : isLocked ? "Đã thanh toán - không thể chỉnh sửa" : "Cập nhật hóa đơn"}
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