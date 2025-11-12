import {db} from "../core/config/knex.js";
import { format } from "date-fns";
import { parse } from "dotenv";
import ExcelJS from "exceljs";
import { datetime, status } from "../utils/general.js";

export const createmutasi = async(req,res) => {
    try {
        const{nama,kode,faktur,tgl,gudang_kirim,gudang_terima,qty,barcode,satuan,username} = req.body;
        const validasiStockObj = await db("stock").where({  barcode }).select("QTY").first();
        const validasiStock = validasiStockObj.QTY
        const isValid = qty > validasiStock 

      const sisaStock = Math.max(validasiStock - qty,0)

        if (isValid) {
          return res.status(400).json({
            status: '99',
            message: 'stock tidak mencukupi'
          })
        }
        await db.transaction(async (trx) => { 
          await trx("mutasigudang_ke").insert({
            nama,
            kode,
            faktur,
            tgl,
            gudang_kirim,
            gudang_terima,
            qty,
            barcode,
            satuan,
            username,
            status : "pending"
        })

        await trx("mutasigudang").insert ({
            posting : "keluar",
            faktur,
            kode,
            nama,
            tgl,
            dari : gudang_kirim,
            ke : gudang_terima,
            barcode,
            qty,
            username
        });

        await trx("stock")
        .where({ barcode })
        .update({ qty: sisaStock})
         
      })
        res.json({status : "00",message : "Mutasi berhasil dibuat"});
    } catch (error) {
        console.error(error);
        res.status(500).json({status : "99",message : "Error create mutasi"});
    }
};



export const receivemutasi = async (req, res) => {
    try {
        const { faktur } = req.params;
        const { nama, kode, faktur_kirim, gudang_kirim, gudang_terima, barcode, qty, satuan, username } = req.body;
        const tgl = format(new Date(), "yyyy-MM-dd HH:mm");

        const mutasiKeObj = await db("mutasigudang_ke")
            .where({ faktur })
            .select("QTY")
            .first();
        const mutasiKe = Number(mutasiKeObj.QTY)
        if (typeof qty !== 'number' || qty <= 0) {
            return res.status(400).json({ status: "99", message: "Qty harus berupa angka lebih dari 0" });
        }
        const isValid =  qty > mutasiKe
        if (isValid) {
          return res.status(400).json({
            status: '99',
            message: 'jumlah yang anda terima melebihi jumlah yang dikirim'
          })
        }
        const validasiStock = await db("stock").where({  barcode }).select("QTY").first();
        const sisaStock = Number(validasiStock.QTY)
        const updateSisaStock = Math.max(mutasiKe - qty, 0)
        const updateStock = Math.max(sisaStock + updateSisaStock,0)
        console.log(updateStock) 

        const lastStock = await db('stock')
        .select('KODE')
        .orderBy('KODE','desc')
        .first()

        const lastBarcode = await db('stock')
        .select('BARCODE')
        .orderBy('BARCODE', 'desc')
        .first()

        let NewBarcode;
        if (lastBarcode && lastBarcode.BARCODE) {
          const lastNumber = parseInt(lastBarcode.BARCODE, 10)
          NewBarcode = String(lastNumber + 1).padStart(5, 0)
        } else {
          NewBarcode = "00001"
        }

        let newKode;
        if (lastStock && lastStock.KODE) {
          const lastNumber = parseInt(lastStock.KODE, 10);
          newKode = String(lastNumber + 1).padStart(10, 0)
        } else {
          newKode = "0000000001";
        }

        
        await db.transaction(async (trx) => {
            await trx("mutasigudang_dari").insert({
                faktur,
                nama,
                kode: newKode,
                faktur_kirim,
                tgl,
                gudang_kirim,
                gudang_terima,
                barcode: NewBarcode,
                qty,
                satuan,
                username,
            });

            await trx("mutasigudang").insert({
                posting: "masuk",
                nama,
                kode: newKode,
                faktur,
                tgl,
                dari: gudang_kirim,
                ke: gudang_terima,
                barcode: NewBarcode,
                qty,
                username, 
            });

            await trx("mutasigudang_ke")
                .where({ faktur })
                .update({ status: "received", qty });

            await trx("mutasigudang")
                .where({ faktur, posting: "keluar" })
                .update({ qty });

            await trx("stock")
              .where({ barcode })
              .update ({ qty:updateStock})

               await trx("stock").insert({
                GUDANG: gudang_terima,
                NAMA: nama,
                QTY: qty,
                KODE: newKode,
                TGL_MASUK: tgl,
                SATUAN: satuan,
                BARCODE: NewBarcode,
              })
              console.log("Berhasil Insert")
        });
         

        res.json({ status: "00", message: "Mutasi berhasil diterima", faktur });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "99", message: "Error menerima mutasi" });
    }
};

