import { db } from "../core/config/knex.js"
import { status } from "../utils/general.js"

export const fetchAllToko = async (req, res) => {
    try {
        const data = await db('toko').select('*')
        
        if (!data || data.length == 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: "Data Kosong",
                data: []
            });
        };
        return res.status(200).json({
            status: status.SUKSES,
            message: "Berhasil ambil Data",
            data,
        })
    } catch (error) {
        console.error('gagal ambil data toko', error.message)
        return res.status(500).json({
            status: status.BAD_REQUEST,
            message: 'terjadi kesalahan pada sisi Server',
            error: error.message
        });
    }
}

export const addToko = async (req, res) => {
    try {
        const {KODE, NAMA, KETERANGAN, GUDANG, ALAMAT} = req.body;
        await db("toko").insert({
            KODE,
            NAMA,
            KETERANGAN,
            GUDANG,
            ALAMAT
        });

        return res.status(200).json({
            status: status.SUKSES,
            message: 'Berhasil Tambah data Toko',
        });
    } catch (error) {
        console.error("ERROR Tambah Stock", error.message)
        return res.status(500).json({
            status: status.BAD_REQUEST,
            message: "Terjadi Kesalahan Pada Sisi Server",
            error: error.message
        })
    }
}

export const editToko = async (req, res) => {
    try {
        const { id } = req.params;
        const {KODE, NAMA, KETERANGAN, GUDANG, ALAMAT} = req.body;

        await db("toko").where({ id }).update({
            KODE,
            NAMA,
            KETERANGAN,
            GUDANG,
            ALAMAT
        });
        return res.status(200).json({
            status: status.SUKSES,
            message: "berhasil Update Toko"
        });
        
    } catch (error) {
        console.error("ERROR EditToko", error.message)
        return res.status(500).json({
            status: status.BAD_REQUEST,
            message: "Gagal Edit Toko",
            error: error.message
        })
    }
}

export const deleteToko= async (req, res) => {
const { id } = req.params;
    try {
    
        const deleted = await db("toko").where({ id }).del();
        if (deleted) {
            return res.status(200).json({
                status: status.SUKSES,
                message: "Berhasil Hapus Toko"
            });
        } else {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: "Toko tidak ditemukann",
            })
        }
    } catch (error) {
        console.error("ERROR Delete", error.message);
        return res.status(500).json({
            status: status.BAD_REQUEST,
            message: "Terjadi Kesalahaan pada Server"
        })
    }
}


