import { fetchAlljenisgudang,
         fetchAllKeteranganGolongan,
         createJenisGudang,
         editJenisGudang,
         deleteJenisGudang
 } from "../controllers/masterGolonganStok.js";
import { Router} from 'express';

const router = Router();


router.get('/keterangan/:keterangan',fetchAllKeteranganGolongan);
router.get('/',fetchAlljenisgudang);
router.post('/create',createJenisGudang);
router.put('/edit/:kode',editJenisGudang);
router.delete('/delete/:kode',deleteJenisGudang);

export default router;

