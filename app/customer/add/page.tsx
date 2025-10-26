"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { toast } from "react-toastify";

interface CustomerForm {
  fullName: string;
  nationalId: string; // CCCD
  phone: string;
  email: string;
  nationality: string;
  address: string;
}

export default function AddCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<string[]>(["Chọn quốc tịch"]);
  const [form, setForm] = useState<CustomerForm>({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    nationality: "Chọn quốc tịch",
    address: "",
  });

  useEffect(() => {
    const loadNationalities = async () => {
      try {
        console.log("Attempting to fetch nationalities from /api/nationalities");
        const res = await fetch("/api/nationalities", { cache: "no-store" });
        console.log("Response status:", res.status, "OK:", res.ok);
        
        if (res.ok) {
          const nationalitiesData: string[] = await res.json();
          console.log("Received nationalities data:", nationalitiesData);
          setCountries(["Chọn quốc tịch", ...nationalitiesData]);
        } else {
          const errorText = await res.text();
          console.warn("Failed to load nationalities. Status:", res.status, "Error:", errorText);
          console.warn("Backend nationalities API not available");
        }
      } catch (e) {
        console.error("Error loading nationalities:", e);
        console.warn("Using fallback countries list");
      }
    };
    loadNationalities();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Restrict CCCD to numbers only and max 12 digits
    if (name === 'nationalId') {
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setForm((s) => ({ ...s, [name]: numericValue }));
      return;
    }
    
    // Restrict phone to numbers only and max 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setForm((s) => ({ ...s, [name]: numericValue }));
      return;
    }
    
    setForm((s) => ({ ...s, [name]: value }));
  };
  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const trimmedName = form.fullName.trim();
    const trimmedNationalId = form.nationalId.trim();
    const trimmedPhone = form.phone.trim();
    
    if (!trimmedName) return toast.error("Vui lòng nhập HỌ TÊN."), false;
    
    // Debug CCCD - Now supports 12 digits with long type
    console.log("CCCD value:", `"${trimmedNationalId}"`, "Length:", trimmedNationalId.length);
    if (!trimmedNationalId) return toast.error("Vui lòng nhập CCCD."), false;
    if (trimmedNationalId.length !== 12) return toast.error(`CCCD phải có đúng 12 chữ số (hiện tại: ${trimmedNationalId.length}).`), false;
    if (!/^\d{12}$/.test(trimmedNationalId)) return toast.error("CCCD chỉ được chứa các chữ số."), false;
    
    // Debug Phone
    console.log("Phone value:", `"${trimmedPhone}"`, "Length:", trimmedPhone.length);
    if (!trimmedPhone) return toast.error("Vui lòng nhập số điện thoại."), false;
    if (trimmedPhone.length !== 10) return toast.error(`Số điện thoại phải có đúng 10 chữ số (hiện tại: ${trimmedPhone.length}).`), false;
    if (!/^0\d{9}$/.test(trimmedPhone)) return toast.error("Số điện thoại phải bắt đầu bằng 0 và chỉ chứa các chữ số."), false;
    
    // Email validation (now required)
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) return toast.error("Vui lòng nhập email."), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return toast.error("Email không hợp lệ."), false;
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/customer/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          nationalId: form.nationalId.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          nationality: form.nationality.trim() || null,
          address: form.address.trim() || null,
        }),
      });

      if (res.status === 409) {
        toast.error("Khách hàng đã tồn tại (CCCD/SĐT trùng). Hãy kiểm tra lại.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      toast.success("Thêm khách hàng thành công!");
      router.push("/customer");
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi khi lưu khách hàng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>+ Thêm khách hàng mới</h1>
            <p className={styles.pageSubtitle}>Thêm khách hàng mới vào danh sách</p>
          </div>
          <a href="/customer" className={styles.backBtn}> ← Quay lại</a>
        </div>
      </section>

      <div className={styles.container}>
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Họ tên<span className={styles.required}>*</span></label>
              <input name="fullName" className={styles.input} value={form.fullName} onChange={onChange} placeholder="Nhập họ tên..." required />
            </div>
            <div>
              <label className={styles.label}>CCCD<span className={styles.required}>*</span></label>
              <input 
                name="nationalId" 
                className={styles.input} 
                value={form.nationalId} 
                onChange={onChange} 
                placeholder="Nhập số CCCD..." 
                maxLength={12}
                pattern="\d{12}"
                title="CCCD phải có đúng 12 chữ số"
                required 
              />
              <small style={{color: '#666', fontSize: '12px'}}>Hiện tại: {form.nationalId.length}/12 ký tự</small>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Số điện thoại<span className={styles.required}>*</span></label>
              <input 
                type="text"
                name="phone" 
                className={styles.input} 
                value={form.phone} 
                onChange={onChange} 
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Nhập số điện thoại..." 
                maxLength={10}
                // // pattern="0\d{9}"
                // // title="Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"
                // required
              />
              <small style={{color: '#666', fontSize: '12px'}}>Hiện tại: {form.phone.length}/10 ký tự</small>
            </div>
            <div>
              <label className={styles.label}>Email<span className={styles.required}>*</span></label>
              <input name="email" className={styles.input} value={form.email} onChange={onChange} placeholder="Nhập email..." required />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Quốc tịch</label>
              <select name="nationality" className={styles.select} value={form.nationality} onChange={onSelectChange}>
                {countries.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Địa chỉ</label>
              <input name="address" className={styles.input} value={form.address} onChange={onChange} placeholder="Nhập địa chỉ...." />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving} className={styles.primary}>
              {saving ? "Đang lưu..." : "+ Thêm khách hàng mới"}
            </button>
            <a href="/customer" className={styles.secondary}>x Hủy</a>
          </div>
        </form>
      </div>
    </main>
  );
}
