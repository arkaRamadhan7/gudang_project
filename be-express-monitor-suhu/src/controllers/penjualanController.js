import { json } from "sequelize";
import { db } from "../core/config/knex.js";
import { status, datetime } from "../utils/general.js"
import { AArrowUpIcon, Columns3Cog } from "lucide-react";

export const getStockByKodeToko = async (req, res) => {
    try {
        const {kode_toko} = req.params;
        
        const data = await db("stock")
        .where({ kode_toko })
        .select(
            'ID',
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


export const transaction = async (req, res) => {
    try {
        const { items, username} = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: "40", 
                message: "Items tidak boleh kosong"
            });
        }   
        let faktur;
        await db.transaction(async (trx) => {
            for (const item of items) {
                
                const id = item.id
                const  stock = await trx('stock').where({ id }).first();
                const qtyStock = Number(stock.QTY);
                faktur = `PJ`+ datetime() + String(id).padStart(6, '0')
                if (item.qty > qtyStock) {
                    throw new Error("Stock tidak Cukup")
                }

                const updateStock = qtyStock - item.qty;

                await trx("kartustock").insert({
                    status: "0",
                    faktur: faktur, 
                    gudang: item.gudang, 
                    kode: item.kode,     
                    qty: item.qty,       
                    harga: item.harga,   
                    kredit: item.qty,    
                    hp: item.harga,      
                    username: username, 
                    satuan: item.satuan, 
                    keterangan: "Penjualan " + item.nama 
                });
                await trx('stock').where({ id }).update({ QTY: updateStock })
            }
        });

        return res.status(200).json({
            status: "00",
            message: "Transaksi Berhasil Disimpan",
            faktur: faktur,
        
        });
    
    } catch (error) {
        console.error("Error pada transaksi:", error);
        return res.status(500).json({
            status: status.BAD_REQUEST, 
            message: "Terjadi Kesalahan Pada Sisi Server"
        });
    };
};