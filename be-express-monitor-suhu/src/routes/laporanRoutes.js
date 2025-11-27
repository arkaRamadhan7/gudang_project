import { Router } from 'express';
import {fetchSisaStock,
        fetchMutasiGudang,
        fetchReqstockGudang,
        fetchdiskontoko,
        fetchallstocktoko
} from '../controllers/laporanController.js'

const router = Router();

router.get('/stock',fetchSisaStock);
router.get('/mutasi', fetchMutasiGudang);
router.get('/request',fetchReqstockGudang);
router.get('/diskon',fetchdiskontoko);
router.get('/toko',fetchallstocktoko);

export default router;