export const getAllmutasi = async (req,res) => {
    try {
        const data = await db ("mutasigudang").select("*").orderBy("tgl" , "desc");
        res.json({ status : "00" , data});
    } catch (error) {
        console.error(error);
        res.status(500).json({status : "99" , message : "Error fetch muatasi"});
    }
};
export const getPendingMutasi = async (req, res) => {
  try {
    const data = await db("mutasigudang_ke")
      .where({ status: "pending" })
      .select(
        "faktur",
        "nama",
        "tgl",
        "gudang_kirim",
        "gudang_terima",
        "qty",
        "barcode",
        "satuan",
        "username",
        "status"
      )
      .orderBy("tgl", "desc");

    res.json({ status: "00", data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "99", message: "Error getPendingMutasi", error: error.message });
  }
};
export const getMutasiByFaktur = async (req, res) => {
  try {
    const { faktur } = req.params;

    const data = await db("mutasigudang_ke") 
      .where({ faktur })
      .first();

    if (!data) {
      return res.status(404).json({ status: "99", message: "Mutasi tidak ditemukan" });
    }

    res.json({ status: "00", data });
  } catch (error) {
    console.error("Error getMutasiByFaktur:", error);
    res.status(500).json({ status: "99", message: "Error fetch mutasi by faktur" });
  }
};

export const getAllFaktur = async (req, res) => {
    try {
        const fakturList = await db("mutasigudang")
        .select("FAKTUR","TGL")
        .orderBy("TGL","desc");

        res.status(200).json({
            status: "00",
            message: "data fakktur berhasil diambil",
            data: fakturList,
        });
    } catch (error) {
        res.status(500).json({
            status: "99",
            message: "data faktur berhasil diambil",
            data: fakturList,
        });
    } 
};

export const exportDataToExcel = async (req, res) => {
  try {
    const data = await db("mutasigudang").select(
      "POSTING",
      "FAKTUR",
      "NAMA",
      "BARCODE",
      "KE",
      "DARI",
      "TGL",
      "QTY"
 )
 const workbook = new ExcelJS.Workbook();
 const worksheet = workbook.addWorksheet("Mutasi Gudang");

 worksheet.columns = [
  {header: "Posting",key: "POSTING", width: 20},
  {header: "Faktur",key: "FAKTUR", width: 20},
  {header: "Nama",key: "NAMA", width: 20},
  {header: "Barcode",key: "BARCODE", width: 20},
  {header: "Ke Gudang",key: "KE", width: 20},
  {header: "Dari Gudang",key: "DARI", width: 20},
  {header: "Tanggal",key: "TGL", width: 20},
  {header: "QTY",key: "QTY", width: 20},
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
  "attachment; filename=mutasi_gudang.xlsx"
 );
 await workbook.xlsx.write(res);
 res.end();
  }catch (error) {
    console.error(error)
    res.status(500).send("Gagal Export Data")
  }
};

export const getTotalColumnsMutasi = async (req, res) => {
  try {
    const data = await db('mutasigudang')
    .where({ POSTING : "masuk"})
    .count('* as total')
    .first();

    res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil menghitung jumlah baris mutasi antar gudang',
      datetime: datetime(),
      total: data.total
    });
  } catch (err) {
    res.status(500).json({
      status: status.ERROR,
      message: 'Gagal menghitung jumlah baris mutasi antar gudang',
      datetime: datetime(),
      error: err.message
    });
  }
};

export const data = async (req, res) => {
  try {

  } catch (error) {
    
  }
}