/* eslint-disable @next/next/no-img-element */
'use client';

import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';

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

    return (
        <div className="grid">
            {[{
                label: "Orders", value: "152", icon: "pi-shopping-cart", bg: "bg-blue-100", color: "text-blue-500", subtitle: "24 new", note: "since last visit"
            }, {
                label: "Revenue", value: "$2.100", icon: "pi-map-marker", bg: "bg-orange-100", color: "text-orange-500", subtitle: "%52+ ", note: "since last week"
            }, {
                label: "Customers", value: "28441", icon: "pi-inbox", bg: "bg-cyan-100", color: "text-cyan-500", subtitle: "520", note: "newly registered"
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
