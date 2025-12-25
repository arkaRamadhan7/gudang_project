import { db } from '../core/config/knex.js';

/**
 * Ambil semua data gudang
 */
export const GetAllGudang = async () => db('nama_gudang').select('*');

/**
 * Ambil nama gudang berdasarkan ID
 * @param {number} id
 */
export const getGudangByID = async (id) =>
  db('nama_gudang').where({ id }).first();

/**
 * Tambah gudang baru
 * @param {{
 *  KODE: string,
 *  nama: string,
 *  alamat: string,
 *  KETERANGAN: string
 * }} data
 */
export const addGudang = async ({ KODE, nama, alamat, KETERANGAN }) => {
  const [id] = await db("nama_gudang").insert({ KODE, nama, alamat, KETERANGAN });
  return db("nama_gudang").where({ id }).first();
};

export const editGudang = async ({ id, KODE, nama, alamat, KETERANGAN }) => {
  await db("nama_gudang")
    .where({ id })
    .update({ KODE, nama, alamat, KETERANGAN });
  return db("nama_gudang").where({ id }).first();
};


/**
 * Hapus permanen
 * @param {number} id
 */
export const removeGudang = async (id) =>
  db('nama_gudang').where({ id }).del();

/**
 * Ambil semua nama gudang berdasarkan jenis
 * @param {string} jenis
 */

