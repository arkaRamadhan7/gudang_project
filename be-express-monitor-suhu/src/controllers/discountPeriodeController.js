import { db } from '../core/config/knex.js';
import { format } from 'date-fns';

export const updateExpiredDiscounts = async () => {
    try {
        const now = new Date();
        const formattedDate = format(now, "yyyy-MM-dd")
        
        const updatedCount = await db('stock_toko')
            .where('END_DISC', '<', formattedDate)
            .whereNotNull('END_DISC')
            .where('DISCOUNT', '>', 0)
            .update({
                HJ2: db.raw('HJ'),  
                DISCOUNT: 0,        
                START_DISC: null,   
                END_DISC: null      
            });
        
        console.log(`Updated ${updatedCount} products with expired discounts`);
        return { success: true, updatedCount };
    } catch (error) {
        console.error('Error updating expired discounts:', error);
        return { success: false, error: error.message };
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { kode_toko } = req.params; 

        if (!kode_toko) {
            return res.status(200).json([]);
        }

        await updateExpiredDiscounts();

        const now = new Date();
        const products = await db('stock_toko as p')
            .where('p.KODE_TOKO', kode_toko) // 
            .select(
                'p.ID', 'p.NAMA', 'p.KODE', 'p.HJ', 'p.DISCOUNT',
                'p.START_DISC', 'p.END_DISC',
                db.raw(
                    `CASE 
                        WHEN p.DISCOUNT > 0 AND ? BETWEEN p.START_DISC AND p.END_DISC 
                        THEN p.HJ - (p.HJ * p.DISCOUNT / 100) 
                        ELSE p.HJ 
                    END as HJ2`,
                    [now]
                )
            )
            .orderBy('p.ID', 'desc');

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil semua data produk', error: error.message });
    }
};

export const addDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { DISCOUNT, START_DISC, END_DISC } = req.body;

        if (DISCOUNT === undefined || !START_DISC || !END_DISC) {
            return res.status(400).json({ message: 'Harap sediakan DISCOUNT, START_DISC, dan END_DISC.' });
        }

        const product = await db('stock_toko').where({ ID: id }).first();
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        if (product.DISCOUNT > 0 || product.START_DISC !== null) {
            return res.status(409).json({ message: 'Produk ini sudah memiliki diskon. Gunakan endpoint EDIT untuk mengubahnya.' });
        }

        await db('stock_toko').where({ ID: id }).update({ DISCOUNT, START_DISC, END_DISC });
        
        const updatedProduct = await db('stock_toko').where({ ID: id }).first();
        res.status(201).json({ message: 'Diskon berhasil ditambahkan', product: updatedProduct });

    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan diskon', error: error.message });
    }
};

export const editDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { DISCOUNT, START_DISC, END_DISC, HJ } = req.body;
        const diskon = Number(DISCOUNT)
        const harga = Number(HJ)
        const hasil = harga - harga * diskon / 100
        if (DISCOUNT === undefined || !START_DISC || !END_DISC) {
            return res.status(400).json({ message: 'Harap sediakan DISCOUNT, START_DISC, dan END_DISC.' });
        }
        const date = new Date()
        const formated = format(date, "yyyy-MM-dd")
        if (END_DISC < formated) {
            return res.status(400).json({message:"Tanggal Diskon Berakhir tidak boleh Kurang dari Tanggal saat ini"})
        }
        console.log(DISCOUNT, START_DISC, END_DISC)

        const updatedCount = await db('stock_toko').where({ ID: id }).update({ 
             DISCOUNT,
             START_DISC: START_DISC ? format(new Date(START_DISC), 'yyyy-MM-dd') : null, 
             END_DISC: END_DISC ? format(new Date(END_DISC), 'yyyy-MM-dd') : null,
             HJ2: hasil
             });
        
        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan untuk diedit' });
        }

        const updatedProduct = await db('stock_toko').where({ ID: id }).first();
        res.status(200).json({ message: 'Diskon berhasil diperbarui', product: updatedProduct });

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Gagal memperbarui diskon', error: error.message });
    }
};

export const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const HJ = await db("stock_toko").where({ id }).first()
        const updatedCount = await db('stock_toko')
            .where({ ID: id })
            .update({
                DISCOUNT: 0,
                START_DISC: null,
                END_DISC: null,
                HJ2: HJ.HJ
            });
        
        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        const updatedProduct = await db('stock_toko').where({ ID: id }).first();
        res.status(200).json({ message: 'Diskon berhasil dihapus', product: updatedProduct });

    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus diskon', error: error.message });
    }
};