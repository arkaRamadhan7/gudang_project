import express from "express";
import { 
    GetDataPenjualan

 } from "../controllers/dataPenjualanTokoController.js";

 const router = express.Router()

 router.get('/:kode_toko', GetDataPenjualan);

 export default router