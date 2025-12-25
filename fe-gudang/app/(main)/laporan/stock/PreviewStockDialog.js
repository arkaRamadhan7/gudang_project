'use client';
import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import ToastNotifier from '@/app/components/ToastNotifier';

const PreviewStockPage = () => {
  const toastRef = useRef(null);
  const [dataPreview, setDataPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock/preview');
      const json = await res.json();

      if (json.status === '00') {
        setDataPreview(json.data);
      } else {
        toastRef.current?.showToast('99', json.message || 'Gagal memuat data preview');
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Terjadi kesalahan ambil data preview');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rowData) => {
    toastRef.current?.showToast('00', `Edit produk: ${rowData.NAMA}`);
    // TODO: buka dialog edit / redirect ke form edit
  };

  const handleDelete = async (rowData) => {
    try {
      const res = await fetch(`/api/stock/${rowData.KODE}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.status === '00') {
        toastRef.current?.showToast('00', `Produk ${rowData.NAMA} berhasil dihapus`);
        fetchPreview();
      } else {
        toastRef.current?.showToast('99', json.message || 'Gagal hapus produk');
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Terjadi kesalahan saat hapus produk');
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
    fetchPreview();
  }, []);

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-sm"
        onClick={() => handleEdit(rowData)}
        title="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData)}
        title="Delete"
      />
    </div>
  );

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Preview Laporan Stok</h3>
     
     <div className='flex gap-2 mb-3'>
      <Button label="Refresh" icon="pi pi-refresh" className="mb-3" onClick={fetchPreview} />
     </div>
      

      <DataTable value={dataPreview} loading={loading} stripedRows paginator rows={10}>
        <Column field="KODE" header="Kode Produk" />
        <Column field="NAMA" header="Nama Produk" />
        <Column field="GUDANG" header="Gudang" />
        <Column field="BARCODE" header="Barcode" />
        <Column field="SISA" header="Sisa Stock" />
        <Column field="SATUAN" header="Satuan" />
        <Column header="Actions" body={actionBodyTemplate} style={{ width: '120px' }} />
      </DataTable>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default PreviewStockPage;
