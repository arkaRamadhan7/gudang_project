import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";


export const fetchAllMutasi = async (req, res ) => {
    try {
        const data = await db('mutasigudang_ke').select([
            'NAMA',
            'FAKTUR',
            'TGL',
            'GUDANG_KIRIM',
            'GUDANG_TERIMA',
            'KODE',
            'QTY',
            'BARCODE',
            'SATUAN',
            'USERNAME',
            'DATETIME',
            'STATUS'
        ]);
        
        if (!data || data.length === 0) {
            return res.status(404).json ({
                status : status.GAGAL,
                message : 'Data Mutasi Kosong',
                datetime:datetime(),
                data :[],
            });
        }

        return res.status(200).json ({
            status : status.SUKSES,
            message : 'Berhasil Ambil Data Mutasi',
            datetime: datetime(),
            data: data,
        });

    } catch (error) {
        console.error('Error ambil data Mutasi:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'terjadi kesalahan pada server',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const addMutasi = async (req, res) => {
    try{
        const {
            NAMA,
            FAKTUR,
            TGL,
            GUDANG_KIRIM,
            GUDANG_TERIMA,
            KODE,
            QTY,
            BARCODE,
            SATUAN,
            USERNAME,
            DATETIME,
            STATUS
        } = req.body

        await db ('mutasigudang_ke').insert({
            NAMA,
            FAKTUR,
            TGL,
            GUDANG_KIRIM,
            GUDANG_TERIMA,
            KODE,
            QTY,
            BARCODE,
            SATUAN,
            USERNAME,
            DATETIME,
            STATUS
        });
        
        return res.status(201).json({
            status: status.SUKSES,
            message: 'Data berhasil Ditambahkan',
            datetime: datetime(),
        });

    } catch (error) {
        console.error('Error Tambah Data:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'GAGAL menambahkan Data',
            datetime: datetime(),
            error: error.message,
        });
    }
};