'use client';

import { React, useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag'; // DIIMPOR untuk template status

const RequestStockPage = () => {
    // --- State Anda yang sudah ada ---
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
    
    const toast = useRef(null);

    // --- State baru untuk Tab Status Permintaan ---
    const [selectedTokoForStatus, setSelectedTokoForStatus] = useState(null);
    const [statusData, setStatusData] = useState([]);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    
    // --- useEffect Anda yang sudah ada ---
    useEffect(() => {
        fetchToko();
        fetchGudang();
    }, []);

    useEffect(() => {
        setFilteredStock(
            searchTerm
                ? stockFromGudang.filter(item => item.NAMA && item.NAMA.toLowerCase().includes(searchTerm.toLowerCase()))
                : stockFromGudang
        );
    }, [searchTerm, stockFromGudang]);

    // --- useEffect baru untuk mengambil data status ---
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

    // --- Fungsi Anda yang sudah ada (tidak ada perubahan) ---
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
            setSelectedToko(null);
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
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => handleRemoveStock(rowData)} />
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
                className="p-inputnumber-sm" 
                style={{ width: '80px', textAlign: 'center'}} 
                tooltip={`Stok tersedia: ${rowData.DOS} DOS`} 
                tooltipOptions={{ position: 'top' }} 
            />
        );
    };

    // --- Template baru untuk kolom status di tabel status ---
    const statusBodyTemplate = (rowData) => {
        const severityMap = {
            pending: 'warning',
            accept: 'success',
            rejected: 'danger',
        };
        const statusText = rowData.STATUS ? rowData.STATUS.toLowerCase() : '';
        return <Tag severity={severityMap[statusText] || 'info'} value={rowData.STATUS}></Tag>;
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="p-4 md:p-6" style={{ backgroundColor: '#F8F9FA' }}>
                <div className="card bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Buat Permintaan Stok ke Gudang</h3>
                    
                    <TabView>
                        <TabPanel header="Detail Permintaan">
                            {/* KONTEN TAB INI TIDAK SAYA UBAH */}
                            <div className="p-fluid formgrid grid mt-4">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="toko" className="font-medium text-sm block mb-2">Toko Peminta</label>
                                    <Dropdown id="toko" value={selectedToko} options={tokoList} onChange={(e) => setSelectedToko(e.value)} optionLabel="NAMA" optionValue="KODE" placeholder={isTokoLoading ? "Memuat..." : "Pilih Toko"} disabled={isTokoLoading} className="w-full" filter />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="gudang" className="font-medium text-sm block mb-2">Gudang Tujuan</label>
                                    <Dropdown id="gudang" value={selectedGudang} options={gudangList} onChange={(e) => setSelectedGudang(e.value)} optionLabel="nama" optionValue="nama" placeholder={isLoading ? 'Memuat...' : 'Pilih Gudang'} disabled={isLoading} className="w-full" filter />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex justify-end items-center mb-4">
                                    <Button label="Tambah Produk" icon="pi pi-plus" onClick={handleOpenDialog} className="p-button-sm font-semibold" />
                                </div>
                                
                                <DataTable value={requestedStock} emptyMessage="Belum ada produk yang di-request." size="small" className="text-sm">
                                    <Column field="KODE" header="Kode Produk" />
                                    <Column field="NAMA" header="Nama Produk" />
                                    <Column field="ISI" header="Isi" /> 
                                    <Column header="Jumlah DOS" body={dosEditorTemplate} />
                                    <Column header="Aksi" body={actionBodyTemplate} />
                                </DataTable>
                                <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                                    <Button label="Cancel" className="p-button-text p-button-secondary font-semibold" onClick={() => { setRequestedStock([]); setSelectedToko(null); setSelectedGudang(null); }} />
                                     <Button label="Buat Request" icon="pi pi-send" className="p-button-success font-semibold" onClick={handleSubmitRequest} disabled={!selectedToko || !selectedGudang || requestedStock.length === 0 || isSubmitting} loading={isSubmitting} />
                                </div>
                                <Dialog header={dialogHeader} visible={isDialogVisible} style={{ width: '60vw' }} onHide={resetDialog}>
                                    <div className="p-2">
                                        <DataTable value={filteredStock} loading={isDialogLoading} emptyMessage="Stok tidak ditemukan di gudang ini." size="small" paginator rows={5} className="text-sm">
                                            <Column field="KODE" header="Kode Produk" />
                                            <Column field="NAMA" header="Nama Produk" />
                                            <Column field="DOS" header="Stok DOS Tersedia" />
                                            <Column field="ISI" header="Isi per DOS" />
                                            <Column body={dialogActionBodyTemplate} style={{ textAlign: 'center', width: '6rem' }} />
                                        </DataTable>
                                    </div>
                                </Dialog>
                            </div>
                        </TabPanel>

                        {/* ======================= PERUBAHAN DI SINI ======================= */}
                        <TabPanel header="Status Permintaan">
                             <div className="p-4">
                                <div className="field">
                                    <label htmlFor="tokoStatus" className="font-medium text-sm block mb-2">Toko</label>
                                    <Dropdown 
                                        id="tokoStatus" 
                                        value={selectedTokoForStatus} 
                                        options={tokoList} 
                                        onChange={(e) => setSelectedTokoForStatus(e.value)} 
                                        optionLabel="NAMA" 
                                        optionValue="KODE" 
                                        placeholder={isTokoLoading ? "Memuat..." : "Pilih Toko untuk Melihat Status"} 
                                        disabled={isTokoLoading} 
                                        className="w-full md:w-1/3" 
                                        filter 
                                    />
                                </div>
                                
                                <div className="mt-6">
                                    <DataTable 
                                        value={statusData} 
                                        loading={isLoadingStatus} 
                                        emptyMessage="Pilih toko untuk menampilkan data atau tidak ada data permintaan." 
                                        size="small" 
                                        className="text-sm"
                                        paginator rows={10}
                                    >
                                        <Column field="FAKTUR" header="FAKTUR" />
                                        <Column field="NAMA" header="NAMA" />
                                        <Column field="DOS" header="JUMLAH DOS" />
                                        <Column field="STATUS" header="Status" body={statusBodyTemplate} />
                                    </DataTable>
                                </div>
                            </div>
                        </TabPanel>
                         {/* ===================== AKHIR PERUBAHAN ===================== */}

                    </TabView>
                </div>
            </div>
        </>
    );
};

export default RequestStockPage;