import express from "express";
import { 
    GetDataPenjualan,
    Getallpenjualan

 } from "../controllers/dataPenjualanTokoController.js";

 const router = express.Router()

 router.get('/:kode_toko', GetDataPenjualan);
 router.get('/',Getallpenjualan);

 export default router