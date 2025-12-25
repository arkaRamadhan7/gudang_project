import { db } from '../core/config/knex.js';

// Ambil semua rak
export const getAllSatuan = () => {
  return db('satuanstock').select(['KODE', 'KETERANGAN']);
};

// Tambah rak baru
export const insertSatuan = (data) => {
  return db('satuanstock').insert(data);
};

// Update rak berdasarkan KODE
export const updateSatuanByKode = (KODE, data) => {
  return db('satuanstock').where({ KODE }).update(data);
};
// Hapus rak berdasarkan KODE
export const deleteSatuanByKode = (KODE) => {
  return db('satuanstock').where({ KODE }).del();
};
