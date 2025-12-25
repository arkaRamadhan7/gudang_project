import { db } from '../core/config/knex.js';

// Ambil semua rak
export const getAllRak = () => {
  return db('rak').select(['KODE', 'KETERANGAN']);
};

// Tambah rak baru
export const insertRak = (data) => {
  return db('rak').insert(data);
};

// Update rak berdasarkan KODE
export const updateRakByKode = (KODE, data) => {
  return db('rak').where({ KODE }).update(data);
};
// Hapus rak berdasarkan KODE
export const deleteRakByKode = (KODE) => {
  return db('rak').where({ KODE }).del();
};
