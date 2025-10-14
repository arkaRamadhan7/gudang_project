import { db } from "../core/config/knex.js";

export const GetDataPenjualan = async (req, res) => {
    try {
        const {kode_toko}= req.params;
        const data = await db("kartustock_toko").where({TOKO: kode_toko}).select("*")
        return res.status(200).json({
        data,
        })
    } catch (error) {
        console.error("Error Terjadi Kesalahan pada Server",error)
        return res.status(500).json({
            status: "99",
            message: "Terjadi Kesalahan pad Server",
            error: error.message
        })
    }
}