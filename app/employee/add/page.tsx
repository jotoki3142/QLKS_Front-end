"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEmployee, NewEmployee, EmployeeRole, EmployeeShift, EmployeeStatus } from "@/utils/api";
<<<<<<< HEAD

export default function AddEmployee() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewEmployee>({
    name: "",
    position: "" as EmployeeRole,
    phoneNumber: 0,
    email: "",
    shift: "" as EmployeeShift,
    salary: 1, // Lương mặc định 1 VNĐ (backend yêu cầu > 0)
    employeeStatus: "WORKING" as EmployeeStatus,
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Chỉ cho phép nhập số, giới hạn 10 ký tự
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setPhoneInput(numericValue);
      setFormData(prev => ({
        ...prev,
        phoneNumber: numericValue ? parseInt(numericValue) : 0,
      }));
    } else if (name === 'email') {
      // Validate email real-time
      setFormData(prev => ({ ...prev, email: value }));
      if (value && !value.endsWith('@gmail.com')) {
        setEmailError('Email phải có đuôi @gmail.com');
      } else {
        setEmailError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
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
    if (!phoneInput || phoneInput.length !== 10) {
      alert('Số điện thoại phải có đúng 10 số');
      return;
    }
    if (!phoneInput.startsWith('0')) {
      alert('Số điện thoại phải bắt đầu bằng số 0');
      return;
    }
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }
    if (!formData.email.endsWith('@gmail.com')) {
      alert('Email phải có đuôi @gmail.com');
      return;
    }
    if (!formData.shift) {
      alert('Vui lòng chọn ca làm việc');
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
                type="text" 
                name="phoneNumber"
                placeholder="Nhập SDT (10 số, bắt đầu bằng 0)..." 
                value={phoneInput}
                onChange={handleChange}
                maxLength={10}
                required 
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input 
                className={styles.input} 
                type="email" 
                name="email"
                placeholder="Nhập email (@gmail.com)..." 
                value={formData.email}
                onChange={handleChange}
                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                required 
              />
              {emailError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{emailError}</span>}
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

          </div>
=======
import { toast } from "react-toastify";

export default function AddEmployee() {
    const router = useRouter();
    const [formData, setFormData] = useState<NewEmployee>({
        name: "",
        position: "" as EmployeeRole,
        phoneNumber: 0,
        email: "",
        shift: "" as EmployeeShift,
        salary: 1, // Lương mặc định 1 VNĐ (backend yêu cầu > 0)
        employeeStatus: "WORKING" as EmployeeStatus,
    });
    const [phoneInput, setPhoneInput] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            // Chỉ cho phép nhập số, giới hạn 10 ký tự
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setPhoneInput(numericValue);
            setFormData(prev => ({
                ...prev,
                phoneNumber: numericValue ? parseInt(numericValue) : 0,
            }));
        } else if (name === 'email') {
            // Validate email real-time
            setFormData(prev => ({ ...prev, email: value }));
            if (value && !value.endsWith('@gmail.com')) {
                setEmailError('Email phải có đuôi @gmail.com');
            } else {
                setEmailError('');
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.warning('Vui lòng nhập họ tên');
            return;
        }
        if (!formData.position) {
            toast.warning('Vui lòng chọn chức vụ');
            return;
        }
        if (!phoneInput || phoneInput.length !== 10) {
            toast.warning('Số điện thoại phải có đúng 10 số');
            return;
        }
        if (!phoneInput.startsWith('0')) {
            toast.warning('Số điện thoại phải bắt đầu bằng số 0');
            return;
        }
        if (!formData.email.trim()) {
            toast.warning('Vui lòng nhập email');
            return;
        }
        if (!formData.email.endsWith('@gmail.com')) {
            toast.warning('Email phải có đuôi @gmail.com');
            return;
        }
        if (!formData.shift) {
            toast.warning('Vui lòng chọn ca làm việc');
            return;
        }

        try {
            await addEmployee(formData);
            // Only set the success message in sessionStorage, don't show toast here
            sessionStorage.setItem('employeeUpdateSuccess', 'Thêm nhân viên mới thành công!');
            router.push('/employee');
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
            toast.error('Lỗi: Không thể thêm nhân viên. Vui lòng kiểm tra kết nối API.');
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
>>>>>>> dev

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
                                type="text"
                                name="phoneNumber"
                                placeholder="Nhập SDT (10 số, bắt đầu bằng 0)..."
                                value={phoneInput}
                                onChange={handleChange}
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Email <span className={styles.required}>*</span></label>
                            <input
                                className={styles.input}
                                type="email"
                                name="email"
                                placeholder="Nhập email (@gmail.com)..."
                                value={formData.email}
                                onChange={handleChange}
                                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                                required
                            />
                            {emailError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{emailError}</span>}
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