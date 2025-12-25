'use client';

import { useEffect, useRef, useState, useCallback} from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
const defaultForm = {
  STATUS: '', FAKTUR: '', TGL: '', GUDANG: '', KODE: '', QTY: '', DEBET: '', KREDIT: '',
  HARGA: '', DISCITEM: '', DISCFAKTUR1: '', DISCFAKTUR2: '', HP: '', KETERANGAN: '',
  DATETIME: '', USERNAME: '', URUT: '', SATUAN: '', PPN: ''
};

const excludeFields = ['STATUS', 'FAKTUR', 'TGL', 'GUDANG', 'KODE', 'QTY']; // sudah dibuat manual di form

const KartuStockContent = () => {
  const toastRef = useRef(null);
  const [dataKartuStock, setDataKartuStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [dialogMode, setDialogMode] = useState(null);
  const [gudangOptions, setGudangOptions] = useState([]);

  const fetchKartuStock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kartustock');
      const json = await res.json();
      if (json.status === '00') setDataKartuStock(json.data);
      else toastRef.current?.showToast(json.status, json.message);
    } catch {
      toastRef.current?.showToast('99', 'Gagal memuat data kartu stok');
    } finally {
      setLoading(false);
    }
  };

  const fetchGudang = useCallback(async () => {
    try {
      const res = await fetch("/api/gudang/nama");
      const json = await res.json();
      if (json.status === "00") {
        const options = json.namaGudang.map(nama => ({ value: nama, label: nama }));
        setGudangOptions(options);
      } else setGudangOptions([]);
    } catch (error) {
      console.error("gagal mengambil data nama gudang", error);
      setGudangOptions([]);
    }
  }, []);

  const handleSubmit = async () => {
    const isEdit = dialogMode === 'edit';
    const endpoint = isEdit ? `/api/kartustock/${form.id}` : '/api/kartustock';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (res.ok && json.status === '00') {
        toastRef.current?.showToast('00', isEdit ? 'Berhasil mengedit data' : 'Berhasil menambah data');
        fetchKartuStock();
      } else {
        toastRef.current?.showToast('99', json.message || 'Gagal menyimpan data');
      }
    } catch {
      toastRef.current?.showToast('99', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setDialogMode(null);
      setForm(defaultForm);
    }
  };

  const handleDelete = async (row) => {
    try {
      const res = await fetch(`/api/kartustock/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.status === '00') {
        toastRef.current?.showToast('00', 'Data berhasil dihapus');
        fetchKartuStock();
      } else toastRef.current?.showToast('99', json.message || 'Gagal menghapus data');
    } catch {
      toastRef.current?.showToast('99', 'Gagal menghapus data');
    }
  };

  const handleEdit = (row) => {
    setForm({ ...row });
    setDialogMode('edit');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchGudang();
    fetchKartuStock();
  }, [fetchGudang]);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Kartu Stok</h3>

      <Button
        label="Tambah Data"
        icon="pi pi-plus"
        className="mb-3"
        onClick={() => {
          setForm(defaultForm);
          setDialogMode('add');
        }}
      />

      <DataTable value={dataKartuStock} paginator rows={10} loading={loading} scrollable size="small">
        {Object.keys(defaultForm).map(field => (
          <Column key={field} field={field} header={field} />
        ))}
        <Column
          header="Aksi"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => handleEdit(rowData)} />
              <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(rowData)} />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header={dialogMode === 'add' ? 'Tambah Data Kartu Stok' : 'Edit Data Kartu Stok'}
        visible={dialogMode !== null}
        onHide={() => setDialogMode(null)}
        style={{ width: '40rem' }}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* STATUS */}
          <div className="mb-3">
            <label htmlFor="STATUS" className="block font-medium mb-1">Status</label>
            <Dropdown
              id="STATUS"
              name="STATUS"
              value={form.STATUS}
              options={[
                { label: 'Masuk', value: 'MASUK' },
                { label: 'Keluar', value: 'KELUAR' }
              ]}
              onChange={(e) => setForm(prev => ({ ...prev, STATUS: e.value }))}
              placeholder="Pilih Status"
              className="w-full"
            />
          </div>

          {/* FAKTUR */}
          <div className="mb-3">
            <label htmlFor="FAKTUR">Faktur</label>
            <InputText id="FAKTUR" name="FAKTUR" value={form.FAKTUR} onChange={handleChange} className="w-full" />
          </div>

          {/* TGL */}
          <div className="mb-3">
            <label htmlFor="TGL">Tanggal</label>
            <Calendar
              id="TGL"
              name="TGL"
              value={form.TGL ? new Date(form.TGL + 'T00:00:00') : null}
              onChange={(e) => {
                const date = e.value;
                if (date instanceof Date && !isNaN(date)) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setForm(prev => ({ ...prev, TGL: `${year}-${month}-${day}` }));
                } else setForm(prev => ({ ...prev, TGL: '' }));
              }}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full"
            />
          </div>

          {/* GUDANG */}
          <div className="mb-3">
            <label htmlFor="GUDANG">Gudang</label>
            <Dropdown
              id="GUDANG"
              name="GUDANG"
              value={form.GUDANG}
              options={gudangOptions}
              onChange={(e) => setForm(prev => ({ ...prev, GUDANG: e.value }))}
              placeholder="Pilih Gudang"
              className="w-full"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          {/* KODE */}
          <div className="mb-3">
            <label htmlFor="KODE">Kode</label>
            <InputText id="KODE" name="KODE" value={form.KODE} onChange={handleChange} className="w-full" />
          </div>

          {/* QTY */}
          <div className="mb-3">
            <label htmlFor="QTY">Qty</label>
            <InputText id="QTY" name="QTY" value={form.QTY} onChange={handleChange} className="w-full" />
          </div>

          {/* Render sisa field secara otomatis */}
          {Object.keys(form).filter(f => !excludeFields.includes(f)).map(field => (
            <div className="mb-3" key={field}>
              <label htmlFor={field}>{field}</label>
              <InputText
                id={field}
                name={field}
                value={form[field] ?? ''}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <Button type="submit" label="Simpan" icon="pi pi-save" />
          </div>
        </form>
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default KartuStockContent;
