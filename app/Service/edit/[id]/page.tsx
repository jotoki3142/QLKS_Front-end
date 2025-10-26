
'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../add/page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateService, getServiceById, NewService } from '@/utils/api';

interface EditServicePageProps {
    params: {
        id: string;
    };
}

const EditServicePage = ({ params }: EditServicePageProps) => {
    const router = useRouter();
    const serviceId = Number(params.id);
    const [formData, setFormData] = useState<NewService | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentService = async () => {
            if (isNaN(serviceId)) {
                alert("ID dịch vụ không hợp lệ.");
                setLoading(false);
                return;
            }
            try {
                const data = await getServiceById(serviceId);
                // Loại bỏ ID khỏi data
                const { id, ...rest } = data;
                setFormData(rest);
            } catch (error) {
                console.error("Lỗi khi fetch dịch vụ:", error);
                alert('Không tìm thấy dịch vụ hoặc lỗi kết nối API.');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentService();
    }, [serviceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (formData) {
            setFormData(prev => ({
                ...prev!,
                [id]: id === 'gia' ? (value ? parseFloat(value) : 0) : value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        if (isNaN(formData.gia) || formData.gia <= 0) {
            alert('Giá dịch vụ phải là số dương.');
            return;
        }

        try {
            await updateService(serviceId, formData);
            alert('Cập nhật dịch vụ thành công!');
            router.push('/service');
        } catch (error) {
            console.error("Lỗi khi cập nhật dịch vụ:", error);
            alert('Lỗi: Không thể cập nhật dịch vụ. Vui lòng kiểm tra kết nối API.');
        }
    };

    if (loading) return <div className={styles.wrapper}>Đang tải thông tin dịch vụ...</div>;
    if (!formData) return <div className={styles.wrapper}>Không tìm thấy dữ liệu dịch vụ.</div>;


    return (
        <div className={styles.wrapper}>
            <header className={styles.formHeader}>
                <h2>Cập nhật dịch vụ</h2>
                <p>Cập nhật thông tin dịch vụ</p>
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
                            <input id="gia" type="number" placeholder="Nhập giá dịch vụ..." required value={formData.gia} onChange={handleChange} min="0" step="1000" />
                        </div>
                        <div className={styles.formGroupSpacer}></div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            📄 Cập nhật dịch vụ mới
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

export default EditServicePage;