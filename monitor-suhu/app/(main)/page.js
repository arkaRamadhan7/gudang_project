'use client';

import React, { useContext, useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '../(auth)/context/authContext';
import "@/styles/page/dashboard.scss";

const Dashboard = () => {
    // ==================== STATE DECLARATIONS ====================
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
    const [totalStockColumns, setTotalStockColumns] = useState(null);
    const [totalGudangColumns, setTotalGudangColumns] = useState(null);
    const [totalMutasiColoumns, setTotalMutasiColoumns] = useState(null);
    const [totalUsersColoumns, setTotalUsersColoumns] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef(null);
    const { user, loading, initialized } = useAuth();

    // ==================== ROLE CHECKING FUNCTIONS ====================
    const isAdmin = () => user?.role === 'admin';
    const isSuperAdmin = () => user?.role === 'superadmin';
    const isAdminGudang = () => user?.role === 'Admin Gudang';
    const isAdminToko = () => user?.role === 'Admin Toko';
    const isFullAdmin = () => isAdmin() || isSuperAdmin();

    const getUserLocation = () => {
        if (isAdminGudang()) {
            return user?.kode_gudang || user?.gudang;
        }
        if (isAdminToko()) {
            return user?.kode_toko || user?.toko;
        }
        return null;
    };

    // ==================== FETCH TOTAL STATS (ONLY FOR FULL ADMIN) ====================
    useEffect(() => {
        if (!isFullAdmin() || !user) return;
        
        const fetchTotalColumns = async () => {
            try {
                const res = await fetch('/api/stock/total');
                if (!res.ok) throw new Error('GAGAL mengambil data total kolom stock');
                const data = await res.json();
                setTotalStockColumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalStockColumns('Error');
            }
        };
        fetchTotalColumns();
    }, [user]);

    useEffect(() => {
        if (!isFullAdmin() || !user) return;
        
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
    }, [user]);

    useEffect(() => {
        if (!isFullAdmin() || !user) return;
        
        const fetchTotalMutasi = async () => {
            try {
                const res = await fetch('/api/mutasi/total');
                if (!res.ok) throw new Error('GAGAL mengambil data total kolom mutasi antar gudang');
                const data = await res.json();
                setTotalMutasiColoumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalMutasiColoumns('Error');
            }
        };
        fetchTotalMutasi();
    }, [user]);

    useEffect(() => {
        if (!isFullAdmin() || !user) return;
        
        const fetchTotalusers = async () => {
            try {
                const res = await fetch('/api/users/total');
                if (!res.ok) throw Error('gagal ambil total users');
                const data = await res.json();
                setTotalUsersColoumns(data.total);
            } catch (error) {
                console.error(error);
                setTotalUsersColoumns('Error');
            }
        };
        fetchTotalusers();
    }, [user]);

    // ==================== FETCH DATA PENJUALAN (ADMIN/SUPERADMIN/ADMIN TOKO) ====================
    useEffect(() => {
        if (!user || (!isFullAdmin() && !isAdminToko())) return;
        
        const fetchPenjualan = async () => {
            setLoadingPenjualan(true);
            try {
                let url = '/api/data-penjualan';
                
                // Filter berdasarkan kode toko untuk Admin Toko
                if (isAdminToko()) {
                    const kodeToko = getUserLocation();
                    if (kodeToko) {
                        url += `?kode_toko=${kodeToko}`;
                    }
                }
                
                const res = await fetch(url);
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
        
        fetchPenjualan();
    }, [user]);

    // ==================== FETCH DATA MUTASI (ADMIN/SUPERADMIN/ADMIN GUDANG) ====================
    useEffect(() => {
        if (!user || (!isFullAdmin() && !isAdminGudang())) return;
        
        const fetchmutasi = async () => {
            setLoadingMutasi(true);
            try {
                let url = '/api/mutasi';
                
                // Filter berdasarkan kode gudang untuk Admin Gudang
                if (isAdminGudang()) {
                    const kodeGudang = getUserLocation();
                    if (kodeGudang) {
                        url += `?kode_gudang=${kodeGudang}`;
                    }
                }
                
                const res = await fetch(url);
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
        
        fetchmutasi();
    }, [user]);

    // ==================== FETCH DATA DISKON (ADMIN/SUPERADMIN/ADMIN TOKO) ====================
    useEffect(() => {
        if (!user || (!isFullAdmin() && !isAdminToko())) return;
        
        const fetchDiskon = async () => {
            setLoadingDiskon(true);
            try {
                let url = '/api/laporan/diskon';
                
                // Filter berdasarkan kode toko untuk Admin Toko
                if (isAdminToko()) {
                    const kodeToko = getUserLocation();
                    if (kodeToko) {
                        url += `?kode_toko=${kodeToko}`;
                    }
                }
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.status === '00') {
                    if (data.data && Array.isArray(data.data)) {
                        setDiskonData(data.data);
                    } else {
                        setDiskonData([]);
                    }
                } else {
                    console.error('Error dari server:', data.message);
                    setDiskonData([]);
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
        
        fetchDiskon();
    }, [user]);

    // ==================== FETCH DATA REQUEST STOCK (ADMIN/SUPERADMIN/ADMIN GUDANG) ====================
    useEffect(() => {
        if (!user || (!isFullAdmin() && !isAdminGudang())) return;
        
        const fetchRequestStock = async () => {
            setLoadingRequest(true);
            try {
                let url = '/api/laporan/request-stock';
                
                // Filter berdasarkan kode gudang untuk Admin Gudang
                if (isAdminGudang()) {
                    const kodeGudang = getUserLocation();
                    if (kodeGudang) {
                        url += `?kode_gudang=${kodeGudang}`;
                    }
                }
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.status === '00') {
                    if (data.data && Array.isArray(data.data)) {
                        setRequestData(data.data);
                    } else {
                        setRequestData([]);
                    }
                } else {
                    console.error('Error dari server:', data.message);
                    setRequestData([]);
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
        
        fetchRequestStock();
    }, [user]);

    // ==================== FORMAT FUNCTIONS ====================
    const formatCurrency = (value) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ==================== BODY TEMPLATES ====================
    const hargaBodyTemplate = (rowData) => {
        return formatCurrency(rowData.HARGA);
    };

    const kreditBodyTemplate = (rowData) => {
        return formatCurrency(rowData.KREDIT);
    };

    const tanggalBodyTemplate = (rowData) => {
        const tanggal = rowData.TGL || rowData.TANGGAL || rowData.tanggal || rowData.tgl_mutasi;
        return formatDate(tanggal);
    };

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

    // ==================== HEADER RENDERS ====================
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

    // ==================== EMPTY MESSAGES ====================
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

    // ==================== LOADING & AUTH CHECKS ====================
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
                        <p className="text-600 mb-0">
                            {isAdmin() && 'Administrator'}
                            {isSuperAdmin() && 'Super Admin'}
                            {isAdminGudang() && `Admin Gudang `}
                            {isAdminToko() && `Admin Toko `}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Cards - Only for Full Admin */}
        {isFullAdmin() && (
            <>
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
            </>
        )}

        {/* Tables dengan TabView */}
        <div className="col-12">
            <div className="card table-card">
                <TabView 
                    activeIndex={activeIndex} 
                    onTabChange={(e) => setActiveIndex(e.index)}
                >
                    {/* Tab Data Penjualan - Full Admin & Admin Toko */}
                    {(isFullAdmin() || isAdminToko()) && (
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
                    )}

                    {/* Tab Data Mutasi - Full Admin & Admin Gudang */}
                    {(isFullAdmin() || isAdminGudang()) && (
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
                    )}

                    {/* Tab Data Diskon - Full Admin & Admin Toko */}
                    {(isFullAdmin() || isAdminToko()) && (
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
                    )}

                    {/* Tab Data Request Stock - Full Admin & Admin Gudang */}
                    {(isFullAdmin() || isAdminGudang()) && (
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
                    )}
                </TabView>
            </div>
        </div>
    </div>
);
};
export default Dashboard;