import { db } from "../core/config/knex.js";
import { datetime, status } from '../utils/general.js';

 

export const fetchAllRak = async (req, res) => {
    try {
        const data = await db('rak').select(['KODE','KETERANGAN']);

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'Data rak kosong',
                datetime: datetime(),
                data: [],
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message: 'berhasil ambil data rak',
            datetime: datetime(),
            data,
        });
    } catch (error) {
        console.error('gagal ambil rak:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal menggambil data rak',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const addRak = async (req, res) => {
    try {
        const {KODE, NAMA, KETERANGAN} = req.body;

        await db ('rak').insert({ KODE, NAMA, KETERANGAN});

        return res.status(201).json({
            status: status.SUKSES,
            message: 'rak berhasil ditambakan',
            datetime: datetime(),
        });
    } catch (error) {
        console.error('gagal tambah rak:', error.message);
        return res.status(500).json({
            status: status.GAGAL,
            message: 'gagal menambahkan rak',
            datetime: datetime(),
            error: error.message
        });
    }
};

export const editRak = async (req, res) => {
    const { KODE } = req.params;
    const { NAMA }  = req.body;
    const { KETERANGAN } = req.body;

    try {
        const updated = await db('rak').where({ KODE }).update({ NAMA, KETERANGAN});

        if (updated) {
            return res.json({
                status: status.SUKSES,
                message: 'rak berhasil diupdate',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'rak tidak ditemukan',
                datetime: datetime(),
            });
        }
    } catch (error) {
        console.error('gagal edit rak: ', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal mengedit rak',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const deleteRak = async (req, res) => {
    const { KODE } = req.params;

    try {
        const deleted = await db('rak').where({ KODE }).del();

        if (deleted) {
            return res.json({
                status: status.SUKSES,
                message: 'rak berhasil dihapus',
                datetime: datetime(),
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: 'rak tidak di temukan',
                datetime:  datetime(),
            });
        }
    } catch (error) {
        console.error('gagal hapus rak:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal menghapus rak',
            datetime: datetime(),
            error: error.message,
        });
    }
};