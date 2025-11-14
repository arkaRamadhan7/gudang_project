'use client';

import React, { useContext, useEffect, useState, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '../(auth)/context/authContext';
import "@/styles/page/dashboard.scss";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [penjualanData, setPenjualanData] = useState([]);
    const [loadingPenjualan, setLoadingPenjualan] = useState(false);
    const [mutasiData, setMutasiData] = useState([]);
    const [loadingMutasi, setLoadingMutasi] = useState(false);
    const [requestData, setRequestData] = useState([]);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [diskonData, setDiskonData] = useState([]);
    const [loadingDiskon, setLoadingDiskon] = useState(false);
    const [globalFilterPenjualan, setGlobalFilterPenjualan] = useState('');
    const [globalFilterMutasi, setGlobalFilterMutasi] = useState('');
    const [globalFilterDiskon, setGlobalFilterDiskon] = useState('');
    const [globalFilterRequest, setGlobalFilterRequest] = useState('');
    const [lineOptions, setLineOptions] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const [totalStockColumns, setTotalStockColumns] = useState(null);
    const [totalGudangColumns, setTotalGudangColumns] = useState(null);
    const [totalMutasiColoumns, setTotalMutasiColoumns] = useState(null);
    const [totalUsersColoumns, setTotalUsersColoumns] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef(null);
    const { user, loading, initialized, logout } = useAuth(); 
    
    useEffect(() => {
        const fetchTotalColumns = async () => {
            try {
                const res = await fetch('/api/stock/total');
                if (!res.ok) throw new Error('GAGAL menggambil data total kolom stock');
                const data = await res.json();
                setTotalStockColumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalStockColumns('Error');
            }
        };
        fetchTotalColumns();
    }, []);

    useEffect(() => {
        const fetchTotalGudang = async () => {
            try {
                const res = await fetch('/api/gudang/total');
                if (!res.ok) throw Error('gagal ambil total gudang');
                const data = await res.json();
                setTotalGudangColumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalGudangColumns('Error');
            }
        };
        fetchTotalGudang();
    }, []);

    useEffect(() => {
        const fetchTotalMutasi = async () => {
            try {
                const res = await fetch('/api/mutasi/total');
                if (!res.ok) throw new Error('GAGAL menggambil data total kolom mutasi antar gudang');
                const data = await res.json();
                setTotalMutasiColoumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalMutasiColoumns('Error');
            }
        };
        fetchTotalMutasi();
    }, []);

    useEffect(() => {
        const fetchTotalusers = async () => {
            try {
                const res = await fetch('/api/users/total');
                if (!res.ok) throw Error('gagal ambil total gudang');
                const data = await res.json();
                setTotalUsersColoumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalUsersColoumns('Error');
            }
        };
        fetchTotalusers();
    }, []);

    // Fetch Data Penjualan
    useEffect(() => {
        const fetchPenjualan = async () => {
            setLoadingPenjualan(true);
            try {
                const res = await fetch('/api/penjualan');
                if (!res.ok) throw new Error('Gagal mengambil data penjualan');
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setPenjualanData(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setPenjualanData(data.data);
                } else if (data.penjualan && Array.isArray(data.penjualan)) {
                    setPenjualanData(data.penjualan);
                } else {
                    console.error('Format data tidak sesuai:', data);
                    setPenjualanData([]);
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Format data penjualan tidak sesuai',
                        life: 3000
                    });
                }
            } catch (error) {
                console.error(error);
                setPenjualanData([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat data penjualan',
                    life: 3000
                });
            } finally {
                setLoadingPenjualan(false);
            }
        };
        
        if (user) {
            fetchPenjualan();
        }
    }, [user]);

    // Fetch Data Mutasi
    useEffect(() => {
        const fetchmutasi = async () => {
            setLoadingMutasi(true);
            try {
                const res = await fetch('/api/mutasi');
                if (!res.ok) throw new Error('Gagal mengambil data Mutasi');
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setMutasiData(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setMutasiData(data.data);
                } else if (data.mutasi && Array.isArray(data.mutasi)) {
                    setMutasiData(data.mutasi);
                } else {
                    console.error('Format data tidak sesuai:', data);
                    setMutasiData([]);
                }
            } catch (error) {
                console.error(error);
                setMutasiData([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat data mutasi',
                    life: 3000
                });
            } finally {
                setLoadingMutasi(false);
            }
        };
        
        if (user) {
            fetchmutasi();
        }
    }, [user]);

    // Fetch Data Diskon
    useEffect(() => {
        const fetchDiskon = async () => {
            setLoadingDiskon(true);
            try {
                const res = await fetch('/api/laporan/diskon');
                const data = await res.json();
                
                // Handle response berdasarkan status
                if (data.status === '00') {
                    // Success
                    if (data.data && Array.isArray(data.data)) {
                        setDiskonData(data.data);
                        
                        // Tampilkan info jika data kosong
                        if (data.data.length === 0) {
                            toast.current?.show({
                                severity: 'info',
                                summary: 'Info',
                                detail: data.message || 'Belum ada diskon yang tersedia',
                                life: 3000
                            });
                        }
                    } else {
                        setDiskonData([]);
                    }
                } else {
                    // Error
                    console.error('Error dari server:', data.message);
                    setDiskonData([]);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: data.message || 'Gagal memuat data diskon',
                        life: 3000
                    });
                }
            } catch (error) {
                console.error('Error fetch diskon:', error);
                setDiskonData([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat data diskon',
                    life: 3000
                });
            } finally {
                setLoadingDiskon(false);
            }
        };
        
        if (user) {
            fetchDiskon();
        }
    }, [user]);

    // Fetch Data Request Stock
    useEffect(() => {
        const fetchRequestStock = async () => {
            setLoadingRequest(true);
            try {
                const res = await fetch('/api/laporan/request-stock');
                const data = await res.json();
                
                // Handle response berdasarkan status
                if (data.status === '00') {
                    // Success
                    if (data.data && Array.isArray(data.data)) {
                        setRequestData(data.data);
                        
                        // Tampilkan info jika data kosong
                        if (data.data.length === 0) {
                            toast.current?.show({
                                severity: 'info',
                                summary: 'Info',
                                detail: data.message || 'Tidak ada request stock saat ini',
                                life: 3000
                            });
                        }
                    } else {
                        setRequestData([]);
                    }
                } else {
                    // Error
                    console.error('Error dari server:', data.message);
                    setRequestData([]);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: data.message || 'Gagal memuat data request stock',
                        life: 3000
                    });
                }
            } catch (error) {
                console.error('Error fetch request stock:', error);
                setRequestData([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat data request stock',
                    life: 3000
                });
            } finally {
                setLoadingRequest(false);
            }
        };
        
        if (user) {
            fetchRequestStock();
        }
    }, [user]);

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Format date
    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Template untuk kolom harga
    const hargaBodyTemplate = (rowData) => {
        return formatCurrency(rowData.HARGA);
    };

    // Template untuk kolom kredit
    const kreditBodyTemplate = (rowData) => {
        return formatCurrency(rowData.KREDIT);
    };

    // Template untuk kolom tanggal
    const tanggalBodyTemplate = (rowData) => {
        const tanggal = rowData.TGL || rowData.TANGGAL || rowData.tanggal || rowData.tgl_mutasi;
        return formatDate(tanggal);
    };

    // Template untuk kolom status
    const statusBodyTemplate = (rowData) => {
        const status = rowData.STATUS || 'Pending';
        let severity = 'warning';
        
        if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'selesai' || status.toLowerCase() === 'aktif') {
            severity = 'success';
        } else if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'ditolak') {
            severity = 'danger';
        }
        
        return <span className={`badge badge-${severity}`}>{status}</span>;
    };

    // Header tables
    const renderHeaderPenjualan = () => (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Data Penjualan</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterPenjualan}
                    onChange={(e) => setGlobalFilterPenjualan(e.target.value)}
                    placeholder="Cari..." 
                />
            </span>
        </div>
    );

    const renderHeaderMutasi = () => (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Data Mutasi Antar Gudang</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterMutasi}
                    onChange={(e) => setGlobalFilterMutasi(e.target.value)}
                    placeholder="Cari..." 
                />
            </span>
        </div>
    );

    const renderHeaderDiskon = () => (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Data Diskon</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterDiskon}
                    onChange={(e) => setGlobalFilterDiskon(e.target.value)}
                    placeholder="Cari..." 
                />
            </span>
        </div>
    );

    const renderHeaderRequest = () => (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Data Request Stock</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterRequest}
                    onChange={(e) => setGlobalFilterRequest(e.target.value)}
                    placeholder="Cari..." 
                />
            </span>
        </div>
    );

    // Custom empty message
    const emptyMessageDiskon = () => (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <i className="pi pi-tag" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1' }}>
                Belum ada diskon yang tersedia
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Saat ini belum ada program diskon yang aktif
            </p>
        </div>
    );

    const emptyMessageRequest = () => (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1' }}>
                Tidak ada request stock
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Belum ada permintaan stock yang diajukan
            </p>
        </div>
    );

    if (!initialized || loading) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner"></i>
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (initialized && !loading && !user) {
        return (
            <div className="redirect-container">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner"></i>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid" style={{ rowGap: '1rem' }}>
            <Toast ref={toast} />
            
            {/* Welcome Card */}
            <div className="col-12" style={{ paddingBottom: 0 }}>
                <div className="card">
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h5>Selamat datang, {user.username}!</h5>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {[{
                label: "Orders",
                value: totalStockColumns ? totalStockColumns.toString() : "Loading...",
                icon: "pi-shopping-cart",
                bg: "bg-blue-100",
                color: "text-blue-500",
                note: "total since last month"
            }, {
                label: "Gudang",
                value: totalGudangColumns ? totalGudangColumns.toString(): "Loading...",
                icon: "pi-building",
                bg: "bg-orange-100",
                color: "text-orange-500",
                note: "since last week"
            }, {
                label: "Mutasi antar gudang",
                value: totalMutasiColoumns ? totalMutasiColoumns.toString() : "Loading...",
                icon: "pi-sync",
                bg: "bg-cyan-100",
                color: "text-cyan-500",
                note: "Total all mutasi antar gudang"
            }, {
                label: "Users",
                value: totalUsersColoumns ? totalUsersColoumns.toString() :"Loading.....",
                icon: "pi-users",
                bg: "bg-purple-100",
                color: "text-purple-500",
                note: "responded"
            }].map((card, i) => (
                <div className="col-12 lg:col-6 xl:col-3" key={i}>
                    <div className="card mb-0 stats-card">
                        <div className="stats-card-header">
                            <div className="stats-info">
                                <span className="stats-label">{card.label}</span>
                                <div className="stats-value">{card.value}</div>
                            </div>
                            <div className={`stats-icon ${card.bg}`}>
                                <i className={`pi ${card.icon} ${card.color}`} />
                            </div>
                        </div>
                        <div className="stats-footer">
                            {card.subtitle && (
                                <span className="stats-change">{card.subtitle}</span>
                            )}
                            <span className="stats-note">{card.note}</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Tables dengan TabView */}
            <div className="col-12">
                <div className="card table-card">
                    <TabView 
                        activeIndex={activeIndex} 
                        onTabChange={(e) => setActiveIndex(e.index)}
                    >
                        {/* Tab Data Penjualan */}
                        <TabPanel 
                            header="Penjualan" 
                            leftIcon="pi pi-shopping-cart mr-2"
                        >
                            <DataTable
                                value={penjualanData}
                                loading={loadingPenjualan}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                globalFilter={globalFilterPenjualan}
                                header={renderHeaderPenjualan()}
                                emptyMessage="Tidak ada data penjualan"
                                stripedRows
                                className="custom-datatable"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column field="POSTING" header="Posting" sortable style={{ minWidth: '120px' }} />
                                <Column field="FAKTUR" header="Faktur" sortable style={{ minWidth: '120px' }} />
                                <Column field="TOKO" header="Toko" sortable style={{ minWidth: '150px' }} />
                                <Column field="KODE" header="Kode" sortable style={{ minWidth: '120px' }} />
                                <Column field="QTY" header="Qty" sortable style={{ minWidth: '80px' }} />
                                <Column field="KREDIT" header="Kredit" body={kreditBodyTemplate} sortable style={{ minWidth: '150px' }} />
                                <Column field="HARGA" header="Harga" body={hargaBodyTemplate} sortable style={{ minWidth: '150px' }} />
                                <Column field="HP" header="HP" sortable style={{ minWidth: '130px' }} />
                                <Column field="KETERANGAN" header="Keterangan" sortable style={{ minWidth: '200px' }} />
                                <Column field="USERNAME" header="Username" sortable style={{ minWidth: '120px' }} />
                            </DataTable>
                        </TabPanel>

                        {/* Tab Data Mutasi */}
                        <TabPanel 
                            header="Mutasi" 
                            leftIcon="pi pi-sync mr-2"
                        >
                            <DataTable
                                value={mutasiData}
                                loading={loadingMutasi}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                globalFilter={globalFilterMutasi}
                                header={renderHeaderMutasi()}
                                emptyMessage="Tidak ada data mutasi"
                                stripedRows
                                className="custom-datatable"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column field="POSTING" header="Posting" sortable style={{ minWidth: '120px' }} />
                                <Column field="TGL" header="Tanggal" body={tanggalBodyTemplate} sortable style={{ minWidth: '120px' }} />
                                <Column field="FAKTUR" header="No. Faktur" sortable style={{ minWidth: '130px' }} />
                                <Column field="DARI" header="Gudang Asal" sortable style={{ minWidth: '150px' }} />
                                <Column field="KE" header="Gudang Tujuan" sortable style={{ minWidth: '150px' }} />
                                <Column field="BARCODE" header="Barcode" sortable style={{ minWidth: '130px' }} />
                                <Column field="NAMA" header="Nama Barang" sortable style={{ minWidth: '200px' }} />
                                <Column field="QTY" header="Qty" sortable style={{ minWidth: '80px' }} />
                                <Column field="STATUS" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '120px' }} />
                                <Column field="USERNAME" header="User" sortable style={{ minWidth: '120px' }} />
                            </DataTable>
                        </TabPanel>

                        {/* Tab Data Diskon */}
                        <TabPanel 
                            header="Diskon" 
                            leftIcon="pi pi-tag mr-2"
                        >
                            <DataTable
                                value={diskonData}
                                loading={loadingDiskon}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                globalFilter={globalFilterDiskon}
                                header={renderHeaderDiskon()}
                                emptyMessage={emptyMessageDiskon()}
                                stripedRows
                                className="custom-datatable"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column field="id" header="ID" sortable style={{ minWidth: '80px' }} />
                                <Column field="name" header="Nama Diskon" sortable style={{ minWidth: '200px' }} />
                                <Column field="code" header="Kode Diskon" sortable style={{ minWidth: '120px' }} />
                                <Column 
                                    field="percentage" 
                                    header="Persentase" 
                                    body={(rowData) => (
                                        <span className="badge badge-success">{rowData.percentage}%</span>
                                    )}
                                    sortable 
                                    style={{ minWidth: '120px' }} 
                                />
                                <Column 
                                    field="start_date" 
                                    header="Tanggal Mulai" 
                                    body={(rowData) => formatDate(rowData.start_date)}
                                    sortable 
                                    style={{ minWidth: '130px' }} 
                                />
                                <Column 
                                    field="end_date" 
                                    header="Tanggal Selesai" 
                                    body={(rowData) => formatDate(rowData.end_date)}
                                    sortable 
                                    style={{ minWidth: '130px' }} 
                                />
                            </DataTable>
                        </TabPanel>

                        {/* Tab Data Request Stock */}
                        <TabPanel 
                            header="Request Stock" 
                            leftIcon="pi pi-inbox mr-2"
                        >
                            <DataTable
                                value={requestData}
                                loading={loadingRequest}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                globalFilter={globalFilterRequest}
                                header={renderHeaderRequest()}
                                emptyMessage={emptyMessageRequest()}
                                stripedRows
                                className="custom-datatable"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column field="ID" header="ID" sortable style={{ minWidth: '80px' }} />
                                <Column field="FAKTUR" header="No. Faktur" sortable style={{ minWidth: '150px' }} />
                                <Column 
                                    field="TGL_MASUK" 
                                    header="Tanggal Masuk" 
                                    body={(rowData) => formatDate(rowData.TGL_MASUK)}
                                    sortable 
                                    style={{ minWidth: '130px' }} 
                                />
                                <Column field="KODE" header="Kode" sortable style={{ minWidth: '120px' }} />
                                <Column field="BARCODE" header="Barcode" sortable style={{ minWidth: '100px' }} />
                                <Column field="NAMA" header="Nama Barang" sortable style={{ minWidth: '200px' }} />
                                <Column field="QTY" header="Qty" sortable style={{ minWidth: '80px' }} />
                                <Column field="DOS" header="DOS" sortable style={{ minWidth: '80px' }} />
                                <Column field="ISI" header="Isi" sortable style={{ minWidth: '80px' }} />
                                <Column field="SATUAN" header="Satuan" sortable style={{ minWidth: '100px' }} />
                                <Column 
                                    field="HJ" 
                                    header="Harga Jual" 
                                    body={(rowData) => formatCurrency(rowData.HJ)}
                                    sortable 
                                    style={{ minWidth: '130px' }} 
                                />
                                <Column 
                                    field="EXPIRED" 
                                    header="Expired" 
                                    body={(rowData) => formatDate(rowData.EXPIRED)}
                                    sortable 
                                    style={{ minWidth: '120px' }} 
                                />
                                <Column 
                                    field="STATUS" 
                                    header="Status" 
                                    body={statusBodyTemplate}
                                    sortable 
                                    style={{ minWidth: '100px' }} 
                                />
                                <Column field="JENIS" header="Jenis" sortable style={{ minWidth: '80px' }} />
                                <Column field="KODE_TOKO" header="Kode Toko" sortable style={{ minWidth: '100px' }} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;