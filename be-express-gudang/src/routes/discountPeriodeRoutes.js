import express from 'express';
import { 
    getAllProducts,
    addDiscount,
    editDiscount,
    deleteDiscount
} from '../controllers/discountPeriodeController.js';

const router = express.Router();

router.get('/:kode_toko', getAllProducts);
router.post('/add/:id', addDiscount);
router.put('/edit/:id', editDiscount);
router.delete('/delete/:id', deleteDiscount);

export default router;