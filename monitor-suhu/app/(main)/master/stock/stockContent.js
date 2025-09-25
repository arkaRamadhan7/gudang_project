'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { format, parseISO } from 'date-fns';
import ToastNotifier from '@/app/components/ToastNotifier';

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
  const toastRef = useRef(null);
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
        toastRef.current?.showToast(json.status, json.message || `Gagal memuat data ${endpoint}`);
        return [];
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      toastRef.current?.showToast('99', `Gagal memuat data ${endpoint}`);
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
      const res = await fetch("/api/gudang/nama");
      const json = await res.json();

      if (json.status === "00") {
        return json.namaGudang.map(nama => ({
          label: nama,
          value: nama,
        }));
      }
      return [];
    } catch (error) {
      console.error("Form Gagal ambil nama gudang", error);
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
          id: item.id || item.ID, // Pastikan ada id
          TGL_MASUK: parseDateFromDB(item.TGL_MASUK),
          EXPIRED: parseDateFromDB(item.EXPIRED)
        }));
        setStock(processedData);
      } else {
        toastRef.current?.showToast(json.status, json.message);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
      toastRef.current?.showToast('99', 'Gagal memuat data stock');
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
      
      // Panggil fetchStock setelah options dimuat
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

  // PERBAIKAN UTAMA: Validasi form dan penanganan submit yang lebih baik
  const validateForm = () => {
    const requiredFields = ['GUDANG', 'KODE', 'NAMA', 'BARCODE'];
    const emptyFields = requiredFields.filter(field => !form[field] || form[field].trim() === '');
    
    if (emptyFields.length > 0) {
      toastRef.current?.showToast('99', `Field wajib tidak boleh kosong: ${emptyFields.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const url = dialogMode === 'add' ? '/api/stock' : `/api/stock/${selectedStock?.id || selectedStock?.ID}`;
      
      // Debug log untuk memastikan data yang dikirim
      console.log('Submitting form:', {
        method,
        url,
        data: form
      });
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const json = await res.json();
      
      // Debug log response
      console.log('Server response:', {
        status: res.status,
        ok: res.ok,
        data: json
      });

      if (res.ok && json.status === '00') {
        toastRef.current?.showToast('00', json.message || 'Data berhasil disimpan');
        await fetchStock();
        closeDialog();
      } else {
        toastRef.current?.showToast(json.status || '99', json.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toastRef.current?.showToast('99', err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  }, [dialogMode, form, selectedStock, fetchStock, validateForm]);

  const handleEdit = useCallback((row) => {
    console.log('Edit row data:', row);
    setDialogMode('edit');
    setSelectedStock(row);
    
    // Mapping semua field dari row ke form
    const formData = {};
    Object.keys(initialFormState).forEach(key => {
      formData[key] = row[key] || '';
    });
    
    // Khusus untuk tanggal
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
      toastRef.current?.showToast('99', 'ID tidak ditemukan');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock/${stockId}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status === '00') {
        toastRef.current?.showToast('00', json.message || 'Data berhasil dihapus');
        await fetchStock();
      } else {
        toastRef.current?.showToast(json.status || '99', json.message || 'Gagal menghapus data');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toastRef.current?.showToast('99', err.message || 'Terjadi kesalahan saat menghapus data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStock]);

  const openAddDialog = useCallback(() => {
    setDialogMode('add');
    setForm(initialFormState);
    setSelectedStock(null);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogMode(null);
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
      <div className="mb-3">
        <label htmlFor={name}>{label}</label>
        <Calendar
          id={name}
          name={name}
          value={dateValue}
          onChange={(e) => handleCalendarChange(name, e.value)}
          dateFormat="yy-mm-dd"
          showIcon
          className="w-full mt-2"
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
    >
      <form onSubmit={handleSubmit}>
        {/* Gudang dropdown */}
        <div className="mb-3">
          <label htmlFor="GUDANG">Gudang *</label>
          <Dropdown
            id="GUDANG"
            name="GUDANG"
            value={form.GUDANG}
            options={options.gudang}
            onChange={(e) => handleDropdownChange('GUDANG', e.value)}
            placeholder="Pilih Gudang"
            className="w-full mt-2"
            optionLabel="label"
            optionValue="value"
            showClear
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="KODE_TOKO">KODE TOKO</label>
          <Dropdown
            id="KODE_TOKO"
            name="KODE_TOKO"
            value={form.KODE_TOKO}
            options={options.toko}
            onChange={(e) => handleDropdownChange('KODE_TOKO', e.value)}
            placeholder="Pilih Kode"
            className="w-full mt-2"
            optionLabel="label"
            optionValue="value"
            showClear
          />
        </div>

        {/* Required fields dengan asterisk */}
        <div className="mb-3">
          <label htmlFor="KODE">KODE *</label>
          <InputText
            id="KODE"
            name="KODE"
            value={form.KODE || ''}
            onChange={handleFormChange}
            className="w-full mt-2"
            placeholder="Masukkan kode"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="NAMA">NAMA *</label>
          <InputText
            id="NAMA"
            name="NAMA"
            value={form.NAMA || ''}
            onChange={handleFormChange}
            className="w-full mt-2"
            placeholder="Masukkan nama"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="JENIS">JENIS</label>
          <InputText
            id="JENIS"
            name="JENIS"
            value={form.JENIS || ''}
            onChange={handleFormChange}
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
            className="w-full mt-2"
            placeholder="Pilih Golongan"
            optionLabel="label"
            optionValue="value"
            showClear
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="RAK">RAK</label>
          <Dropdown
            id="RAK"
            name="RAK"
            value={form.RAK}
            options={options.rak}
            onChange={(e) => handleDropdownChange('RAK', e.value)}
            className="w-full mt-2"
            placeholder="Pilih RAK"
            optionLabel="label"
            optionValue="value"
            showClear
          />
        </div>

        <div className="mb-3">
          <label htmlFor="DOS">DOS</label>
          <InputText
            id="DOS"
            name="DOS"
            value={form.DOS || ''}
            onChange={handleFormChange}
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
            className="w-full mt-2"
            placeholder="Pilih Satuan"
            optionLabel="label"
            optionValue="value"
            showClear
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">BARCODE *</label>
          <InputText
            id="BARCODE"
            name="BARCODE"
            value={form.BARCODE || ''}
            onChange={handleFormChange}
            readOnly={dialogMode === 'edit'}
            placeholder="Masukkan Barcode"
            className="w-full mt-2"
          />
        </div>

        {['ISI', 'DISCOUNT', 'HB', 'HJ', 'BERAT', 'QTY'].map((field) => (
          <div key={field} className="mb-3">
            <label htmlFor={field}>{field.replace(/_/g, ' ')}</label>
            <InputText
              id={field}
              name={field}
              value={form[field] || ''}
              onChange={handleFormChange}
              className="w-full mt-2"
              type={['HB', 'HJ', 'QTY', 'BERAT'].includes(field) ? 'number' : 'text'}
            />
          </div>
        ))}

        {renderCalendarInput('TGL_MASUK', 'Tanggal Masuk')}
        {renderCalendarInput('EXPIRED', 'Tanggal Expired')}

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            label="Batal" 
            severity="secondary" 
            onClick={closeDialog}
          />
          <Button 
            type="submit" 
            label="Simpan" 
            severity="primary" 
            icon="pi pi-save" 
            loading={isLoading}
          />
        </div>
      </form>
    </Dialog>
  );

  return (
    <div className="card">
      <h3 className="text-xl font-semibold">Master Stock</h3>

      <div className="mb-4 flex gap-2">
        <Button
          label="Tambah Stock"
          icon="pi pi-plus"
          onClick={openAddDialog}
        />
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          severity="secondary"
          onClick={clearFilters}
        />
      </div>
      
      <div className="mb-4 p-3 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Filter RAK</label>
            <Dropdown
              value={filters.rak}
              options={options.rak}
              onChange={(e) => handleFilterChange('rak', e.value)}
              className="w-full"
              placeholder="Pilih RAK "
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter Satuan</label>
            <Dropdown
              value={filters.satuan}
              options={options.satuan}
              onChange={(e) => handleFilterChange('satuan', e.value)}
              className="w-full"
              placeholder="Pilih Satuan"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Filter Gudang</label>
            <Dropdown
              value={filters.gudang}
              options={options.gudang}
              onChange={(e) => handleFilterChange('gudang', e.value)}
              className='w-full'
              placeholder='Pilih Gudang'
              optionLabel='label'
              optionValue='value'
              showClear
            />
          </div>
        </div>
      </div>
      
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
              body={key === 'TGL_MASUK' || key === 'EXPIRED' ? 
                (rowData) => renderDateColumn(rowData, key) : undefined
              }
            />
          ))}
          
        <Column
          header="Aksi"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="warning"
                onClick={() => handleEdit(row)}
                tooltip="Edit"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                onClick={() => handleDelete(row)}
                tooltip="Hapus"
              />
            </div>
          )}
        />
      </DataTable>

      {renderDialogForm()}
      <ToastNotifier ref={toastRef} />
    </div>
  );
};

export default StockContent;