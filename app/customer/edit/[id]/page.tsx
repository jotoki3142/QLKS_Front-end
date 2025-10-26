"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface BackendCustomerDetail {
  customerId: number;
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  nationality?: string;
  address?: string;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<string[]>(["Chọn quốc gia"]);
  const [form, setForm] = useState<CustomerForm>({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    nationality: "",
    address: "",
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        // Load customer details and nationalities in parallel
        const [customerRes, nationalitiesRes] = await Promise.all([
          fetch(`/api/customer/api/detail/${id}`, { cache: "no-store" }),
          fetch("/api/nationalities", { cache: "no-store" })
        ]);

        if (!customerRes.ok) throw new Error("Failed to load customer");
        const c: BackendCustomerDetail = await customerRes.json();
        
        // Load nationalities
        if (nationalitiesRes.ok) {
          const nationalitiesData: string[] = await nationalitiesRes.json();
          console.log("Received nationalities data:", nationalitiesData);
          setCountries(["Chọn quốc gia", ...nationalitiesData]);
        } else {
          const errorText = await nationalitiesRes.text();
          console.warn("Failed to load nationalities. Status:", nationalitiesRes.status, "Error:", errorText);
          console.warn("Using fallback countries list");
        }

        const rawPhone = String(c.phone ?? "");
        const normalizedPhone = /^\d{9}$/.test(rawPhone) ? ("0" + rawPhone) : rawPhone;
        setForm({
          fullName: c.fullName ?? "",
          nationalId: c.nationalId ?? "",
          phone: normalizedPhone,
          email: c.email ?? "",
          nationality: c.nationality ?? "",
          address: c.address ?? "",
        });
      } catch (e) {
        console.error(e);
        toast.error("Không tải được dữ liệu khách hàng");
        router.push("/customer");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

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
    
    // CCCD validation
    if (!trimmedNationalId) return toast.error("Vui lòng nhập CCCD."), false;
    if (trimmedNationalId.length !== 12) return toast.error(`CCCD phải có đúng 12 chữ số (hiện tại: ${trimmedNationalId.length}).`), false;
    if (!/^\d{12}$/.test(trimmedNationalId)) return toast.error("CCCD chỉ được chứa các chữ số."), false;
    
    // Phone validation
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
    if (saving || !id) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/customer/api/update/${id}`, {
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

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      toast.success("Cập nhật thành công!");
      router.push("/customer");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Đang tải...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Cập nhật khách hàng</h1>
            <p className={styles.pageSubtitle}>Cập nhật thông tin khách hàng</p>
          </div>
          <div className={styles.headerRight}>
            <button onClick={() => router.push("/customer")} className={styles.backButton}>
              ← Quay lại
            </button>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {/* <h1 className={styles.title}>Cập nhật khách hàng</h1> */}
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
                placeholder="Nhập 12 chữ số CCCD..." 
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
              placeholder="Nhập 10 chữ số SĐT (bắt đầu bằng 0)..." 
              maxLength={10}
              pattern="0\d{9}"
              title="Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"
              required 
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
              <select name="nationality" className={styles.input} value={form.nationality} onChange={onSelectChange}>
                <option value="">Chọn quốc tịch</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Địa chỉ</label>
              <textarea 
                name="address" 
                className={styles.input} 
                value={form.address} 
                onChange={onChange} 
                placeholder="Nhập địa chỉ..."
                rows={3}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving} className={styles.submit}>
               {saving ? "Đang cập nhật..." : "Cập nhật khách hàng"}
            </button>
            <button type="button" onClick={() => router.push("/customer")} className={styles.cancel}>
              ✕ Hủy
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
