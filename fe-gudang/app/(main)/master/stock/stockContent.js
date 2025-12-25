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
  // ==================== STATE MANAGEMENT ====================
  const toast = useRef(null);
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ rak: '', satuan: '', gudang: '' });
  const [globalFilter, setGlobalFilter] = useState('');
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

  // ==================== UTILITY FUNCTIONS ====================
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BRC${timestamp.slice(-8)}${random}`;
  };

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

  const validateForm = () => {
    const requiredFields = ['GUDANG', 'KODE', 'NAMA'];
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

  // ==================== API CALLS ====================
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

  // ==================== EFFECTS ====================
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

  // ==================== COMPUTED VALUES ====================
  const filteredStocks = useMemo(() => {
    let filtered = stock;
    
    // Filter by dropdown filters
    if (filters.rak) filtered = filtered.filter(item => item.RAK === filters.rak);
    if (filters.satuan) filtered = filtered.filter(item => item.SATUAN === filters.satuan);
    if (filters.gudang) filtered = filtered.filter(item => item.GUDANG === filters.gudang);
    
    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          (item.KODE && item.KODE.toLowerCase().includes(searchLower)) ||
          (item.NAMA && item.NAMA.toLowerCase().includes(searchLower)) ||
          (item.BARCODE && item.BARCODE.toLowerCase().includes(searchLower)) ||
          (item.GUDANG && item.GUDANG.toLowerCase().includes(searchLower)) ||
          (item.JENIS && item.JENIS.toLowerCase().includes(searchLower)) ||
          (item.GOLONGAN && item.GOLONGAN.toLowerCase().includes(searchLower))
        );
      });
    }
    
    return filtered;
  }, [stock, filters, globalFilter]);

  // ==================== EVENT HANDLERS ====================
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ rak: '', satuan: '', gudang: '' });
    setGlobalFilter('');
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

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setForm(initialFormState);
    setSelectedStock(null);
  }, []);

  const openAddDialog = useCallback(() => {
    setDialogMode('add');
    const newForm = { ...initialFormState, BARCODE: generateBarcode() };
    setForm(newForm);
    setSelectedStock(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
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
    setDialogMode('edit');
    setSelectedStock(row);
    
    const formData = {};
    Object.keys(initialFormState).forEach(key => {
      formData[key] = row[key] || '';
    });
    
    if (row.TGL_MASUK) formData.TGL_MASUK = parseDateFromDB(row.TGL_MASUK);
    if (row.EXPIRED) formData.EXPIRED = parseDateFromDB(row.EXPIRED);
    
    setForm(formData);
  }, []);

  const handleDelete = useCallback(async (data) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    const stockId = data?.id || data?.ID;
    
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

  // ==================== RENDER FUNCTIONS ====================
  const renderCalendarInput = (name, label) => {
    let dateValue = null;
    if (form[name]) {
      const dateString = form[name] + 'T12:00:00';
      dateValue = new Date(dateString);
      if (isNaN(dateValue.getTime())) dateValue = null;
    }

    return (
      <div className="mb-3">
        <label htmlFor={name}>{label}</label>
        <Calendar
          id={name}
          name={name}
          value={dateValue}
          onChange={(e) => handleCalendarChange(name, e.value)}
          dateFormat="yy-mm-dd"
          showIcon
          placeholder={`Pilih ${label}`}
          className="w-full mt-2"
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

  const renderHeader = () => (
    <div className="stock-header">
      <div className="header-content">
        <div className="title-section">
          <i className="pi pi-shopping-bag header-icon"></i>
          <h3 className="page-title">Master Stock</h3>
        </div>
        <Button
          label="Tambah Stock"
          icon="pi pi-plus"
          onClick={openAddDialog}
          className="btn-add"
        />
      </div>
    </div>
  );

  const renderFilterSection = () => (
    <div className="filter-section">
      {/* Search Bar */}
      <div className="search-bar">
        <span className="p-input-icon-left" style={{ width: '100%' }}>
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari berdasarkan kode, nama, barcode, gudang..."
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </span>
      </div>

      {/* Filter Dropdowns */}
      <div className="filter-grid">
        <div className="filter-group">
          <label className="filter-label">
            <i className="pi pi-th-large"></i>
            Filter RAK
          </label>
          <Dropdown
            value={filters.rak}
            options={options.rak}
            onChange={(e) => handleFilterChange('rak', e.value)}
            placeholder="Semua RAK"
            optionLabel="label"
            optionValue="value"
            showClear
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">
            <i className="pi pi-percentage"></i>
            Filter Satuan
          </label>
          <Dropdown
            value={filters.satuan}
            options={options.satuan}
            onChange={(e) => handleFilterChange('satuan', e.value)}
            placeholder="Semua Satuan"
            optionLabel="label"
            optionValue="value"
            showClear
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">
            <i className="pi pi-warehouse"></i>
            Filter Gudang
          </label>
          <Dropdown
            value={filters.gudang}
            options={options.gudang}
            onChange={(e) => handleFilterChange('gudang', e.value)}
            placeholder="Semua Gudang"
            optionLabel="label"
            optionValue="value"
            showClear
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label" style={{ opacity: 0 }}>Action</label>
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            onClick={clearFilters}
            className="btn-reset"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );

  const renderDataTable = () => (
    <DataTable
      value={filteredStocks}
      paginator
      rows={10}
      loading={isLoading}
      scrollable
      size="small"
      emptyMessage="Tidak ada data stock"
      className="custom-datatable"
    >
      <Column field="GUDANG" header="GUDANG" style={{ minWidth: '120px' }} className="col-gudang" />
      <Column field="KODE" header="KODE" style={{ minWidth: '100px' }} className="col-kode" />
      <Column field="NAMA" header="NAMA" style={{ minWidth: '150px' }} className="col-nama" />
      <Column field="JENIS" header="JENIS" style={{ minWidth: '100px' }} />
      <Column field="GOLONGAN" header="GOLONGAN" style={{ minWidth: '100px' }} />
      <Column field="RAK" header="RAK" style={{ minWidth: '80px' }} />
      <Column field="SATUAN" header="SATUAN" style={{ minWidth: '100px' }} />
      <Column field="HB" header="HB" style={{ minWidth: '100px' }} />
      <Column field="HJ" header="HJ" style={{ minWidth: '100px' }} />
      <Column field="QTY" header="QTY" style={{ minWidth: '80px' }} />
      <Column field="BARCODE" header="BARCODE" style={{ minWidth: '120px' }} />
      <Column 
        field="TGL_MASUK" 
        header="TGL MASUK" 
        style={{ minWidth: '120px' }}
        body={(rowData) => renderDateColumn(rowData, 'TGL_MASUK')}
      />
      <Column 
        field="EXPIRED" 
        header="EXPIRED" 
        style={{ minWidth: '120px' }}
        body={(rowData) => renderDateColumn(rowData, 'EXPIRED')}
      />
      <Column
        header="AKSI"
        style={{ minWidth: '120px' }}
        className="col-action"
        body={(row) => (
          <div className="action-buttons">
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              className="btn-edit"
              onClick={() => handleEdit(row)}
              tooltip="Edit"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              className="btn-delete"
              onClick={() => handleDelete(row)}
              tooltip="Hapus"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        )}
      />
    </DataTable>
  );

  const renderDialogForm = () => (
    <Dialog
      header={
        <div className="dialog-header">
          <i className={`pi ${dialogMode === 'add' ? 'pi-plus' : 'pi-pencil'}`}></i>
          {dialogMode === 'add' ? 'Tambah Stock' : 'Edit Stock'}
        </div>
      }
      visible={!!dialogMode}
      onHide={closeDialog}
      style={{ width: '700px', maxHeight: '90vh' }}
      className="stock-dialog"
      modal
    >
      <div className="stock-form-wrapper">
        {/* Section: Informasi Gudang & Toko */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="pi pi-warehouse"></i>
            Informasi Gudang 
          </h4>
          
          <div className="grid-2">
            <div className="mb-3">
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
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* Section: Informasi Produk */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="pi pi-box"></i>
            Informasi Produk
          </h4>
          
          <div className="grid-2">
            <div className="mb-3">
              <label htmlFor="KODE">Kode *</label>
              <InputText
                id="KODE"
                name="KODE"
                value={form.KODE || ''}
                onChange={handleFormChange}
                placeholder="Masukkan kode produk"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="NAMA">Nama Produk *</label>
              <InputText
                id="NAMA"
                name="NAMA"
                value={form.NAMA || ''}
                onChange={handleFormChange}
                placeholder="Masukkan nama produk"
                className="w-full mt-2"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="BARCODE">Barcode (Auto)</label>
            <InputText
              id="BARCODE"
              name="BARCODE"
              value={form.BARCODE || ''}
              readOnly
              placeholder="Barcode otomatis"
              className="w-full mt-2"
              style={{ 
                backgroundColor: '#0f172a !important', 
                cursor: 'not-allowed',
                opacity: 0.7 
              }}
            />
            <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              <i className="pi pi-info-circle" style={{ fontSize: '11px', marginRight: '4px' }}></i>
              Barcode akan digenerate otomatis oleh sistem
            </small>
          </div>

          <div className="grid-2">
            <div className="mb-3">
              <label htmlFor="JENIS">Jenis</label>
              <InputText
                id="JENIS"
                name="JENIS"
                value={form.JENIS || ''}
                onChange={handleFormChange}
                placeholder="Masukkan jenis produk"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
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
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* Section: Penyimpanan & Satuan */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="pi pi-th-large"></i>
            Penyimpanan & Satuan
          </h4>
          
          <div className="grid-3">
            <div className="mb-3">
              <label htmlFor="RAK">Rak</label>
              <Dropdown
                id="RAK"
                name="RAK"
                value={form.RAK}
                options={options.rak}
                onChange={(e) => handleDropdownChange('RAK', e.value)}
                placeholder="Pilih Rak"
                optionLabel="label"
                optionValue="value"
                showClear
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
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
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="DOS">Dos</label>
              <InputText
                id="DOS"
                name="DOS"
                value={form.DOS || ''}
                onChange={handleFormChange}
                placeholder="Jumlah dos"
                className="w-full mt-2"
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="mb-3">
              <label htmlFor="ISI">Isi</label>
              <InputText
                id="ISI"
                name="ISI"
                value={form.ISI || ''}
                onChange={handleFormChange}
                placeholder="Isi per satuan"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="BERAT">Berat (gr)</label>
              <InputText
                id="BERAT"
                name="BERAT"
                type="number"
                value={form.BERAT || ''}
                onChange={handleFormChange}
                placeholder="Berat produk"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="QTY">Quantity</label>
              <InputText
                id="QTY"
                name="QTY"
                type="number"
                value={form.QTY || ''}
                onChange={handleFormChange}
                placeholder="Jumlah stok"
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* Section: Harga */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="pi pi-dollar"></i>
            Informasi Harga
          </h4>
          
          <div className="grid-3">
            <div className="mb-3">
              <label htmlFor="HB">Harga Beli (HB)</label>
              <InputText
                id="HB"
                name="HB"
                type="number"
                value={form.HB || ''}
                onChange={handleFormChange}
                placeholder="Rp 0"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="HJ">Harga Jual (HJ)</label>
              <InputText
                id="HJ"
                name="HJ"
                type="number"
                value={form.HJ || ''}
                onChange={handleFormChange}
                placeholder="Rp 0"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="DISCOUNT">Diskon (%)</label>
              <InputText
                id="DISCOUNT"
                name="DISCOUNT"
                value={form.DISCOUNT || ''}
                onChange={handleFormChange}
                placeholder="0"
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* Section: Tanggal */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="pi pi-calendar"></i>
            Informasi Tanggal
          </h4>
          
          <div className="grid-2">
            {renderCalendarInput('TGL_MASUK', 'Tanggal Masuk')}
            {renderCalendarInput('EXPIRED', 'Tanggal Expired')}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button 
            type="button" 
            label="Batal" 
            severity="secondary" 
            onClick={closeDialog}
          />
          <Button 
            type="button"
            label="Simpan" 
            severity="success" 
            icon="pi pi-save" 
            loading={isLoading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="stock-container">
      <Toast ref={toast} />
      {renderHeader()}
      <div className="stock-content">
        {renderFilterSection()}
        {renderDataTable()}
      </div>
      {renderDialogForm()}
    </div>
  );
};

export default StockContent;