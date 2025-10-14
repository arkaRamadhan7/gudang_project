import { json, NUMBER, or, where } from "sequelize";
import { db } from "../core/config/knex.js";
import { status, datetime, timestap } from "../utils/general.js"
import { format } from "date-fns";
import { date } from "zod";

export const getStockForHargaDiskon = async (req, res) => {
    try {
        const {kode_toko} = req.params;

        const data = await db("stock_toko")
        .where({kode_toko})
        .select("*")
 
        if (data.length === 0) {
            return res.status(404).json({
                status: "04",
                message: "Data tidak Ditemukan"
            });
        }

        
        return res.status(200).json({
            status:"00",
            message: "Berhasil ambil Data",
            data,
        });
    } catch (error) {
        console.error("ERROR gagal ambil data",error.message);
        return res.status(500),json({
            status: "99",
            message: "Terjadi kesalahan pada sisi Server",
            error: error.message
        })
    }
}
export const getStockByKodeToko = async (req, res) => {
    try {
        const {kode_toko} = req.params;
        
        const data = await db("stock_toko")
        .where({ kode_toko })
        .select("*")
        

        if (!data || data.length == 0) {
            return res.status(404).json({
                status: status.NOT_FOUND,
                message: "data kosong",
                data: []
            });
            
        };
        console.log(data.DISCOUNT)
        return res.status(200).json({
            status: status.SUKSES,
            message: "Berhasil Ambil Data",
            data,
        });
        } catch (error) {
            console.error("gagal ambil data ", error.message);
            return res.status(500).json({
                status: status.BAD_REQUEST,
                message: "Terjadi Kesalahan Pada Sisi Server",
                error: error.message

            })
        }

}


export const transaction = async (req, res) => {
    try {
        const { items, username} = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: "40", 
                message: "Items tidak boleh kosong"
            });
        }   

        let faktur;
        await db.transaction(async (trx) => {
            for (const item of items) {
                
                const id = item.id
                const  stock = await trx('stock_toko').where({ id }).first();
                const qtyStock = Number(stock.QTY);
                faktur = `PJ`+ datetime() + String(id).padStart(6, '0')
                if (item.qty > qtyStock) {
                    throw new Error("Stock tidak Cukup")
                }

                const updateStock = qtyStock - item.qty;
                const cekDiskon = await trx("stock").where({ id }).first();
                console.log(cekDiskon.DISCOUNT)

                await trx("kartustock_toko").insert({
                    status: "0",
                    faktur: faktur, 
                    kode: item.kode,     
                    qty: item.qty,       
                    harga: item.harga,   
                    kredit: item.qty,    
                    hp: item.harga,      
                    username: username, 
                    satuan: item.satuan, 
                    keterangan: "Penjualan " + item.nama 
                });
                await trx('stock_toko').where({ id }).update({ QTY: updateStock })
            }
        });

        return res.status(200).json({
            status: "00",
            message: "Transaksi Berhasil Disimpan",
            faktur: faktur,
        
        });
    
    } catch (error) {
        console.error("Error pada transaksi:", error);
        return res.status(500).json({
            status: status.BAD_REQUEST, 
            message: "Terjadi Kesalahan Pada Sisi Server"
        });
    };
};

export const updateHargaDiskon = async (req, res) => {
    try {
        const { id, harga, diskon } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID produk tidak boleh kosong." });
        }

        const originalProduct = await db("stock_toko").where({ id }).first();

        if (!originalProduct) {
            return res.status(404).json({
                status: "03",
                message: "Produk Tidak ditemukan"
            });
        }


        await db('stock_toko').where({ id }).update({
            HJ: harga,
            HJ2: harga
        });

        return res.status(200).json({
            status:"00",
            message: "Berhasil Update Harga",
        });

    } catch (error) {
        console.error("Error pada update harga:", error);
        return res.status(500).json({
            status: "99",
            message: "Terjadi Kesalahan Pada Sisi Server"
        });
    }
};

export const TambahStockGetGudang = async (req, res) =>  {
 try {
    const data = await db("nama_gudang").select("*")
    return res.status(200).json({
        status:"00",
        message:"Berhasil Ambil gudang",
        data,
    })
 } catch (error) {
    console.error("ERROR gagal ambil data gudang", error.message)
    return res.status(500).json({
        status:"99",
        message:"Terjadi kesalahan pada Server",
        error: error.message
    })
 }
}

export const TambahStockGetStock = async (req, res) => {
    try {
        const { GUDANG } = req.params;

        const data = await db("stock").where({GUDANG}).select( 
            'ID',
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
            'HB',
            'HJ',
            'HJ2',
            'EXPIRED',
            'TGL_MASUK',
            'BERAT',
            'QTY',
            'BARCODE'
        )

        return res.status(200).json({
            status: "00",
            message: "Berhasil ambil data Stock",
            data,
        })

    } catch (error) {
        console.log("ERROR Terjadi Kesalahan Ketika Ambil data", error.message)
        return res.status(500).json({
            status: "99",
            message: "Terjadi Kesalahan pada Sisi Server",
            error: error.message
        })
    }
}

