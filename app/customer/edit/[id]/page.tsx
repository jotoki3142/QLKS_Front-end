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
  // Danh sách quốc gia (inline theo yêu cầu không tạo file mới)
  const COUNTRIES = [
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
    nationality: "",
    address: "",
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/customers/api/detail/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load customer");
        const c: BackendCustomerDetail = await res.json();
        setForm({
          fullName: c.fullName ?? "",
          nationalId: c.nationalId ?? "",
          phone: c.phone ?? "",
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
    setForm((s) => ({ ...s, [name]: value }));
  };
  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return toast.error("Vui lòng nhập HỌ TÊN."), false;
    if (!/^\d{9,12}$/.test(form.nationalId.trim())) return toast.error("CCCD phải là 9-12 chữ số."), false;
    if (!/^\d{9,11}$/.test(form.phone.trim())) return toast.error("SĐT phải là 9-11 chữ số."), false;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Email không hợp lệ."), false;
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !id) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/api/update/${id}`, {
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
      <div className={styles.container}>
        <h1 className={styles.title}>Cập nhật khách hàng</h1>
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Họ tên</label>
              <input name="fullName" className={styles.input} value={form.fullName} onChange={onChange} required />
            </div>
            <div>
              <label className={styles.label}>CCCD</label>
              <input name="nationalId" className={styles.input} value={form.nationalId} onChange={onChange} required />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>SĐT</label>
              <input name="phone" className={styles.input} value={form.phone} onChange={onChange} required />
            </div>
            <div>
              <label className={styles.label}>Email</label>
              <input name="email" className={styles.input} value={form.email} onChange={onChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Quốc tịch</label>
              <select name="nationality" className={styles.input} value={form.nationality} onChange={onSelectChange}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Địa chỉ</label>
              <input name="address" className={styles.input} value={form.address} onChange={onChange} />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving} className={styles.submit}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
            <a href="/customer" className={styles.cancel}>Hủy</a>
          </div>
        </form>
      </div>
    </main>
  );
}
