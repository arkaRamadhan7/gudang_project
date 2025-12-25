'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

export default function RequestStockPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/request-stock`);
      const responseObject = await response.json(); 

      if (!response.ok) {
        throw new Error(responseObject.message || 'Gagal mengambil data');
      }

      if (responseObject && Array.isArray(responseObject.data)) {
        setRequests(responseObject.data);
      } else {
        throw new Error('Format data dari server salah.');
      }

    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Terjadi kesalahan saat memuat data', life: 3000 });
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]); 

  // ====================== AWAL PERUBAHAN ======================

  /**
   * Fungsi ini HANYA untuk menangani penerimaan (accept) request.
   */
  const handleAccept = async (rowData) => {
    try {
      const response = await fetch("/api/request-stock/accept", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData), 
      });

      const result = await response.json();

      if (!response.ok || result.status !== "00") {
        throw new Error(result.message || 'Gagal memproses permintaan');
      }
      
      fetchRequest(); // Muat ulang data
      
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Berhasil', 
        detail: `Request untuk ${rowData.NAMA} telah diterima!`, 
        life: 3000 
      });

    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    }
  };

  /**
   * Fungsi ini HANYA untuk menangani penolakan (reject) request.
   */
  const handleReject = async (rowData) => {
    try {
      const response = await fetch("/api/request-stock/rejected", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData), 
      });

      const result = await response.json();

      if (!response.ok || result.status !== "00") {
        throw new Error(result.message || 'Gagal memproses permintaan');
      }
      
      fetchRequest(); // Muat ulang data
      
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Ditolak', 
        detail: `Request untuk ${rowData.NAMA} telah ditolak.`, 
        life: 3000 
      });

    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    }
  };
  
  const statusBodyTemplate = (rowData) => {
    const severityMap = {
      accept: 'success',
      rejected: 'danger',
      pending: 'warning'
    };
    return <Tag value={rowData.STATUS} severity={severityMap[rowData.STATUS] || 'info'}></Tag>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        {/* Tombol Terima sekarang memanggil handleAccept */}
        <Button 
          icon="pi pi-check" 
          className="p-button-success p-button-sm" 
          onClick={() => handleAccept(rowData)} 
          disabled={rowData.STATUS !== 'pending'}
          tooltip="Terima"
        />
        {/* Tombol Tolak sekarang memanggil handleReject */}
        <Button 
          icon="pi pi-times" 
          className="p-button-danger p-button-sm" 
          onClick={() => handleReject(rowData)} 
          disabled={rowData.STATUS !== 'pending'}
          tooltip="Tolak"
        />
      </div>
    );
  };
  
  // ======================= AKHIR PERUBAHAN =======================
  
  const header = (
    <h2 className="text-xl font-bold m-0">Daftar Request Stock</h2>
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="p-4 md:p-6">
        <div className="card">
          <DataTable 
            value={requests} 
            loading={loading}
            paginator rows={10} dataKey="KODE" 
            header={header}
            emptyMessage="Tidak ada data request ditemukan."
            className="p-datatable-sm"
          >
            <Column field="KODE" header="Kode" sortable />
            <Column field="NAMA" header="Nama Barang" sortable style={{ minWidth: '12rem' }} />
            <Column field="QTY" header="Qty" sortable/>
            <Column field='DOS' header="Jumlah Dos"/>
            <Column field="EXPIRED" header="Expired" sortable/>
            <Column field="TGL_MASUK" header="Tgl Masuk" sortable/>
            <Column field="FAKTUR" header="Faktur" sortable/>
            <Column field="STATUS" header="Status" body={statusBodyTemplate} sortable/>
            <Column header="Aksi" body={actionBodyTemplate} style={{ width: '8rem' }} />
          </DataTable>
        </div>
      </div>
    </>
  );
}