'use client';

import { useEffect, useRef, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import ToastNotifier from '@/app/components/ToastNotifier';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
export const dynamic = "force-dynamic";

export default function GolonganStokPage() {
  const toastRef = useRef();
  const [golongan, setGolongan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [form, setForm] = useState({ KODE: '', KETERANGAN: '' });

  useEffect(() => {
    fetchGolongan();
  }, []);

  const fetchGolongan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/golonganstock', {
        cache: 'no-store', // ⬅️ penting agar tidak di-prerender
      });
      const result = await res.json();

      if (result.status === '00' && Array.isArray(result.data)) {
        setGolongan(result.data);
      } else {
        toastRef.current?.showToast(result.status || '99', result.message || 'Gagal memuat data');
      }
    } catch (error) {
      toastRef.current?.showToast('99', 'Gagal memuat data golongan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.KODE || !form.KETERANGAN) {
      toastRef.current?.showToast('99', 'Semua field wajib diisi');
      return;
    }

    try {
      let res;
      if (dialogMode === 'add') {
        res = await fetch('/api/golonganstock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`/api/golonganstock/${form.KODE}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ KETERANGAN: form.KETERANGAN }),
        });
      }

      const json = await res.json();
      toastRef.current?.showToast(json.status, json.message);

      if (json.status === '00') {
        fetchGolongan();
        setDialogVisible(false);
        setForm({ KODE: '', KETERANGAN: '' });
      }
    } catch (error) {
      toastRef.current?.showToast('99', 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (kode) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`/api/golonganstock/${kode}`, { method: 'DELETE' });
      const json = await res.json();
      toastRef.current?.showToast(json.status, json.message);

      if (json.status === '00') fetchGolongan();
    } catch (error) {
      toastRef.current?.showToast('99', 'Gagal menghapus data');
    }
  };

  const actionButtons = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setForm({ KODE: rowData.KODE, KETERANGAN: rowData.KETERANGAN });
          setDialogMode('edit');
          setDialogVisible(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(rowData.KODE)}
      />
    </div>
  );

  return (
    <div className="p-4 card">
      <h2 className="text-xl font-semibold mb-4">Data Golongan Stok</h2>

      <Button
        label="Tambah Golongan"
        icon="pi pi-plus"
        className="mb-3"
        onClick={() => {
          setForm({ KODE: '', KETERANGAN: '' });
          setDialogMode('add');
          setDialogVisible(true);
        }}
      />

      <DataTable
        value={golongan}
        dataKey="KODE"
        loading={loading}
        paginator
        rows={10}
        stripedRows
        emptyMessage="Tidak ada data"
        scrollable
        className='card'
      >
        <Column field="KODE" header="Kode" style={{ minWidth: '100px' }} />
        <Column field="KETERANGAN" header="Nama Golongan" style={{ minWidth: '200px' }} />
        <Column header="Aksi" body={actionButtons} style={{ minWidth: '200px', textAlign: 'center' }} />
      </DataTable>

      <ToastNotifier ref={toastRef} />

      <Dialog
        header={dialogMode === 'edit' ? 'Edit Golongan Stok' : 'Tambah Golongan Stok'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '30rem' }}
        modal
      >
        <div className="flex flex-col gap-y-4">
          <div>
            <label htmlFor="KODE" className="block mb-1 font-medium">Kode</label>
            <InputText
              id="KODE"
              value={form.KODE}
              onChange={(e) => setForm({ ...form, KODE: e.target.value })}
              className="w-full"
              readOnly={dialogMode === 'edit'} // ⬅️ biar kode tidak bisa diubah saat edit
            />
          </div>

          <div>
            <label htmlFor="KETERANGAN" className="block mb-1 font-medium">Keterangan</label>
            <InputText
              id="KETERANGAN"
              value={form.KETERANGAN}
              onChange={(e) => setForm({ ...form, KETERANGAN: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button label="Batal" onClick={() => setDialogVisible(false)} />
          <Button label="Simpan" onClick={handleSubmit} />
        </div>
      </Dialog>
    </div>
  );
}
