"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

export default function PenjualanPage() {
  const toast = useRef(null);
  
  const [tokoOptions, setTokoOptions] = useState([]);
  const [selectedGudang, setSelectedGudang] = useState(null);
  const [selectedToko, setSelectedToko] = useState(null); // value = KODE dari toko

  const [barang, setBarang] = useState({ kode: "", nama: "", qty: 1, harga: 0 });
  const [cart, setCart] = useState([]);

  const [stockKeyword, setStockKeyword] = useState("");
  const [stockResult, setStockResult] = useState([]);

  // Toast helper functions
  const showSuccess = (message) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Berhasil',
      detail: message,
      life: 3000
    });
  };

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  };

  const showWarn = (message) => {
    toast.current?.show({
      severity: 'warn',
      summary: 'Peringatan',
      detail: message,
      life: 3000
    });
  };

  const FetchStockByToko = useCallback(async () => {
    try {
      const res = await fetch("/api/toko");
      const json = await res.json();

      if (json.status === "00") {
        const options = json.data.map((item) => ({
          label: item.NAMA,
          value: item.KODE, 
        }));
        setTokoOptions(options);
      } else {
        setTokoOptions([]);
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
        console.log("API Error:", json.message || "Unknown error");
        setStockResult([]);
        showError(json.message || "Gagal mengambil data stock");
      }
    } catch (error) {
      console.error("Gagal ambil stock", error);
      setStockResult([]);
      showError("Terjadi kesalahan saat mengambil data stock");
    }
  };

  useEffect(() => {
    setStockResult([]);
    setStockKeyword("");
  }, [selectedToko]);

  const handleAddToCart = async () => {
    if (!barang.kode || !barang.nama) {
      showWarn("Anda harus memilih barang terlebih dahulu!");
      return;
    }
    if (!selectedToko) {
      showWarn("Anda harus pilih toko terlebih dahulu!");
      return;
    }

    const faktur = "PJ" + Date.now();

    const payload = {
      KODE: barang.kode,
      KODE_TOKO: selectedToko,
      NAMA: barang.nama,
      FAKTUR: faktur,
      QTY: Number(barang.qty),
      HARGA: Number(barang.harga) // Menggunakan harga dari HJ yang sudah di-set
    };

    try {
      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.status === "00") {
        showSuccess("Barang berhasil dimasukkan ke keranjang");
        setCart((prev) => [...prev, {
          kode: payload.KODE,
          nama: payload.NAMA,
          qty: payload.QTY,
          harga: payload.HARGA
        }]);
        setBarang({ kode: "", nama: "", qty: 1, harga: 0 });
      } else {
        showError(json.message || "Gagal menambahkan barang ke keranjang");
      }
    } catch (error) {
      console.error("ERROR Gagal Menambahkan barang ke keranjang", error);
      showError("Terjadi kesalahan pada server");
    }
  };

  const handleSubmit = async () => {
    if (!selectedGudang || !selectedToko) {
      showWarn("Pilih gudang dan toko terlebih dahulu!");
      return;
    }

    if (cart.length === 0) {
      showWarn("Keranjang masih kosong!");
      return;
    }

    const payload = {
      gudang: selectedGudang,
      toko: selectedToko,
      items: cart,
    };

    try {
      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.status === "00") {
        showSuccess("Penjualan berhasil disimpan!");
        setCart([]);
        setBarang({ kode: "", nama: "", qty: 1, harga: 0 });
      } else {
        showError(json.message || "Gagal menyimpan penjualan");
      }
    } catch (error) {
      console.error("Error saat menyimpan penjualan", error);
      showError("Terjadi kesalahan pada server");
    }
  };

  const handleSelectBarang = (row) => {
    setBarang({
      kode: row.KODE,
      nama: row.NAMA,
      qty: 1,
      harga: row.HJ || row.HARGA || 0, // Prioritas HJ, fallback ke HARGA
    });
    showSuccess(`Barang ${row.NAMA} berhasil dipilih`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    showSuccess("Item berhasil dihapus dari keranjang");
  };

  const getTotalCart = () => {
    return cart.reduce((total, item) => total + (Number(item.qty) * Number(item.harga)), 0);
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
      <h1 className="text-xl font-bold mb-4">Transaksi Penjualan</h1>

      {/* Pilih Toko */}
      <div className="mb-5">
        <label className="font-semibold">Toko</label>
        <Dropdown
          value={selectedToko}
          options={tokoOptions}
          onChange={(e) => setSelectedToko(e.value)}
          placeholder="Pilih Toko"
          className="w-full mt-2"
          showClear
        />
        {selectedToko && (
          <small className="text-gray-600">
            Toko terpilih dengan kode: {selectedToko}
          </small>
        )}
      </div>

      {/* Form Pencarian Stock */}
      {selectedToko && (
        <div className="p-4 border rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Cari Stock</h2>
          <div className="flex gap-2">
            <InputText
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
              loading={stockResult.length === 0 && stockKeyword}
            />
          </div>

          {/* Hasil stock */}
          {stockResult.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Menampilkan {stockResult.length} item untuk toko: {selectedToko}
              </p>
              <DataTable value={stockResult} paginator rows={5} stripedRows>
                <Column field="KODE" header="Kode" sortable />
                <Column field="NAMA" header="Nama" sortable />
                <Column field="KODE_TOKO" header="Kode Toko" />
                <Column field="QTY" header="Qty" sortable />
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
          
          {stockResult.length === 0 && stockKeyword && (
            <div className="mt-4 text-center text-gray-500 py-4">
              <i className="pi pi-search text-4xl mb-2 block"></i>
              Tidak ada stock yang ditemukan untuk toko ini
            </div>
          )}
        </div>
      )}

      {/* Input Barang Manual */}
      <div className="p-4 border rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Input Barang</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <InputText
            placeholder="Kode Barang"
            value={barang.kode}
            onChange={(e) => setBarang({ ...barang, kode: e.target.value })}
            disabled
          />
          <InputText
            placeholder="Nama Barang"
            value={barang.nama}
            onChange={(e) => setBarang({ ...barang, nama: e.target.value })}
            disabled
          />
          <InputText
            placeholder="Qty"
            type="number"
            min="1"
            value={barang.qty}
            onChange={(e) => setBarang({ ...barang, qty: Math.max(1, e.target.value) })}
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
            <DataTable value={cart} stripedRows>
              <Column field="kode" header="Kode" />
              <Column field="nama" header="Nama" />
              <Column field="qty" header="Qty" />
              <Column 
                field="harga" 
                header="Harga"
                body={(row) => formatCurrency(row.harga)}
              />
              <Column
                header="Subtotal"
                body={(row) => formatCurrency(Number(row.qty) * Number(row.harga))}
              />
              <Column
                header="Aksi"
                body={(row, { rowIndex }) => (
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
          label="Clear Keranjang"
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