'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';

export const dynamic = "force-dynamic";

const TokoPage = () => {
  const toastRef = useRef(null);
  const [toko, setToko] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); 
  const [selectedToko, setSelectedToko] = useState(null);
  const [gudangOption, setGudangOptions] = useState([]);
  const [form, setForm] = useState({
    KODE: '',
    NAMA: '',
    KETERANGAN: '',
    GUDANG: '',
    ALAMAT: ''
  });

  useEffect(() => {
    fetchToko();
    fetchGudangOptions();
  }, []);

  const fetchToko = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/toko');
      const json = await res.json();

      if (json.status === '00') {
        setToko(json.data);
      } else {
        toastRef.current?.showToast(json.status, json.message);
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal mengambil data Toko');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGudangOptions = async () => {
    try {
      const res = await fetch ('/api/gudang/nama');
      const json = await res.json();

      if (json.status === '00') {
        const option = json.namaGudang.map(nama =>({
          label : nama,
          value : nama
        }));
        setGudangOptions(option);
      }
    }catch (err) {
      console.error('gagal mengabil data dari gudang',err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url =
        dialogMode === 'add' ? '/api/toko' : `/api/toko/${selectedToko.ID}`;
      const method = dialogMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      toastRef.current?.showToast(json.status, json.message);

      if (json.status === '00') {
        await fetchToko();
        resetForm();
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal menyimpan data toko');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus Toko "${item.NAMA}"?`)) return;
    try {
      const res = await fetch(`/api/toko/${item.ID}`, { method: 'DELETE' });
      const json = await res.json();

      toastRef.current?.showToast(json.status, json.message);

      if (json.status === '00') {
        setToko((prev) => prev.filter((r) => r.ID !== item.ID));
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal menghapus Toko');
    }
  };

  // Function untuk reset form dengan nilai kosong
  const resetForm = () => {
    setForm({ 
      KODE: '', 
      NAMA: '', 
      KETERANGAN: '', 
      GUDANG: '',
      ALAMAT: '' 
    });
    setDialogMode(null);
    setSelectedToko(null);
  };

  // Function untuk membuka dialog tambah dengan form kosong
  const openAddDialog = () => {
    setDialogMode('add');
    setSelectedToko(null);
    setForm({ 
      KODE: '', 
      NAMA: '', 
      KETERANGAN: '', 
      GUDANG: '',
      ALAMAT: '' 
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Toko</h3>

      <div className="flex justify-end mb-4">
        <Button
          label="Tambah Toko"
          icon="pi pi-plus"
          onClick={openAddDialog}
        />
      </div>

      <DataTable
        value={toko}
        loading={isLoading}
        paginator
        rows={10}
        scrollable
        size="small"
        className="text-sm"
      >
        <Column field="KODE" header="Kode" />
        <Column field="NAMA" header="Nama" />
        <Column field="KETERANGAN" header="Keterangan" />
        <Column field="GUDANG" header="Gudang" />
        <Column field="ALAMAT" header="Alamat" />
        <Column
          header="Aksi"
          style={{ width: '150px' }}
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="warning"
                onClick={() => {
                  setDialogMode('edit');
                  setSelectedToko(row);
                  setForm({ 
                    KODE: row.KODE || '',
                    NAMA: row.NAMA || '',
                    KETERANGAN: row.KETERANGAN || '',
                    GUDANG: row.GUDANG || '',
                    ALAMAT: row.ALAMAT || ''
                  });
                }}
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                onClick={() => handleDelete(row)}
              />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header={dialogMode === 'add' ? 'Tambah Toko' : 'Edit Toko'}
        visible={dialogMode !== null}
        onHide={resetForm}
        style={{ width: '30rem' }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-3">
            <label htmlFor="KODE">Kode</label>
            <InputText
              id="KODE"
              name="KODE"
              value={form.KODE}
              onChange={handleChange}
              className="w-full mt-2"
              required
              readOnly={dialogMode === 'edit'}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="NAMA">Nama</label>
            <InputText
              id="NAMA"
              name="NAMA"
              value={form.NAMA}
              onChange={handleChange}
              className="w-full mt-2"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="KETERANGAN">Keterangan</label>
            <InputText
              id="KETERANGAN"
              name="KETERANGAN"
              value={form.KETERANGAN}
              onChange={handleChange}
              className="w-full mt-2"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="GUDANG">Gudang</label>
            <Dropdown
              id="GUDANG"
              name="GUDANG"
              value={form.GUDANG}
              onChange={(e) => setForm(prev => ({...prev,GUDANG:e.value}))}
              options={gudangOption}
              placeholder='pilih gudang'
              className="w-full mt-2"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ALAMAT">Alamat</label>
            <InputText
              id="ALAMAT"
              name="ALAMAT"
              value={form.ALAMAT}
              onChange={handleChange}
              className="w-full mt-2"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label="Simpan"
              icon="pi pi-save"
              severity="success"
            />
          </div>
        </form>
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default TokoPage;