'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { format, parseISO } from 'date-fns';
import '@/styles/page/stock.scss';

const initialFormState = {
  GUDANG: '', 
  KODE: '',
  KODE_TOKO: '',
  NAMA: '',
  JENIS: '',
  GOLONGAN: '',
  RAK: '',
  DOS: '',
  SATUAN: '',
  ISI: '',
  DISCOUNT: '',
  HB: '',
  HJ: '',
  EXPIRED: '',
  TGL_MASUK: '',
  BERAT: '',
  QTY: '',
  BARCODE: ''
};

const StockContent = () => {
  const toast = useRef(null);
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    rak: '',
    satuan: '',
    gudang: '',
  });
  const [options, setOptions] = useState({
    rak: [],
    satuan: [],
    gudang: [],
    golongan: [],
    toko: []
  });
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [form, setForm] = useState(initialFormState);
  
  const formatDateToDB = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const jakartaDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
    const year = jakartaDate.getUTCFullYear();
    const month = String(jakartaDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jakartaDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const parseDateFromDB = (dateString) => {
    if (!dateString) return '';
    try {
      const parsedDate = parseISO(dateString);
      return format(parsedDate, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Invalid date string:', error);
      return '';
    }
  };

  const fetchDropdownData = useCallback(async (endpoint, labelField = 'KETERANGAN') => {
    try {
      const res = await fetch(`/api/${endpoint}`);
      const json = await res.json();
      
      if (json.status === '00') {
        return json.data.map(item => ({
          value: item.KODE,
          label: item[labelField] || item.KETERANGAN || item.NAMA
        }));
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: json.message || `Gagal memuat data ${endpoint}`, 
          life: 3000 
        });
        return [];
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Gagal memuat data ${endpoint}`, 
        life: 3000 
      });
      return [];
    }
  }, []);

  const fetchToko = useCallback(async() => {
    try {
      const res = await fetch("/api/toko");
      const json = await res.json();

      if (json.status === '00') {
        return json.data.map(item => ({
          label: item.NAMA,
          value: item.KODE
        }));
      }
      return [];
    } catch (error) {
      console.error("Gagal ambil kode Toko", error);
      return [];
    }
  }, []);

  const fetchGudang = useCallback(async () => {
    try {
      const res = await fetch("/api/gudang");
      const json = await res.json();

      if (json.status === "00" && Array.isArray(json.data)) {
        console.log("✅ Data gudang:", json.data);
        return json.data.map(item => ({
          label: item.nama || item.NAMA,
          value: item.nama || item.NAMA,
        }));
      }
      return [];
    } catch (error) {
      console.error("Form Gagal ambil nama gudang", error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal mengambil data gudang', 
        life: 3000 
      });
      return [];  
    }
  }, []);

  const fetchStock = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stock');
      const json = await res.json();
      
      if (json.status === '00') {
        const processedData = json.data.map(item => ({
          ...item,
          id: item.id || item.ID,
          TGL_MASUK: parseDateFromDB(item.TGL_MASUK),
          EXPIRED: parseDateFromDB(item.EXPIRED)
        }));
        setStock(processedData);
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: json.message, 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Gagal memuat data stock', 
        life: 3000 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const [rakData, satuanData, golonganData, tokoData, gudangData] = await Promise.all([
        fetchDropdownData('rak'),
        fetchDropdownData('satuan'),
        fetchDropdownData('golonganstock'),
        fetchToko(),
        fetchGudang(),
      ]);

      setOptions({
        rak: rakData,
        satuan: satuanData,
        golongan: golonganData,
        gudang: gudangData,
        toko: tokoData
      });
      
      await fetchStock();
    };

    loadInitialData();
  }, [fetchDropdownData, fetchStock, fetchToko, fetchGudang]);

  const filteredStocks = useMemo(() => {
    let filtered = stock;

    if (filters.rak) {
      filtered = filtered.filter(item => item.RAK === filters.rak);
    }

    if (filters.satuan) {
      filtered = filtered.filter(item => item.SATUAN === filters.satuan);
    }
    if (filters.gudang) {
      filtered = filtered.filter(item => item.GUDANG === filters.gudang);
    }

    return filtered;
  }, [stock, filters]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      rak: '',
      satuan: '',
      gudang: ''
    });
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDropdownChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCalendarChange = useCallback((name, value) => {
    if (!value) {
      setForm(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    const formattedDate = formatDateToDB(value);
    setForm(prev => ({ ...prev, [name]: formattedDate }));
  }, []);

  const validateForm = () => {
    const requiredFields = ['GUDANG', 'KODE', 'NAMA', 'BARCODE'];
    const emptyFields = requiredFields.filter(field => !form[field] || form[field].trim() === '');
    
    if (emptyFields.length > 0) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Validasi', 
        detail: `Field wajib tidak boleh kosong: ${emptyFields.join(', ')}`, 
        life: 3000 
      });
      return false;
    }
    
    return true;
  };

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setForm(initialFormState);
    setSelectedStock(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const url = dialogMode === 'add' ? '/api/stock' : `/api/stock/${selectedStock.KODE}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const json = await res.json();

      if (res.ok && json.status === '00') {
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Berhasil', 
          detail: json.message, 
          life: 3000 
        });
        await fetchStock();
        closeDialog();
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: json.message || 'Gagal menyimpan data', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: err.message || 'Terjadi kesalahan saat menyimpan data', 
        life: 3000 
      });
    } finally {
      setIsLoading(false);
    }
  }, [dialogMode, form, selectedStock, fetchStock, closeDialog]);

  const handleEdit = useCallback((row) => {
    console.log('Edit row data:', row);
    setDialogMode('edit');
    setSelectedStock(row);
    
    const formData = {};
    Object.keys(initialFormState).forEach(key => {
      formData[key] = row[key] || '';
    });
    
    if (row.TGL_MASUK) {
      formData.TGL_MASUK = parseDateFromDB(row.TGL_MASUK);
    }
    if (row.EXPIRED) {
      formData.EXPIRED = parseDateFromDB(row.EXPIRED);
    }
    
    console.log('Form data for edit:', formData);
    setForm(formData);
  }, []);

  const handleDelete = useCallback(async (data) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    const stockId = data?.id || data?.ID;
    console.log("Delete Stock ID:", stockId);
    
    if (!stockId) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Error', 
        detail: 'ID tidak ditemukan', 
        life: 3000 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock/${stockId}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status === '00') {
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Berhasil', 
          detail: json.message || 'Data berhasil dihapus', 
          life: 3000 
        });
        await fetchStock();
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: json.message || 'Gagal menghapus data', 
          life: 3000 
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: err.message || 'Terjadi kesalahan saat menghapus data', 
        life: 3000 
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchStock]);

  const openAddDialog = useCallback(() => {
    setDialogMode('add');
    setForm(initialFormState);
    setSelectedStock(null);
  }, []);

  const renderCalendarInput = (name, label) => {
    let dateValue = null;
    if (form[name]) {
      const dateString = form[name] + 'T12:00:00';
      dateValue = new Date(dateString);
      
      if (isNaN(dateValue.getTime())) {
        dateValue = null;
      }
    }

    return (
      <div className="mutasi-form-group">
        <label htmlFor={name}>{label}</label>
        <Calendar
          id={name}
          name={name}
          value={dateValue}
          onChange={(e) => handleCalendarChange(name, e.value)}
          dateFormat="yy-mm-dd"
          showIcon
          placeholder={`Pilih ${label}`}
        />
      </div>
    );
  };

  const renderDateColumn = (rowData, field) => {
    const dateValue = rowData[field];
    if (!dateValue) return '-';
    try {
      const date = new Date(dateValue + 'T12:00:00');
      return date.toLocaleDateString('id-ID');
    } catch (e) {
      return dateValue;
    }
  };

  const renderDialogForm = () => (
    <Dialog
      header={dialogMode === 'add' ? 'Tambah Stock' : 'Edit Stock'}
      visible={!!dialogMode}
      onHide={closeDialog}
      style={{ width: '40rem' }}
      className="mutasi-dialog"
    >
      <form onSubmit={handleSubmit}>
        {/* Grid 2 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-2">
          <div className="mutasi-form-group">
            <label htmlFor="GUDANG">Gudang *</label>
            <Dropdown
              id="GUDANG"
              name="GUDANG"
              value={form.GUDANG}
              options={options.gudang}
              onChange={(e) => handleDropdownChange('GUDANG', e.value)}
              placeholder="Pilih Gudang"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          
          <div className="mutasi-form-group">
            <label htmlFor="KODE_TOKO">KODE TOKO</label>
            <Dropdown
              id="KODE_TOKO"
              name="KODE_TOKO"
              value={form.KODE_TOKO}
              options={options.toko}
              onChange={(e) => handleDropdownChange('KODE_TOKO', e.value)}
              placeholder="Pilih Kode"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
        </div>

        {/* Grid 2 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-2">
          <div className="mutasi-form-group">
            <label htmlFor="KODE">KODE *</label>
            <InputText
              id="KODE"
              name="KODE"
              value={form.KODE || ''}
              onChange={handleFormChange}
              placeholder="Masukkan kode"
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="NAMA">NAMA *</label>
            <InputText
              id="NAMA"
              name="NAMA"
              value={form.NAMA || ''}
              onChange={handleFormChange}
              placeholder="Masukkan nama"
            />
          </div>
        </div>

        {/* Grid 2 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-2">
          <div className="mutasi-form-group">
            <label htmlFor="JENIS">JENIS</label>
            <InputText
              id="JENIS"
              name="JENIS"
              value={form.JENIS || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="GOLONGAN">Golongan</label>
            <Dropdown
              id="GOLONGAN"
              name="GOLONGAN"
              value={form.GOLONGAN}
              options={options.golongan}
              onChange={(e) => handleDropdownChange('GOLONGAN', e.value)}
              placeholder="Pilih Golongan"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
        </div>
        
        {/* Grid 3 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-3">
          <div className="mutasi-form-group">
            <label htmlFor="RAK">RAK</label>
            <Dropdown
              id="RAK"
              name="RAK"
              value={form.RAK}
              options={options.rak}
              onChange={(e) => handleDropdownChange('RAK', e.value)}
              placeholder="Pilih RAK"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="DOS">DOS</label>
            <InputText
              id="DOS"
              name="DOS"
              value={form.DOS || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="SATUAN">Satuan</label>
            <Dropdown
              id="SATUAN"
              name="SATUAN"
              value={form.SATUAN}
              options={options.satuan}
              onChange={(e) => handleDropdownChange('SATUAN', e.value)}
              placeholder="Pilih Satuan"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
        </div>

        <div className="mutasi-form-group">
          <label>BARCODE *</label>
          <InputText
            id="BARCODE"
            name="BARCODE"
            value={form.BARCODE || ''}
            onChange={handleFormChange}
            readOnly={dialogMode === 'edit'}
            placeholder="Masukkan Barcode"
          />
        </div>

        {/* Grid 3 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-3">
          <div className="mutasi-form-group">
            <label htmlFor="ISI">ISI</label>
            <InputText
              id="ISI"
              name="ISI"
              value={form.ISI || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="DISCOUNT">DISCOUNT</label>
            <InputText
              id="DISCOUNT"
              name="DISCOUNT"
              value={form.DISCOUNT || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="BERAT">BERAT</label>
            <InputText
              id="BERAT"
              name="BERAT"
              type="number"
              value={form.BERAT || ''}
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Grid 3 Kolom */}
        <div className="mutasi-grid mutasi-grid-cols-3">
          <div className="mutasi-form-group">
            <label htmlFor="HB">HB (Harga Beli)</label>
            <InputText
              id="HB"
              name="HB"
              type="number"
              value={form.HB || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="HJ">HJ (Harga Jual)</label>
            <InputText
              id="HJ"
              name="HJ"
              type="number"
              value={form.HJ || ''}
              onChange={handleFormChange}
            />
          </div>

          <div className="mutasi-form-group">
            <label htmlFor="QTY">QTY</label>
            <InputText
              id="QTY"
              name="QTY"
              type="number"
              value={form.QTY || ''}
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Grid 2 Kolom - Calendar */}
        <div className="mutasi-grid mutasi-grid-cols-2">
          {renderCalendarInput('TGL_MASUK', 'Tanggal Masuk')}
          {renderCalendarInput('EXPIRED', 'Tanggal Expired')}
        </div>

        <div className="mutasi-button-wrapper">
          <Button 
            type="button" 
            label="Batal" 
            severity="secondary" 
            onClick={closeDialog}
          />
          <Button 
            type="submit" 
            label="Simpan" 
            severity="success" 
            icon="pi pi-save" 
            loading={isLoading}
            className="p-button-success"
          />
        </div>
      </form>
    </Dialog>
  );

  return (
    <div className="mutasi-container">
      <Toast ref={toast} />
      
      {/* HEADER SECTION */}
      <div className="mutasi-header">
        <h2>Master Stock</h2>
      </div>

      {/* FORM SECTION - Action Buttons */}
      <div className="mutasi-form">
        <div className="mutasi-button-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '14px' }}>
          <Button
            label="Tambah Stock"
            icon="pi pi-plus"
            onClick={openAddDialog}
            className="p-button-success"
          />
          <Button
            label="Reset Filter"
            icon="pi pi-refresh"
            severity="secondary"
            onClick={clearFilters}
          />
        </div>
        
        {/* FILTER SECTION */}
        <div className="mutasi-grid mutasi-grid-cols-3">
          <div className="mutasi-form-group">
            <label>Filter RAK</label>
            <Dropdown
              value={filters.rak}
              options={options.rak}
              onChange={(e) => handleFilterChange('rak', e.value)}
              placeholder="Pilih RAK"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div className="mutasi-form-group">
            <label>Filter Satuan</label>
            <Dropdown
              value={filters.satuan}
              options={options.satuan}
              onChange={(e) => handleFilterChange('satuan', e.value)}
              placeholder="Pilih Satuan"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div className="mutasi-form-group">
            <label>Filter Gudang</label>
            <Dropdown
              value={filters.gudang}
              options={options.gudang}
              onChange={(e) => handleFilterChange('gudang', e.value)}
              placeholder="Pilih Gudang"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="mutasi-table">
          <DataTable
            value={filteredStocks}
            paginator
            rows={10}
            loading={isLoading}
            scrollable
            size="small"
            emptyMessage="Tidak ada data stock"
          >
            {Object.keys(initialFormState)
              .filter(key => key !== 'BERAT')
              .map(key => (
                <Column 
                  key={key} 
                  field={key} 
                  header={key.replace(/_/g, ' ')}
                  style={{ minWidth: '100px' }}
                  body={key === 'TGL_MASUK' || key === 'EXPIRED' ? 
                    (rowData) => renderDateColumn(rowData, key) : undefined
                  }
                />
              ))}
              
            <Column
              header="AKSI"
              style={{ minWidth: '100px' }}
              body={(row) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-warning p-button-sm"
                    onClick={() => handleEdit(row)}
                    tooltip="Edit"
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-sm"
                    onClick={() => handleDelete(row)}
                    tooltip="Hapus"
                  />
                </div>
              )}
            />
          </DataTable>
        </div>
      </div>

      {renderDialogForm()}
    </div>
  );
};

export default StockContent;