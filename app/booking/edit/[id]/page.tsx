"use client";

<<<<<<< HEAD
export default async function EditBooking({ params }: { params: Promise<{ id: string }> }) {
  await params;
=======
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import styles from "./page.module.css";

interface BookingForm {
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface Booking {
  bookingId: number;
  customerId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  status: string;
}

export default function EditBooking({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<BookingForm>({
    customerId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    status: "PENDING"
  });

  // Load params and booking data
  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setBookingId(id);

      try {
        setLoadingData(true);
        const res = await fetch(`/api/booking/api/${id}`, { cache: "no-store" });
        if (!res.ok) {
          toast.error("Không thể tải thông tin đặt phòng");
          router.push("/booking");
          return;
        }
        
        const booking: Booking = await res.json();
        
        // Convert datetime to date string for input
        const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0];
        const checkOutDate = new Date(booking.checkOut).toISOString().split('T')[0];
        
        setFormData({
          customerId: booking.customerId.toString(),
          roomId: booking.roomId.toString(),
          checkIn: checkInDate,
          checkOut: checkOutDate,
          status: booking.status
        });
      } catch (error) {
        console.error("Error loading booking:", error);
        toast.error("Có lỗi xảy ra khi tải thông tin đặt phòng");
        router.push("/booking");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [params, router]);

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
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        toast.error("Ngày trả phòng phải sau ngày nhận phòng");
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

      const response = await fetch(`/api/booking/api/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast.success("Cập nhật đặt phòng thành công!");
        router.push("/booking");
      } else {
        const errorText = await response.text();
        toast.error(`Lỗi khi cập nhật đặt phòng: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Có lỗi xảy ra khi cập nhật đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <main className={styles.main}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Đang tải thông tin đặt phòng...</p>
        </div>
      </main>
    );
  }
>>>>>>> dev

  return (
    <main className={styles.main}>
      {/* Tiêu đề trang */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>Cập nhật đặt phòng</h1>
              <p className={styles.headerSubtitle}>Chỉnh sửa thông tin đặt phòng #{bookingId}</p>
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
              {loading ? "Đang cập nhật..." : "Cập nhật đặt phòng"}
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
