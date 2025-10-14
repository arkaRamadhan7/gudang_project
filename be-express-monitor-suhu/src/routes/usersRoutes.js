import Router from 'express';
import { fetchAllUsers,createNewUser,updateUser,deleteUser,getTotalusers } from '../controllers/userController.js';

const router = Router();

router.get('/', fetchAllUsers);        
router.get('/total',getTotalusers);        
router.post('/create', createNewUser);         
router.put('/edit/:id', updateUser);                      
router.delete('/delete/:id', deleteUser);      

export default router;
