'use client';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../(auth)/context/authContext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [lineOptions, setLineOptions] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const [totalStockColumns, setTotalStockColumns] = useState(null);
    const [totalGudangColumns, setTotalGudangColumns] = useState(null);
    const [totalMutasiColoumns, setTotalMutasiColoumns] = useState(null);
    const toast = useRef(null);
    
    const { user, loading, initialized, logout } = useAuth(); 
    


    const applyLightTheme = () => {
        const options = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#495057' },
                    grid: { color: '#ebedef' }
                },
                y: {
                    ticks: { color: '#495057' },
                    grid: { color: '#ebedef' }
                }
            }
        };

        setLineOptions(options);
    };

    const applyDarkTheme = () => {
        const options = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ebedef' },
                    grid: { color: 'rgba(160, 167, 181, .3)' }
                },
                y: {
                    ticks: { color: '#ebedef' },
                    grid: { color: 'rgba(160, 167, 181, .3)' }
                }
            }
        };

        setLineOptions(options);
    };
    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);



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


    if (!initialized || loading) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-3">Loading Dashboard...</p>
                    <small className="text-500">
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
            <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <p className="text-500">Redirecting to login</p>
                </div>
            </div>
        );
    }


    return (
        <div className="grid">
            <Toast ref={toast} />
            
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h5>Selamat datang, {user.username}!</h5>
                        </div>
                    </div>
                        
                </div>
            </div>

            {[{
                label: "Orders",value: totalStockColumns ? totalStockColumns.toString() : "Loading...", icon: "pi-shopping-cart", bg: "bg-blue-100", color: "text-blue-500", note: "total since last month"
            }, {
                label: "Gudang", value: totalGudangColumns ? totalGudangColumns.toString(): "Loading...", icon: "pi-building", bg: "bg-orange-100", color: "text-orange-500",  note: "since last week"
            }, {
                label: "Mutasi antar gudang", value: totalMutasiColoumns ? totalMutasiColoumns.toString() : "Loading...", icon: " pi-sync", bg: "bg-cyan-100", color: "text-cyan-500", note: "Total all mutasi antar gudang"
            }, {
                label: "Comments", value: "152 Unread", icon: "pi pi-comment", bg: "bg-purple-100", color: "text-purple-500", subtitle: "85", note: "responded"
            }].map((card, i) => (
                <div className="col-12 lg:col-6 xl:col-3" key={i}>
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">{card.label}</span>
                                <div className="text-900 font-medium text-xl">{card.value}</div>
                            </div>
                            <div className={`flex align-items-center justify-content-center ${card.bg} border-round`} style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className={`pi ${card.icon} ${card.color} text-xl`} />
                            </div>
                        </div>
                        <span className="text-green-500 font-medium">{card.subtitle} </span>
                        <span className="text-500">{card.note}</span>
                    </div>
                </div>
            ))}

            {['Sehari', 'Seminggu', 'Sebulan'].map((periode, i) => (
                <div className="col-12" key={i}>
                    <div className="card">
                        <h5>Data Suhu Selama {periode}</h5>
                        <Chart type="line" data={lineData} options={lineOptions} />
                    </div>
                    <div className="card">
                        <DataTable />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;