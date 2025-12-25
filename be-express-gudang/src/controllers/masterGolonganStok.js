import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";
import { addJenisGudangSchema,updateJenisGudangSchema } from "../schemas/golonganstockScema.js";

export const fetchAlljenisgudang = async (req,res) => {
    try {
        const data = await db('golonganstock').select('KODE','KETERANGAN');
        
        if (!data || data.length === 0) {
            return res.status(404).json ({
                status : status.GAGAL,
                message : 'Data jenis kosong',
                datetime:datetime(),
                data:[],
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message : 'Berhasil ambil data jenis gudang',
            datetime : datetime(),
            data,
        });
    } catch (error) {
        console.error('Error ambil jenis gudang :',error.message);
        return res.status(500).json({
            status:status.ERROR,
            message : 'Terjadi kesalahan server',
            datetime : datetime(),
            error:error.message,
        });
    }
};

export const fetchAllKeteranganGolongan = async (req, res) => {
  try {
    const data = await db('golonganstock').distinct('KETERANGAN');

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: status.GAGAL,
        message: 'Data keterangan kosong',
        datetime: datetime(),
        data: [],
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil ambil data keterangan golongan stock',
      datetime: datetime(),
      data,
    });
  } catch (error) {
    console.error('Error ambil keterangan golongan:', error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: 'Terjadi kesalahan server',
      datetime: datetime(),
      error: error.message,
    });
  }
};

export const createJenisGudang = async (req, res) => {
  try {
    const validation = addJenisGudangSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: 'Validasi gagal',
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { KODE, KETERANGAN } = validation.data;

    const existing = await db('golonganstock').where({ KODE }).first();
    if (existing) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: 'Kode jenis gudang sudah digunakan',
        datetime: datetime(),
      });
    }

    await db('golonganstock').insert({ KODE, KETERANGAN });

    return res.status(201).json({
      status: status.SUKSES,
      message: 'Jenis gudang berhasil ditambahkan',
      datetime: datetime(),
      data: { KODE, KETERANGAN },
    });
  } catch (error) {
    console.error('Error tambah jenis gudang:', error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Gagal menambahkan jenis gudang: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const editJenisGudang = async (req, res) => {
  try {
    const { kode } = req.params;
    const { KETERANGAN } = req.body;

    if (!kode || !KETERANGAN) {
      return res.status(400).json({
        status: '99',
        message: 'Data tidak lengkap',
        datetime: datetime(),
      });
    }

    await db('golonganstock')
      .where('KODE', kode)
      .update({ KETERANGAN });

    res.status(200).json({
      status: '00',
      message: 'Data berhasil diupdate',
      datetime: datetime(),
    });
  } catch (error) {
    console.error('Error update jenis gudang:', error.message);
    res.status(500).json({
      status: '99',
      message: 'Gagal mengupdate jenis gudang',
      datetime: datetime(),
    });
  }
};

export const deleteJenisGudang = async (req, res) => {
  try {
    const { kode } = req.params;

    if (!kode) {
      return res.status(400).json({
        status: '99',
        message: 'Kode tidak ditemukan di parameter',
        datetime: datetime(),
      });
    }

    await db('golonganstock').where('KODE', kode).del();

    res.status(200).json({
      status: '00',
      message: 'Data berhasil dihapus',
      datetime: datetime(),
    });
  } catch (error) {
    console.error('Error hapus jenis gudang:', error.message);
    res.status(500).json({
      status: '99',
      message: 'Gagal menghapus jenis gudang',
      datetime: datetime(),
    });
  }
};
