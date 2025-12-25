import { db } from "../core/config/knex.js";

/**
 * Get all produk
 **/
export const getAllProduk = async () => db("master_produk").select("*");

/**
 * Get produk by ID
 **/
export const getProdukById = async (id) =>
  db("master_produk").where({ id }).first();

/**
 * Create new produk
 **/
export const addProduk = async ({kode,nomor,nama,stock,harga,kategori,satuan,gudang}) => {
  const [id] = await db("master_produk").insert ({
    kode,
    nomor,
    nama,
    stock,
    harga,
    kategori,
    satuan,
    gudang,
  });
  return db ("master_produk").where({id}).first();
};

/**
 * Update existing produk
 **/
export const editProduk = async ({
  id,
  kode,
  nomor,
  nama,
  stock,
  harga,
  kategori,
  satuan,
  gudang
}) => { await db("master_produk").where({id}).update({kode,nomor,nama,stock,harga,kategori,satuan,gudang});
return db ("master_produk").where({id}).first();
};
/**
 * Delete existing produk
 **/
export const removeProduk = async (id) => {
  return db ("master_produk").where({id}).del()
}



