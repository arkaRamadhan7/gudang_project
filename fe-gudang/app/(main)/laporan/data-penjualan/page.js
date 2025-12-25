"use client"
import { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const LaporanPenjualan = () => {
    const [toko, setToko] = useState([]);
    const [selectedToko, setSelectedToko] = useState(null);
    const [dataPenjualan, setDataPenjualan] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchToko = useCallback(async () => {
    try {
        const response = await fetch('/api/toko');
        const result = await response.json(); // Sekarang ini akan berhasil

        if (result && Array.isArray(result.data)) {
            setToko(result.data); // <-- Ambil array dari properti 'data'
        } else {
            console.error("Format data dari API tidak sesuai:", result);
            setToko([]);
        }

    } catch (error) {
        console.error("Gagal mengambil data toko:", error);
        setToko([]);
    }
}, []);
    useEffect(() => {
        fetchToko();
    }, [fetchToko]); 

    const fetchPenjualan = useCallback((kodeToko) => {
    if (!kodeToko) return;

    setLoading(true);
    setDataPenjualan([]); // Reset data sebelum fetch baru

    fetch(`/api/data-penjualan/${kodeToko}`)
        .then(res => res.json())
        .then(apiResponse => {
            if (apiResponse && Array.isArray(apiResponse.data)) {
                setDataPenjualan(apiResponse.data);
            } else {
                console.warn("Tidak ada data penjualan atau format respons salah.", apiResponse);
                setDataPenjualan([]);
            }
        })
        .catch(err => {
            console.error("Gagal mengambil data penjualan:", err);
            setDataPenjualan([]); // Set ke array kosong jika terjadi error
        })
        .finally(() => setLoading(false));
}, []);

    const onTokoChange = (e) => {
        const kodeToko = e.value;
        setSelectedToko(kodeToko);
        fetchPenjualan(kodeToko);
    }
    
    const cardHeader = (
      <div className="flex justify-content-between align-items-center">
          <h2 className="m-0">Laporan Penjualan per Toko</h2>
      </div>
    );

    return (
        <div className="p-grid p-fluid p-4">
            <div className="p-col-12">
                <Card title={cardHeader}>
                    <div className="p-field p-grid">
                        <label htmlFor="toko-dropdown" className="p-col-12 p-md-2">Pilih Toko:</label>
                        <div className="p-col-12 p-md-10">
                            <Dropdown 
                                id="toko-dropdown"
                                value={selectedToko} 
                                options={toko} 
                                onChange={onTokoChange} 
                                optionLabel="NAMA"
                                optionValue="KODE"
                                placeholder="-- Pilih Toko --" 
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <DataTable 
                            value={dataPenjualan} 
                            loading={loading} 
                            paginator 
                            rows={10} 
                            emptyMessage="Tidak ada data penjualan untuk ditampilkan."
                        >
                            <Column field="STATUS" header="Status" sortable></Column>
                            <Column field="KETERANGAN" header="Keterangan" sortable></Column>
                            <Column field="FAKTUR" header="Faktur" sortable></Column>
                            <Column field="HARGA" header="Harga" body={(rowData) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rowData.HARGA)} sortable></Column>
                            <Column field="QTY" header="Qty" sortable></Column>
                            <Column field="KREDIT" header="Kredit" sortable></Column>
                        </DataTable>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LaporanPenjualan;