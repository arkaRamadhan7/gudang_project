
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/ToastNotifier';
import '@/styles/page/gudang.scss'

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
  <div className="gudang-container">
    <div className="gudang-header">
      <div className="header-content">
        <div className="title-section">
          <i className="pi pi-warehouse header-icon"></i>
          <h3 className="page-title">Master Gudang</h3>
        </div>
        <Button
          label="Tambah Gudang"
          icon="pi pi-plus"
          className="btn-add"
          onClick={() => {
            setDialogMode('add');
            setForm(defaultForm);
            setSelectedGudang(null);
          }}
        />
      </div>
    </div>

    <div className="gudang-content">
      <DataTable
        size="small"
        className="custom-datatable"
        value={gudangList}
        paginator
        rows={10}
        loading={isLoading}
        scrollable
        emptyMessage="Tidak ada data gudang"
      >
        <Column 
          field="KODE" 
          header="Kode" 
          className="col-kode"
        />
        <Column 
          field="nama" 
          header="Nama" 
          className="col-nama"
        />
        <Column 
          field="alamat" 
          header="Alamat" 
          className="col-alamat"
        />
        <Column 
          field="KETERANGAN" 
          header="Keterangan" 
          className="col-keterangan"
        />
        <Column
          header="Aksi"
          body={(row) => (
            <div className="action-buttons">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="warning"
                className="btn-edit"
                tooltip="Edit"
                tooltipOptions={{ position: 'top' }}
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
                className="btn-delete"
                tooltip="Hapus"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleDelete(row)}
              />
            </div>
          )}
          className="col-action"
        />
      </DataTable>
    </div>

    <Dialog
      key={dialogMode}
      header={
        <div className="dialog-header">
          <i className={`pi ${dialogMode === 'edit' ? 'pi-pencil' : 'pi-plus-circle'}`}></i>
          <span>{dialogMode === 'edit' ? 'Edit Gudang' : 'Tambah Gudang'}</span>
        </div>
      }
      visible={dialogMode !== null}
      onHide={resetFormAndCloseDialog}
      className="gudang-dialog"
    >
      <form
        className="gudang-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="form-group">
          <label htmlFor="KODE" className="form-label">
            <i className="pi pi-tag"></i>
            Kode
          </label>
          <InputText
            id="KODE"
            name="KODE"
            value={form.KODE}
            onChange={handleChange}
            className="form-input"
            placeholder="Masukkan kode gudang"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nama" className="form-label">
            <i className="pi pi-building"></i>
            Nama
          </label>
          <InputText
            id="nama"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="form-input"
            placeholder="Masukkan nama gudang"
          />
        </div>

        <div className="form-group">
          <label htmlFor="alamat" className="form-label">
            <i className="pi pi-map-marker"></i>
            Alamat
          </label>
          <InputText
            id="alamat"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            className="form-input"
            placeholder="Masukkan alamat gudang"
          />
        </div>

        <div className="form-group">
          <label htmlFor="KETERANGAN" className="form-label">
            <i className="pi pi-info-circle"></i>
            Jenis Gudang
          </label>
          <Dropdown
            id="KETERANGAN"
            name="KETERANGAN"
            value={form.KETERANGAN} 
            options={jenisGudangList}
            onChange={(e) => setForm(prev => ({ ...prev, KETERANGAN: e.value }))}
            className="form-dropdown"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih jenis gudang"
          />
        </div>

        <div className="form-footer">
          <Button
            type="button"
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            className="btn-cancel"
            onClick={resetFormAndCloseDialog}
          />
          <Button
            type="submit"
            label="Simpan"
            icon="pi pi-save"
            severity="success"
            className="btn-submit"
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