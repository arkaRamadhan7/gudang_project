'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';
export const dynamic = "force-dynamic";

const defaultForm = {
  kode: '',
  role: '',
};

const JenisRoleContent = () => {
  const toastRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit' | null
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState(defaultForm);

  // Ambil data roles dari API
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jenis-role');
      const json = await res.json();

      if (res.ok && Array.isArray(json.data)) {
        setRoles(json.data);
      } else {
        toastRef.current?.showToast('99', 'Data role tidak valid');
      }
    } catch (err) {
      toastRef.current?.showToast('99', 'Gagal memuat data role');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form dan dialog
  const resetFormAndCloseDialog = () => {
    setForm(defaultForm);
    setDialogMode(null);
    setSelectedRole(null);
  };

  // Update form saat input berubah
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form tambah atau edit
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!form.role.trim()) {
      toastRef.current?.showToast('99', 'Jenis role wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      let res, json;

      if (dialogMode === 'add') {
        res = await fetch('/api/jenis-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else if (dialogMode === 'edit' && selectedRole) {
        res = await fetch(`/api/jenis-role/${selectedRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        toastRef.current?.showToast('99', 'Mode dialog tidak valid');
        setIsSubmitting(false);
        return;
      }

      json = await res.json();

      if (!res.ok) {
        toastRef.current?.showToast(json.status ?? '99', json.message || 'Gagal menyimpan data');
        setIsSubmitting(false);
        return;
      }

      toastRef.current?.showToast(json.status, json.message);
      resetFormAndCloseDialog();
      await fetchRoles();
    } catch (error) {
      toastRef.current?.showToast('99', 'Gagal menyimpan data');
      console.error('Submit error:', error);
    }

    setIsSubmitting(false);
  };

  // Hapus role
  const handleDelete = async (item) => {
    if (!confirm(`Hapus role "${item.role}"?`)) return;

    try {
      const res = await fetch(`/api/jenis-role/${item.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (json.status === '00') {
        toastRef.current?.showToast('00', json.message);
        await fetchRoles();
      } else {
        toastRef.current?.showToast(json.status ?? '99', json.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toastRef.current?.showToast('99', 'Gagal menghapus role');
    }
  };

  // Ambil data saat page pertama kali dibuka
  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="card p-5">
      <h3 className="text-xl font-semibold mb-4">Jenis Role</h3>

      <div className="flex justify-end mb-3">
        <Button
          label="Tambah Role"
          icon="pi pi-plus"
          className="text-sm"
          onClick={() => {
            setDialogMode('add');
            setForm(defaultForm);
            setSelectedRole(null);
          }}
        />
      </div>

      <DataTable
        size="small"
        className="text-sm"
        value={roles}
        paginator
        rows={10}
        loading={isLoading}
        scrollable
      >
        <Column field="kode" header="Kode" filter />
        <Column field="role" header="Role" />
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
                  setSelectedRole(row);
                  setForm({
                    kode: row.kode || '',
                    role: row.role || '',
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
        header={dialogMode === 'add' ? 'Tambah Role' : 'Edit Role'}
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
            <label htmlFor="kode" className="block font-medium">
              KODE
            </label>
            <InputText
              id="kode"
              name="kode"
              value={form.kode}
              onChange={handleChange}
              type="text"
              className="w-full mt-1"
              placeholder="Kode role"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="block font-medium">
              ROLE
            </label>
            <InputText
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              type="text"
              className="w-full mt-1"
              placeholder="Nama role"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label={isSubmitting ? 'Menyimpan...' : 'Submit'}
              severity="success"
              icon="pi pi-save"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default JenisRoleContent;
