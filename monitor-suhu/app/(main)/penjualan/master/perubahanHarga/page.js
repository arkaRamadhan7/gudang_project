"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";

export default function PerubahanHargaPage() {
  const toast = useRef(null);
  
  const [daftarToko, setDaftarToko] = useState([]);
  const [selectedToko, setSelectedToko] = useState(null); 
  const [daftarStok, setDaftarStok] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const showSuccess = (message) => toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 });
  const showError = (message) => toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  
  const fetchToko = useCallback(async () => {
    try {
      const res = await fetch("/api/toko");
      const json = await res.json();
      if (json.status === "00") {
        setDaftarToko(json.data);
      } else {
        showError("Gagal mengambil data toko");
      }
    } catch (error) {
      showError("Terjadi kesalahan saat mengambil data toko");
    }
  }, []);

  useEffect(() => {
    fetchToko();
  }, [fetchToko]);

  const fetchDaftarStok = useCallback(async () => {
    if (!selectedToko) return;

    setIsLoading(true);
    try {
      const kodeToko = selectedToko.KODE; 
      let apiUrl = `/api/penjualan/perubahan/${kodeToko}?keyword=${keyword.trim()}`;
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status === "00" && json.data) {
        setDaftarStok(json.data);
      } else {
        setDaftarStok([]);
        if (json.status !== "00") showError(json.message || "Gagal mengambil data stok");
      }
    } catch (error) {
      setDaftarStok([]);
      showError("Terjadi kesalahan saat mengambil data stok");
    } finally {
      setIsLoading(false);
    }
  }, [selectedToko, keyword]);

  useEffect(() => {
    setDaftarStok([]);
    setKeyword("");
  }, [selectedToko]);

  const openEditDialog = (product) => {
    setProductToEdit({ ...product });
    setIsDialogVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!productToEdit) return;

    const payload = {
        id: productToEdit.ID, 
        harga: productToEdit.HJ,
        diskon: productToEdit.DISCOUNT,
    };

    try {
      const response = await fetch('/api/penjualan/perubahan', {
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      const json = await response.json();

      if (!response.ok) {
          throw new Error(json.message || 'Gagal menyimpan perubahan ke server');
      }

      // ✅ PERBAIKAN: Membandingkan berdasarkan ID yang unik
      setDaftarStok(prevStok => 
        prevStok.map(stok => 
          stok.ID === productToEdit.ID ? productToEdit : stok
        )
      );

      showSuccess(json.message);
      setIsDialogVisible(false);
      setProductToEdit(null);
    } catch (error) {
        showError(error.message || 'Gagal menyimpan perubahan');
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  };

  const dialogFooter = (
    <div>
        <Button label="Batal" icon="pi pi-times" onClick={() => setIsDialogVisible(false)} className="p-button-text" />
        <Button label="Simpan Perubahan" icon="pi pi-check" onClick={handleSaveChanges} autoFocus />
    </div>
  );

  return (
    <div className="card p-6">
      <Toast ref={toast} />
      <h1 className="text-xl font-bold mb-4 ">Perubahan Harga</h1>
      
      <div className="mb-5">
        <label className="font-semibold ">Pilih Toko</label>
        <Dropdown
          value={selectedToko}
          options={daftarToko}
          optionLabel="NAMA"
          onChange={(e) => setSelectedToko(e.value)}
          placeholder="Pilih Toko"
          className="w-full mt-2"
          showClear
        />
      </div>

      {selectedToko && (
        <div className="p-4 border rounded-xl shadow mb-6">
          <div className="text-xl font-semibold mb-4">
            <h2 className="text-lg font-semibold mb-4">Daftar Harga Barang</h2>
            <div className="flex justify-end mb-4">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Cari nama/kode barang..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchDaftarStok()}
                        className="w-full md:w-auto"
                    />
                </span>
                <Button label="Cari" icon="pi pi-search" onClick={fetchDaftarStok} loading={isLoading} className="ml-2" />
            </div>
          </div>

          <DataTable 
            value={daftarStok} 
            paginator 
            rows={10} 
            stripedRows 
            size="small" 
            dataKey="ID" // ✅ SUDAH BENAR: Menggunakan ID sebagai kunci unik
            loading={isLoading}
            emptyMessage="Tidak ada data stok ditemukan."
          >
            <Column field="KODE" header="Kode" sortable style={{ width: '15%' }} />
            <Column field="NAMA" header="Nama" sortable style={{ width: '35%' }} />
            <Column field="QTY" header="Stok" sortable style={{ width: '10%' }}/>
            <Column 
              field="HJ" 
              header="Harga" 
              body={(rowData) => formatCurrency(rowData.HJ)}
              sortable 
              style={{ width: '15%' }}
            />
            <Column 
                header="Aksi"
                body={(rowData) => (
                    <Button 
                        icon="pi pi-pencil" 
                        severity="warning"
                        size="small"
                        tooltip="Ubah Harga"
                        onClick={() => openEditDialog(rowData)} 
                    />
                )}
                style={{ width: '10%', textAlign: 'center' }}
            />
          </DataTable>
        </div>
      )}

      <Dialog 
        header="Ubah Harga & Diskon" 
        visible={isDialogVisible} 
        style={{ width: '30rem' }} 
        modal 
        footer={dialogFooter} 
        onHide={() => {
            setIsDialogVisible(false);
            setProductToEdit(null);
        }}
      >
        {productToEdit && (
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="nama">Nama Barang</label>
                    <InputText id="nama" value={productToEdit.NAMA} disabled />
                </div>
                <div className="field mt-3">
                    <label htmlFor="harga">Harga</label>
                    <InputNumber 
                        inputId="harga" 
                        value={productToEdit.HJ} 
                        onValueChange={(e) => setProductToEdit({ ...productToEdit, HJ: e.value })} 
                        mode="currency" 
                        currency="IDR" 
                        locale="id-ID" 
                    />
                </div>
            </div>
        )}
      </Dialog>
    </div>
  );
}