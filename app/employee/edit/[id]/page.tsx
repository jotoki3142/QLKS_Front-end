"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEmployeeById, updateEmployee, NewEmployee, EmployeeRole, EmployeeShift, EmployeeStatus } from "@/utils/api";
<<<<<<< HEAD

export default function EditEmployee({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<NewEmployee>({
    name: "",
    position: "" as EmployeeRole,
    phoneNumber: 0,
    email: "",
    shift: "" as EmployeeShift,
    salary: 0,
    employeeStatus: "WORKING" as EmployeeStatus,
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const loadEmployee = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setEmployeeId(id);
      
      try {
        const employee = await getEmployeeById(id);
        const phoneStr = employee.phoneNumber.toString();
        setPhoneInput(phoneStr);
        setFormData({
          name: employee.name,
          position: employee.position,
          phoneNumber: employee.phoneNumber,
          email: employee.email,
          shift: employee.shift,
          salary: employee.salary,
          employeeStatus: employee.employeeStatus,
        });
      } catch (error) {
        console.error("Lỗi khi tải thông tin nhân viên:", error);
        alert("Không thể tải thông tin nhân viên");
      } finally {
        setLoading(false);
      }
    };
    loadEmployee();
  }, [params]);

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
        [name]: name === 'salary' 
          ? (value ? parseFloat(value) : 0) 
          : value,
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
    if (formData.salary <= 0) {
      alert('Lương phải lớn hơn 0');
      return;
    }

    if (!employeeId) return;

    try {
      await updateEmployee(employeeId, formData);
      alert('Cập nhật nhân viên thành công!');
      router.push('/employee');
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      alert('Lỗi: Không thể cập nhật nhân viên.');
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div>Đang tải...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>Cập nhật nhân viên</h1>
              <p className={styles.headerSubtitle}>Cập nhật thông tin nhân viên</p>
            </div>
          </div>
          <Link href="/employee" className={styles.backBtn}>← Quay lại</Link>
        </div>
      </section>

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>
                Họ tên <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ tên..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Chức vụ <span className={styles.required}>*</span>
              </label>
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
              <label className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                name="phoneNumber"
                value={phoneInput}
                onChange={handleChange}
                placeholder="Nhập SDT (10 số, bắt đầu bằng 0)..."
                maxLength={10}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email (@gmail.com)..."
                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                required
              />
              {emailError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{emailError}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ca làm việc <span className={styles.required}>*</span>
              </label>
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
              <label className={styles.label}>
                Lương <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="number"
                name="salary"
                value={formData.salary || ''}
                onChange={handleChange}
                placeholder="Nhập lương..."
                min="0"
                step="1000"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Trạng thái <span className={styles.required}>*</span>
              </label>
              <select 
                className={styles.select} 
                name="employeeStatus"
                value={formData.employeeStatus}
                onChange={handleChange}
                required
              >
                <option value="WORKING">Đang làm</option>
                <option value="RESIGNED">Nghỉ việc</option>
              </select>
            </div>
          </div>
=======
import { toast } from "react-toastify";

export default function EditEmployee({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<NewEmployee>({
        name: "",
        position: "" as EmployeeRole,
        phoneNumber: 0,
        email: "",
        shift: "" as EmployeeShift,
        salary: 0,
        employeeStatus: "WORKING" as EmployeeStatus,
    });
    const [phoneInput, setPhoneInput] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        const loadEmployee = async () => {
            const resolvedParams = await params;
            const id = parseInt(resolvedParams.id);
            setEmployeeId(id);

            try {
                const employee = await getEmployeeById(id);
                const phoneStr = employee.phoneNumber.toString();
                setPhoneInput(phoneStr);
                setFormData({
                    name: employee.name,
                    position: employee.position,
                    phoneNumber: employee.phoneNumber,
                    email: employee.email,
                    shift: employee.shift,
                    salary: employee.salary,
                    employeeStatus: employee.employeeStatus,
                });
            } catch (error) {
                console.error("Lỗi khi tải thông tin nhân viên:", error);
                toast.error("Không thể tải thông tin nhân viên");
            } finally {
                setLoading(false);
            }
        };
        loadEmployee();
    }, [params]);

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
                [name]: name === 'salary'
                    ? (value ? parseFloat(value) : 0)
                    : value,
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
        if (formData.salary <= 0) {
            toast.warning('Lương phải lớn hơn 0');
            return;
        }

        if (!employeeId) return;
>>>>>>> dev

        try {
            await updateEmployee(employeeId, formData);
            // Only set the success message in sessionStorage, don't show toast here
            sessionStorage.setItem('employeeUpdateSuccess', 'Cập nhật nhân viên thành công!');
            router.push('/employee');
        } catch (error) {
            console.error("Lỗi khi cập nhật nhân viên:", error);
            toast.error('Lỗi: Không thể cập nhật nhân viên.');
        }
    };

    if (loading) {
        return (
            <main className={styles.main}>
                <div>Đang tải...</div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div className={styles.headerLeft}>
                        <div>
                            <h1 className={styles.headerTitle}>Cập nhật nhân viên</h1>
                            <p className={styles.headerSubtitle}>Cập nhật thông tin nhân viên</p>
                        </div>
                    </div>
                    <Link href="/employee" className={styles.backBtn}>← Quay lại</Link>
                </div>
            </section>

            <section className={styles.card}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Họ tên <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập họ tên..."
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Chức vụ <span className={styles.required}>*</span>
                            </label>
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
                            <label className={styles.label}>
                                Số điện thoại <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="text"
                                name="phoneNumber"
                                value={phoneInput}
                                onChange={handleChange}
                                placeholder="Nhập SDT (10 số, bắt đầu bằng 0)..."
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Email <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email (@gmail.com)..."
                                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                                required
                            />
                            {emailError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{emailError}</span>}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Ca làm việc <span className={styles.required}>*</span>
                            </label>
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
                            <label className={styles.label}>
                                Lương <span className={styles.required}>*</span>
                            </label>
                            <input
                                className={styles.input}
                                type="number"
                                name="salary"
                                value={formData.salary || ''}
                                onChange={handleChange}
                                placeholder="Nhập lương..."
                                min="0"
                                step="1000"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Trạng thái <span className={styles.required}>*</span>
                            </label>
                            <select
                                className={styles.select}
                                name="employeeStatus"
                                value={formData.employeeStatus}
                                onChange={handleChange}
                                required
                            >
                                <option value="WORKING">Đang làm</option>
                                <option value="RESIGNED">Nghỉ việc</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryBtn}>
                            Cập nhật nhân viên
                        </button>
                        <Link href="/employee" className={styles.cancelBtn}>
                            × Hủy
                        </Link>
                    </div>
                </form>
            </section>
        </main>
    );
}