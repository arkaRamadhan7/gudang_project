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
import { useAuth } from "@/app/(auth)/context/authContext";

export default function PerubahanHargaPage() {
  const toast = useRef(null);
  
  const [daftarToko, setDaftarToko] = useState([]);
  const [selectedToko, setSelectedToko] = useState(null); 
  const [daftarStok, setDaftarStok] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  // Menggunakan useAuth context
  const { user } = useAuth();
  
  const showSuccess = (message) => toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 });
  const showError = (message) => toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  const showWarn = (message) => toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: message, life: 3000 });
  
  // Helper functions untuk cek role
  const isSuperAdmin = () => {
    return user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'super admin';
  };

  const isAdminToko = () => {
    return user?.role === 'Admin Toko';
  };

  // Fetch data user untuk mendapatkan toko yang ditugaskan
  const fetchUserData = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoadingUser(true);
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      
      if (json.users && Array.isArray(json.users)) {
        // Cari user berdasarkan email yang login
        const currentUser = json.users.find(u => u.email === user.email);
        
        if (currentUser && currentUser.toko) {
          // Jika user punya toko yang ditugaskan
          if (isAdminToko() || !isSuperAdmin()) {
            const tokoUser = daftarToko.find(toko => 
              toko.NAMA === currentUser.toko ||
              toko.KODE === currentUser.toko ||
              toko.ID === currentUser.toko
            );
            
            if (tokoUser) {
              setSelectedToko(tokoUser);
            } else {
              // Jika toko tidak ditemukan di daftar
              showWarn(`Toko "${currentUser.toko}" tidak ditemukan dalam sistem`);
            }
          }
        } else if (isAdminToko()) {
          // Jika Admin Toko tapi tidak punya toko yang ditugaskan
          showError("Akun Anda belum ditugaskan ke toko manapun. Hubungi administrator.");
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data user", error);
      showError("Gagal memuat data user");
    } finally {
      setIsLoadingUser(false);
    }
  }, [user, daftarToko]);

  const fetchToko = useCallback(async () => {
    try {
      const res = await fetch("/api/toko");
      const json = await res.json();
      if (json.status === "00") {
        setDaftarToko(json.data);
      } else {
        setDaftarToko([]);
        showError("Gagal mengambil data toko");
      }
    } catch (error) {
      console.error("Gagal mengambil data toko", error);
      setDaftarToko([]);
      showError("Terjadi kesalahan saat mengambil data toko");
    }
  }, []);

  useEffect(() => {
    fetchToko();
  }, [fetchToko]);

  // Fetch user data setelah daftar toko tersedia
  useEffect(() => {
    if (daftarToko.length > 0 && user) {
      fetchUserData();
    }
  }, [daftarToko, user, fetchUserData]);

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
        if (json.data.length === 0) {
          showWarn("Tidak ada data stok yang ditemukan");
        }
      } else {
        setDaftarStok([]);
        if (json.status !== "00") showError(json.message || "Gagal mengambil data stok");
      }
    } catch (error) {
      console.error("Gagal mengambil data stok", error);
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

      // Update data di tabel
      setDaftarStok(prevStok => 
        prevStok.map(stok => 
          stok.ID === productToEdit.ID ? productToEdit : stok
        )
      );

      showSuccess(json.message || 'Perubahan berhasil disimpan');
      setIsDialogVisible(false);
      setProductToEdit(null);
    } catch (error) {
        console.error("Error menyimpan perubahan", error);
        showError(error.message || 'Gagal menyimpan perubahan');
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(value || 0);
  };

  // Cek apakah dropdown toko harus disabled
  const isTokoDropdownDisabled = () => {
    return isAdminToko() || isLoadingUser;
  };

  const dialogFooter = (
    <div>
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          onClick={() => setIsDialogVisible(false)} 
          className="p-button-text" 
        />
        <Button 
          label="Simpan Perubahan" 
          icon="pi pi-check" 
          onClick={handleSaveChanges} 
          autoFocus 
        />
    </div>
  );

  return (
    <div className="card p-6">
      <Toast ref={toast} />
      <h1 className="text-xl font-bold mb-4">Perubahan Harga</h1>
      
      <div className="mb-5">
        <label className="font-semibold">Pilih Toko</label>
        {isAdminToko() && (
          <div className="text-xs text-blue-600 mt-1 mb-2">
            ℹ️ Toko ditentukan berdasarkan penugasan akun Anda
          </div>
        )}
        {!isSuperAdmin() && !isAdminToko() && (
          <div className="text-xs text-gray-500 mt-1 mb-2">
            Toko ditentukan berdasarkan akun Anda
          </div>
        )}
        <Dropdown
          value={selectedToko}
          options={daftarToko}
          optionLabel="NAMA"
          onChange={(e) => setSelectedToko(e.value)}
          placeholder={isLoadingUser ? "Memuat data toko..." : "Pilih Toko"}
          className="w-full mt-2"
          showClear={isSuperAdmin()}
          disabled={isTokoDropdownDisabled()}
        />
      </div>

      {selectedToko && (
        <div className="p-4 border rounded-xl shadow mb-6">
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
            <Button 
              label="Cari" 
              icon="pi pi-search" 
              onClick={fetchDaftarStok} 
              loading={isLoading} 
              className="ml-2" 
            />
          </div>

          <DataTable 
            value={daftarStok} 
            paginator 
            rows={10} 
            stripedRows 
            size="small" 
            dataKey="ID"
            loading={isLoading}
            emptyMessage="Tidak ada data stok ditemukan. Gunakan pencarian untuk menampilkan data."
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
                  tooltipOptions={{ position: 'top' }}
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
            <div className="field mb-4">
              <label htmlFor="kode" className="font-semibold">Kode Barang</label>
              <InputText id="kode" value={productToEdit.KODE} disabled className="mt-2" />
            </div>
            <div className="field mb-4">
              <label htmlFor="nama" className="font-semibold">Nama Barang</label>
              <InputText id="nama" value={productToEdit.NAMA} disabled className="mt-2" />
            </div>
            <div className="field mb-4">
              <label htmlFor="stok" className="font-semibold">Stok Tersedia</label>
              <InputText id="stok" value={productToEdit.QTY} disabled className="mt-2" />
            </div>
            <div className="field">
              <label htmlFor="harga" className="font-semibold">Harga Jual</label>
              <InputNumber 
                inputId="harga" 
                value={productToEdit.HJ} 
                onValueChange={(e) => setProductToEdit({ ...productToEdit, HJ: e.value })} 
                mode="currency" 
                currency="IDR" 
                locale="id-ID"
                className="mt-2"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}