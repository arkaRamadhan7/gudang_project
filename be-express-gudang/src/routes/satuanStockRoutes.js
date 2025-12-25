import express from 'express';
import {
  fetchAllSatuan,
  addSatuan,
  editSatuan,
  deleteSatuan,
  
} from '../controllers/satuanStockController.js';

const router = express.Router();


router.use(express.json());

router.get('/', fetchAllSatuan);
router.post('/create', addSatuan); 
router.put('/:KODE', editSatuan);
router.delete('/:KODE', deleteSatuan);

export default router;