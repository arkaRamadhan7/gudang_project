import {
    addGudang,
    editGudang,
    getGudangByID,
    removeGudang,
} from '../models/gudangModel.js';

import { updateGudangSchema, addGudangSchema } from '../schemas/masterGudangSchema.js';
import { datetime, status } from "../utils/general.js";
import { db } from "../core/config/knex.js";



export const fetchAllGudang = async (req, res) => {
  try {
    const gudang = await db("nama_gudang").select("id", "nama","alamat","KODE","KETERANGAN");

    if (!gudang || gudang.length === 0) {
      return res.status(404).json({
        status: "01",
        message: "Data gudang kosong",
        gudang: [],
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Berhasil ambil data gudang",
      gudang,
    });
  } catch (error) {
    return res.status(500).json({
      status: "99",
      message: "Server error",
      error: error.message,
    });
  }
};


export const createGudang = async (req, res) => {
    try {
        const validation = addGudangSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                status: status.BAD_REQUEST,
                message: 'Validasi gagal',
                datetime: datetime(),
                errors: validation.error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const { KODE, nama, alamat, KETERANGAN } = validation.data;

        const cekNama = await db('nama_gudang').where({ nama }).first();
        if (cekNama) {
            return res.status(400).json({
                status: status.BAD_REQUEST,
                message: 'Nama gudang sudah digunakan',
                datetime: datetime(),
            });
        }

        const gudang = await addGudang({ KODE, nama, alamat,KETERANGAN });

        return res.status(201).json({
            status: status.SUKSES,
            message: 'Gudang berhasil ditambahkan',
            datetime: datetime(),
            gudang,
        });
    } catch (error) {
        return res.status(500).json({
            status: status.GAGAL,
            message: `Gagal menambahkan gudang: ${error.message}`,
            datetime: datetime(),
        });   
    }
};

export const updateGudang = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = updateGudangSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                status: status.BAD_REQUEST,
                message: 'Validasi gagal',
                datetime: datetime(),
                errors: validation.error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const existing = await getGudangByID(id);
        if (!existing) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Gudang tidak ditemukan',
                datetime: datetime(),
            });
        }

        const { KODE, nama, alamat, KETERANGAN } = validation.data;

        const namaDuplikat = await db('nama_gudang').where({ nama }).andWhereNot({ id }).first();
        if (namaDuplikat) {
            return res.status(400).json({
                status: status.BAD_REQUEST,
                message: 'Nama gudang sudah digunakan oleh gudang lain',
                datetime: datetime(),
            });
        }

        await editGudang({ id,KODE, nama, alamat, KETERANGAN });
        const updated = await getGudangByID(id);

        return res.status(200).json({
            status: status.SUKSES,
            message: 'Gudang berhasil diperbarui',
            datetime: datetime(),
            gudang: updated,
        });
    } catch (error) {
        return res.status(500).json({
            status: status.GAGAL,
            message: `Gagal update gudang: ${error.message}`,
            datetime: datetime(),
        });
    }
};

export const destroyGudang = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await getGudangByID(id);
        if (!existing) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Data gudang tidak ditemukan',
                datetime: datetime(),
            });
        }

        await removeGudang(id);

        return res.status(200).json({
            status: status.SUKSES,
            message: 'Gudang berhasil dihapus secara permanen',
            datetime: datetime(),
        });
    } catch (error) {
        return res.status(500).json({
            status: status.GAGAL,
            message: `Gagal menghapus gudang: ${error.message}`,
            datetime: datetime(),
        });
    }
};

export const fetchGudangByJenis = async (req, res) => {
  const { jenis } = req.params;
  try {
    const data = await db('nama_gudang')
      .count('* as jumlah')
      .where('jenis', jenis)
      .first();

    return res.json({
      status: status.SUKSES,
      message: `Jumlah gudang jenis ${jenis} berhasil diambil`,
      datetime: datetime(),
      jumlah: data.jumlah,
    });
  } catch (err) {
    console.error('Error getGudangByJenis:', err);
    return res.status(500).json({
      status: status.GAGAL,
      message: 'Terjadi kesalahan saat mengambil jumlah gudang',
      datetime: datetime(),
    });
  }
};

export const fetchDetailGudangByJenis = async (req, res) => {
    const { keterangan } = req.params;

    try {
        const data = await db('nama_gudang')
            .where('keterangan', keterangan)
            .select('*'); 

        return res.json({
            status: '00',
            message: `Detail gudang untuk gudang ${keterangan} berhasil diambil`,
            datetime: datetime(),
            gudang: data
        });
    } catch (err) {
        console.error(' Error saat ambil detail gudang:', err);
        return res.status(500).json({
            status: '99',
            message: 'Gagal mengambil detail gudang berdasarkan ketrangan jenis',
            datetime: datetime(),
        });
    }
};

export const fetchNamaGudangOnly = async (req, res) => {
  try {
    const data = await db('nama_gudang').select('nama');

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: '01',
        message: 'Tidak ada nama gudang ditemukan',
        namaGudang: [],
      });
    }


    return res.status(200).json({
      status: '00',
      message: 'Berhasil ambil nama-nama gudang',
      namaGudang: data,
    });
  } catch (error) {
    console.error('Gagal ambil nama gudang:', error);
    return res.status(500).json({
      status: '99',
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

export const getTotalColumnsGudang = async (req, res) => {
  try {
    const data = await db('nama_gudang').count('* as total').first();

    res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil menghitung jumlah baris gudang',
      datetime: datetime(),
      total: data.total
    });
  } catch (err) {
    res.status(500).json({
      status: status.ERROR,
      message: 'Gagal menghitung jumlah baris gudang',
      datetime: datetime(),
      error: err.message
    });
  }
};
