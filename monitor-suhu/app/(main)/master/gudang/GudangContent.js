
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/ToastNotifier';

const defaultForm = {
  KODE: '',
  nama: '',
  alamat: '',
  KETERANGAN: '',
};

const GudangContent = () => {
  const toastRef = useRef(null);
  const [gudangList, setGudangList] = useState([]);
  const [dialogMode, setDialogMode] = useState(null); 
  const [selectedGudang, setSelectedGudang] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jenisGudangList, setJenisGudangList] = useState([
    { label: 'Gudang Bahan Baku', value: 'Gudang Bahan Baku' },
    { label: 'Gudang Barang Jadi', value: 'Gudang Barang Jadi' },
    { label: 'Gudang Transit', value: 'Gudang Pendingin' },
  ]);

  const fetchGudang = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gudang');
      const json = await res.json();
      console.log('RESPON API:', json); 
      if (res.ok && json.status === '00') {
        setGudangList(Array.isArray(json.gudang || json.data) ? (json.gudang || json.data) : []);
      } else {
        toastRef.current?.showToast('99', json.message || 'Gagal memuat data gudang');
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGudang();
  }, []);

  const resetFormAndCloseDialog = () => {
    setForm(defaultForm);
    setDialogMode(null);
    setSelectedGudang(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!form.KODE || !form.nama || !form.alamat || !form.KETERANGAN) {
      toastRef.current?.showToast('99', 'Kode, Nama, alamat, dan Keterangan wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      let res, json;

      if (dialogMode === 'add') {
        res = await fetch('/api/gudang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else if (dialogMode === 'edit' && selectedGudang) {
        res = await fetch(`/api/gudang/edit?id=${selectedGudang.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      json = await res.json();

      if (!res.ok) {
        toastRef.current?.showToast('99', json.message || 'Gagal menyimpan data');
        setIsSubmitting(false);
        return;
      }

      toastRef.current?.showToast('00', json.message);
      resetFormAndCloseDialog();
      await fetchGudang();
    } catch (err) {
      toastRef.current?.showToast('99', 'Terjadi kesalahan');
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus gudang "${item.nama}"?`)) return;
    try {
      const res = await fetch(`/api/gudang/${item.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok) {
        toastRef.current?.showToast('00', json.message);
        await fetchGudang();
      } else {
        toastRef.current?.showToast(json.status || '99', json.message);
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal menghapus gudang');
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold">Master Gudang</h3>

      <div className="flex justify-end my-3">
        <Button
          label="Tambah Gudang"
          icon="pi pi-plus"
          className="text-sm"
          onClick={() => {
            setDialogMode('add');
            setForm(defaultForm);
            setSelectedGudang(null);
          }}
        />
      </div>

      <DataTable
        size="small"
        className="text-sm"
        value={gudangList}
        paginator
        rows={10}
        loading={isLoading}
        scrollable
      >
        <Column field="KODE" header="Kode" />
        <Column field="nama" header="Nama" />
        <Column field="alamat" header="Alamat" />
        <Column field="KETERANGAN" header="Keterangan" />
        <Column
          header="Aksi"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="warning"
                onClick={() => {
                  setDialogMode('edit');
                  setSelectedGudang(row);
                  setForm({
                    KODE: row.KODE,
                    nama: row.nama,
                    alamat: row.alamat || '',
                    KETERANGAN: row.KETERANGAN,
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
          style={{ width: '150px' }}
        />
      </DataTable>

      <Dialog
        key={dialogMode}
        header={dialogMode === 'edit' ? 'Edit Gudang' : 'Tambah Gudang'}
        visible={dialogMode !== null}
        onHide={resetFormAndCloseDialog}
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
              placeholder="Kode Gudang"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="nama">Nama</label>
            <InputText
              id="nama"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full mt-2"
              placeholder="Nama Gudang"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="alamat">Alamat</label>
            <InputText
              id="alamat"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              className="w-full mt-2"
              placeholder="Alamat Gudang"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="KETERANGAN">Jenis Gudang</label>
            <Dropdown
              id="KETERANGAN"
              name="KETERANGAN"
              value={form.KETERANGAN} 
              options={jenisGudangList}
              onChange={(e) => setForm(prev => ({ ...prev, KETERANGAN: e.value }))}
              className="w-full mt-2"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis Gudang"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label="Simpan"
              icon="pi pi-save"
              severity="success"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default GudangContent;