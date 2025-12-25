import { db } from "../core/config/knex.js"
import { status } from "../utils/general.js"

export const fetchSisaStock= async (req,res) => {
    try {
        const data = await db("stock").select([
            'KODE',
            'NAMA',
            'GUDANG',
            'BARCODE',
            'QTY',
            'SATUAN'
        ])
        if (!data || data.length == 0) {
            return res.status({status: 404}).json({
                status: status.GAGAL,
                message: 'data kosong',
                data: []

            })     
           }
        return res.status(200).json({
            status: status.SUKSES,
            message: 'Berhasil Ambil Data Laporan',
            data: data
        })
    } catch (error) {
        console.error("ERROR ambil data Laporan", error);
        return res.status(500).json({
            status: status.ERROR,
            message: 'terjadi kesalahan pada server',
            error: error.message,
        })
    }
}

export const fetchMutasiGudang = async (req,res) => {
    try {
        const data = await db("mutasigudang").select([
            "POSTING",
            "FAKTUR",
            "DARI",
            "KE",
            "BARCODE",
            "QTY"
        ])
    
    if (!data || data.length == 0) {
        return res.status(404).json({
            status: status.GAGAL,
            message: "Data Mutasi Kosong",
            data: []

        })
    }
        return res.status(200).json({
            status: status.SUKSES,
            message: "berhasil ambil data Mutasi",
            data: data,
        })
    } catch (error) {
        console.error("ERROR Get data Laporan", error.message)
        return res.status(500).json({
            status: status.ERROR,
            message: "terjadi kesalahan pada sisi server",
            error: error.message
            
        });
    }
};


export const fetchReqstockGudang = async (req,res) => {
    try {
        const data = await db("request_stock").select("*");
    
    if (!data || data.length == 0) {
        return res.status(404).json({
            status: status.GAGAL,
            message: "Data Request stock Kosong",
            data: []

        })
    }
        return res.status(200).json({
            status: status.SUKSES,
            message: "berhasil ambil data request stock",
            data: data,
        })
    } catch (error) {
        console.error("ERROR Get data Laporan", error.message)
        return res.status(500).json({
            status: status.ERROR,
            message: "terjadi kesalahan pada sisi server",
            error: error.message
            
        });
    }
};

export const fetchdiskontoko = async (req,res) => {
    try {
        const data = await db("discounts").select("*");
         if (!data || data.length == 0) {
        return res.status(404).json({
            status: status.GAGAL,
            message: "sedang tidak ada Diskon",
            data: []

        })
    }
        return res.status(200).json({
            status: status.SUKSES,
            message: "berhasil ambil data diskon",
            data: data,
        })
    } catch (error) {
        console.error("ERROR Get data Diskon", error.message)
        return res.status(500).json({
            status: status.ERROR,
            message: "terjadi kesalahan pada sisi server",
            error: error.message
            
        });
    }
};

export const fetchallstocktoko  = async (req,res) => {
  try {
        const data = await db("stock_toko").select("*");
        if (!data || data.length == 0) {
        return res.status(404).json({
            status: status.GAGAL,
            message: "Stock toko kosong",
            data: []

        });
    }   
     return res.status(200).json({
            status: status.SUKSES,
            message: "berhasil ambil data Stock Toko",
            data: data,
        });
    }catch (error) {
        console.error("ERROR Get data Laporan stock toko", error.message)
        return res.status(500).json({
            status: status.ERROR,
            message: "terjadi kesalahan pada sisi server",
            error: error.message
            
        });
    }
};