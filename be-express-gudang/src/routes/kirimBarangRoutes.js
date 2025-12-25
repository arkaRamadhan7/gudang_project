import express from 'express';
import { fetchAllMutasi, addMutasi } from '../controllers/kirimBarangController.js'; 

const router = express.Router(); 
router.use(express.json());      

router.get('/', fetchAllMutasi);
router.post('/create', addMutasi);

export default router;
