import express from 'express';
import {
  fetchAllJenisGudang,
  addJenisGudang,
  editJenisGudang,
  deleteJenisGudang
} from '../controllers/jenisGudangController.js';

const router = express.Router();

router.use(express.json());

router.get('/', fetchAllJenisGudang);
router.post('/create', addJenisGudang);
router.put('/edit/:id', editJenisGudang);
router.delete('/delete/:id', deleteJenisGudang);

export default router;