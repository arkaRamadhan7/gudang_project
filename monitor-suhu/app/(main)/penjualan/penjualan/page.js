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
  const [barang, setBarang] = useState({ id: "", kode: "", nama: "", qty: 1, harga: 0, gudang: "",satuan: "", });
  const [cart, setCart] = useState([]);
  const [stockKeyword, setStockKeyword] = useState("");
  const [stockResult, setStockResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const showSuccess = (message) => toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 });
  const showError = (message) => toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  const showWarn = (message) => toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: message, life: 3000 });
  
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
      setTokoOptions([]);
      showError("Terjadi kesalahan saat mengambil data toko");
    }
  }, []);

  useEffect(() => {
    FetchStockByToko();
  }, [FetchStockByToko]);


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
    setBarang({ id: '', kode: "", nama: "", qty: 1, harga: 0, gudang: "", satuan: "" });
  }, [selectedToko]);

  const handleAddToCart = () => {
  if (!barang.kode || !barang.nama) {
    showWarn("Anda harus memilih barang terlebih dahulu!");
    return;
  }
  if (Number(barang.qty) <= 0) {
    showError("Kuantitas barang harus lebih dari 0");
    return;
  }
  if (!barang.gudang) {
    showError("Informasi gudang tidak ditemukan untuk barang ini. Tidak dapat ditambahkan.");
    return;
  }


  const isExisting = cart.some(item => item.kode === barang.kode && item.gudang === barang.gudang);

  if (isExisting) {
    showSuccess(`Qty ${barang.nama} diperbarui di keranjang`);
  } else {
    showSuccess(`${barang.nama} berhasil ditambahkan ke keranjang`);
  }

  setCart((prevCart) => {
    const existingItemIndex = prevCart.findIndex(item => item.kode === barang.kode && item.gudang === barang.gudang);

    if (existingItemIndex !== -1) {
      return prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          return { ...item, qty: item.qty + Number(barang.qty) };
        }
        return item;
      });
    } else {
      const newItem = {
        id: barang.id,
        kode: barang.kode,
        nama: barang.nama,
        qty: Number(barang.qty),
        harga: Number(barang.harga),
        gudang: barang.gudang,
        satuan: barang.satuan
      };
      return [...prevCart, newItem];
    }
  });

  setBarang({ id: '', kode: "", nama: "", qty: 1, harga: 0, gudang: "", satuan: "" });
};

  const handleSubmit = async () => {
    console.log(cart)


      
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
      gudang: item.gudang,
      satuan: item.satuan,
      id: item.id,


      
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
        setBarang({ kode: "", nama: "", qty: 1, harga: 0, gudang: "", satuan: "" });
      } else {
        showError(json.message || "Gagal menyimpan penjualan");
      }
    } catch (error) {
      console.error("Error saat menyimpan penjualan", error.message);
      showError(error.message);
    }
  };

  const handleSelectBarang = (row) => {
    setBarang({
      kode: row.KODE,
      nama: row.NAMA,
      qty: 1,
      harga: row.HJ || row.HARGA || 0,
      gudang: row.GUDANG,
      satuan: row.SATUAN,
      id: row.ID,
      no_hp: row.NO_HP
    });
    showSuccess(`Barang ${row.NAMA} berhasil dipilih`);
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
    <div className="p-6">
      <Toast ref={toast} />
      <h1 className="text-xl font-bold mb-4 ">Transaksi Penjualan</h1>
      <div className="mb-5">
        <label className="font-semibold ">Toko</label>
        <Dropdown
          value={selectedToko}
          options={daftarToko}
          optionLabel="NAMA"
          optionValue="KODE"
          onChange={(e) => setSelectedToko(e.value)}
          placeholder="Pilih Toko"
          className="w-full mt-2"
          showClear
        />
      </div>

      {/* Form Pencarian Stock */}
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
              <DataTable value={stockResult} paginator rows={5} stripedRows size="small" dataKey="KODE">
                <Column field="KODE" header="Kode" sortable />
                <Column field="NAMA" header="Nama" sortable />
                <Column field="QTY" header="Stock" sortable />
                <Column field="GUDANG" header="Gudang" sortable />
                <Column 
                  field="HJ" 
                  header="Harga Jual" 
                  sortable
                  body={(row) => formatCurrency(row.HJ || row.HARGA || 0)}
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

      {/* Input Barang Manual */}
      <div className="p-4 border rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Input Barang</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 items-center">
          <InputText
            placeholder="Kode Barang"
            value={barang.kode}
            disabled
          />
          <InputText
            placeholder="Nama Barang"
            value={barang.nama}
            disabled
          />
          <InputNumber
            placeholder="Qty"
            value={barang.qty}
            onValueChange={(e) => setBarang({ ...barang, qty: e.value })}
            min={1}
            showButtons
          />
          <InputText
            placeholder="Harga"
            value={formatCurrency(barang.harga)}
            disabled
          />
        </div>
        <Button 
          label="Tambah ke Keranjang" 
          icon="pi pi-plus" 
          onClick={handleAddToCart}
          disabled={!barang.kode || !barang.nama}
        />
      </div>

      {/* Table Cart */}
      <div className="p-4 border rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Keranjang ({cart.length} item)
        </h2>
        {cart.length > 0 ? (
          <>
            <DataTable value={cart} stripedRows dataKey="kode">
              <Column field="kode" header="Kode" />
              <Column field="nama" header="Nama" />
              <Column field="gudang" header="Gudang" />
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

      {/* Simpan */}
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