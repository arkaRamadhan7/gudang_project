import express from "express";
import {
    getStockByKodeToko,
    transaction, 
    updateHargaDiskon, 
    getStockForHargaDiskon,
    TambahStockGetGudang,
    TambahStockGetStock,
    TambahStockAdd,
    getFakturFromRequest,
    terimaRequest,
    statusRequest,
    rejected
    

} from "../controllers/penjualanController.js"
const router = express.Router();
router.get("/request", getFakturFromRequest)
router.get("/gudang", TambahStockGetGudang);
router.get("/get-stock/:GUDANG", TambahStockGetStock);
router.post("/request-stock", TambahStockAdd)
router.post("/terima-request", terimaRequest);
router.post("/rejected", rejected)
router.post("/transaksi", transaction);
router.put("/perubahan", updateHargaDiskon);
//
router.get("/status/:kode_toko", statusRequest);
router.get("/product/:kode_toko", getStockForHargaDiskon);
router.get("/:kode_toko", getStockByKodeToko);

//




export default router;