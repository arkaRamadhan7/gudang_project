import express from 'express';
import {
  fetchAllRak,
  addRak,
  editRak,
  deleteRak
} from '../controllers/rakController.js';

const router = express.Router();

// Middleware untuk parse JSON
router.use(express.json());

// Endpoint untuk rak
router.get('/', fetchAllRak);
router.post('/create', addRak);  // POST /api/rak/create
router.put('/:KODE', editRak);
router.delete('/:KODE', deleteRak);

export default router;