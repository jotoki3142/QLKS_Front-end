
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { getServices, deleteService, Service, PagedResponse } from '@/utils/api';

const ServiceManagementPage = () => {
    const [servicesData, setServicesData] = useState<PagedResponse<Service> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchServices = useCallback(async (page: number, currentKeyword: string) => {
        setLoading(true);
        try {
            const data = await getServices(page, pageSize, currentKeyword);
            setServicesData(data);
            setCurrentPage(page);
        } catch (error) {
            console.error("Lỗi khi fetch dịch vụ:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices(0, searchKeyword);
    }, [fetchServices, searchKeyword]);

    const handleSearch = () => {
        setSearchKeyword(keyword);
    };

    const handlePageChange = (page: number) => {
        if (servicesData && page >= 0 && page < servicesData.totalPages) {
            fetchServices(page, searchKeyword);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            try {
                await deleteService(id);
                alert('Xóa dịch vụ thành công!');
                fetchServices(currentPage, searchKeyword);
            } catch (error) {
                console.error("Lỗi khi xóa dịch vụ:", error);
                alert('Lỗi: Không thể xóa dịch vụ.');
            }
        }
    };

    if (loading && !servicesData) return <div className={styles.container}>Đang tải dịch vụ...</div>;

    const services = servicesData?.content || [];
    const pageNumber = servicesData?.number ?? 0;
    const totalPages = servicesData?.totalPages ?? 1;
    const totalElements = servicesData?.totalElements ?? 0;

    return (
        <div className={styles.container}>

            <div className={styles.titleSection}>
                <h2>Quản lý dịch vụ</h2>
                <p>Quản lý dịch vụ trong khách sạn</p>
            </div>

            {/* Thanh tìm kiếm và bộ lọc */}
            <div className={styles.filterSection}>
                <div className={styles.inputGroup}>
                    <label htmlFor="search">🔍 Tìm kiếm dịch vụ</label>
                    <input
                        id="search"
                        placeholder="Nhập tên dịch vụ..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="type"> Loại dịch vụ</label>
                    <select id="type"><option>Tất cả loại</option></select>
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="status"> Trạng thái</label>
                    <select id="status"><option>Tất cả</option></select>
                </div>
                <button className={styles.searchButton} onClick={handleSearch}>Tìm kiếm</button>
                <button className={styles.clearButton} onClick={() => {setKeyword(''); setSearchKeyword('');}}>🗑️ Xóa bộ lọc</button>
            </div>

            <hr className={styles.divider} />

            <div className={styles.tableHeader}>
                <span>⚠️ Hiển thị {services.length}/{totalElements} dịch vụ (Trang {pageNumber + 1}/{totalPages})</span>
                <Link href="/service/add" className={styles.addButton}>
                    + Thêm dịch vụ mới
                </Link>
            </div>

            <table className={styles.dataTable}>
                <thead>
                <tr>
                    <th>Mã DV</th>
                    <th>Tên dịch vụ</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th>Loại dịch vụ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {services.map((service) => (
                    <tr key={service.id}>
                        <td>{service.id}</td>
                        <td>{service.tenDichVu}</td>
                        <td>{service.moTa}</td>
                        <td>{service.gia.toLocaleString('vi-VN')} VND</td>
                        <td>{service.loaiDichVu}</td>
                        <td>{service.trangThai}</td>
                        <td>
                            <Link href={`/service/edit/${service.id}`} className={styles.actionButton}>
                                Cập nhật
                            </Link>
                            <button className={styles.deleteButton} onClick={() => handleDelete(service.id)}>
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Phân trang */}
            <div className={styles.pagination}>
                <span onClick={() => handlePageChange(0)} className={pageNumber === 0 ? styles.disabled : ''}>&lt;&lt;</span>
                <span onClick={() => handlePageChange(pageNumber - 1)} className={pageNumber === 0 ? styles.disabled : ''}>&lt;</span>
                {[...Array(totalPages)].map((_, i) => (
                    <span
                        key={i}
                        className={i === pageNumber ? styles.activePage : ''}
                        onClick={() => handlePageChange(i)}
                    >
                    {i + 1}
                </span>
                ))}
                <span onClick={() => handlePageChange(pageNumber + 1)} className={pageNumber === totalPages - 1 ? styles.disabled : ''}>&gt;</span>
                <span onClick={() => handlePageChange(totalPages - 1)} className={pageNumber === totalPages - 1 ? styles.disabled : ''}>&gt;&gt;</span>
            </div>
        </div>
    );
};

export default ServiceManagementPage;