import Router from 'express';
import {
    fetchAllKartuStock,
    addKartuStock,
    editKartuStock,
    deleteKartuStock
} from '../controllers/kartuStockController.js';

const router = Router();

router.get('/', fetchAllKartuStock);
router.post('/add', addKartuStock);
router.put('/edit/:id', editKartuStock);
router.delete('/:id', deleteKartuStock);
router.delete('/delete/:id', deleteKartuStock); 

export default router;
