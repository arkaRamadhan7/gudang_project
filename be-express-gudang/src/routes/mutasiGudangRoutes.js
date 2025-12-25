import {Router} from "express"
import {
    createmutasi,
    receivemutasi,
    getAllmutasi,
    getAllFaktur,
    getPendingMutasi,
    getMutasiByFaktur,
    exportDataToExcel,
    getTotalColumnsMutasi,
    getDetailBarangByFaktur,
    getFakturByGudang
} from "../controllers/mutasiGudangController.js";

const router = Router();


router.get("/",getAllmutasi);
router.get("/faktur", getAllFaktur);
router.get("/pending", getPendingMutasi);
router.get("/receive/:faktur", getMutasiByFaktur);
router.get("/mutasi", getAllmutasi);
router.get("/export", exportDataToExcel);
router.get("/total",getTotalColumnsMutasi);
router.get('/bygudang', getFakturByGudang);
router.get('/detail/:faktur', getDetailBarangByFaktur);
router.post ("/create",createmutasi);
router.post("/receive/:faktur",receivemutasi);






export default router;