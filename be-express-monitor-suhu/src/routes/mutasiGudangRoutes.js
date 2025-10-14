import {Router} from "express"
import {
    createmutasi,
    receivemutasi,
    getAllmutasi,
    getAllFaktur,
    getPendingMutasi,
    getMutasiByFaktur,
    exportDataToExcel,
    getTotalColumnsMutasi
} from "../controllers/mutasiGudangController.js";

const router = Router();


router.get("/",getAllmutasi);
router.get("/faktur", getAllFaktur);
router.get("/pending", getPendingMutasi);
router.get("/receive/:faktur", getMutasiByFaktur);
router.get("/mutasi", getAllmutasi);
router.get("/export", exportDataToExcel);
router.get("/total",getTotalColumnsMutasi);
router.post ("/create",createmutasi);
router.post("/receive/:faktur",receivemutasi);




export default router;