export const TambahStockAdd = async (req, res) => {
    const { items, toko_peminta_id, gudang_tujuan_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            status: "99",
            message: "Request gagal: Daftar produk (items) tidak boleh kosong."
        });
    }

    try {
        for (const item of items) {
            const requestedAmount = Number(item.DOS_REQUEST);
            const availableStock = Number(item.DOS);

            if (requestedAmount > availableStock) {
                return res.status(400).json({
                    status: "03",
                    message: `Stock untuk produk ${item.NAMA}  tidak mencukupi.`,
                    data: {
                        produk: item.KODE,
                        diminta: requestedAmount,
                        tersedia: availableStock
                    }
                });
            }
        }
        const faktur = 'RS' + Date.now();
        const dataToInsert = items.map(item => ({
            KODE: item.KODE,
            KODE_TOKO: toko_peminta_id, 
            NAMA: item.NAMA,
            JENIS: item.JENIS,
            DOS: item.DOS_REQUEST,
            SATUAN: item.SATUAN,
            ISI: item.ISI,
            HJ: item.HJ,
            EXPIRED: item.EXPIRED ? format(new Date(item.EXPIRED), 'yyyy-MM-dd') : null,
            TGL_MASUK: new Date(),
            BERAT: item.BERAT,
            QTY: item.DOS_REQUEST * item.ISI,
            FAKTUR: faktur,
            BARCODE: item.BARCODE,
            STATUS: "pending"
        }));

        await db("request_stock").insert(dataToInsert);

        return res.status(200).json({
            status: "00",
            message: "Berhasil Request, Menunggu persetujuan pihak gudang"
        });

    } catch (error) {
        console.error("ERROR Gagal Membuat Request", error.message);
        return res.status(500).json({
            status: "99",
            message: "Terjadi Kesalahan Saat membuat request",
            error: error.message
        });
    }
};

export const getFakturFromRequest = async (req, res) => {
    try {
       const data=  await db("request_stock").where({status: "pending"}).select("*")

       return res.status(200).json({
        status: "00",
        message: "berhasil ambil data",
        data,
       })
    } catch (error) {
        console.error("ERROR Get data", error.message);
        return res.status(200).json({
            status: "99",
            message: "Gagal ambil Data Request Stock",
            error: error.message
        })
    }
}

export const terimaRequest = async (req, res) => {
    try {
        const {ID, KODE, KODE_TOKO, NAMA, JENIS, DOS, SATUAN, ISI, QTY,EXPIRED, TGL_MASUK, BERAT, FAKTUR, HJ, BARCODE} = req.body

        const HargaBeli = HJ

         await db.transaction(async (trx) => {
            await trx("stock_masuk").insert({
                KODE,
                KODE_TOKO,
                NAMA,
                JENIS,
                DOS,
                SATUAN,
                ISI,
                HJ,
                QTY: DOS * ISI,
                EXPIRED: EXPIRED ? format(new Date(EXPIRED), 'yyyy-MM-dd') : null,
                TGL_MASUK: new Date(),
                BERAT,
                FAKTUR
            })
            await trx("request_stock").where({FAKTUR}).update({status: "accept"})

            await trx("stock_toko").insert({
                KODE,
                KODE_TOKO,
                NAMA,
                JENIS,
                DOS,
                HB: HargaBeli,
                SATUAN,
                ISI,
                QTY: DOS * ISI,
                EXPIRED: EXPIRED ? format(new Date(EXPIRED), 'yyyy-MM-dd') : null,
                TGL_MASUK: new Date(),
                BERAT
            
            })
           const stock = await trx("stock").where({ BARCODE }).first()
            const jumlahStock = Number(stock.DOS)
            const jumlahRequest = Number(DOS)
            const updateDos = jumlahStock - jumlahRequest
            const updateQty = updateDos * ISI
           await trx("stock").where({BARCODE}).update({DOS: updateDos, QTY: updateQty})
            const faktur = "PJG" + datetime() + String(ID).padStart(6, "0")
           await trx("kartustock").insert({
            POSTING: "0",
            STATUS: "PJG",
            FAKTUR: faktur,
            TGL: new Date(),
            GUDANG: "?",
            KODE,
            QTY: DOS * ISI,
            KREDIT: DOS * ISI,
            HARGA: HJ,
            HP: HJ,
            KETERANGAN: `Penjualan ${NAMA}`,
            SATUAN

           })
         })
         return res.status(200).json({
            status: "00",
            message: "Berhasil menerima data",
         })

    } catch (error) {
        console.error("Error Terjadi Kesalahan", error.message);
        return res.status(500).json({
            status: "99",
            message: "Terjadi Kesalahan",
            error: error.message
        })
    }
}

export const rejected = async (req, res) => {
    const {ID} = req.body;
    try {
        await db("request_stock").where({ID}).update({status: "rejected"})
        return res.status(200).json({
            status:"00",
            message: " Berhasil Menolak Permintaan",
        })

    } catch (error) {
        console.error("ERROR Terjadi kesalahan saat menolak", error.message)
        return res.status(500).json({
            status:"99",
            message: "Terjadi Kesalahan pada Sisi Server",
            error: error.message
        })
    }
}

export const statusRequest = async (req, res) => {
    const {kode_toko}=  req.params;
    
    try {
        const data = await db("request_stock").where({kode_toko}).select("*")
        return res.status(200).json({
            status:"00",
            message: "Berhasil Ambil Data",
            data,
        })
    } catch (error) {
        console.error("ERROR terjadi Kesalahan saat ambil data", error.message)
        return res.status(500).json({
            status:"99",
            message: "Terjadi Kesalahan Pada Sisi Server",
            error: error.message
        })
    }
 };

 export const getAllpenjualan = async (req, res) => {
  try {
    const data = await db('kartustock_toko').select('*');

    res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil menampilkan seluruh penjualan',
      datetime: datetime(),
      data: data
    });
  } catch (err) {
    res.status(500).json({
      status: status.ERROR,
      message: 'Mengambil data seluruh penjualan',
      datetime: datetime(),
      error: err.message
    });
  }
};
