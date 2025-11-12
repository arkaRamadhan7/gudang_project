'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { format } from 'date-fns';
import { useAuth } from "@/app/(auth)/context/authContext";
 
const DiscountManagementPage = () => {
    // State untuk data
    const [products, setProducts] = useState([]);
    const [tokoList, setTokoList] = useState([]);
    const [selectedToko, setSelectedToko] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    
    // State untuk mengontrol UI
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [discountData, setDiscountData] = useState({ DISCOUNT: 0, START_DISC: null, END_DISC: null, HJ:""});
    const [isEditMode, setIsEditMode] = useState(false);
    const toast = useRef(null);
    
    // Menggunakan useAuth context
    const { user } = useAuth();

    // Helper functions untuk cek role
    const isSuperAdmin = () => {
        return user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'super admin';
    };

    const isAdminToko = () => {
        return user?.role === 'Admin Toko';
    };

    // Mengambil data toko saat komponen pertama kali dimuat
    useEffect(() => {
        fetchToko();
    }, []);
    
    // Fetch data user untuk mendapatkan toko yang ditugaskan
    const fetchUserData = useCallback(async () => {
        if (!user?.email) return;
        
        setIsLoadingUser(true);
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            
            if (json.users && Array.isArray(json.users)) {
                // Cari user berdasarkan email yang login
                const currentUser = json.users.find(u => u.email === user.email);
                
                if (currentUser && currentUser.toko) {
                    // Jika user punya toko yang ditugaskan
                    if (isAdminToko() || !isSuperAdmin()) {
                        const tokoUser = tokoList.find(toko => 
                            toko.NAMA === currentUser.toko ||
                            toko.KODE === currentUser.toko ||
                            toko.ID === currentUser.toko
                        );
                        
                        if (tokoUser) {
                            setSelectedToko(tokoUser);
                        } else {
                            // Jika toko tidak ditemukan di daftar
                            toast.current?.show({ 
                                severity: 'warn', 
                                summary: 'Peringatan', 
                                detail: `Toko "${currentUser.toko}" tidak ditemukan dalam sistem`, 
                                life: 5000 
                            });
                        }
                    }
                } else if (isAdminToko()) {
                    // Jika Admin Toko tapi tidak punya toko yang ditugaskan
                    toast.current?.show({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Akun Anda belum ditugaskan ke toko manapun. Hubungi administrator.', 
                        life: 5000 
                    });
                }
            }
        } catch (error) {
            console.error("Gagal mengambil data user", error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal memuat data user', 
                life: 3000 
            });
        } finally {
            setIsLoadingUser(false);
        }
    }, [user, tokoList]);
    
    const fetchToko = async () => {
        try {
            const res = await fetch("/api/toko");
            const json = await res.json();

            if (json.status === "00" && Array.isArray(json.data)) {
                setTokoList(json.data);
            } else if (Array.isArray(json)) {
                setTokoList(json);
            } else {
                setTokoList([]);
            }
        } catch (error) {
            console.error("Gagal ambil data Toko", error);
            setTokoList([]);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal memuat data toko', 
                life: 3000 
            });
        }
    };
    
    // Fetch user data setelah daftar toko tersedia
    useEffect(() => {
        if (tokoList.length > 0 && user) {
            fetchUserData();
        }
    }, [tokoList, user, fetchUserData]);
    
    // Mengambil daftar produk setiap kali toko yang dipilih berubah
    useEffect(() => {
        if (selectedToko && selectedToko.KODE) {
            fetchProducts(selectedToko.KODE);
        } else {
            setProducts([]);
        }
    }, [selectedToko]);

    const fetchProducts = async (kodeToko) => {
        try {
            const response = await fetch(`/api/discount/${kodeToko}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal memuat data produk', 
                life: 3000 
            });
            console.error("Fetch error:", error);
        }
    };


    const handleAddDiscount = async () => {
        if (!selectedProduct || !selectedToko) return;
        try {
            const response = await fetch(`/api/discount/product/${selectedProduct.ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discountData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambah diskon');
            }

            toast.current.show({ 
                severity: 'success', 
                summary: 'Berhasil', 
                detail: 'Diskon berhasil ditambahkan', 
                life: 3000 
            });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: error.message, 
                life: 3000 
            });
        }
    };

    const handleEditDiscount = async () => {
        if (!selectedProduct || !selectedToko) return;
        try {
            const response = await fetch(`/api/discount/product/${selectedProduct.ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discountData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengedit diskon');
            }

            toast.current.show({ 
                severity: 'success', 
                summary: 'Berhasil', 
                detail: 'Diskon berhasil diperbarui', 
                life: 3000 
            });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: error.message, 
                life: 3000 
            });
        }
    };

    const handleDeleteDiscount = async () => { 
        if (!selectedProduct || !selectedToko) return;
        try {
            const response = await fetch(`/api/discount/product/${selectedProduct.ID}`, { 
                method: 'DELETE' 
            });
            
            if (!response.ok) {
                throw new Error('Gagal menghapus diskon');
            }
            
            toast.current.show({ 
                severity: 'success', 
                summary: 'Berhasil', 
                detail: 'Diskon berhasil dihapus', 
                life: 3000 
            });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal menghapus diskon', 
                life: 3000 
            });
        }
    };

    const openDiscountDialog = (product) => {
        setSelectedProduct(product);
        if (product.DISCOUNT > 0) {
            setIsEditMode(true); // Set mode Edit
            setDiscountData({
                DISCOUNT: product.DISCOUNT,
                START_DISC: product.START_DISC ? new Date(product.START_DISC) : null,
                END_DISC: product.END_DISC ? new Date(product.END_DISC) : null,
                HJ: product.HJ
            });
        } else {
            setIsEditMode(false); // Set mode Tambah
            setDiscountData({ DISCOUNT: 0, START_DISC: new Date(), END_DISC: null, HJ: product.HJ });
        }
        setDialogVisible(true);
    };

    const openDeleteDialog = (product) => {
        setSelectedProduct(product);
        setDeleteDialogVisible(true);
    };

    const hideDialogs = () => {
        setDialogVisible(false);
        setDeleteDialogVisible(false);
        setSelectedProduct(null);
    };

    const priceBodyTemplate = (rowData) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0 
        }).format(rowData.HJ || 0);
    };

    const statusBodyTemplate = (rowData) => {
        try {
            if (!rowData.START_DISC || !rowData.END_DISC || !rowData.DISCOUNT || rowData.DISCOUNT <= 0) {
                return <Tag severity={'warning'} value={'TIDAK AKTIF'} />;
            }
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const startStr = format(new Date(rowData.START_DISC), "yyyy-MM-dd");
            const endStr = format(new Date(rowData.END_DISC), "yyyy-MM-dd");
            const isActive = todayStr >= startStr && todayStr <= endStr;
            
            return <Tag severity={isActive ? 'success' : 'warning'} value={isActive ? 'AKTIF' : 'TIDAK AKTIF'} />;
        } catch (error) {
            console.error("Invalid date format:", rowData);
            return <Tag severity={'danger'} value={'TANGGAL ERROR'} />;
        }
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button 
                icon="pi pi-pencil" 
                className="p-button-success" 
                onClick={() => openDiscountDialog(rowData)} 
                tooltip={rowData.DISCOUNT > 0 ? "Edit Diskon" : "Tambah Diskon"} 
                tooltipOptions={{ position: 'top' }}
                size="small"
            />
            {rowData.DISCOUNT > 0 && (
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-danger" 
                    onClick={() => openDeleteDialog(rowData)} 
                    tooltip="Hapus Diskon" 
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
            )}
        </div>
    );

    // Cek apakah dropdown toko harus disabled
    const isTokoDropdownDisabled = () => {
        return isAdminToko() || isLoadingUser;
    };

    // --- Render Komponen ---
    return (
        <div className="card p-4">
            <Toast ref={toast} />
            
            <h1 className="text-2xl font-bold mb-4">Manajemen Diskon Produk</h1>

            <div className="mb-4">
                <label htmlFor="toko-selector" className="font-bold block mb-2">
                    Pilih Toko
                </label>
                {isAdminToko() && (
                    <div className="text-xs text-blue-600 mb-2">
                        ℹ️ Toko ditentukan berdasarkan penugasan akun Anda
                    </div>
                )}
                {!isSuperAdmin() && !isAdminToko() && (
                    <div className="text-xs text-gray-500 mb-2">
                        Toko ditentukan berdasarkan akun Anda
                    </div>
                )}
                <Dropdown
                    id="toko-selector"
                    value={selectedToko}
                    options={Array.isArray(tokoList) ? tokoList : []} 
                    onChange={(e) => setSelectedToko(e.value)}
                    optionLabel="NAMA"
                    placeholder={isLoadingUser ? "Memuat data toko..." : (isSuperAdmin() ? "Pilih sebuah toko" : "Toko Anda")}
                    className="w-full md:w-1/2"
                    showClear={isSuperAdmin()}
                    disabled={isTokoDropdownDisabled()}
                />
            </div>

            <DataTable 
                value={products} 
                responsiveLayout="scroll" 
                paginator 
                rows={10} 
                emptyMessage={selectedToko ? "Tidak ada produk yang ditemukan" : "Pilih toko untuk menampilkan produk"}
                stripedRows
            >
                <Column field="KODE" header="Kode Produk" sortable />
                <Column field="NAMA" header="Nama Produk" sortable />
                <Column field="HJ" header="Harga Normal" body={priceBodyTemplate} sortable />
                <Column 
                    field="DISCOUNT" 
                    header="Diskon (%)" 
                    sortable
                    body={(rowData) => rowData.DISCOUNT ? `${rowData.DISCOUNT}%` : '-'}
                />
                <Column header="Status Diskon" body={statusBodyTemplate} />
                <Column header="Aksi" body={actionBodyTemplate} />
            </DataTable>
            
            <Dialog 
                visible={isDialogVisible} 
                style={{ width: '450px' }} 
                header={isEditMode ? "Edit Diskon Produk" : "Tambah Diskon Produk"} 
                modal 
                onHide={hideDialogs} 
                footer={ 
                    <div> 
                        <Button 
                            label="Batal" 
                            icon="pi pi-times" 
                            onClick={hideDialogs} 
                            className="p-button-text" 
                        /> 
                        <Button 
                            label="Simpan" 
                            icon="pi pi-check" 
                            onClick={isEditMode ? handleEditDiscount : handleAddDiscount} 
                        /> 
                    </div> 
                }
            >
                <div className="p-fluid">
                    {selectedProduct && (
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <div className="font-semibold">{selectedProduct.NAMA}</div>
                            <div className="text-sm text-gray-600">Kode: {selectedProduct.KODE}</div>
                            <div className="text-sm text-gray-600">Harga: {priceBodyTemplate(selectedProduct)}</div>
                        </div>
                    )}
                    
                    <div className="p-field mb-3">
                        <label htmlFor="discount">Diskon (%)</label>
                        <InputNumber 
                            id="discount" 
                            value={discountData.DISCOUNT} 
                            onValueChange={(e) => setDiscountData({...discountData, DISCOUNT: e.value})} 
                            mode="decimal"
                            min={0}
                            max={100}
                            suffix="%"
                        />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="start_date">Tanggal Mulai</label>
                        <Calendar 
                            id="start_date" 
                            value={discountData.START_DISC} 
                            onChange={(e) => setDiscountData({...discountData, START_DISC: e.value})} 
                            showIcon 
                            dateFormat="dd/mm/yy"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="end_date">Tanggal Selesai</label>
                        <Calendar 
                            id="end_date" 
                            value={discountData.END_DISC} 
                            onChange={(e) => setDiscountData({...discountData, END_DISC: e.value})} 
                            showIcon 
                            dateFormat="dd/mm/yy"
                            minDate={discountData.START_DISC}
                        />
                    </div>
                </div> 
            </Dialog>
            
            <Dialog 
                visible={isDeleteDialogVisible} 
                style={{ width: '32rem' }} 
                header="Konfirmasi Hapus Diskon" 
                modal 
                onHide={hideDialogs} 
                footer={ 
                    <div> 
                        <Button 
                            label="Tidak" 
                            icon="pi pi-times" 
                            onClick={hideDialogs} 
                            className="p-button-text" 
                        /> 
                        <Button 
                            label="Ya, Hapus" 
                            icon="pi pi-check" 
                            onClick={handleDeleteDiscount} 
                            className="p-button-danger" 
                        /> 
                    </div> 
                }
            >
                <div className="flex align-items-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    <span>
                        Anda yakin ingin menghapus diskon dari produk <strong>{selectedProduct?.NAMA}</strong>? 
                        <br/>Harga akan kembali normal.
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default DiscountManagementPage;