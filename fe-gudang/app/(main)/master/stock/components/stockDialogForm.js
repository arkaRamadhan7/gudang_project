'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

/**
 * @param {{
 *   data: any[],
 *   loading: boolean,
 *   onEdit: (row: any) => void,
 *   onDelete: (row: any) => void
 * }} props
 */
const StockTable = ({ data = [], loading = false, onEdit, onDelete }) => {
  return (
    <DataTable
      value={data}
      paginator
      rows={10}
      scrollable
      size="small"
      loading={loading}
      emptyMessage="Tidak ada data stock"
      className="text-sm"
    >
      <Column field="gudang" header="Gudang" />
      <Column field="KODE" header="Kode" />
      <Column field="KODE_TOKO" header="Kode Toko" />
      <Column field="NAMA" header="Nama" />
      <Column field="JENIS" header="Jenis" />
      <Column field="GOLONGAN" header="Golongan" />
      <Column field="RAK" header="Rak" />
      <Column field="DOS" header="Dos" />
      <Column field="SATUAN" header="Satuan" />
      <Column field="ISI" header="Isi" />
      <Column field="DISCOUNT" header="Discount" />
      <Column field="HB" header="Harga Beli" />
      <Column field="HJ" header="Harga Jual" />
      <Column field="EXPIRED" header="Expired" />
      <Column field="TGL_MASUK" header="Tanggal Masuk" />
      <Column field="BERAT" header="Berat" />
      <Column field="BARCODE" header="barcode"/>
      <Column
        header="Aksi"
        body={(row) => (
          <div className="flex gap-2">
            <Button
              icon="pi pi-pencil"
              className="text-sm"
              size="small"
              severity="warning"
              onClick={() => onEdit?.(row)}
            />
            <Button
              icon="pi pi-trash"
              className="text-sm"
              size="small"
              severity="danger"
              onClick={() => onDelete?.(row)}
            />
          </div>
        )}
        style={{ width: '150px' }}
      />
    </DataTable>
  );
};

export default StockTable;
