import { db } from "../core/config/knex.js";
import { datetime, status } from '../utils/general.js';


export const fetchAllSatuan = async (req, res) => {
    try {
        const data = await db('satuanstock').select(['KODE', 'KETERANGAN']);

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Data satuan kosong',
                datetime: datetime(),
                data: [],
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message: 'berhasil ambil data satuan',
            datetime: datetime(),
            data,
        });
    } catch (error) {
        console.error('gagal ambil satuan:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal menggambil data satuan',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const addSatuan = async (req, res) => {
    try {
        const {KODE, KETERANGAN} = req.body;

        await db ('satuanstock').insert({ KODE, KETERANGAN});

        return res.status(201).json({
            status: status.SUKSES,
            message: 'satuan berhasil ditambakan',
            datetime: datetime(),
        });
    } catch (error) {
        console.error('gagal tambah satuan:', error.message);
        return res.status(500).json({
            status: status.GAGAL,
            message: 'gagal menambahkan satuan',
            datetime: datetime(),
            error: error.message
        });
    }
};

export const editSatuan = async (req, res) => {
    const { KODE } = req.params;
    const { KETERANGAN } = req.body;

    try {
        const updated = await db('satuanstock').where({ KODE }).update({ KETERANGAN });

        if (updated) {
            return res.json({
                status: status.SUKSES,
                message: 'satuan berhasil diupdate',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'satuan tidak ditemukan',
                datetime: datetime(),
            });
        }
    } catch (error) {
        console.error('gagal edit satuan: ', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal mengedit satuan',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const deleteSatuan = async (req, res) => {
    const { KODE } = req.params;

    try {
        const deleted = await db('satuanstock').where({ KODE }).del();

        if (deleted) {
            return res.json({
                status: status.SUKSES,
                message: 'satuan berhasil dihapus',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'satuan tidak di temukan',
                datetime:  datetime(),
            });
        }
    } catch (error) {
        console.error('gagal hapus satuan:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal menghapus satuan',
            datetime: datetime(),
            error: error.message,
        });
    }
};