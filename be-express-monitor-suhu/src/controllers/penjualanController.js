import { json } from "sequelize";
import { db } from "../core/config/knex.js";
import { status } from "../utils/general.js"

export const getStockByKodeToko = async (req, res) => {
    try {
        const {kode_toko} = req.params;
        
        const data = await db("stock")
        .where({ kode_toko })
        .select(
            'GUDANG',
            'KODE',
            'KODE_TOKO',
            'NAMA',
            'JENIS',
            'GOLONGAN',
            'RAK',
            'DOS',
            'SATUAN',
            'ISI',
            'DISCOUNT',
            'HB',
            'HJ',
            'EXPIRED',
            'TGL_MASUK',
            'BERAT',
            'QTY',
            'BARCODE')

        if (!data || data.length == 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: "data kosong",
                data: []
            });
        };
        return res.status(200).json({
            status: status.SUKSES,
            message: "Berhasil Ambil Data",
            data,
        });
        } catch (error) {
            console.error("gagal ambil data ", error.message);
            return res.status(500).json({
                status: status.BAD_REQUEST,
                message: "Terjadi Kesalahan Pada Sisi Server",
                error: error.message

            })
        }

}

export const addTransaction = async (req, res) => {
    try {
        const {
            KODE,
            KODE_TOKO,
            FAKTUR,
            TGL,
            GUDANG,
            NAMA,
            HARGA,
            QTY,
            KREDIT,
            USERNAME,
        } = req.body;

        await db("transaksi_toko").insert({
            KODE,
            KODE_TOKO,
            FAKTUR,
            TGL,
            GUDANG,
            NAMA,
            HARGA,
            QTY,
            KREDIT: QTY,
            USERNAME,
        });
        return res.status(200).json({
            status: status.SUKSES,
            message: "Berhasil Tambahkan data transaksi",
        });
    } catch (error) {
        console.error("ERROR Tambahkan Transaksi", error.message);
        return res.status(500).json({
            status: status.BAD_REQUEST,
            message: "Gagal Tambahkan Data Transaksi",
            error: error.message
        })
    }
}
