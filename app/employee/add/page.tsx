"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEmployee, NewEmployee, EmployeeRole, EmployeeShift, EmployeeStatus } from "@/utils/api";

export default function AddEmployee() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewEmployee>({
    name: "",
    position: "" as EmployeeRole,
    phoneNumber: 0,
    email: "",
    shift: "" as EmployeeShift,
    salary: 0,
    employeeStatus: "WORKING" as EmployeeStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phoneNumber' || name === 'salary' 
        ? (value ? parseFloat(value) : 0) 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }
    if (!formData.position) {
      alert('Vui lòng chọn chức vụ');
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.toString().length !== 10) {
      alert('Số điện thoại phải có 10 số');
      return;
    }
    if (!formData.email.includes('@')) {
      alert('Email không hợp lệ');
      return;
    }
    if (!formData.shift) {
      alert('Vui lòng chọn ca làm việc');
      return;
    }
    if (formData.salary <= 0) {
      alert('Lương phải lớn hơn 0');
      return;
    }

    try {
      console.log('Sending employee data:', formData);
      console.log('JSON payload:', JSON.stringify(formData, null, 2));
      await addEmployee(formData);
      alert('Thêm nhân viên thành công!');
      router.push('/employee');
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      alert('Lỗi: Không thể thêm nhân viên. Vui lòng kiểm tra kết nối API.');
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <span className={styles.plus}>+</span>
            <div>
              <h1 className={styles.headerTitle}>Thêm nhân viên mới</h1>
              <p className={styles.headerSubtitle}>Thêm nhân viên mới vào danh sách</p>
            </div>
          </div>
          <Link href="/employee" className={styles.backBtn}>← Quay lại</Link>
        </div>
      </section>

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Họ tên <span className={styles.required}>*</span></label>
              <input 
                className={styles.input} 
                type="text" 
                name="name"
                placeholder="Nhập họ tên..." 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Chức vụ <span className={styles.required}>*</span></label>
              <select 
                className={styles.select} 
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Chọn chức vụ</option>
                <option value="MANAGER">Quản lý</option>
                <option value="RECEPTIONIST">Lễ tân</option>
                <option value="HOUSEKEEPING">Buồng phòng</option>
                <option value="SECURITY">Bảo vệ</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại <span className={styles.required}>*</span></label>
              <input 
                className={styles.input} 
                type="number" 
                name="phoneNumber"
                placeholder="Nhập SDT..." 
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input 
                className={styles.input} 
                type="email" 
                name="email"
                placeholder="Nhập email..." 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ca làm việc <span className={styles.required}>*</span></label>
              <select 
                className={styles.select} 
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Chọn ca làm việc</option>
                <option value="MORNING">Ca sáng</option>
                <option value="AFTERNOON">Ca chiều</option>
                <option value="NIGHT">Ca tối</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lương <span className={styles.required}>*</span></label>
              <input 
                className={styles.input} 
                type="number" 
                name="salary"
                placeholder="Nhập lương..." 
                value={formData.salary || ''}
                onChange={handleChange}
                min="0"
                step="1000"
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Trạng thái <span className={styles.required}>*</span></label>
              <select 
                className={styles.select} 
                name="employeeStatus"
                value={formData.employeeStatus}
                onChange={handleChange}
                required
              >
                <option value="WORKING">Đang làm</option>
                <option value="RESIGNED">Nghỉ</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>Thêm nhân viên mới</button>
            <Link href="/employee" className={styles.cancelBtn}>× Hủy</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
