import { db } from "../core/config/knex.js";
import { datetime, status} from '../utils/general.js';

export const GetDataPenjualan = async (req, res) => {
    try {
        const {kode_toko}= req.params;
        const data = await db("kartustock_toko").where({TOKO: kode_toko}).select("*")
        return res.status(200).json({
         status: status.SUKSES,
            message: 'Berhasil Ambil Data Laporan',
            data: data
        });
    } catch (error) {
        console.error("Error Terjadi Kesalahan pada Server",error)
        return res.status(500).json({
            status : status.GAGAL,
            message: "Terjadi Kesalahan pada Server",
            error: error.message
        });
    }
};

export const Getallpenjualan = async (req,res) => {
    try {
        const data = await db("kartustock_toko").select("*");
         return res.status(200).json({
         status: status.SUKSES,
            message: 'Berhasil Ambil Data Laporan',
            data: data
        });
    } catch (error) {
        console.error("Error Terjadi Kesalahan pada Server",error)
        return res.status(500).json({
            status : status.GAGAL,
            message: "Terjadi Kesalahan pad Server",
            error: error.message
        });
    }
}
