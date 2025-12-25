import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";
import ExcelJS from "exceljs";

export const fetchAllStock = async (req, res) => {
    try {
        const data = await db('stock').select([
            'id',
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
            'BARCODE'
        ]);

       if (!data || data.length === 0) {
            return res.status(404).json ({
                status : status.GAGAL,
                message : 'Data stock kosong',
                datetime:datetime(),
                data:[],
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message : 'Berhasil ambil data stock',
            datetime : datetime(),
            data,
        });
    } catch (error) {
        console.error('Error ambil data stock:',error.message);
        return res.status(500).json({
            status:status.ERROR,
            message : 'Terjadi kesalahan server',
            datetime : datetime(),
            error:error.message,
        });
    }
};

export const addStock = async (req, res) => {
    try {
        const {
            GUDANG,
            KODE,
            KODE_TOKO,
            NAMA,
            JENIS,
            GOLONGAN,
            RAK,
            DOS,
            SATUAN,
            ISI,
            DISCOUNT,
            HB,
            HJ,
            EXPIRED,
            TGL_MASUK,
            BERAT,
            QTY,
            BARCODE
        } = req.body;

        await db('stock').insert({
            GUDANG, 
            KODE,
            KODE_TOKO,
            NAMA,
            JENIS,
            GOLONGAN,
            RAK,
            DOS,
            SATUAN,
            ISI,
            DISCOUNT,
            HB,
            HJ,
            EXPIRED,
            TGL_MASUK,
            BERAT, 
            QTY,
            BARCODE
        });

        return res.status(201).json({
            status: status.SUKSES,
            message: 'Data stock berhasil ditambahkan',
            datetime: datetime(),
        });
    } catch (error) {
        console.error('Error tambah stock:', error.message);
        return res.status(500).json({
            status: status.ERROR,
            message: 'gagal menambahkan data stock',
            datetime: datetime(),
            error: error.message,
        });
    }
};

export const previewStockExcel = async (req, res) => {
  try {
    const data = await db("stock").select(
      "KODE",
      "NAMA",
      "GUDANG",
      "BARCODE",
      "QTY",
      "SATUAN" 
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "preview stock berhasil diambil",
      datetime: datetime(),
      data
    });
  } catch (error) {
    console.error("error preview stock: ",error.message);
    return res.status(500).json({
      status: status.ERROR,
      message: "gagal preview stock",
      datetime: datetime(),
      error: error.message
    });
  }
}
export const editStock = async (req, res) => {
  try {
    const { id } = req.params; 
    const {
      GUDANG, KODE, KODE_TOKO, NAMA, JENIS, GOLONGAN,
      RAK, DOS, SATUAN, ISI, DISCOUNT, HB, HJ, BERAT, QTY
    } = req.body;

    await db('stock')
      .where({ id }) 
      .update({
        GUDANG, KODE, KODE_TOKO, NAMA, JENIS, GOLONGAN,
        RAK, DOS, SATUAN, ISI, DISCOUNT, HB, HJ,BERAT, QTY
      });

    return res.json({
      status: status.SUKSES,
      message: 'Data stock berhasil diperbarui',
      datetime: datetime()
    });
  } catch (error) {
    console.error('Error editStock:', error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: 'Gagal mengedit data stock',
      error: error.message,
      datetime: datetime()
    });
  }
};

export const deleteStock = async (req, res) => {
  const { id } = req.params;

  try {

    const deleted = await db('stock').where({ id }).del();

    if (deleted) {
      return res.json({
        status: status.SUKSES,
        message: 'Stock berhasil dihapus',
        datetime: datetime(),
      });
    } else {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: 'Stock tidak ditemukan',
        datetime: datetime(),
      });
    }

  } catch (error) {
    console.error('Gagal hapus stock:', error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: 'Gagal menghapus stock',
      datetime: datetime(),
      error: error.message,
    });
  }
};
export const fetchStockBySatuan = async (req, res) => {
  console.log('Masuk fetchStockBySatuan:', req.params);

  try {
    const { satuan } = req.params;
    if (!satuan) {
      return res.status(400).json({ status: '99', message: 'Satuan kosong' });
    }

    const result = await db('stock').where({ satuan });

    return res.status(200).json({ status: '00', data: result });
  } catch (error) {
    console.error('Error fetchStockBySatuan:', error);
    return res.status(500).json({ status: '99', message: 'Gagal mengambil data' });
  }
};


export const getStockByGudang = async (req, res) => {
  const { gudang } = req.params;

  try {
    const data = await db('stock')
      .select('*')
      .where('gudang', gudang);

    return res.json({
      status: status.SUKSES,
      message: `Produk dari gudang '${gudang}' berhasil diambil`,
      datetime: datetime(),
      produk: data,
    });
  } catch (err) {
    console.error('Error getProdukByGudang:', err);
    return res.status(500).json({
      status: status.GAGAL,
      message: 'Gagal mengambil produk berdasarkan gudang',
      datetime: datetime(),
    });
  }
};

export const getTotalColumnsStock = async (req, res) => {
  try {
    const data = await db('stock').count('* as total').first();

    res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil menghitung jumlah baris stock',
      datetime: datetime(),
      total: data.total
    });
  } catch (err) {
    res.status(500).json({
      status: status.ERROR,
      message: 'Gagal menghitung jumlah baris stock',
      datetime: datetime(),
      error: err.message
    });
  }
};

export const exportDataToExcel = async (req, res) => {
  try {
    const data = await db("stock").select(
      "KODE",
      "NAMA",
      "GUDANG",
      "BARCODE",
      "QTY",
      "SATUAN",
 )
 const workbook = new ExcelJS.Workbook();
 const worksheet = workbook.addWorksheet("Sisa Stock");

 worksheet.columns = [
  {header: "Kode",key: "KODE", width: 20},
  {header: "Barcode",key: "BARCODE", width: 20},
  {header: "Nama",key: "NAMA", width: 20},
  {header: "Gudang",key: "GUDANG", width: 20},
  {header: "Satuan",key: "SATUAN", width: 20},
 ];
 data.forEach((row) => {
  worksheet.addRow(row);
 });
 worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" }, 
      };
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

 res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 );
 res.setHeader(
  "Content-Disposition",
  "attachment; filename=laporan_stock.xlsx"
 );
 await workbook.xlsx.write(res);
 res.end();
  }catch (error) {
    console.error(error)
    res.status(500).send("Gagal Export Data")
  }
};


