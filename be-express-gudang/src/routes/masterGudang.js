import { Router } from "express";
import { 
    fetchAllGudang,
    createGudang,
    updateGudang,
    destroyGudang,
    fetchGudangByJenis,
} from "../controllers/namaGudangController.js";
import { fetchDetailGudangByJenis } from '../controllers/namaGudangController.js';
import { fetchNamaGudangOnly } from "../controllers/namaGudangController.js";
import { getTotalColumnsGudang } from "../controllers/namaGudangController.js";

const router = Router();

router.get('/', fetchAllGudang);
router.post('/create', createGudang);
router.put('/edit/:id', updateGudang);
router.delete('/delete/:id', destroyGudang);
router.get('/jenis/:jenis', fetchGudangByJenis);
router.get('/detail/keterangan/:keterangan', fetchDetailGudangByJenis);
router.get('/nama',fetchNamaGudangOnly);
router.get('/total', getTotalColumnsGudang);

export default router;