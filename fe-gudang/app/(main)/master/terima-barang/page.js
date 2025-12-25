'use client';

import { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { useAuth } from '@/app/(auth)/context/authContext';

export default function MutasiTerimaDataPage() {
  const toastRef = useRef(null);
  const [fakturInput, setFakturInput] = useState('');
  const [terimaData, setTerimaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pendingData, setPendingData] = useState([]);
  const [dosAwal, setDosAwal] = useState(null);
  const [isiAwal, setIsiAwal] = useState(null);
  const [qtyAwal, setQtyAwal] = useState(null);
  
  // State untuk filter gudang
  const [gudangOptions, setGudangOptions] = useState([]);
  const [selectedGudang, setSelectedGudang] = useState(null);
  const [loadingGudang, setLoadingGudang] = useState(false);
  
  const { user } = useAuth();

  const generateFaktur = () => `FT${Date.now()}`;

  // Fetch daftar gudang saat komponen dimuat
  useEffect(() => {
    fetchGudang();
  }, []);

  const fetchGudang = async () => {
    setLoadingGudang(true);
    try {
      const res = await fetch("/api/gudang/nama");
      const json = await res.json();
      if (json.status === "00") {
        const options = json.namaGudang.map(item => ({
          label: item.nama || item.NAMA || item,
          value: item.nama || item.NAMA || item
        }));
        setGudangOptions(options);
      }
    } catch (error) {
      console.error("Error fetch gudang:", error);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal mengambil data gudang', 
        life: 3000 
      });
    } finally {
      setLoadingGudang(false);
    }
  };

  const handleFakturEnter = async (e) => {
    if (e.key !== 'Enter') return;

    const faktur = fakturInput.trim();
    if (!faktur) return;

    setLoading(true);

    try {
      const resTerima = await fetch(`/api/mutasi/receive/${faktur}`);
      const jsonTerima = await resTerima.json();
      
      if (jsonTerima.status === '00' && jsonTerima.data) {
        const dos = Number(jsonTerima.data.dos ?? 0);
        const isi = Number(jsonTerima.data.isi ?? 1);
        const qty = Number(jsonTerima.data.qty ?? 0);

        setDosAwal(dos);
        setIsiAwal(isi);
        setQtyAwal(qty);

        setTerimaData([{ 
          ...jsonTerima.data, 
          dos: dos,
          isi: isi,
          qty: qty 
        }]);

        toastRef.current?.show({ 
          severity: 'success', 
          summary: 'Berhasil', 
          detail: `Faktur ${faktur} ditemukan (DOS: ${dos}, ISI: ${isi}, QTY: ${qty})`, 
          life: 3000 
        });
      } else {
        setTerimaData([]);
        setDosAwal(null);
        setIsiAwal(null);
        setQtyAwal(null);
        toastRef.current?.show({ 
          severity: 'info', 
          summary: 'Info', 
          detail: jsonTerima.message || 'Data tidak ditemukan', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Error fetching faktur:', err);
      setDosAwal(null);
      setIsiAwal(null);
      setQtyAwal(null);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal mengambil data', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFaktur = async () => {
    // Validasi: harus pilih gudang dulu
    if (!selectedGudang) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Pilih Gudang',
        detail: 'Silakan pilih gudang terlebih dahulu',
        life: 3000
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/mutasi/pending?gudang=${encodeURIComponent(selectedGudang)}`);
      const json = await res.json();
      
      if (json.status === "00" && Array.isArray(json.data)) {
        const formattedData = json.data.map(item => ({
          ...item,
          dos: Number(item.dos || item.DOS || 0),
          isi: Number(item.isi || item.ISI || 1),
          qty: Number(item.qty || item.QTY || 0),
          faktur: item.faktur || item.FAKTUR
        }));
        
        setPendingData(formattedData);
        setVisible(true);
        
        if (formattedData.length === 0) {
          toastRef.current?.show({ 
            severity: 'info', 
            summary: 'Info', 
            detail: `Tidak ada faktur pending untuk gudang ${selectedGudang}`, 
            life: 3000 
          });
        } else {
          toastRef.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Ditemukan ${formattedData.length} faktur untuk ${selectedGudang}`,
            life: 3000
          });
        }
      } else {
        setPendingData([]);
        toastRef.current?.show({ 
          severity: 'warn', 
          summary: 'Warning', 
          detail: json.message || 'Data tidak ditemukan', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Error fetching pending:', err);
      setPendingData([]);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal ambil faktur pending', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFaktur = (row) => {
    const dos = Number(row.dos);
    const isi = Number(row.isi);
    const qty = Number(row.qty);

    setFakturInput(row.faktur);
    setTerimaData([{
      ...row,
      dos: dos,
      isi: isi,
      qty: qty
    }]);
    
    setDosAwal(dos);
    setIsiAwal(isi);
    setQtyAwal(qty);
    
    setVisible(false);
    
    toastRef.current?.show({ 
      severity: 'success', 
      summary: 'Faktur Dipilih', 
      detail: `Faktur ${row.faktur} berhasil dimuat (DOS: ${dos}, ISI: ${isi}, QTY: ${qty})`, 
      life: 3000 
    });
  };

  const handleTerimaRow = async (rowData) => {
    const fakturKirim = rowData.faktur;
    if (!fakturKirim) {
      return toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Faktur tidak tersedia', 
        life: 3000 
      });
    }

    const dos = Number(rowData.dos);
    const isi = Number(rowData.isi);
    const qty = Number(rowData.qty);

    if (!dos || dos <= 0) {
      return toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'DOS harus lebih dari 0', 
        life: 3000 
      });
    }

    if (!isi || isi <= 0) {
      return toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'ISI harus lebih dari 0', 
        life: 3000 
      });
    }

    const calculatedQty = dos * isi;
    if (qty !== calculatedQty) {
      return toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `QTY tidak sesuai. Seharusnya ${calculatedQty} (DOS: ${dos} × ISI: ${isi})`, 
        life: 3000 
      });
    }

    const fakturBaru = generateFaktur();

    const payload = {
      faktur: fakturBaru,
      faktur_kirim: fakturKirim,
      nama: rowData.nama,
      kode: rowData.kode,
      dos: dos,
      isi: isi,
      qty: qty,
      satuan: rowData.satuan,
      username: rowData.username,
      tgl: new Date().toISOString(),
      gudang_kirim: rowData.gudang_kirim,
      gudang_terima: rowData.gudang_terima,
      barcode: rowData.barcode,
      user_terima: user?.username
    };

    try {
      const res = await fetch(`/api/mutasi/receive/${fakturKirim}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (json.status === '00') {
        toastRef.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: json.message || 'Mutasi berhasil diterima', 
          life: 3000 
        });
        
        setFakturInput('');
        setTerimaData([]);
        setDosAwal(null);
        setIsiAwal(null);
        setQtyAwal(null);
        
        if (selectedGudang) {
          fetchPendingFaktur();
        }
      } else {
        toastRef.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: json.message || 'Gagal menerima mutasi', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Error receiving mutasi:', err);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal menerima mutasi', 
        life: 3000 
      });
    }
  };

  const handleDosChange = (faktur, newDos) => {
    if (newDos < 0) {
      toastRef.current?.show({ 
        severity: 'warn', 
        summary: 'Invalid DOS', 
        detail: 'DOS tidak boleh negatif', 
        life: 3000 
      });
      return;
    }

    if (dosAwal !== null && newDos > dosAwal) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Invalid DOS',
        detail: `DOS tidak boleh melebihi yang dikirim (${dosAwal})`,
        life: 3000
      });
      return;
    }

    setTerimaData(prev =>
      prev.map(item => {
        if (item.faktur === faktur) {
          const isi = item.isi || 1;
          const newQty = newDos * isi;
          return { ...item, dos: newDos, qty: newQty };
        }
        return item;
      })
    );
  };

  const dosBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <InputNumber
        value={rowData.dos}
        onValueChange={(e) => handleDosChange(rowData.faktur, e.value)}
        min={0}
        max={dosAwal || undefined}
        style={{ width: '100%' }}
        inputStyle={{
          width: '60px',              
          transition: 'all 0.2s ease',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          textAlign: 'left',
          padding: '4px',
          fontSize: '14px',
          lineHeight: '1.2',
          verticalAlign: 'middle'
        }}
        onFocus={(e) => {
          e.target.style.width = '100px'; 
          e.target.style.border = '2px solid #1761b6ff';
          e.target.style.borderRadius = '6px';
          e.target.style.background = 'white';
          e.target.style.boxShadow = '0 0 0 3px rgba(244, 244, 244, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.width = '60px'; 
          e.target.style.border = 'none';
          e.target.style.background = 'transparent';
          e.target.style.boxShadow = 'none';
        }}
        size="small"
      />
    </div>
  );

  return (
    <div className="mutasi-container">
      <Toast ref={toastRef} />
      
      {/* HEADER SECTION */}
      <div className="mutasi-header">
        <h2>Terima Barang</h2>
      </div>

      {/* FORM SECTION */}
      <div className="mutasi-form">
        
        {/* Grid 2 Kolom - Gudang dan Faktur */}
        <div className="mutasi-grid mutasi-grid-cols-2">
          <div className="mutasi-form-group">
            <label>Gudang</label>
            <Dropdown 
              placeholder="Pilih Gudang" 
              options={gudangOptions} 
              value={selectedGudang} 
              onChange={(e) => setSelectedGudang(e.value)} 
              showClear
              filter
            />
            {!selectedGudang && (
              <small className="text-warning">
                Pilih gudang untuk memfilter faktur
              </small>
            )}
          </div>

          <div className="mutasi-form-group">
            <label>Faktur</label>
            <div className="p-inputgroup">
              <InputText 
                placeholder="Ketik Faktur" 
                value={fakturInput} 
                onChange={(e) => setFakturInput(e.target.value)}
                onKeyDown={handleFakturEnter}
              />
              <Button 
                icon="pi pi-search" 
                onClick={fetchPendingFaktur}
                disabled={!selectedGudang}
                loading={loading}
                tooltip={!selectedGudang ? "Pilih gudang terlebih dahulu" : "Cari faktur pending"}
              />
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="mutasi-table">
          <DataTable 
            value={terimaData} 
            paginator 
            rows={10} 
            size="small" 
            loading={loading} 
            scrollable 
            emptyMessage="Belum ada barang yang dipilih"
          >
            <Column field="nama" header="NAMA" style={{ minWidth: '200px' }} />
            <Column field="faktur" header="FAKTUR" style={{ minWidth: '120px' }} />
            <Column field="tgl" header="TANGGAL" style={{ minWidth: '100px' }} />
            <Column field="gudang_kirim" header="DARI GUDANG" style={{ minWidth: '120px' }} />
            <Column field="gudang_terima" header="KE GUDANG" style={{ minWidth: '120px' }} />
            <Column field="kode" header="KODE" style={{ minWidth: '80px' }} />
            <Column field="dos" header="DOS" body={dosBodyTemplate} style={{ minWidth: '80px' }} />
            <Column field="isi" header="ISI" style={{ minWidth: '60px' }} />
            <Column field="qty" header="QTY" style={{ minWidth: '80px' }} />
            <Column field="barcode" header="BARCODE" style={{ minWidth: '100px' }} />
            <Column field="satuan" header="SATUAN" style={{ minWidth: '80px' }} />
            <Column field="username" header="USER KIRIM" style={{ minWidth: '100px' }} />
            <Column field="status" header="STATUS" style={{ minWidth: '100px' }} />
            <Column
              header="AKSI"
              style={{ minWidth: '80px' }}
              body={(rowData) => (
                <Button
                  label="Terima"
                  icon="pi pi-check"
                  className="p-button-success p-button-sm"
                  onClick={() => handleTerimaRow(rowData)}
                  disabled={!rowData.dos || rowData.dos <= 0}
                />
              )}
            />
          </DataTable>
        </div>
      </div>

      {/* DIALOG */}
      <Dialog 
        header={`Pilih Faktur Pending - ${selectedGudang || 'Semua'} (${pendingData.length})`}
        visible={visible} 
        style={{ width: '85vw' }} 
        onHide={() => setVisible(false)}
        position="center"
        className="mutasi-dialog"
        maximizable
      >
        <DataTable 
          value={pendingData} 
          paginator 
          rows={10} 
          size="small"
          emptyMessage={`Tidak ada faktur pending untuk gudang ${selectedGudang || 'yang dipilih'}`}
          scrollable
        >
          <Column field="faktur" header="FAKTUR" style={{ minWidth: '120px' }} sortable />
          <Column field="nama" header="NAMA" style={{ minWidth: '200px' }} />
          <Column field="kode" header="KODE" style={{ minWidth: '100px' }} />
          <Column 
            field="tgl" 
            header="TANGGAL" 
            style={{ minWidth: '100px' }}
            body={(row) => new Date(row.tgl).toLocaleDateString('id-ID')}
            sortable
          />
          <Column field="gudang_kirim" header="DARI GUDANG" style={{ minWidth: '120px' }} />
          <Column field="gudang_terima" header="KE GUDANG" style={{ minWidth: '120px' }} />
          <Column field="dos" header="DOS" style={{ minWidth: '60px' }} />
          <Column field="isi" header="ISI" style={{ minWidth: '60px' }} />
          <Column field="qty" header="QTY" style={{ minWidth: '80px' }} />
          <Column field="status" header="STATUS" style={{ minWidth: '100px' }} />
          <Column 
            header="AKSI" 
            body={(row) => (
              <Button 
                label="Pilih" 
                icon="pi pi-check" 
                size="small" 
                className="p-button-success"
                onClick={() => handleSelectFaktur(row)} 
              />
            )}
            style={{ minWidth: '100px' }}
          />
        </DataTable>
      </Dialog>
    </div>
  );
}