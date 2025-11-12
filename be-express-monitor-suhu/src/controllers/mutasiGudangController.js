import {db} from "../core/config/knex.js";
import { format } from "date-fns";
import { parse } from "dotenv";
import ExcelJS from "exceljs";
import { datetime, status } from "../utils/general.js";
import { errors } from "jose";

export const createmutasi = async(req,res) => {
    try {
        const{nama,kode,faktur,tgl,gudang_kirim,gudang_terima,qty,dos,isi,barcode,satuan,username} = req.body;
          console.log(dos)
          console.log(isi)
          console.log(qty)
        if (!dos || dos <= 0) {
            console.error(error.massage)
            return res.status(400).json({
                status: '99',
                message: 'DOS harus lebih dari 0'
            });
        }
        
        if (!isi || isi <= 0) {
            return res.status(400).json({
                status: '99',
                message: 'ISI harus lebih dari 0'
            });
        }

        // Verifikasi perhitungan QTY = DOS × ISI
        const calculatedQty = dos * isi;
        if (qty !== calculatedQty) {
            return res.status(400).json({
                status: '99',
                message: `QTY tidak sesuai. Seharusnya ${calculatedQty} (DOS: ${dos} × ISI: ${isi})`
            });
        }

        const validasiStockObj = await db("stock").where({ barcode }).select("QTY").first();
        const validasiStock = validasiStockObj.QTY;
        const isValid = qty > validasiStock;

        const sisaStock = Math.max(validasiStock - qty, 0);

        if (isValid) {
            return res.status(400).json({
                status: '99',
                message: `Stock tidak mencukupi. Stock tersedia: ${validasiStock}, diminta: ${qty}`
            });
        }

        await db.transaction(async (trx) => { 
            await trx("mutasigudang_ke").insert({
                nama,
                kode,
                faktur,
                tgl,
                gudang_kirim,
                gudang_terima,
                dos,
                isi,
                qty,
                barcode,
                satuan,
                username,
                status: "pending"
            });

            await trx("mutasigudang").insert({
                posting: "keluar",
                faktur,
                kode,
                nama,
                tgl,
                dari: gudang_kirim,
                ke: gudang_terima,
                barcode,
                dos,
                isi,
                qty,
                username
            });

            await trx("stock")
                .where({ barcode })
                .update({ qty: sisaStock });
        });

        res.json({
            status: "00",
            message: "Mutasi berhasil dibuat",
            data: {
                faktur,
                dos,
                isi,
                qty: calculatedQty
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "99",
            message: "Error create mutasi",
            error: error.message
        });
    }
};

export const receivemutasi = async (req, res) => {
    try {
        const { faktur } = req.params;
        const { nama, kode, faktur_kirim, gudang_kirim, gudang_terima, barcode, qty, dos, isi, satuan, username } = req.body;
        const tgl = format(new Date(), "yyyy-MM-dd HH:mm");
        const gudang = gudang_kirim

        const cekDos = await db("stock").where({kode, gudang }).first()
        const DOS = cekDos.DOS - dos

        
        const lastStock = await db('stock').select('KODE').orderBy('KODE', 'desc').first();
        const lastBarcode = await db('stock').select('BARCODE').orderBy('BARCODE', 'desc').first();
        let NewBarcode;
        if (lastBarcode && lastBarcode.BARCODE) {
            NewBarcode = String(parseInt(lastBarcode.BARCODE, 10) + 1).padStart(5, '0');
        } else {
            NewBarcode = "00001";
        }
        let newKode;
        if (lastStock && lastStock.KODE) {
            newKode = String(parseInt(lastStock.KODE, 10) + 1).padStart(10, '0');
        } else {
            newKode = "0000000001";
        }
        
        await db.transaction(async (trx) => {
            
            await trx("mutasigudang_dari").insert({
                faktur, nama, kode: newKode, faktur_kirim, tgl, gudang_kirim, gudang_terima,
                barcode: NewBarcode, dos, isi, qty, satuan, username,
            });
            await trx("mutasigudang").insert({
                posting: "masuk", nama, kode: newKode, faktur, tgl, dari: gudang_kirim, ke: gudang_terima,
                barcode: NewBarcode, dos, isi, qty, username,
            });

            await trx("mutasigudang_ke").where({ faktur }).update({ status: "received", qty, dos, isi });
            await trx("mutasigudang").where({ faktur, posting: "keluar" }).update({ qty, dos, isi });

            await trx("stock").where({kode, gudang}).update({ DOS })
            await trx("stock").insert({
                GUDANG: gudang_terima,
                NAMA: nama,
                QTY: qty,
                KODE: newKode,
                TGL_MASUK: tgl,
                SATUAN: satuan,
                BARCODE: NewBarcode,
                ISI: isi,
                DOS: dos
            });

            console.log("Berhasil Insert Stock Penerima");
        });

        res.json({
            status: "00",
            message: "Mutasi berhasil diterima",
            faktur,
            data: { dos, isi, qty }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "99",
            message: error.message || "Error menerima mutasi"
        });
    }
};

export const getAllmutasi = async (req, res) => {
    try {
        const data = await db("mutasigudang").select("*").orderBy("tgl", "desc");
        res.json({ status: "00", data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "99", 
            message: "Error fetch mutasi",
            error: error.message
        });
    }
};

export const getPendingMutasi = async (req, res) => {
    try {
        const data = await db("mutasigudang_ke")
            .where({ status: "pending" })
            .select(
                "faktur",
                "nama",
                "kode",
                "tgl",
                "gudang_kirim",
                "gudang_terima",
                "dos",
                "isi",
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
        res.status(500).json({ 
            status: "99", 
            message: "Error getPendingMutasi", 
            error: error.message 
        });
    }
};

export const getMutasiByFaktur = async (req, res) => {
    try {
        const { faktur } = req.params;

        const data = await db("mutasigudang_ke")
            .where({ faktur })
            .first();

        if (!data) {
            return res.status(404).json({ 
                status: "99", 
                message: "Mutasi tidak ditemukan" 
            });
        }

        res.json({ status: "00", data });
    } catch (error) {
        console.error("Error getMutasiByFaktur:", error);
        res.status(500).json({ 
            status: "99", 
            message: "Error fetch mutasi by faktur",
            error: error.message
        });
    }
};

export const getAllFaktur = async (req, res) => {
    try {
        const fakturList = await db("mutasigudang")
            .select("FAKTUR", "TGL")
            .orderBy("TGL", "desc");

        res.status(200).json({
            status: "00",
            message: "Data faktur berhasil diambil",
            data: fakturList,
        });
    } catch (error) {
        res.status(500).json({
            status: "99",
            message: "Error mengambil data faktur",
            error: error.message,
        });
    }
};

export const exportDataToExcel = async (req, res) => {
    try {
        const data = await db("mutasigudang").select(
            "POSTING",
            "FAKTUR",
            "NAMA",
            "KODE",
            "BARCODE",
            "DOS",
            "ISI",
            "QTY",
            "KE",
            "DARI",
            "TGL",
            "USERNAME"
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Mutasi Gudang");

        worksheet.columns = [
            { header: "Posting", key: "POSTING", width: 15 },
            { header: "Faktur", key: "FAKTUR", width: 20 },
            { header: "Nama", key: "NAMA", width: 30 },
            { header: "Kode", key: "KODE", width: 15 },
            { header: "Barcode", key: "BARCODE", width: 15 },
            { header: "DOS", key: "DOS", width: 10 },
            { header: "ISI", key: "ISI", width: 10 },
            { header: "QTY", key: "QTY", width: 10 },
            { header: "Ke Gudang", key: "KE", width: 20 },
            { header: "Dari Gudang", key: "DARI", width: 20 },
            { header: "Tanggal", key: "TGL", width: 20 },
            { header: "User", key: "USERNAME", width: 15 },
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "99",
            message: "Gagal Export Data",
            error: error.message
        });
    }
};

export const getTotalColumnsMutasi = async (req, res) => {
    try {
        const data = await db('mutasigudang')
            .where({ POSTING: "masuk" })
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

// Fungsi tambahan untuk mendapatkan detail mutasi dengan DOS & ISI
export const getMutasiDetail = async (req, res) => {
    try {
        const { faktur } = req.params;

        const data = await db("mutasigudang")
            .where({ faktur })
            .select(
                "POSTING",
                "FAKTUR",
                "NAMA",
                "KODE",
                "BARCODE",
                "DOS",
                "ISI",
                "QTY",
                "DARI",
                "KE",
                "TGL",
                "USERNAME"
            );

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: "99",
                message: "Data mutasi tidak ditemukan"
            });
        }

        res.json({
            status: "00",
            message: "Data mutasi berhasil diambil",
            data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "99",
            message: "Error fetch mutasi detail",
            error: error.message
        });
    }
};