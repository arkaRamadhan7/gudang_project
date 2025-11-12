'use client';

import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
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
  const { user } = useAuth();

  const generateFaktur = () => `FT${Date.now()}`;

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

        // Simpan nilai awal untuk validasi
        setDosAwal(dos);
        setIsiAwal(isi);
        setQtyAwal(qty);

        setTerimaData([{ 
          ...jsonTerima.data, 
          dos: dos,
          isi: isi,
          qty: qty 
        }]);

        console.log('Data Mutasi Ditemukan:', {
          faktur: faktur,
          dos: dos,
          isi: isi,
          qty: qty
        });

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
    try {
      const res = await fetch(`/api/mutasi/pending`);
      const json = await res.json();
      console.log("DEBUG pending faktur:", json);
      
      if (json.status === "00" && Array.isArray(json.data)) {
        // Pastikan DOS, ISI, QTY adalah number
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
            detail: 'Tidak ada faktur pending', 
            life: 3000 
          });
        }
      } else {
        toastRef.current?.show({ 
          severity: 'warn', 
          summary: 'Warning', 
          detail: json.message || 'Data tidak ditemukan', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Error fetching pending:', err);
      toastRef.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal ambil faktur pending', 
        life: 3000 
      });
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
    
    // Simpan nilai awal
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

    // Validasi DOS, ISI, QTY
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

    // Verifikasi perhitungan
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

    console.log('Payload Terima Barang:', payload);

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
        
        // Reset semua
        fetchPendingFaktur();
        setFakturInput('');
        setTerimaData([]);
        setDosAwal(null);
        setIsiAwal(null);
        setQtyAwal(null);
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

    // Validasi tidak boleh melebihi DOS awal
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
    <div className="card">
      <Toast ref={toastRef} />
      <h2 className="text-xl font-bold mb-4">Terima Barang Berdasarkan Faktur Kirim</h2>

      <div className="flex flex-col gap-1 mb-4">
        <label className="font-medium">
          Cari Faktur
        </label>
        <div className="p-inputgroup">
          <InputText 
            placeholder="Ketik Faktur dan Enter" 
            value={fakturInput} 
            onChange={(e) => setFakturInput(e.target.value)} 
            onKeyDown={handleFakturEnter} 
            className="w-64" 
          />
          <Button 
            icon="pi pi-search" 
            onClick={fetchPendingFaktur}
            tooltip="Cari faktur pending"
          />
        </div>
      </div>

      <Dialog 
        header={`Pilih Faktur Pending (${pendingData.length})`}
        visible={visible} 
        style={{ width: '85vw' }} 
        onHide={() => setVisible(false)}
      >
        <DataTable 
          value={pendingData} 
          paginator 
          rows={10} 
          size="small" 
          emptyMessage="Tidak ada faktur pending"
          scrollable
        >
          <Column field="faktur" header="Faktur" style={{ minWidth: '120px' }} />
          <Column field="nama" header="Nama" style={{ minWidth: '200px' }} />
          <Column field="kode" header="Kode" style={{ minWidth: '100px' }} />
          <Column field="tgl" header="Tanggal" style={{ minWidth: '100px' }} />
          <Column field="gudang_kirim" header="Dari Gudang" style={{ minWidth: '120px' }} />
          <Column field="gudang_terima" header="Ke Gudang" style={{ minWidth: '120px' }} />
          <Column field="dos" header="DOS" style={{ minWidth: '60px' }} />
          <Column field="isi" header="ISI" style={{ minWidth: '60px' }} />
          <Column field="qty" header="QTY" style={{ minWidth: '80px' }} />
          <Column 
            field="status" 
            header="Status" 
            body={(row) => (
              <span>
                {row.status}
              </span>
            )}
            style={{ minWidth: '100px' }}
          />
          <Column 
            header="Action" 
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

      <DataTable 
        value={terimaData} 
        loading={loading} 
        paginator 
        rows={10} 
        size="small" 
        scrollable
      >
        <Column field="faktur" header="Faktur" style={{ minWidth: '120px' }} />
        <Column field="nama" header="Nama" style={{ minWidth: '200px' }} />
        <Column field="kode" header="Kode" style={{ minWidth: '100px' }} />
        <Column field="tgl" header="Tanggal" style={{ minWidth: '100px' }} />
        <Column field="gudang_kirim" header="Gudang Kirim" style={{ minWidth: '120px' }} />
        <Column field="gudang_terima" header="Gudang Terima" style={{ minWidth: '120px' }} />
        <Column field="barcode" header="Barcode" style={{ minWidth: '100px' }} />
        <Column field="dos" header="DOS" body={dosBodyTemplate} style={{ minWidth: '80px' }} />
        <Column field="isi" header="ISI" style={{ minWidth: '60px' }} />
        <Column 
          field="qty" 
          header="QTY"
          style={{ minWidth: '80px' }}
        />
        <Column field="satuan" header="Satuan" style={{ minWidth: '80px' }} />
        <Column field="username" header="User Kirim" style={{ minWidth: '100px' }} />
        <Column 
          field="status" 
          header="Status" 
          body={(row) => (
            <span>
              {row.status}
            </span>
          )}
          style={{ minWidth: '100px' }}
        />
        <Column 
          header="Action" 
          body={(row) => (
            <Button 
              label="Terima" 
              icon="pi pi-check" 
              className="p-button-success" 
              onClick={() => handleTerimaRow(row)}
              disabled={!row.dos || row.dos <= 0}
            />
          )}
          style={{ minWidth: '100px' }}
        />
      </DataTable>
    </div>
  );
}