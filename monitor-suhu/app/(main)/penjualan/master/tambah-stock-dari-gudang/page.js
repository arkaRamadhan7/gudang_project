'use client';

import { React, useEffect, useState, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useAuth } from "@/app/(auth)/context/authContext";


const RequestStockPage = () => {
    const toast = useRef(null);
    const { user } = useAuth();
    
    // --- State yang sudah ada ---
    const [requestedStock, setRequestedStock] = useState([]);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gudangList, setGudangList] = useState([]);
    const [selectedGudang, setSelectedGudang] = useState(null);
    const [stockFromGudang, setStockFromGudang] = useState([]);
    const [filteredStock, setFilteredStock] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogLoading, setIsDialogLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokoList, setTokoList] = useState([]);
    const [selectedToko, setSelectedToko] = useState(null);
    const [isTokoLoading, setIsTokoLoading] = useState(false);
    const [selectedTokoForStatus, setSelectedTokoForStatus] = useState(null);
    const [statusData, setStatusData] = useState([]);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Helper function untuk cek superadmin
    const isSuperAdmin = () => {
        return user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'super admin';
    };

    // --- Fetch User Data ---
    const fetchUserData = useCallback(async () => {
        if (!user?.email) return;
        
        setIsLoadingUser(true);
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            
            if (json.users && Array.isArray(json.users)) {
                const currentUser = json.users.find(u => u.email === user.email);
                
                if (currentUser && currentUser.toko && !isSuperAdmin()) {
                    const tokoUser = tokoList.find(toko => toko.NAMA === currentUser.toko);
                    if (tokoUser) {
                        setSelectedToko(tokoUser.KODE);
                        setSelectedTokoForStatus(tokoUser.KODE);
                    }
                }
            }
        } catch (error) {
            console.error("Gagal mengambil data user", error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal mengambil data user', 
                life: 3000 
            });
        } finally {
            setIsLoadingUser(false);
        }
    }, [user, tokoList]);

    // --- Fetch Initial Data ---
    useEffect(() => {
        fetchToko();
        fetchGudang();
    }, []);

    // Fetch user data setelah daftar toko tersedia
    useEffect(() => {
        if (tokoList.length > 0 && user) {
            fetchUserData();
        }
    }, [tokoList, user, fetchUserData]);

    useEffect(() => {
        setFilteredStock(
            searchTerm
                ? stockFromGudang.filter(item => item.NAMA && item.NAMA.toLowerCase().includes(searchTerm.toLowerCase()))
                : stockFromGudang
        );
    }, [searchTerm, stockFromGudang]);

    useEffect(() => {
        if (!selectedTokoForStatus) {
            setStatusData([]);
            return;
        }

        const fetchStatusData = async () => {
            setIsLoadingStatus(true);
            try {
                const res = await fetch(`/api/penjualan/tambahstock/request-stock/status/${selectedTokoForStatus}`);
                const json = await res.json();
                if (json.status === '00' && Array.isArray(json.data)) {
                    setStatusData(json.data);
                } else {
                    setStatusData([]);
                }
            } catch (error) {
                console.error("Gagal mengambil data status:", error);
                setStatusData([]);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        fetchStatusData();
    }, [selectedTokoForStatus]);

    const fetchToko = async () => {
        setIsTokoLoading(true);
        try {
            const res = await fetch('/api/toko');
            const json = await res.json();
            if (json.status === '00' && Array.isArray(json.data)) {
                setTokoList(json.data);
            } else {
                setTokoList([]);
            }
        } catch (err) {
            console.error('Gagal mengambil data toko', err);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Gagal mengambil data toko', 
                life: 3000 
            });
        } finally {
            setIsTokoLoading(false);
        }
    };

    const fetchGudang = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/gudang');
            const json = await res.json();
            if (json.status === '00' && Array.isArray(json.data)) {
                setGudangList(json.data);
            } else {
                setGudangList([]);
            }
        } catch (err) {
            console.error('Gagal mengambil data gudang', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStockByGudang = async (gudangId) => {
        setIsDialogLoading(true);
        try {
            const res = await fetch(`/api/penjualan/tambahstock/${encodeURIComponent(gudangId)}`);
            const json = await res.json();
            if (json.status === '00' && Array.isArray(json.data)) {
                setStockFromGudang(json.data);
            } else {
                setStockFromGudang([]);
            }
        } catch (err) {
            console.error('Gagal mengambil data stok', err);
            setStockFromGudang([]);
        } finally {
            setIsDialogLoading(false);
        }
    };

    const handleOpenDialog = () => {
        if (!selectedGudang) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Silakan pilih gudang tujuan terlebih dahulu.', life: 3000 });
            return;
        }
        setIsDialogVisible(true);
        fetchStockByGudang(selectedGudang);
    };

    const handleAddStock = (stockItem) => {
        if (!requestedStock.some(item => item.KODE === stockItem.KODE)) {
            const stockToAdd = {
                ...stockItem,
                DOS_REQUEST: 1 
            };
            setRequestedStock(prev => [...prev, stockToAdd]);
        } else {
            toast.current.show({ severity: 'info', summary: 'Info', detail: `Produk "${stockItem.NAMA}" sudah ada di daftar.`, life: 3000 });
        }
    };

    const handleRemoveStock = (stockItem) => {
        setRequestedStock(prev => prev.filter(item => item.KODE !== stockItem.KODE));
    };

    const handleDosChange = (e, rowData) => {
        const newDos = e.value;
        const updatedStock = requestedStock.map(item => {
            if (item.KODE === rowData.KODE) {
                return { ...item, DOS_REQUEST: newDos };
            }
            return item;
        });
        setRequestedStock(updatedStock);
    };
    
    const handleSubmitRequest = async () => {
        if (!selectedToko || !selectedGudang || requestedStock.length === 0) {
            return;
        }

        setIsSubmitting(true);
        const payload = {
            toko_peminta_id: selectedToko,
            gudang_tujuan_id: selectedGudang,
            items: requestedStock
        };
        console.log("PAYLOAD YANG DIKIRIM:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('/api/penjualan/tambahstock/request-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal memvalidasi data.');
            }

            toast.current.show({ 
                severity: 'success', 
                summary: 'Berhasil', 
                detail: result.message, 
                life: 3000 
            });
            
            setRequestedStock([]);
            // Jika bukan superadmin, kembalikan ke toko user
            if (!isSuperAdmin() && user?.email) {
                // Reset ke toko user dari database
                fetchUserData();
            } else {
                setSelectedToko(null);
            }
            setSelectedGudang(null);
            
        } catch (error) {
            console.error("Error saat membuat request:", error);
            toast.current.show({ 
                severity: 'error',
                summary: 'Error', 
                detail: error.message,
                life: 4000 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetDialog = () => {
        setIsDialogVisible(false);
        setStockFromGudang([]);
        setSearchTerm('');
    };

    const actionBodyTemplate = (rowData) => (
        <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleRemoveStock(rowData)} />
    );

    const dialogActionBodyTemplate = (rowData) => (
        <Button label="Tambah" className="p-button-sm p-button-success" onClick={() => handleAddStock(rowData)} disabled={requestedStock.some(item => item.KODE === rowData.KODE)} />
    );

    const dialogHeader = (
        <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800">Pilih Produk dari Gudang</h4>
            <div className="p-input-icon-left mt-3">
                <i className="pi pi-search" />
                <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari Produk..." disabled={isDialogLoading} className="w-full" />
            </div>
        </div>
    );
    
    const dosEditorTemplate = (rowData) => {
        return (
            <InputNumber 
                value={rowData.DOS_REQUEST} 
                onValueChange={(e) => handleDosChange(e, rowData)} 
                mode="decimal" 
                showButtons 
                min={1} 
                className="p-inputnumber-sm w-28"
                inputClassName="!text-center"
                tooltip={`Stok tersedia: ${rowData.DOS} DOS`} 
                tooltipOptions={{ position: 'top' }} 
            />
        );
    };

    const statusBodyTemplate = (rowData) => {
        const severityMap = {
            pending: 'warning',
            accept: 'success',
            rejected: 'danger',
        };
        const statusText = rowData.STATUS ? rowData.STATUS.toLowerCase() : '';
        return <Tag severity={severityMap[statusText] || 'info'} value={rowData.STATUS}></Tag>;
    };

    // Loading state saat mengambil data user
    if (isLoadingUser) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            </div>
        );
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="p-4 md:p-6 w-full">
                <div className="card p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Buat Permintaan Stok ke Gudang</h3>
                    
                    <TabView className="custom-tabview">
                        {/* TAB PERMINTAAN */}
                        <TabPanel 
                            header={
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-file-edit"></i>
                                    <span className="font-semibold">Permintaan</span>
                                </div>
                            }
                        >
                            <div className="surface-section border-round-lg shadow-2 p-4 mt-4">
                                {/* Form Section */}
                                <div className="border-round p-4 mb-4">
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="toko" className="font-semibold text-900 mb-2 block">
                                            <i className="pi pi-building mr-2 text-primary"></i>
                                            Toko Peminta
                                        </label>
                                        {!isSuperAdmin() && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Toko ditentukan berdasarkan akun Anda
                                            </div>
                                        )}
                                        <Dropdown 
                                            id="toko" 
                                            value={selectedToko} 
                                            options={tokoList} 
                                            onChange={(e) => setSelectedToko(e.value)} 
                                            optionLabel="NAMA" 
                                            optionValue="KODE" 
                                            placeholder={isLoadingUser ? "Memuat..." : isSuperAdmin() ? "Pilih Toko" : "Toko Anda"} 
                                            disabled={!isSuperAdmin() || isLoadingUser} 
                                            className="w-full border-round" 
                                            filter 
                                            showClear={isSuperAdmin()}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="gudang" className="font-semibold text-900 mb-2 block">
                                            <i className="pi pi-warehouse mr-2 text-primary"></i>
                                            Gudang Tujuan
                                        </label>
                                        <Dropdown 
                                            id="gudang" 
                                            value={selectedGudang} 
                                            options={gudangList} 
                                            onChange={(e) => setSelectedGudang(e.value)} 
                                            optionLabel="nama" 
                                            optionValue="nama" 
                                            placeholder={isLoading ? 'Memuat...' : 'Pilih Gudang'} 
                                            disabled={isLoading} 
                                            className="w-full border-round" 
                                            filter 
                                            showClear
                                        />
                                    </div>
                                </div>

                                {/* Product List Section */}
                                <div className="surface-card border-round-lg shadow-1 p-4">
                                    <div className="flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-900 m-0 mb-1">
                                                Daftar Produk
                                            </h4>
                                            <p className="text-600 text-sm m-0">
                                                {requestedStock.length} produk dipilih
                                            </p>
                                        </div>
                                        <Button 
                                            label="Tambah Produk" 
                                            icon="pi pi-plus" 
                                            onClick={handleOpenDialog} 
                                            className="font-semibold shadow-2" 
                                            raised
                                        />
                                    </div>

                                    <div className="border-round overflow-hidden">
                                        <DataTable 
                                            value={requestedStock} 
                                            emptyMessage={
                                                <div className="text-center py-6">
                                                    <i className="pi pi-inbox text-4xl text-400 mb-3"></i>
                                                    <p className="text-600 font-medium">Belum ada produk yang di-request</p>
                                                    <p className="text-500 text-sm">Klik tombol (Tambah Produk) untuk memulai</p>
                                                </div>
                                            }
                                            size="small" 
                                            className="text-sm"
                                            stripedRows
                                        >
                                            <Column 
                                                field="KODE" 
                                                header="Kode Produk" 
                                                headerClassName="font-bold"
                                            />
                                            <Column 
                                                field="NAMA" 
                                                header="Nama Produk" 
                                                headerClassName="font-bold"
                                            />
                                            <Column 
                                                field="ISI" 
                                                header="Isi" 
                                                headerClassName="font-bold"
                                                style={{ width: '100px' }}
                                            />
                                            <Column 
                                                header="Jumlah DOS" 
                                                body={dosEditorTemplate} 
                                                headerClassName="font-bold"
                                                style={{ width: '150px' }}
                                            />
                                            <Column 
                                                header="Aksi" 
                                                body={actionBodyTemplate} 
                                                headerClassName="font-bold"
                                                style={{ width: '100px', textAlign: 'center' }}
                                            />
                                        </DataTable>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-content-end gap-3 mt-5 pt-4 border-top-1 surface-border">
                                    <Button 
                                        label="Batal" 
                                        icon="pi pi-times"
                                        className="p-button-text p-button-secondary font-semibold" 
                                        onClick={() => { 
                                            setRequestedStock([]);
                                            if (!isSuperAdmin() && user?.email) {
                                                fetchUserData();
                                            } else {
                                                setSelectedToko(null);
                                            }
                                            setSelectedGudang(null); 
                                        }} 
                                    />
                                    <Button 
                                        label="Buat Request" 
                                        icon="pi pi-send" 
                                        className="p-button-success font-semibold shadow-2" 
                                        onClick={handleSubmitRequest} 
                                        disabled={!selectedToko || !selectedGudang || requestedStock.length === 0 || isSubmitting} 
                                        loading={isSubmitting}
                                        raised
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        {/* TAB STATUS PERMINTAAN */}
                        <TabPanel 
                            header={
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-list"></i>
                                    <span className="font-semibold">Status Permintaan</span>
                                </div>
                            }
                        >
                            <div className="surface-section border-round-lg shadow-2 p-5 mt-4">
                                {/* Filter Section */}
                                <div className="surface-ground border-round p-4 mb-5">
                                    <div className="field mb-0">
                                        <label htmlFor="tokoStatus" className="font-semibold text-900 mb-2 block">
                                            <i className="pi pi-building mr-2 text-primary"></i>
                                            Pilih Toko
                                        </label>
                                        {!isSuperAdmin() && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Toko ditentukan berdasarkan akun Anda
                                            </div>
                                        )}
                                        <Dropdown 
                                            id="tokoStatus" 
                                            value={selectedTokoForStatus} 
                                            options={tokoList} 
                                            onChange={(e) => setSelectedTokoForStatus(e.value)} 
                                            optionLabel="NAMA" 
                                            optionValue="KODE" 
                                            placeholder={isLoadingUser ? "Memuat..." : isSuperAdmin() ? "Pilih Toko untuk Melihat Status" : "Toko Anda"} 
                                            disabled={!isSuperAdmin() || isLoadingUser} 
                                            className="w-full md:w-6" 
                                            filter={isSuperAdmin()}
                                            showClear={isSuperAdmin()}
                                        />
                                    </div>
                                </div>
                                
                                {/* Data Table Section */}
                                <div className="surface-card border-round-lg shadow-1 p-4">
                                    <div className="mb-3">
                                        <h4 className="text-lg font-bold text-900 m-0 mb-1">
                                            Daftar Status Permintaan
                                        </h4>
                                        <p className="text-600 text-sm m-0">
                                            {statusData.length} permintaan ditemukan
                                        </p>
                                    </div>
                                    
                                    <div className="border-round overflow-hidden">
                                        <DataTable 
                                            value={statusData} 
                                            loading={isLoadingStatus} 
                                            emptyMessage={
                                                <div className="text-center py-6">
                                                    <i className="pi pi-search text-4xl text-400 mb-3"></i>
                                                    <p className="text-600 font-medium">
                                                        {selectedTokoForStatus ? 'Tidak ada data permintaan' : 'Pilih toko untuk menampilkan data'}
                                                    </p>
                                                </div>
                                            }
                                            size="small" 
                                            className="text-sm"
                                            paginator 
                                            rows={10}
                                            stripedRows
                                        >
                                            <Column 
                                                field="FAKTUR" 
                                                header="FAKTUR" 
                                                headerClassName="font-bold"
                                            />
                                            <Column 
                                                field="NAMA" 
                                                header="NAMA PRODUK" 
                                                headerClassName="font-bold"
                                            />
                                            <Column 
                                                field="DOS" 
                                                header="JUMLAH DOS" 
                                                headerClassName="font-bold"
                                                style={{ width: '150px' }}
                                            />
                                            <Column 
                                                field="STATUS" 
                                                header="STATUS" 
                                                body={statusBodyTemplate} 
                                                headerClassName="font-bold"
                                                style={{ width: '120px' }}
                                            />
                                        </DataTable>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            {/* Dialog */}
            <Dialog 
                header={dialogHeader}
                visible={isDialogVisible} 
                style={{ width: '70vw' }} 
                onHide={resetDialog}
                className="border-round-lg"
                dismissableMask
            >
                <div className="surface-ground border-round p-3">
                    <DataTable 
                        value={filteredStock} 
                        loading={isDialogLoading} 
                        emptyMessage={
                            <div className="text-center py-5">
                                <i className="pi pi-search text-3xl text-400 mb-2"></i>
                                <p className="text-600 font-medium">Stok tidak ditemukan di gudang ini</p>
                            </div>
                        }
                        size="small" 
                        paginator 
                        rows={5} 
                        className="text-sm"
                        stripedRows
                    >
                        <Column 
                            field="KODE" 
                            header="Kode Produk" 
                            headerClassName="font-bold"
                        />
                        <Column 
                            field="NAMA" 
                            header="Nama Produk" 
                            headerClassName="font-bold"
                        />
                        <Column 
                            field="DOS" 
                            header="Stok DOS Tersedia" 
                            headerClassName="font-bold"
                            style={{ width: '150px' }}
                        />
                        <Column 
                            field="ISI" 
                            header="Isi per DOS" 
                            headerClassName="font-bold"
                            style={{ width: '130px' }}
                        />
                        <Column 
                            body={dialogActionBodyTemplate} 
                            headerClassName="font-bold"
                            style={{ textAlign: 'center', width: '100px' }} 
                        />
                    </DataTable>
                </div>
            </Dialog>
        </>
    );
};

export default RequestStockPage;