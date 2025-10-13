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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          id: item.id,
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
      const [rakData, satuanData, golonganData, tokoData, gudangData  ] = await Promise.all([
        fetchDropdownData('rak'),
        fetchDropdownData('satuan'),
        fetchDropdownData('golonganstock'),
        fetchDropdownData('toko'),
        fetchGudang(),
        fetchStock()
      ]);

      setOptions({
        rak: rakData,
        satuan: satuanData,
        golongan: golonganData,
        gudang: gudangData,
        toko: tokoData
      });
    };

    loadInitialData();
  }, [fetchDropdownData, fetchStock]);

  const filteredStocks = useMemo(() => {
    let filtered = stock;

    if (filters.rak) {
      filtered = filtered.filter(item => item.RAK === filters.rak);
    }

    if (filters.satuan) {
      filtered = filtered.filter(item => item.SATUAN === filters.satuan);
    }
    if (filters.gudang) {
      filtered =filtered.filter(item => item.GUDANG === filters.gudang)
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

  const resetFormAndCloseDialog = () => {
  setForm(initialFormState);  
  setDialogMode(null);         
  setSelectedStock(null);      
};

    
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!form.KODE.trim()) {
      toastRef.current?.showToast('99','Kode wajib di isi');
      setIsSubmitting(false);
      return;
    }
    try {
      let res,json;
      if (dialogMode === 'add') {
        res = await fetch ('/api/stock', {
          method : 'POST',
          headers: { 'Content-Type' : 'application/json'},
          body : JSON.stringify(form),  
        });
      }else if (dialogMode === 'edit' && selectedStock ) {
        res = await fetch(`/api/stock/${selectedStock.id}`, {
          method : 'PUT',
          headers : { 'Content-Type' : 'application/json'},
          body : JSON.stringify(form),
        });
      } else {
        toastRef.current?.showToast('99' , 'Mode dialog tidak valid');
        setIsSubmitting(false);
        return;
      }
      json = await res.json();

      if (!res.ok) {
        toastRef.current?.showToast(json.status ?? '99' , json.message || 'Gagal menimpan data');
        setIsSubmitting(false);
        return;
      }
      toastRef.current?.showToast(json.status, json.message);
      resetFormAndCloseDialog();
      await fetchStock();
    } catch (error) {
      toastRef.current?.showToast('99','Gagal/error dalam meyimpan data')
      console.error('Sumbit error : ', error);
    }
    setIsSubmitting(false);
  };


  const handleEdit = useCallback((row) => {
    setDialogMode('edit');
    setSelectedStock(row);
    
    const formData = { ...row };
    if (formData.TGL_MASUK) {
      formData.TGL_MASUK = parseDateFromDB(formData.TGL_MASUK);
    }
    if (formData.EXPIRED) {
      formData.EXPIRED = parseDateFromDB(formData.EXPIRED);
    }
    setForm(formData);
  }, []);

  const handleDelete = useCallback(async (data) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    console.log("Stock ID:", data?.ID);
    if (!data?.id) {
      toastRef.current?.showToast('99', 'ID NOT FOUND')
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock/${data.id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.status === '00') {
        toastRef.current?.showToast(json.status, json.message);
        await fetchStock();
      } else {
        toastRef.current?.showToast(json.status || '99', json.message || 'Gagal menghapus data');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toastRef.current?.showToast('error', err.message || 'Terjadi kesalahan saat menghapus data');
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
      <form
       onSubmit={(e) => {
            e.preventDefault(); 
            handleSubmit();
          }}
        >
        {/* Fix Gudang dropdown */}
        <div className="mb-3">
          <label htmlFor="GUDANG">Gudang</label>
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
        

        {['KODE', 'NAMA', 'JENIS'].map((field) => (
          <div key={field} className="mb-3">
            <label htmlFor={field}>{field.replace(/_/g, ' ')}</label>
            <InputText
              id={field}
              name={field}
              value={form[field] || ''}
              onChange={handleFormChange}
              className="w-full mt-2"
            />
          </div>
        ))}

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
        
        {/* RAK */}
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
          <label className="block text-sm font-medium mb-1">BARCODE</label>
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
            showClear/>
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