'use client';

import React, { useState, useEffect, useRef } from 'react';
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
 
const DiscountManagementPage = () => {
    // State untuk data
    const [products, setProducts] = useState([]);
    const [tokoList, setTokoList] = useState([]);
    const [selectedToko, setSelectedToko] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // State untuk mengontrol UI
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [discountData, setDiscountData] = useState({ DISCOUNT: 0, START_DISC: null, END_DISC: null, HJ:""});
    const [isEditMode, setIsEditMode] = useState(false);
    const toast = useRef(null);

    // Mengambil daftar toko saat komponen pertama kali dimuat
    useEffect(() => {
        fetchToko();
    }, []);
    
    const fetchToko = async () => {
        try {
            const res = await fetch("/api/toko");
            const json = await res.json();

            // Pengecekan keamanan jika API mengembalikan struktur { status, data }
            if (json && Array.isArray(json.data)) {
                setTokoList(json.data);
            } else if (Array.isArray(json)) {
                setTokoList(json);
            } else {
                setTokoList([]);
            }
        } catch (error) {
            console.error("Gagal ambil data Toko", error);
            setTokoList([]);
        }
    };
    
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
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data produk', life: 3000 });
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

            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Diskon berhasil ditambahkan', life: 3000 });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
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

            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Diskon berhasil diperbarui', life: 3000 });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        }
    };

    const handleDeleteDiscount = async () => { 
        if (!selectedProduct || !selectedToko) return;
        try {
            await fetch(`/api/discount/product/${selectedProduct.ID}`, { method: 'DELETE' });
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Diskon berhasil dihapus', life: 3000 });
            fetchProducts(selectedToko.KODE);
            hideDialogs();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus diskon', life: 3000 });
        }
    };

    const openDiscountDialog = (product) => {
        setSelectedProduct(product);
        if (product.DISCOUNT > 0) {
            setIsEditMode(true); 
            setDiscountData({
                DISCOUNT: product.DISCOUNT,
                START_DISC: new Date(product.START_DISC),
                END_DISC: new Date(product.END_DISC),
                HJ: product.HJ
            });
        } else {
            setIsEditMode(false); 
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


    const priceBodyTemplate = (rowData) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rowData.HJ);

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
        <div>
            <Button icon="pi pi-pencil" className=" mr-1 p-button-success p-mr-2" onClick={() => openDiscountDialog(rowData)} tooltip={rowData.DISCOUNT > 0 ? "Edit Diskon" : "Tambah Diskon"} tooltipOptions={{ position: 'top' }} />
            {rowData.DISCOUNT > 0 && (
                <Button icon="pi pi-trash" className="ml-1 p-button-warning" onClick={() => openDeleteDialog(rowData)} tooltip="Hapus Diskon" tooltipOptions={{ position: 'top' }} />
            )}
        </div>
    );

    // --- Render Komponen ---
    return (
        <div className="card p-4">
            <Toast ref={toast} />

            <div className="mb-4">
                <label htmlFor="toko-selector" className="font-bold block mb-2">Pilih Toko</label>
                <Dropdown
                    id="toko-selector"
                    value={selectedToko}
                    options={Array.isArray(tokoList) ? tokoList : []} 
                    onChange={(e) => setSelectedToko(e.value)}
                    optionLabel="NAMA"
                    placeholder="Pilih sebuah toko"
                    className="w-full md:w-1/4"
                    showClear
                />
            </div>

            <DataTable value={products} responsiveLayout="scroll" paginator rows={10} emptyMessage="Pilih toko untuk menampilkan produk.">
                <Column field="NAMA" header="Nama Produk" sortable />
                <Column field="KODE" header="Kode Produk" />
                <Column field="HJ" header="Harga Normal" body={priceBodyTemplate} sortable />
                <Column header="Status Diskon" body={statusBodyTemplate} />
                <Column header="Aksi" body={actionBodyTemplate} />
            </DataTable>
            
            <Dialog 
                visible={isDialogVisible} 
                style={{ width: '450px' }} 
                header="Detail Diskon Produk" 
                modal 
                onHide={hideDialogs} 
                footer={ 
                    <div> 
                        <Button label="Batal" icon="pi pi-times" onClick={hideDialogs} className="p-button-text" /> 
                        <Button 
                            label="Simpan" 
                            icon="pi pi-check" 
                            onClick={handleEditDiscount} 
                        /> 
                    </div> 
                }
            >
                <div className="p-fluid">
                    <div className="p-field mb-3">
                        <label htmlFor="discount">Diskon (%)</label>
                        <InputNumber id="discount" value={discountData.DISCOUNT} onValueChange={(e) => setDiscountData({...discountData, DISCOUNT: e.value})} mode="decimal" />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="start_date">Tanggal Mulai</label>
                        <Calendar id="start_date" value={discountData.START_DISC} onChange={(e) => setDiscountData({...discountData, START_DISC: e.value})} showIcon />
                    </div>
                    <div className="p-field">
                        <label htmlFor="end_date">Tanggal Selesai</label>
                        <Calendar id="end_date" value={discountData.END_DISC} onChange={(e) => setDiscountData({...discountData, END_DISC: e.value})} showIcon />
                    </div>
                </div> 
            </Dialog>
            
            <Dialog 
                visible={isDeleteDialogVisible} 
                style={{ width: '32rem' }} 
                header="Konfirmasi" 
                modal 
                onHide={hideDialogs} 
                footer={ 
                    <div> 
                        <Button label="Tidak" icon="pi pi-times" onClick={hideDialogs} className="p-button-text" /> 
                        <Button label="Ya, Hapus" icon="pi pi-check" onClick={handleDeleteDiscount} className="p-button-danger" /> 
                    </div> 
                }
            >
                <p>Anda yakin ingin menghapus diskon dari produk <b>{selectedProduct?.NAMA}</b>? Harga akan kembali normal.</p> 
            </Dialog>
        </div>
    );
};

export default DiscountManagementPage;