'use client'

import { useEffect, useState, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { useAuth } from '@/app/(auth)/context/authContext';

export default function TerimaBarang() {
  const [terimaData, setTerimaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [gudangOptions, setGudangOptions] = useState([]);
  const [satuanOptions, setSatuanOptions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [produkList, setProdukList] = useState([]);
  const [ fakturList, setFakturList ] = useState([]);
  const [visibleFaktur, setVisibleFaktur] = useState(false);
  const [rows, setRows ] = useState([]);
  const [selectedFaktur, setSelectedFaktur] = useState([]);
  const { user } = useAuth();
  const toast = useRef(null);
  

  const [formData, setFormData] = useState({
    TGL: null,
    KODE: '',
    NAMA: '',
    FAKTUR: '',
    FAKTUR_KIRIM: '',
    QTY: '',
    BARCODE: '',
    GUDANG_KIRIM: null,
    GUDANG_TERIMA: null,
    SATUAN: null,
  });

  useEffect(() => {
  fetch("http://localhost:8100/api/mutasi/faktur")
    .then((res) => res.json())
    .then((data) => {
      console.log("API faktur:", data); 
      if (data.status === "00") {
        setFakturList(data.data);
      }
    })
    .catch((err) => console.error("Error fetch faktur:", err));
}, []);

const handleSelectFaktur = (fakturData) => {
  setSelectedFaktur((prev) => {
    // cek apakah faktur sudah ada di tabel
    const existingIndex = prev.findIndex((item) => item.FAKTUR === fakturData.FAKTUR);

    if (existingIndex !== -1) {
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: (updated[existingIndex].qty || 1) + 1
      };
      return updated;
    } else {
      return [...prev, { ...fakturData, qty: 1 }];
    }
  });
};


  

  const formatDateForDatabase = (date) => {
    if (!date) return '-';
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  const fetchGudang = useCallback(async () => {
    try {
      const res = await fetch("/api/gudang/nama");
      const json = await res.json();
      if (json.status === "00") {
        setGudangOptions(json.namaGudang.map(nama => ({ label: nama, value: nama })));
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data gudang', life: 3000 });
    }
  }, []);

  const fetchSatuan = useCallback(async () => {
    try {
      const res = await fetch("/api/satuan");
      const json = await res.json();
      if (json.status === "00" && Array.isArray(json.data)) {
        setSatuanOptions(json.data.map(item => ({ label: item.KODE, value: item.KODE })));
      }
    } catch (error) {
      console.error(error);
      setSatuanOptions([]);
    }
  }, []);

  const fetchProduk = useCallback(async () => {
    try {
      const res = await fetch("/api/stock");
      const json = await res.json();
      if (json.status === "00") {
        setProdukList(json.data.map(item => ({
          ID: item.ID,
          KODE: item.KODE,
          BARCODE: item.BARCODE,
          NAMA: item.NAMA,
          HJ: item.HJ,
          SATUAN: item.SATUAN,
          QTY: item.QTY,
        })));
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data produk', life: 3000 });
    }
  }, []);

  // Fetch data terima barang dari API
  const fetchTerimaData = useCallback(async () => {
    try {
      const res = await fetch('/api/terimabarang'); 
      const json = await res.json();
      if (json.status === '00') {
        const formattedData = json.data.map((item, index) => ({
          id: item.ID || item.id || index + 1,
          NAMA: item.NAMA || item.nama || '-',
          FAKTUR: item.FAKTUR || item.faktur || '-',
          FAKTUR_KIRIM: item.FAKTUR_KIRIM || item.faktur_kirim || '-',
          TGL: item.TGL || item.tanggal || '-',
          GUDANG_KIRIM: item.GUDANG_KIRIM || item.gudang_kirim || '-',
          GUDANG_TERIMA: item.GUDANG_TERIMA || item.gudang_terima || '-',
          KODE: item.KODE || item.kode || '-',
          QTY: item.QTY || item.qty || 0,
          BARCODE: item.BARCODE || item.barcode || '-',
          SATUAN: item.SATUAN || item.satuan || '-',
          USERNAME: item.USERNAME || item.username || '-'
        }));
        setTerimaData(formattedData);
      } else {
        console.log('API Response:', json);
        toast.current?.show({ severity: 'warn', summary: 'Info', detail: json.message || 'Tidak ada data terima barang', life: 3000 });
        setTerimaData([]);
      }
    } catch (error) {
      console.error('Error fetching terima data:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data dari server', life: 3000 });
      setTerimaData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFaktur = useCallback(async () => {
    try {
      const res = await fetch("/api/mutasi/faktur");
      const json = await res.json();
      if (json.status === "00") {
        setFakturList(json.data.map(item => ({
          label: `${item.FAKTUR} - ${item.TGL}`,
          value: item.FAKTUR
        })));
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', details: 'gagal ambil faktur', life: 3000});
    }
  },[]);

  useEffect(() => {
  fetchGudang();
  fetchSatuan();
  fetchProduk();
  fetchTerimaData();
  fetchFaktur();
}, [fetchGudang, fetchSatuan, fetchProduk, fetchTerimaData, fetchFaktur]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateFaktur = () => {
    const timestamp = Date.now();
    return `TR${timestamp}`;
  };

  
  const handleSelect = (selectedProduct) => {
    setTerimaData(prev => {
      const existing = prev.find(item => item.BARCODE === selectedProduct.BARCODE);

      let faktur = formData.FAKTUR;
      if (!faktur) {
        faktur = generateFaktur();
        setFormData(prevForm => ({ ...prevForm, FAKTUR: faktur }));
      }

      if (existing) {
        return prev.map(item =>
          item.BARCODE === selectedProduct.BARCODE
            ? { ...item, QTY: Number(item.QTY) + 1 }
            : item
        );
      } else {
        const newItem = {
          id: prev.length + 1,
          KODE: selectedProduct.KODE,
          BARCODE: selectedProduct.BARCODE,
          NAMA: selectedProduct.NAMA,
          QTY: 1,
          SATUAN: selectedProduct.SATUAN,
          FAKTUR: faktur,
          FAKTUR_KIRIM: formData.FAKTUR_KIRIM || '-',
          TGL: formData.TGL ? formatDateForDatabase(formData.TGL) : '-',
          GUDANG_KIRIM: formData.GUDANG_KIRIM || '-',
          GUDANG_TERIMA: formData.GUDANG_TERIMA || '-',
          USERNAME: user?.username || '-'
        };
        return [...prev, newItem];
      }
    });

    setVisible(false);
    setFormData(prev => ({ ...prev, BARCODE: '' }));
    toast.current?.show({
      severity: 'success',
      summary: 'Produk Ditambahkan',
      detail: `${selectedProduct.NAMA} berhasil ditambahkan`,
      life: 3000
    });
  };

  
  const handleBarcodeEnter = (e) => {
    if (e.key !== 'Enter') return;
    const code = (formData.BARCODE || '').toString().trim();
    if (!code) return;
    const found = produkList.find(p => (p.BARCODE || '').toString() === code);
    if (found) {
      handleSelect(found);
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Tidak ditemukan',
        detail: `Barcode "${code}" tidak ada di daftar produk`,
        life: 3000
      });
    }
  };

  
  const handleSubmit = async () => {
    if (!formData.GUDANG_TERIMA || !formData.GUDANG_KIRIM || !formData.TGL) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Field Gudang dan Tanggal wajib diisi', life: 3000 });
      return;
    }

    if (terimaData.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Kosong', detail: 'Belum ada item untuk disimpan', life: 2500 });
      return;
    }

    setSubmitLoading(true);
    try {
      
      const payload = terimaData.map(item => ({
        FAKTUR: item.FAKTUR || formData.FAKTUR || generateFaktur(),
        FAKTUR_KIRIM: item.FAKTUR_KIRIM || '-',
        TGL: item.TGL && item.TGL !== '-' ? item.TGL : formatDateForDatabase(formData.TGL),
        GUDANG_TERIMA: item.GUDANG_TERIMA || formData.GUDANG_TERIMA,
        GUDANG_KIRIM: item.GUDANG_KIRIM || formData.GUDANG_KIRIM,
        KODE: item.KODE,
        QTY: parseInt(item.QTY) || 0,
        BARCODE: item.BARCODE,
        SATUAN: item.SATUAN,
        USERNAME: item.USERNAME || user?.username || 'SYSTEM'
      }));

      console.log('Payload yang akan dikirim:', payload);

      const res = await fetch('/api/terimabarang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });

      const responseData = await res.json();
      console.log('Response dari server:', responseData);

      if (!res.ok) {
        throw new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (responseData.status !== '00') {
        throw new Error(responseData.message || 'Gagal menyimpan data');
      }

      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Data berhasil disimpan!', life: 3000 });
      setFormData({
        TGL: null, KODE: '', NAMA: '', FAKTUR: '', QTY: '', BARCODE: '',
        GUDANG_KIRIM: null, GUDANG_TERIMA: null, SATUAN: null
      });
      setTerimaData([]);
      fetchTerimaData();
    } catch (error) {
      console.error('Error saat submit:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Terjadi kesalahan saat menyimpan data', 
        life: 5000 
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteRow = (id) => {
    setTerimaData(prev => prev.filter(item => item.id !== id));
    toast.current?.show({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil dihapus',
      life: 3000
    });
  };

  return (
    <div className="card p-4">
      <Toast ref={toast} />
      <h2 className="text-xl font-bold mb-4">Terima Barang</h2>

      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
        {/* Form Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Dari Gudang</label>
            <Dropdown placeholder="Pilih Ke Gudang" options={gudangOptions} value={formData.GUDANG_TERIMA} onChange={(e) => handleInputChange('GUDANG_TERIMA', e.value)} showClear />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ke Gudang</label>
            <Dropdown placeholder="Pilih Dari Gudang" options={gudangOptions} value={formData.GUDANG_KIRIM} onChange={(e) => handleInputChange('GUDANG_KIRIM', e.value)} showClear />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <Calendar placeholder="Tanggal" value={formData.TGL} onChange={(e) => handleInputChange('TGL', e.value)} showIcon dateFormat="dd/mm/yy" className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Faktur </label>
            <div className='p-inputgroup'>
              <InputText
              placeholder="ketik / pilih FAKTUR"
              value={ formData.FAKTUR}
              onChange={(e) => handleInputChange("FAKTUR", e.target.value)}
              />
              <Button icon="pi pi-search" onClick={() => setVisibleFaktur(true)} />
            </div>
          </div>

          <Dialog
            header="Pilih Faktur"
            visible={visibleFaktur}
            style={{ width: "50vw" }}
            onHide={() => setVisibleFaktur(false)}
            position="center"
          >
            <DataTable value={fakturList} paginator rows={10} size="small">
              <Column field="FAKTUR" header="FAKTUR" sortable />
              <Column
                field="TGL"
                header="TANGGAL"
                body={(rowData) =>
                  new Date(rowData.TGL).toLocaleDateString("id-ID")
                }
                sortable
              />
              <Column
                header="AKSI"
                body={(rowData) => (
                  <Button
                  label="Pilih"
                  icon="pi pi-check"
                  size="small"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      FAKTUR: rowData.FAKTUR,
                      TGL: rowData.TGL,
                    }));

                    setTerimaData((prev) => {
                      const existsIndex = prev.findIndex(item => item.FAKTUR === rowData.FAKTUR);

                      if (existsIndex !== -1) {
                        // kalau sudah ada → QTY + 1
                        const updated = [...prev];
                        updated[existsIndex] = {
                          ...updated[existsIndex],
                          QTY: (updated[existsIndex].QTY || 0) + 1
                        };
                        return updated;
                      }

                      
                      return [
                        ...prev,
                        {
                          id: prev.length + 1,
                          FAKTUR: rowData.FAKTUR,
                          TGL: new Date(rowData.TGL).toLocaleDateString("id-ID"),
                          NAMA: "-",
                          FAKTUR_KIRIM: "-",
                          GUDANG_KIRIM: "-",
                          GUDANG_TERIMA: "-",
                          KODE: "-",
                          QTY: 1,
                          BARCODE: "-",
                          SATUAN: "-",
                          USERNAME: user?.username || "-"
                        }
                      ];
                    });

                    setVisibleFaktur(false);

                    toast.current?.show({
                      severity: 'success',
                      summary: 'Faktur Ditambahkan',
                      detail: `Faktur berhasil dipilih`,
                      life: 3000
                    });
                  }}
                />
                )}
              />
            </DataTable>
          </Dialog>
  
          <div>
            <label className="block text-sm font-medium mb-1">BARCODE</label>
            <div className="p-inputgroup">
              <InputText
                placeholder="Scan / ketik BARCODE lalu Enter"
                value={formData.BARCODE}
                onChange={(e) => handleInputChange('BARCODE', e.target.value)}
                onKeyDown={handleBarcodeEnter}
              />
              <Button icon="pi pi-search" onClick={() => setVisible(true)} />
            </div>
          </div>
        </div>

        {/* Dialog Pilih Produk */}
        <Dialog header="Pilih Produk" visible={visible} style={{ width: '70vw' }} onHide={() => setVisible(false)} position="center">
          <DataTable value={produkList} paginator rows={10} size="small">
            <Column field="KODE" header="KODE" sortable/>
            <Column field="BARCODE" header="BARCODE"/>
            <Column field="NAMA" header="NAMA"/>
            <Column field="QTY" header="QTY"/>
            <Column field="SATUAN" header="SATUAN"/>
            <Column field="HJ" header="HARGA" body={(rowData) => `Rp ${(rowData.HJ ?? 0).toLocaleString('id-ID')}`} />
            <Column header="AKSI" body={(rowData) => <Button label="Pilih" icon="pi pi-check" size="small" onClick={() => handleSelect(rowData)} />} />
          </DataTable>
        </Dialog>

        {/* Tabel Terima Data */}
        <div className='mt-3'>
          <DataTable value={terimaData}paginator rows={10} size="small" loading={loading} scrollable emptyMessage="Tidak ada data yang ditemukan">
            <Column field='NAMA' header="NAMA"/>
            <Column field="FAKTUR" header="FAKTUR " />
            <Column field="FAKTUR_KIRIM" header="FAKTUR KIRIM" />
            <Column field="TGL" header="TANGGAL" />
            <Column field="GUDANG_KIRIM" header="KE GUDANG" />
            <Column field="GUDANG_TERIMA" header="DARI GUDANG" />
            <Column field="KODE" header="KODE" />
            <Column field="QTY" header="QTY" />
            <Column field="BARCODE" header="BARCODE"/>
            <Column field="SATUAN" header="SATUAN" />
            <Column field="USERNAME" header="USER" />
            <Column
              header="AKSI"
              body={(rowData) => (
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-sm"
                  onClick={() => handleDeleteRow(rowData.id)}
                />
              )}
            />
          </DataTable>
          <div className="w-full flex mt-3 justify-end gap-2">
            <Button
              label="Simpan"
              icon="pi pi-check"
              onClick={handleSubmit}
              loading={submitLoading}
              className="p-button-success ml-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}