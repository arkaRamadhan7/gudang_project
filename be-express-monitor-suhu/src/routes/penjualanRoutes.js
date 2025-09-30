import express from "express";
import {getStockByKodeToko,  transaction} from "../controllers/penjualanController.js"
const router = express.Router();


router.get("/:kode_toko", getStockByKodeToko);
router.post("/transaksi", transaction)

export default router;