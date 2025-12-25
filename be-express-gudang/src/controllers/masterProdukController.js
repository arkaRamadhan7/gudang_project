import {
  addProduk,
  editProduk,
  getAllProduk,
  getProdukById,
  removeProduk,
} from "../models/masterProdukModel.js";

import {
  addProdukSchema,
  updateProdukSchema
} from "../schemas/masterProdukScema.js";

import { datetime, status } from "../utils/general.js";
import { db } from "../core/config/knex.js";




export const fetchAllProduk = async (req, res) => {
  try {
    const produk = await getAllProduk();

    if (produk.length === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data produk kosong",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data produk berhasil didapatkan",
      datetime: datetime(),
      produk,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};



// Ambil produk berdasarkan ID
export const fetchProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await getProdukById(id);

    if (!produk) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data produk tidak ditemukan",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data produk berhasil didapatkan",
      datetime: datetime(),
      produk,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};


export const createProduk = async (req, res) => {
  try {
    const validation = addProdukSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { kode, nomor, nama, stock, harga, kategori, satuan, gudang } = validation.data;

    const produk = await addProduk({ kode, nomor, nama, stock, harga, kategori, satuan, gudang });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data produk berhasil dibuat",
      datetime: datetime(),
      produk,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};


export const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateProdukSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const existing = await getProdukById(id);
    if (!existing) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Produk tidak ditemukan",
        datetime: datetime(),
      });
    }

    const { kode, nomor, nama, stock, harga, kategori, satuan, gudang } = validation.data;

    // Ambil data produk lain dengan kode yang sama
const produkWithSameKode = await db("master_produk")
  .where({ kode })
  .first();

// Jika ada dan ID-nya berbeda dari yang sedang diedit, maka duplikat
if (produkWithSameKode && Number(produkWithSameKode.id) !== Number(id)) {
  return res.status(400).json({
    status: status.BAD_REQUEST,
    message: "Kode produk sudah digunakan oleh produk lain",
    datetime: datetime(),
  });
}


    await editProduk({ id, kode, nomor, nama, stock, harga, kategori, satuan, gudang });

    const updated = await getProdukById(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data produk berhasil diperbarui",
      datetime: datetime(),
      produk: updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const destroyProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db("master_produk").where({ id }).first();
    if (!existing) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data tidak ditemukan",
        datetime: datetime(),
      });
    }

    await db("master_produk").where({ id }).del();

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data produk berhasil dihapus secara permanen",
      datetime: datetime(),
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const getProdukByGudang = async (req, res) => {
  const { gudang } = req.params;

  try {
    const data = await db('master_produk')
      .select('*')
      .where('gudang', gudang);

    return res.json({
      status: status.SUKSES,
      message: `Produk dari gudang '${gudang}' berhasil diambil`,
      datetime: datetime(),
      produk: data,
    });
  } catch (err) {
    console.error('Error getProdukByGudang:', err);
    return res.status(500).json({
      status: status.GAGAL,
      message: 'Gagal mengambil produk berdasarkan gudang',
      datetime: datetime(),
    });
  }
};
