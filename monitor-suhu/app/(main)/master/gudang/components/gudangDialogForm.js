'use client';

import { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * Dropdown yang memuat data jenis gudang dari API.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 *   disabled?: boolean
 * }} props
 */
export default function JenisGudangDropdown({ value, onChange, placeholder = 'Pilih Jenis Gudang', disabled = false }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJenisGudang = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/jenis-gudang');
        const json = await res.json();
        if (json.data?.status === '00') {
          const mapped = json.data.jenis.map((j) => ({
            label: j.nama,
            value: j.nama, 
          }));
          setOptions(mapped);
        }
      } catch (err) {
        console.error('Gagal fetch jenis gudang:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJenisGudang();
  }, []);

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={(e) => onChange(e.value)}
      placeholder={placeholder}
      loading={loading}
      className="form-dropdown"
      disabled={disabled}
      style={{
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid #3d566e'
      }}
      panelStyle={{
        backgroundColor: '#1e293b',
        border: '1px solid #3d566e'
      }}
    />
  );
}