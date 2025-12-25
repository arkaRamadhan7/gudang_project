'use client';
import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';   
import ToastNotifier from '@/app/components/ToastNotifier';

const LaporanStock = () => {
  const toastRef = useRef(null);
  const [data, setData] = useState([]);
  const [dataLaporan, setDataLaporan] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [listGudang, setListGudang] = useState([]);
  const [selectedGudang, setSelectedGudang] = useState(null);

  const [previewVisible, setPreviewVisible] = useState(false); 

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock/preview');
      const json = await res.json();
      if (json.status === '00') {
        setDataLaporan(json.data || []);
        setPreviewVisible(true);   
      } else {
        toastRef.current?.showToast('99', 'Terjadi kesalahan ambil preview');
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Terjadi kesalahan ambil preview');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/laporanstock');
      const json = await res.json();
      if (json.status === '00') {
        const rows = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.rows)
          ? json.data.rows
          : [];
        setData(rows);

        const grouped = {};
        const gudangSet = new Set();

        rows.forEach(item => {
          const gudangName = item.nama_gudang || item.NAMA_GUDANG || item.GUDANG || "-";
          const key = `${item.KODE}-${gudangName}`;
          gudangSet.add(gudangName);

          if (!grouped[key]) {
            grouped[key] = {
              KODE: item.KODE,
              NAMA: item.NAMA || item.KODE,
              GUDANG: gudangName,
              BARCODE: item.BARCODE,
              SATUAN: item.SATUAN,
              QTY: item.QTY
            };
          }
        });

        setDataLaporan(Object.values(grouped));
        setListGudang(Array.from(gudangSet).map(g => ({ label: g, value: g })));
      } else {
        toastRef.current?.showToast(json.status, json.message);
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal mengambil data Laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/stock/preview?download=excel');
      if (!res.ok) throw new Error('gagal download laporan');

      const blob  = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'laporan-stock.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toastRef.current?.showToast('99', 'terjadi kesalahan saat mendownload laporan');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = selectedGudang
    ? dataLaporan.filter(item => item.GUDANG === selectedGudang)
    : dataLaporan;

  // ✅ bikin dummy handleDownload biar gak error
  // const handleDownload = () => {
  //   toastRef.current?.showToast('00', 'Download laporan belum diimplementasi');
  // };

  const handleDelete = (row) => {
    setDataLaporan((prev) => prev.filter(item => item.KODE !== row.KODE || item.GUDANG !== row.GUDANG));
    toastRef.current?.showToast('00', `Data ${row.NAMA} di ${row.GUDANG} dihapus dari preview`);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Laporan Sisa Stok</h3>
      <div className="flex items-center gap-3 mb-3">
        <Button label="Refresh" icon="pi pi-refresh" onClick={fetchData}  className='p-button-outlined'/>
        <Button label="Preview Laporan" icon="pi pi-eye" onClick={fetchPreview} className='p-button-info' />
        <Dropdown
          value={selectedGudang}
          options={listGudang}
          onChange={(e) => setSelectedGudang(e.value)}
          placeholder="Pilih Gudang"
          showClear
          className="w-64 ml-auto"
        />
      </div>

      {/* tabel utama */}
      <DataTable value={filteredData} paginator rows={10} loading={loading} stripedRows>
        <Column field="KODE" header="Kode Produk" />
        <Column field="NAMA" header="Nama Produk" />
        <Column field="GUDANG" header="Gudang" />
        <Column field="BARCODE" header="Barcode" />
        <Column field="QTY" header="Sisa Stock" />
        <Column field="SATUAN" header="Satuan" />
      </DataTable>

      {/* dialog preview */}
<Dialog
  header="Preview Laporan Stok"
  visible={previewVisible}
  style={{ width: '80vw' }}
  onHide={() => setPreviewVisible(false)}  
>
  <DataTable value={dataLaporan} loading={loading} stripedRows paginator rows={10}>
    <Column field="KODE" header="Kode Produk" />
    <Column field="NAMA" header="Nama Produk" />
    <Column field="GUDANG" header="Gudang" />
    <Column field="BARCODE" header="Barcode" />
    <Column field="QTY" header="Sisa Stock" />
    <Column field="SATUAN" header="Satuan" />

    {/* ✅ Kolom Aksi */}
    <Column
      header="Aksi"
      body={(rowData) => (
        <Button
          icon="pi pi-trash"
          className=" p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
        />
      )}
      style={{ width: '100px', textAlign: 'center' }}
    />
  </DataTable>

  <div className="flex justify-end mt-4">
    <Button label="Download Laporan" icon="pi pi-download" onClick={handleDownload} />
  </div>
</Dialog>


      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default LaporanStock;
