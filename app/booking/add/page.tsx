"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { toast } from "react-toastify";

interface BookingForm {
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export default function AddBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    customerId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    status: "PENDING"
  });

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkInDate < today) {
        toast.error("Ngày nhận phòng không thể là ngày trong quá khứ");
        setLoading(false);
        return;
      }
      
      if (checkOutDate <= checkInDate) {
        toast.error("Ngày trả phòng phải sau ngày nhận phòng");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.customerId.trim()) {
        toast.error("Vui lòng nhập mã khách hàng");
        setLoading(false);
        return;
      }
      
      if (!formData.roomId.trim()) {
        toast.error("Vui lòng nhập mã phòng");
        setLoading(false);
        return;
      }
      
      if (!formData.checkIn) {
        toast.error("Vui lòng chọn ngày nhận phòng");
        setLoading(false);
        return;
      }
      
      if (!formData.checkOut) {
        toast.error("Vui lòng chọn ngày trả phòng");
        setLoading(false);
        return;
      }

      // Validate customer ID and room ID are numbers
      if (isNaN(parseInt(formData.customerId))) {
        toast.error("Mã khách hàng phải là số");
        setLoading(false);
        return;
      }
      
      if (isNaN(parseInt(formData.roomId))) {
        toast.error("Mã phòng phải là số");
        setLoading(false);
        return;
      }

      // Convert to the format expected by backend
      const bookingData = {
        customerId: parseInt(formData.customerId),
        roomId: parseInt(formData.roomId),
        checkIn: formData.checkIn + "T14:00:00", // Add time component
        checkOut: formData.checkOut + "T11:00:00", // Add time component
        status: formData.status
      };

      console.log('Sending booking data:', bookingData);

      const response = await fetch("/api/booking/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking created successfully:', result);
        toast.success("Thêm đặt phòng thành công!");
        router.push("/booking");
      } else {
        try {
          const errorData = await response.json();
          console.error('Error response JSON:', errorData);
          const message = errorData.message || errorData.error || `HTTP ${response.status}`;
          toast.error(`Lỗi: ${message}`);
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          toast.error(`Lỗi khi thêm đặt phòng: ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Error adding booking:", error);
      toast.error("Có lỗi xảy ra khi thêm đặt phòng");
    } finally {
      setLoading(false);
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
              <h1 className={styles.headerTitle}>Thêm đặt phòng mới</h1>
              <p className={styles.headerSubtitle}>Tạo thông tin đặt phòng mới cho khách hàng</p>
            </div>
          </div>
          <Link href="/booking" className={styles.backBtn}>
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
                Mã khách hàng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="number"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                placeholder="Nhập mã khách hàng..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Mã phòng <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="number"
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                placeholder="Nhập mã phòng..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ngày nhận phòng <span className={styles.required}>*</span>
              </label>
              <input 
                className={styles.input} 
                type="date" 
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                min={today}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ngày trả phòng <span className={styles.required}>*</span>
              </label>
              <input 
                className={styles.input} 
                type="date" 
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                min={formData.checkIn || today}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Trạng thái <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="PENDING">Đang chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm đặt phòng mới"}
            </button>
            <Link href="/booking" className={styles.cancelBtn}>
              × Hủy
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
