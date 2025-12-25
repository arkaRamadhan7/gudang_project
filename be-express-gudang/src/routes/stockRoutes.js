import Router from 'express';
import {
    fetchAllStock,
    addStock,
    editStock,
    deleteStock,
    fetchStockBySatuan,
    getStockByGudang,
    getTotalColumnsStock,
    exportDataToExcel,
    previewStockExcel
} from '../controllers/stockController.js';

const router = Router();

router.get('/satuan/:satuan', fetchStockBySatuan);
router.get('/',fetchAllStock);
router.post('/add',addStock);
router.put('/edit/:id', editStock);
router.delete('/:id', deleteStock);
router.delete('/delete/:id', deleteStock);
router.get('/gudang/:gudang',getStockByGudang);
router.get("/total", getTotalColumnsStock);
router.get("/export", exportDataToExcel);
router.get("/preview", previewStockExcel);

export default router;
