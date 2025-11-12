'use client';

import React, { useContext, useEffect, useState, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '../(auth)/context/authContext';
import "@/styles/page/dashboard.scss";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [penjualanData, setPenjualanData] = useState([]);
    const [loadingPenjualan, setLoadingPenjualan] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [lineOptions, setLineOptions] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const [totalStockColumns, setTotalStockColumns] = useState(null);
    const [totalGudangColumns, setTotalGudangColumns] = useState(null);
    const [totalMutasiColoumns, setTotalMutasiColoumns] = useState(null);
    const [totalUsersColoumns, setTotalUsersColoumns] = useState(null);
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
                
                // Handle berbagai format response
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

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    };

    // Template untuk kolom harga
    const hargaBodyTemplate = (rowData) => {
        return formatCurrency(rowData.HARGA);
    };

    // Template untuk kolom kredit
    const kreditBodyTemplate = (rowData) => {
        return formatCurrency(rowData.KREDIT);
    };

    // Header tabel 
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <h5 className="m-0">Data Penjualan</h5>
            </div>
        );
    };

    if (!initialized || loading) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner"></i>
                    <p>Loading Dashboard...</p>
                    <small>
                        Initialized: {initialized ? 'Yes' : 'No'} | 
                        Loading: {loading ? 'Yes' : 'No'} | 
                        User: {user?.username || 'None'}
                    </small>
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
            
            <div className="col-12" style={{ paddingBottom: 0 }}>
                <div className="card">
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h5>Selamat datang, {user.username}!</h5>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Tabel Data Penjualan */}
            <div className="col-12">
                <div className="card table-card">
                    <DataTable
                        value={penjualanData}
                        loading={loadingPenjualan}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        globalFilter={globalFilter}
                        header={renderHeader()}
                        emptyMessage="Tidak ada data penjualan"
                        stripedRows
                        className="custom-datatable"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                    >
                        <Column 
                            field="POSTING" 
                            header="Posting" 
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column 
                            field="FAKTUR" 
                            header="Faktur" 
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column 
                            field="TOKO" 
                            header="Toko" 
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column 
                            field="KODE" 
                            header="Kode" 
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column 
                            field="QTY" 
                            header="Qty" 
                            sortable
                            style={{ minWidth: '80px' }}
                        />
                        <Column 
                            field="KREDIT" 
                            header="Kredit" 
                            body={kreditBodyTemplate}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column 
                            field="HARGA" 
                            header="Harga" 
                            body={hargaBodyTemplate}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column 
                            field="HP" 
                            header="HP" 
                            sortable
                            style={{ minWidth: '130px' }}
                        />
                        <Column 
                            field="KETERANGAN" 
                            header="Keterangan" 
                            sortable
                            style={{ minWidth: '200px' }}
                        />
                        <Column 
                            field="USERNAME" 
                            header="Username" 
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;