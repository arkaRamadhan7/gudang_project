'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/ToastNotifier';

const defaultForm = {
  KODE: '',
  KODE_TOKO: '',
  NAMA: '',
  JENIS: '',
  DOS: '',
  SATUAN: '',
  ISI: '',
  BERAT: '',
  HB: '',
  DISCOUNT: '',
  START_DISC: '',
  END_DISC: '',
  HJ: '',
  HJ2: '',
  EXPIRED: '',
  TGL_MASUK: '',
  QTY: '',
  BARCODE: ''
};

const StockTokoContent = () => {
  const toastRef = useRef(null);
  const [dataStockToko, setDataStockToko] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [dialogMode, setDialogMode] = useState(null);
  const [tokoOptions, setTokoOptions] = useState([]);
  const [jenisOptions, setJenisOptions] = useState([]);

  const fetchStockToko = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/laporan/stock-toko');
      const json = await res.json();
      
      // Debug: Lihat response lengkap
      console.log('Response dari API:', json);
      console.log('Status:', json.status);
      console.log('Data:', json.data);
      console.log('Data.data:', json.data?.data);
      
      if (json.status === '00' && json.data?.data) {
        console.log('Setting data:', json.data.data);
        setDataStockToko(json.data.data);
      } else {
        console.log('Status bukan 00 atau data kosong');
        toastRef.current?.showToast(json.status, json.message);
      }
    } catch (error) {
      console.error('Error fetching:', error);
      toastRef.current?.showToast('99', 'Gagal memuat data stock toko');
    } finally {
      setLoading(false);
    }
  };

  const fetchToko = useCallback(async () => {
    try {
      const res = await fetch('/api/toko');
      const json = await res.json();
      if (json.status === '00') {
        const options = json.data.map(toko => ({ 
          value: toko.KODE_TOKO, 
          label: `${toko.KODE_TOKO} - ${toko.NAMA_TOKO}` 
        }));
        setTokoOptions(options);
      } else setTokoOptions([]);
    } catch (error) {
      console.error('Gagal mengambil data toko', error);
      setTokoOptions([]);
    }
  }, []);


  const handleDetail = (row) => {
    setForm({ ...row });
    setDialogMode('detail');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (fieldName, dateValue) => {
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      setForm(prev => ({ ...prev, [fieldName]: `${year}-${month}-${day}` }));
    } else {
      setForm(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  useEffect(() => {
    fetchToko();
    fetchStockToko();
  }, [fetchToko, ]);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Stock Toko</h3>

      <DataTable 
        value={dataStockToko} 
        paginator 
        rows={10} 
        loading={loading} 
        scrollable 
        size="small"
        emptyMessage="Tidak ada data"
      >
        <Column field="ID" header="ID" sortable />
        <Column field="KODE" header="Kode" sortable />
        <Column field="KODE_TOKO" header="Kode Toko" sortable />
        <Column field="NAMA" header="Nama" sortable />
        <Column field="JENIS" header="Jenis" sortable />
        <Column field="DOS" header="Dos" />
        <Column field="SATUAN" header="Satuan" />
        <Column field="ISI" header="Isi" />
        <Column field="BERAT" header="Berat" />
        <Column field="HB" header="HB" />
        <Column field="DISCOUNT" header="Discount %" />
        <Column field="START_DISC" header="Start Disc" />
        <Column field="END_DISC" header="End Disc" />
        <Column field="HJ" header="HJ" />
        <Column field="HJ2" header="HJ2" />
        <Column field="EXPIRED" header="Expired" />
        <Column field="TGL_MASUK" header="Tgl Masuk" />
        <Column field="QTY" header="Qty" />
        <Column field="BARCODE" header="Barcode" />
        <Column
          header="Aksi"
          body={(rowData) => (
            <Button 
              icon="pi pi-eye" 
              size="small" 
              severity="info" 
              onClick={() => handleDetail(rowData)} 
              label="Detail"
            />
          )}
        />
      </DataTable>

      <Dialog
        header="Detail Stock Toko"
        visible={dialogMode !== null}
        onHide={() => setDialogMode(null)}
        style={{ width: '50rem' }}
        maximizable
      >
        <div className="grid grid-cols-2 gap-4">
          {/* ID */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">ID</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.ID || '-'}</div>
          </div>

          {/* KODE */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Kode</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.KODE || '-'}</div>
          </div>

          {/* KODE_TOKO */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Kode Toko</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.KODE_TOKO || '-'}</div>
          </div>

          {/* NAMA */}
          <div className="mb-3 col-span-2">
            <label className="block font-medium mb-1 text-gray-700">Nama</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.NAMA || '-'}</div>
          </div>

          {/* JENIS */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Jenis</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.JENIS || '-'}</div>
          </div>

          {/* DOS */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Dos</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.DOS || '-'}</div>
          </div>

          {/* SATUAN */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Satuan</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.SATUAN || '-'}</div>
          </div>

          {/* ISI */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Isi</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.ISI || '-'}</div>
          </div>

          {/* BERAT */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Berat</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.BERAT || '-'}</div>
          </div>

          {/* HB */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Harga Beli (HB)</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.HB ? `Rp ${parseFloat(form.HB).toLocaleString('id-ID')}` : '-'}</div>
          </div>

          {/* DISCOUNT */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Discount (%)</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.DISCOUNT ? `${form.DISCOUNT}%` : '-'}</div>
          </div>

          {/* START_DISC */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Start Discount</label>
            <div className="p-3 bg-slate-700 text-white rounded">{formatDateDisplay(form.START_DISC)}</div>
          </div>

          {/* END_DISC */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">End Discount</label>
            <div className="p-3 bg-slate-700 text-white rounded">{formatDateDisplay(form.END_DISC)}</div>
          </div>

          {/* HJ */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Harga Jual (HJ)</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.HJ ? `Rp ${parseFloat(form.HJ).toLocaleString('id-ID')}` : '-'}</div>
          </div>

          {/* HJ2 */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Harga Jual 2 (HJ2)</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.HJ2 ? `Rp ${parseFloat(form.HJ2).toLocaleString('id-ID')}` : '-'}</div>
          </div>

          {/* EXPIRED */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Expired</label>
            <div className="p-3 bg-slate-700 text-white rounded">{formatDateDisplay(form.EXPIRED)}</div>
          </div>

          {/* TGL_MASUK */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Tanggal Masuk</label>
            <div className="p-3 bg-slate-700 text-white rounded">{formatDateDisplay(form.TGL_MASUK)}</div>
          </div>

          {/* QTY */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Quantity</label>
            <div className="p-3 bg-slate-600 text-white rounded font-semibold">{form.QTY || '0'}</div>
          </div>

          {/* BARCODE */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-gray-700">Barcode</label>
            <div className="p-3 bg-slate-700 text-white rounded">{form.BARCODE || '-'}</div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            type="button" 
            label="Tutup" 
            icon="pi pi-times" 
            onClick={() => setDialogMode(null)}
          />
        </div>
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default StockTokoContent;