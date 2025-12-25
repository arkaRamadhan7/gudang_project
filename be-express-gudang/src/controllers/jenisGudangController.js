import { db } from "../core/config/knex.js";
import { datetime, status } from '../utils/general.js';

// Ambil semua jenis gudang
export const fetchAllJenisGudang = async (req, res) => {
    try {
        const data = await db('jenis-gudang').select(['id', 'KODE', 'KETERANGAN']);
        if (!data || data.length === 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Data jenis gudang kosong',
                datetime: datetime(),
                data: [],
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message: 'Berhasil ambil data jenis gudang',
            datetime: datetime(),
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: status.ERROR,
            message: 'Gagal mengambil data jenis gudang',
            datetime: datetime(),
            error: error.message,
        });
    }
};

// Tambah jenis gudang
export const addJenisGudang = async (req, res) => {
    try {
        const { KODE, KETERANGAN } = req.body;

        await db('jenis-gudang').insert({ KODE, KETERANGAN });

        return res.status(201).json({
            status: status.SUKSES,
            message: 'Jenis gudang berhasil ditambahkan',
            datetime: datetime(),
        });
    } catch (error) {
        return res.status(500).json({
            status: status.GAGAL,
            message: 'Gagal menambahkan jenis gudang',
            datetime: datetime(),
            error: error.message
        });
    }
};

// Edit jenis gudang (berdasarkan id)
export const editJenisGudang = async (req, res) => {
    const { id } = req.params;
    const { KODE, KETERANGAN } = req.body;

    try {
        const updated = await db('jenis-gudang').where({ id }).update({ KODE, KETERANGAN });

        if (updated) {
            return res.json({
                status: status.SUKSES,
                message: 'Jenis gudang berhasil diupdate',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Jenis gudang tidak ditemukan',
                datetime: datetime(),
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: status.ERROR,
            message: 'Gagal mengedit jenis gudang',
            datetime: datetime(),
            error: error.message,
        });
    }
};

// Hapus jenis gudang (berdasarkan id)
export const deleteJenisGudang = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db('jenis-gudang').where({ id }).del();

        if (deleted) {
            return res.json({
                status: status.SUKSES,
                message: 'Jenis gudang berhasil dihapus',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Jenis gudang tidak ditemukan',
                datetime: datetime(),
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: status.ERROR,
            message: 'Gagal menghapus jenis gudang',
            datetime: datetime(),
            error: error.message,
        });
    }
};

// Hitung jumlah gudang per jenis
export const getJumlahGudangPerJenis = async (req, res) => {
    try {
        const data = await db('gudang')
            .select('jenis_gudang')
            .count('id as jumlah')
            .groupBy('jenis_gudang');

        res.json({
            status: status.SUKSES,
            message: 'Berhasil mengambil jumlah gudang per jenis',
            datetime: datetime(),
            data
        });
    } catch (err) {
        res.status(500).json({
            status: status.GAGAL,
            message: err.message,
            datetime: datetime(),
        });
    }
};
