"use client";

import { useState } from "react";
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
  // Danh sách quốc gia (inline theo yêu cầu không tạo file mới)
  const COUNTRIES = [
    "Chọn quốc tịch",
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Úc",
    "Áo",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Bỉ",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Campuchia",
    "Cameroon",
    "Canada",
    "Cộng hòa Trung Phi",
    "Chad",
    "Chile",
    "Trung Quốc",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Bờ Biển Ngà",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Séc (Cộng hòa Séc)",
    "Đan Mạch",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Cộng hòa Dân chủ Công-gô",
    "Ecuador",
    "Ai Cập",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Phần Lan",
    "Pháp",
    "Gabon",
    "Gambia",
    "Georgia",
    "Đức",
    "Ghana",
    "Hy Lạp",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Holy See",
    "Honduras",
    "Hungary",
    "Iceland",
    "Ấn Độ",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Ý",
    "Jamaica",
    "Nhật Bản",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Lào",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Quần đảo Mác-san",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mông Cổ",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Hà Lan",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Triều Tiên (Bắc Hàn)",
    "North Macedonia",
    "Na Uy",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Ba Lan",
    "Bồ Đào Nha",
    "Qatar",
    "Romania",
    "Nga",
    "Rwanda",
    "Saint Kitts & Nevis",
    "Saint Lucia",
    "Samoa",
    "San Marino",
    "Sao Tome & Principe",
    "Ả Rập Xê-út",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "Nam Phi",
    "Hàn Quốc",
    "South Sudan",
    "Tây Ban Nha",
    "Sri Lanka",
    "St. Vincent & Grenadines",
    "State of Palestine",
    "Sudan",
    "Suriname",
    "Thụy Điển",
    "Thụy Sĩ",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thái Lan",
    "Đông Timor",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "Các Tiểu Vương Quốc Ả Rập Thống Nhất",
    "Vương quốc Anh",
    "Hoa Kỳ (Mỹ)",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Việt Nam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];
  const [form, setForm] = useState<CustomerForm>({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    nationality: "Chọn quốc tịch",
    address: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };
  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return toast.error("Vui lòng nhập HỌ TÊN."), false;
    if (!/^\d^[0-9]{12}$/.test(form.nationalId.trim())) return toast.error("CCCD phải là 12 chữ số."), false;
    if (!/^\d^(0[0-9]{9})$/.test(form.phone.trim())) return toast.error("Số điện thoại phải có 10 số và bắt đầu bằng 0."), false;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Email không hợp lệ."), false;
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/customers/api/add", {
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
          <a href="/customer" className={styles.backBtn}>↶ Quay lại</a>
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
              <input name="nationalId" className={styles.input} value={form.nationalId} onChange={onChange} placeholder="Nhập CCCD..." required />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Số điện thoại<span className={styles.required}>*</span></label>
              <input name="phone" className={styles.input} value={form.phone} onChange={onChange} placeholder="Nhập số điện thoại..." required />
            </div>
            <div>
              <label className={styles.label}>Email</label>
              <input name="email" className={styles.input} value={form.email} onChange={onChange} placeholder="Nhập email..." />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Quốc tịch</label>
              <select name="nationality" className={styles.select} value={form.nationality} onChange={onSelectChange}>
                {COUNTRIES.map((c) => (
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
