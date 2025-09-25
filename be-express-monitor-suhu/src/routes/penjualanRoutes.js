import express from "express";
import {getStockByKodeToko, addTransaction} from "../controllers/penjualanController.js"
const router = express.Router();

router.get("/:kode_toko", getStockByKodeToko);
router.post("/add", addTransaction);

export default router;