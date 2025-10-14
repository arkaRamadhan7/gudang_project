import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";

const formatDateForMySQL = (dateString) => {
  if (!dateString) return null;
  
  // Jika sudah format YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Jika format ISO dengan timezone, convert ke YYYY-MM-DD
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  
  return dateString;
};

/**
 * ✅ Helper function untuk format datetime ke MySQL format
 */
const formatDateTimeForMySQL = (datetimeString) => {
  if (!datetimeString) return null;
  
  // Jika sudah format MySQL DATETIME, return as is
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetimeString)) {
    return datetimeString;
  }
  
  // Jika format ISO, convert ke MySQL DATETIME
  if (datetimeString.includes('T')) {
    const date = new Date(datetimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  return datetimeString;
};

/**
 * ✅ Helper function untuk sanitize data sebelum kirim ke database
 */
const sanitizeKartuStockData = (data) => {
  const sanitized = { ...data };
  
  // Format TGL field
  if (sanitized.TGL) {
    sanitized.TGL = formatDateForMySQL(sanitized.TGL);
  }
  
  // Format DATETIME field
  if (sanitized.DATETIME) {
    sanitized.DATETIME = formatDateTimeForMySQL(sanitized.DATETIME);
  }
  
  return sanitized;
};

/**
 * Ambil semua data kartu stok
 */
export const fetchAllKartuStock = async (req, res) => {
  try {
    const data = await db("kartustock").select([
      "id",
      "STATUS",
      "FAKTUR",
      "TGL",
      "GUDANG",
      "KODE",
      "QTY",
      "DEBET",
      "KREDIT",
      "HARGA",
      "DISCITEM",
      "DISCFAKTUR1",
      "DISCFAKTUR2",
      "HP",
      "KETERANGAN",
      "DATETIME",
      "USERNAME",
      "URUT",
      "SATUAN",
      "PPN"
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Data kartu stok kosong",
        datetime: datetime(),
        data: []
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Berhasil ambil data kartu stok",
      datetime: datetime(),
      data
    });
  } catch (error) {
    console.error("❌ Error fetch kartu stok:", error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: "Terjadi kesalahan server",
      datetime: datetime(),
      error: error.message
    });
  }
};

/**
 * ✅ FIXED: Tambah data kartu stok baru dengan sanitization
 */
export const addKartuStock = async (req, res) => {
  try {
    const body = req.body;
    
    // ✅ Sanitize data sebelum insert
    const sanitizedData = sanitizeKartuStockData(body);
    
    console.log('📝 Data yang akan di-insert:', sanitizedData); // Debug log
    
    await db("kartustock").insert(sanitizedData);

    return res.status(201).json({
      status: status.SUKSES,
      message: "Data kartu stok berhasil ditambahkan",
      datetime: datetime()
    });
  } catch (error) {
    console.error("❌ Error tambah kartu stok:", error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: "Gagal menambahkan data kartu stok",
      datetime: datetime(),
      error: error.message
    });
  }
}; 

/**
 * ✅ FIXED: Edit data kartu stok dengan sanitization
 */
export const editKartuStock = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // ✅ Sanitize data sebelum update
    const sanitizedData = sanitizeKartuStockData(body);
    
    console.log('📝 Data yang akan di-update:', sanitizedData); // Debug log

    const updated = await db("kartustock").where({ id }).update(sanitizedData);

    if (!updated) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data kartu stok tidak ditemukan",
        datetime: datetime()
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data kartu stok berhasil diperbarui",
      datetime: datetime()
    });
  } catch (error) {
    console.error("❌ Error edit kartu stok:", error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: "Gagal memperbarui data kartu stok",
      datetime: datetime(),
      error: error.message
    });
  }
};

/**
 * Hapus data kartu stok berdasarkan ID
 */
export const deleteKartuStock = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db("kartustock").where({ id }).del();

    if (!deleted) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data kartu stok tidak ditemukan",
        datetime: datetime()
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data kartu stok berhasil dihapus",
      datetime: datetime()
    });
  } catch (error) {
    console.error("❌ Error hapus kartu stok:", error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: "Gagal menghapus data kartu stok",
      datetime: datetime(),
      error: error.message
    });
  }
};