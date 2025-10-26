
'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addService, NewService } from '@/utils/api';

const AddServicePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<NewService>({
        tenDichVu: '',
        moTa: '',
        gia: 0,
        loaiDichVu: '',
        trangThai: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: id === 'gia' ? (value ? parseFloat(value) : 0) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(formData.gia) || formData.gia <= 0) {
            alert('Giá dịch vụ phải là số dương.');
            return;
        }

        try {
            await addService(formData);
            alert('Thêm dịch vụ mới thành công!');
            router.push('/service');
        } catch (error) {
            console.error("Lỗi khi thêm dịch vụ:", error);
            alert('Lỗi: Không thể thêm dịch vụ. Vui lòng kiểm tra lại dữ liệu và kết nối API.');
        }
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.formHeader}>
                <h2>+ Thêm dịch vụ mới</h2>
                <p>Thêm dịch vụ mới vào danh sách</p>
                <Link href="/service" className={styles.backButton}>
                    ← Quay lại
                </Link>
            </header>

            <div className={styles.formContainer}>
                <form className={styles.serviceForm} onSubmit={handleSubmit}>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="tenDichVu">Tên dịch vụ</label>
                            <input id="tenDichVu" placeholder="Nhập tên dịch vụ..." required value={formData.tenDichVu} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="loaiDichVu">Loại dịch vụ</label>
                            <input id="loaiDichVu" placeholder="Nhập loại dịch vụ..." required value={formData.loaiDichVu} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="moTa">Mô tả</label>
                            <input id="moTa" placeholder="Nhập mô tả..." required value={formData.moTa} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="trangThai">Trạng thái</label>
                            <select id="trangThai" required value={formData.trangThai} onChange={handleChange}>
                                <option value="">Chọn trạng thái</option>
                                <option value="Hoạt động">Hoạt động</option>
                                <option value="Không hoạt động">Không hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="gia">Giá</label>
                            <input id="gia" type="number" placeholder="Nhập giá dịch vụ..." required value={formData.gia || ''} onChange={handleChange} min="0" step="1000" />
                        </div>
                        <div className={styles.formGroupSpacer}></div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            + Thêm dịch vụ mới
                        </button>
                        <Link href="/service" className={styles.cancelButton}>
                            x Hủy
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddServicePage;