import {db} from "../core/config/knex.js";
import { datetime, status} from '../utils/general.js';

export const getAllJenisRole = async (req, res) => {
  try {
    const roles = await db("jenis_role").select("*");
    res.status(200).json({
      status: status.success,
      message: "Data jenis role berhasil diambil",
      data: roles,
      datetime: datetime()
    });
  } catch (error) {
    res.status(500).json({
      status: status.error,
      message: "Gagal mengambil data jenis role",
      error: error.message,
      datetime: datetime()
    });
  }
};


export const createJenisRole = async (req, res) => {
    try {
        const {kode, role} = req.body;

        await db ('jenis_role').insert({ kode, role});

        return res.status(201).json({
            status: status.SUKSES,
            message: 'jenis role berhasil ditambakan',
            datetime: datetime(),
        });
    } catch (error) {
        console.error('gagal tambah jenis role:', error.message);
        return res.status(500).json({
            status: status.GAGAL,
            message: 'gagal menambahkan jenis role',
            datetime: datetime(),
            error: error.message
        });
    }
};

//update
export const updateJenisRole = async (req, res) => {
    const { id } = req.params;
    const { kode, role } = req.body;

    try {
        const updated = await db("jenis_role").where({ id }).update({ kode, role });

        if (!updated) {
            return res.status(404).json({
                status: status.error,
                message: "Jenis role tidak ditemukan",
                datetime: datetime()
            });
        }

        res.status(200).json({
            status: status.success,
            message: "Jenis role berhasil diperbarui",
            datetime: datetime()
        });
    } catch (error) {
        res.status(500).json({
            status: status.error,
            message: "Gagal memperbarui jenis role",
            error: error.message,
            datetime: datetime()
        });
    }
};

export const deleteJenisRole = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db("jenis_role").where({ id }).del();

        if (!deleted) {
            return res.status(404).json({
                status: status.error,
                message: "Jenis role tidak ditemukan",
                datetime: datetime()
            });
        }

        res.status(200).json({
            status: status.success,
            message: "Jenis role berhasil dihapus",
            datetime: datetime()
        });
    } catch (error) {
        res.status(500).json({
            status: status.error,
            message: "Gagal menghapus jenis role",
            error: error.message,
            datetime: datetime()
        });
    }
};
