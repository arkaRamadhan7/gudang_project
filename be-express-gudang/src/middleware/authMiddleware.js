import jwt from 'jsonwebtoken';
import { getUserById } from '../models/userModel.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token tidak valid. User tidak ditemukan.' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
      no_hp:decoded.no_hp,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token sudah expired' });
    }

    return res.status(500).json({ message: 'Error server pada autentikasi' });
  }
};

export default authMiddleware;