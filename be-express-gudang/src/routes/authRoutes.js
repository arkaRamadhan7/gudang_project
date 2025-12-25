import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verify);

router.get('/profile', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Profil user', 
    user: req.user 
  });
});

router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

router.get('/users', authMiddleware, roleMiddleware(['admin']), authController.getAllUsers);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), authController.deleteUser);

export default router;