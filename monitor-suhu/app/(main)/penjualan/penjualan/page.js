"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "@/app/(auth)/context/authContext";
import { downloadStrukAsPDF } from "./StrukPrint"
import { Dialog } from "primereact/dialog";

export default function PenjualanPage() {
  const toast = useRef(null);
  
  const [daftarToko, setDaftarToko] = useState([]);
  const [selectedToko, setSelectedToko] = useState(null); 
  const [cart, setCart] = useState([]);
  const [stockKeyword, setStockKeyword] = useState("");
  const [stockResult, setStockResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { user } = useAuth();
  
  const showSuccess = (message) => toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 });
  const showError = (message) => toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  const showWarn = (message) => toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: message, life: 3000 });
  
  const isSuperAdmin = () => {
    return user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'super admin';
  };

  const fetchUserData = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoadingUser(true);
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      
      if (json.users && Array.isArray(json.users)) {
        // Cari user berdasarkan email yang login
        const currentUser = json.users.find(u => u.email === user.email);
        
        if (currentUser && currentUser.toko && !isSuperAdmin()) {
          // Jika bukan superadmin dan punya toko, set toko otomatis
          const tokoUser = daftarToko.find(toko => toko.NAMA === currentUser.toko);
          if (tokoUser) {
            setSelectedToko(tokoUser.KODE);
          }
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data user", error);
      showError("Gagal mengambil data user");
    } finally {
      setIsLoadingUser(false);
    }
  }, [user, daftarToko]);

  const FetchStockByToko = useCallback(async () => {
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
      console.error("Gagal Ambil Kode Toko", error);
      setDaftarToko([]);
      showError("Terjadi kesalahan saat mengambil data toko");
    }
  }, []);

  useEffect(() => {
    FetchStockByToko();
  }, [FetchStockByToko]);

  // Fetch user data setelah daftar toko tersedia
  useEffect(() => {
    if (daftarToko.length > 0 && user) {
      fetchUserData();
    }
  }, [daftarToko, user]);

  const handleSearchStock = async () => {
    if (!selectedToko) {
      showWarn("Pilih toko terlebih dahulu sebelum mencari stock!");
      return;
    }
    setIsLoading(true);
    try {
      let apiUrl = `/api/penjualan/${selectedToko}`;
      if (stockKeyword.trim()) {
        apiUrl += `?keyword=${stockKeyword}`;
      }
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status === "00" && json.data) {
        setStockResult(json.data);
        if (json.data.length === 0) {
          showWarn("Tidak ada stock yang ditemukan");
        }
      } else {
        setStockResult([]);
        showError(json.message || "Gagal mengambil data stock");
      }
    } catch (error) {
      console.error("Gagal ambil stock", error);
      setStockResult([]);
      showError("Terjadi kesalahan saat mengambil data stock");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStockResult([]);
    setStockKeyword("");
    setCart([]);
  }, [selectedToko]);


  const handleSubmit = async () => {
    if (!selectedToko) {
      showWarn("Pilih toko terlebih dahulu!");
      return;
    }
    if (cart.length === 0) {
      showWarn("Keranjang masih kosong!");
      return;
    }
    
    const itemsPayload = cart.map(item => ({
      kode: item.kode,
      nama: item.nama,
      qty: item.qty,
      harga: item.harga,
      satuan: item.satuan,
      id: item.id,
      discount: item.discount
    }));

    const payload = {
      KODE_TOKO: selectedToko,
      username: user ? user.email : "-", 
      items: itemsPayload,
    };

    try {
      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error("Stock Tidak mencukupi")
      }
      if (json.status === "00") {
        const tokoTerpilih = daftarToko.find(toko => toko.KODE === selectedToko);
        showSuccess("Penjualan berhasil disimpan!");
        downloadStrukAsPDF({
          faktur: json.faktur,
          items: cart,
          total: getTotalCart(),
          tanggal: new Date(),
          username: user ? user.email : "-",
          namaToko: tokoTerpilih ? tokoTerpilih.NAMA : "-",
          alamatToko: tokoTerpilih ? tokoTerpilih.ALAMAT : "-",
          nomerHp: tokoTerpilih ? tokoTerpilih.NO_HP : "-"
        });
        setCart([]);
      } else {
        showError(json.message || "Gagal menyimpan penjualan");
      }
    } catch (error) {
      console.error("Error saat menyimpan penjualan", error.message);
      showError(error.message);
    }
  };

  const handleSelectBarang = (row) => {
    // Langsung tambahkan ke cart dengan qty 1
    const newItem = {
      id: row.ID,
      kode: row.KODE,
      nama: row.NAMA,
      qty: 1,
      harga: Number(row.HJ2),
      satuan: row.SATUAN,
      discount: row.DISCOUNT
    };

    const existingItemIndex = cart.findIndex(item => item.kode === row.KODE);

    if (existingItemIndex !== -1) {
      // Jika sudah ada, tambah qty
      setCart(prevCart => prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      }));
      showSuccess(`${row.NAMA} ditambah 1 di keranjang`);
    } else {
      // Jika belum ada, tambahkan item baru
      setCart(prevCart => [...prevCart, newItem]);
      showSuccess(`${row.NAMA} berhasil ditambahkan ke keranjang`);
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  };
  
  const removeFromCart = (rowIndex) => {
    const newCart = cart.filter((_, i) => i !== rowIndex);
    setCart(newCart);
    showSuccess("Item berhasil dihapus dari keranjang");
  };
  
  const updateCartQuantity = (rowIndex, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      removeFromCart(rowIndex);
      return;
    }
    setCart((prevCart) => prevCart.map((item, index) => index === rowIndex ? { ...item, qty: qty } : item));
  };
  
  const getTotalCart = () => {
    return cart.reduce((total, item) => total + (Number(item.qty) * Number(item.harga)), 0);
  };

  return (
    <div className="card p-6">
      <Toast ref={toast} />
      <h1 className="text-xl font-bold mb-4">Transaksi Penjualan</h1>
      
      <div className="mb-5">
        <label className="font-semibold">Toko</label>
        {!isSuperAdmin() && (
          <div className="text-xs text-gray-500 mt-1 mb-2">
            Toko ditentukan berdasarkan akun Anda
          </div>
        )}
        <Dropdown
          value={selectedToko}
          options={daftarToko}
          optionLabel="NAMA"
          optionValue="KODE"
          onChange={(e) => setSelectedToko(e.value)}
          placeholder={isLoadingUser ? "Memuat..." : "Pilih Toko"}
          className="w-full mt-2"
          showClear={isSuperAdmin()}
          disabled={!isSuperAdmin() || isLoadingUser}
        />
      </div>

      {selectedToko && (
        <div className="p-4 border rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Cari Stock</h2>
          <div className="flex gap-2">
            <InputText
              id="stock-search-input"
              placeholder="Masukkan kode/nama barang"
              value={stockKeyword}
              onChange={(e) => setStockKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchStock()}
              className="flex-1"
            />
            <Button 
              label="Cari" 
              icon="pi pi-search" 
              onClick={handleSearchStock}
              loading={isLoading}
            />
          </div>

          {stockResult.length > 0 && (
            <div className="mt-4">
              <DataTable value={stockResult} paginator rows={5} stripedRows size="small" dataKey="ID">
                <Column field="KODE" header="Kode" sortable />
                <Column field="NAMA" header="Nama" sortable />
                <Column field="QTY" header="Stock" sortable />
                <Column 
                  field="HJ2" 
                  header="Harga Jual" 
                  sortable
                  body={(row) => formatCurrency(row.HJ2 || row.HARGA || 0)}
                />
                <Column
                  header="Aksi"
                  body={(row) => (
                    <Button
                      label="Pilih"
                      size="small"
                      icon="pi pi-check"
                      onClick={() => handleSelectBarang(row)}
                      className="p-button-sm"
                    />
                  )}
                />
              </DataTable>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Keranjang ({cart.length} item)
        </h2>
        {cart.length > 0 ? (
          <>
            <DataTable value={cart} stripedRows dataKey="kode">
              <Column field="kode" header="Kode" />
              <Column field="nama" header="Nama" />
              <Column 
                field="qty" 
                header="Qty"
                headerStyle={{ width: '90px', textAlign: 'center' }} 
                bodyStyle={{ display: 'flex', justifyContent: 'center' }} 
                body={(row, { rowIndex }) => (
                  <InputNumber
                    value={row.qty}
                    onValueChange={(e) => updateCartQuantity(rowIndex, e.value)}
                    min={0}
                    className="w-20"
                    inputClassName="!text-center !p-2 !text-sm"
                    showButtons
                  />
                )}
              />
              <Column 
                field="harga" 
                header="Harga"
                headerStyle={{ width: '120px' }}
                body={(row) => formatCurrency(row.harga)}
              />
              <Column
                header="Subtotal"
                headerStyle={{ width: '150px' }}
                body={(row) => formatCurrency(Number(row.qty) * Number(row.harga))}
              />
              <Column
                header="Aksi"
                headerStyle={{ width: '80px', textAlign: 'center' }}
                bodyStyle={{ textAlign: 'center' }}
                body={(_, { rowIndex }) => (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text"
                    onClick={() => removeFromCart(rowIndex)}
                    tooltip="Hapus dari keranjang"
                  />
                )}
              />
            </DataTable>
            <div className="mt-4 text-right">
              <strong className="text-lg">
                Total: {formatCurrency(getTotalCart())}
              </strong>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <i className="pi pi-shopping-cart text-4xl mb-2 block"></i>
            Keranjang masih kosong
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          label="Kosongkan Keranjang"
          icon="pi pi-trash"
          severity="secondary"
          onClick={() => {
            setCart([]);
            showSuccess("Keranjang berhasil dikosongkan");
          }}
          disabled={cart.length === 0}
        />
        <Button
          label="Simpan Transaksi"
          icon="pi pi-save"
          severity="success"
          onClick={handleSubmit}
          disabled={cart.length === 0}
        />
      </div>
    </div>
  );
}