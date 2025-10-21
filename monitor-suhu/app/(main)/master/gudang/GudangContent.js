'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/ToastNotifier';
import JenisGudangDropdown from '@/app/(main)/master/gudang/components/gudangDialogForm.js';
import '@/styles/page/gudang.scss';

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
  header={dialogMode === 'add' ? 'Tambah Gudang' : 'Edit Gudang'}
  visible={dialogMode !== null}
  style={{ width: '400px' }}
  modal
  onHide={() => setDialogMode(null)}
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
  >
    <div className="mb-3">
      <label htmlFor="KODE">Kode Gudang</label>
      <InputText
        id="KODE"
        name="KODE"
        value={form.KODE}
        onChange={handleChange}
        type="text"
        className="w-full mt-3"
        placeholder="Masukkan kode gudang"
      />
    </div>

    <div className="mb-3">
      <label htmlFor="nama">Nama Gudang</label>
      <InputText
        id="nama"
        name="nama"
        value={form.nama}
        onChange={handleChange}
        type="text"
        className="w-full mt-3"
        placeholder="Masukkan nama gudang"
      />
    </div>

    <div className="mb-3">
      <label htmlFor="alamat">Alamat</label>
      <InputText
        id="alamat"
        name="alamat"
        value={form.alamat}
        onChange={handleChange}
        type="text"
        className="w-full mt-3"
        placeholder="Masukkan alamat gudang"
      />
    </div>

    <div className="mb-3">
      <label htmlFor="KETERANGAN">Jenis Gudang</label>
      <JenisGudangDropdown
        value={form.KETERANGAN}
        onChange={(value) => setForm((prev) => ({ ...prev, KETERANGAN: value }))}
        placeholder="Pilih jenis gudang"
      />
    </div>


    <div className="flex justify-end">
      <Button
        type="submit"
        label="Submit"
        severity="success"
        icon="pi pi-save"
        disabled={isSubmitting}
      />
    </div>
  </form>
</Dialog>

<ToastNotifier ref={toastRef} />


    <ToastNotifier ref={toastRef} />
    
    <style jsx global>{`
      .gudang-dialog .p-dialog-content {
        background-color: #2c3e50 !important;
      }
      
      .gudang-dialog .p-dialog-header {
        background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
      }
      
      .gudang-form .form-input {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border: 1px solid #3d566e !important;
      }
      
      .gudang-form .form-input:focus {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
      }
      
      .gudang-form .form-input::placeholder {
        color: #64748b !important;
      }
      
      .p-dropdown-panel {
        background: #1e293b !important;
        border: 1px solid #3d566e !important;
      }
      
      .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
        color: #94a3b8 !important;
        background: transparent !important;
      }
      
      .p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
        background: rgba(59, 130, 246, 0.15) !important;
        color: #e2e8f0 !important;
      }
      
      .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
        background: rgba(59, 130, 246, 0.25) !important;
        color: #e2e8f0 !important;
      }
      
      /* Paginator Fix */
      .p-paginator {
        background: #34495e !important;
        border: none !important;
        border-top: 2px solid #3d566e !important;
        padding: 16px !important;
        border-radius: 0 0 12px 12px !important;
      }
      
      .p-paginator .p-paginator-first,
      .p-paginator .p-paginator-prev,
      .p-paginator .p-paginator-next,
      .p-paginator .p-paginator-last {
        color: #cbd5e1 !important;
        background: transparent !important;
        border: 1px solid #3d566e !important;
        border-radius: 8px !important;
      }
      
      .p-paginator .p-paginator-first:not(.p-disabled):hover,
      .p-paginator .p-paginator-prev:not(.p-disabled):hover,
      .p-paginator .p-paginator-next:not(.p-disabled):hover,
      .p-paginator .p-paginator-last:not(.p-disabled):hover {
        background: rgba(59, 130, 246, 0.15) !important;
        border-color: #3b82f6 !important;
        color: #3b82f6 !important;
      }
      
      .p-paginator .p-paginator-pages .p-paginator-page {
        color: #cbd5e1 !important;
        background: transparent !important;
        border: 1px solid transparent !important;
        border-radius: 8px !important;
        min-width: 2.5rem !important;
        height: 2.5rem !important;
      }
      
      .p-paginator .p-paginator-pages .p-paginator-page:hover {
        background: rgba(59, 130, 246, 0.15) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
        color: #3b82f6 !important;
      }
      
      .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
        background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
      }
      
      .p-paginator .p-paginator-current {
        color: #94a3b8 !important;
      }
      
      .p-paginator .p-dropdown {
        background: #1e293b !important;
        border: 1px solid #3d566e !important;
      }
      
      .p-paginator .p-dropdown .p-dropdown-label {
        color: #e2e8f0 !important;
      }
      
      .p-paginator .p-dropdown .p-dropdown-trigger {
        color: #94a3b8 !important;
      }
    `}</style>
  </div>
);
};

export default GudangContent;