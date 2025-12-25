'use client';

export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';

const JenisGudangPage = () => {
    const toastRef = useRef(null);
    const [jenisGudang, setJenisGudang] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);
    const [selectedJenisGudang, setSelectedJenisGudang] = useState(null);
    const [form, setForm] = useState({
        id: '',
        KODE: '',
        KETERANGAN: '',
    });

    useEffect(() => {
        fetchJenisGudang();
    }, []);

    const fetchJenisGudang = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/jenis-gudang');
            const json = await res.json();

            if (json.status === '00') {
                setJenisGudang(json.data);
            } else {
                toastRef.current?.showToast(json.status, json.message);
            }
        } catch (err) {
            toastRef.current?.showToast('99', 'Gagal mengambil data jenis gudang');
        } finally {
            setIsLoading(false);
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
                dialogMode === 'add'
                    ? '/api/jenis-gudang'
                    : `/api/jenis-gudang/${selectedJenisGudang.id}`;
            const method = dialogMode === 'add' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            toastRef.current?.showToast(json.status, json.message);

            if (json.status === '00') {
                await fetchJenisGudang();
                resetForm();
            }
        } catch (err) {
            toastRef.current?.showToast('99', 'Gagal menyimpan data jenis gudang');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus Gudang "${item.KODE}"?`)) return;
        try {
            const res = await fetch(`/api/jenis-gudang/${item.id}`, { method: 'DELETE' });
            const json = await res.json();

            toastRef.current?.showToast(json.status, json.message);

            if (json.status === '00') {
                setJenisGudang((prev) => prev.filter((r) => r.id !== item.id));
            }
        } catch (err) {
            toastRef.current?.showToast('99', 'Gagal menghapus jenis gudang');
        }
    };

    const resetForm = () => {
        setForm({ id: '', KODE: '', KETERANGAN: '' });
        setDialogMode(null);
        setSelectedJenisGudang(null);
    };

    return (
        <div className="card">
            <h3 className="text-xl font-semibold mb-4">Jenis Gudang</h3>

            <div className="flex justify-end mb-4">
                <Button
                    label="Tambah Gudang"
                    icon="pi pi-plus"
                    onClick={() => {
                        setDialogMode('add');
                        setForm({ id: '', KODE: '', KETERANGAN: '' });
                    }}
                />
            </div>

            <DataTable
                value={jenisGudang}
                loading={isLoading}
                paginator
                rows={10}
                scrollable
                size="small"
                className="text-sm"
            >
                <Column field="KODE" header="Kode" />
                <Column field="KETERANGAN" header="Keterangan" />
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
                                    setSelectedJenisGudang(row);
                                    setForm({ ...row });
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
                header={dialogMode === 'add' ? 'Tambah Gudang' : 'Edit Gudang'}
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

                    <div className="flex justify-end">
                        <Button type="submit" label="Simpan" icon="pi pi-save" severity="success" />
                    </div>
                </form>
            </Dialog>

            <ToastNotifier ref={toastRef} />
        </div>
    );
};

export default JenisGudangPage;
