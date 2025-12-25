import Router from 'express';
import {
  getAllJenisRole,
  createJenisRole,
  updateJenisRole,
  deleteJenisRole
} from '../controllers/jenisRoleController.js';

const router = Router();

router.get('/', getAllJenisRole);
router.post('/create', createJenisRole);
router.put('/update/:id', updateJenisRole);
router.delete('/delete/:id', deleteJenisRole);

export default router;
