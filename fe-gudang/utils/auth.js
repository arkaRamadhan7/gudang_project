// utils/auth.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const getUserFromToken = () => {
  try {
    const cookieStore = cookies();
    
    const possibleTokenNames = ['auth_token', 'token', 'access_token', 'jwt_token', 'authToken'];
    let token = null;
    
    for (const tokenName of possibleTokenNames) {
      const cookieToken = cookieStore.get(tokenName);
      if (cookieToken) {
        token = cookieToken;
        break;
      }
    }
    
    if (!token) {
      return { error: 'No token found', userId: null };
    }
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    
    return {
      userId: decoded.userId || decoded.id || decoded.sub,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      no_hp: decoded.no_hp,
      error: null
    };
    
  } catch (error) {
    console.error('Error decoding token:', error);
    return {
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      userId: null
    };
  }
};

export const requireAuth = () => {
  const { userId, error } = getUserFromToken();
  
  if (error || !userId) {
    return {
      isAuthenticated: false,
      userId: null,
      error: error || 'Authentication required'
    };
  }
  
  return {
    isAuthenticated: true,
    userId,
    error: null
  };
};

// Middleware untuk validasi auth di API routes
export const withAuth = (handler) => {
  return async (req, ...args) => {
    const auth = requireAuth();
    
    if (!auth.isAuthenticated) {
      return new Response(
        JSON.stringify({
          status: '401',
          message: auth.error || 'Unauthorized'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Tambahkan userId ke request object
    req.userId = auth.userId;
    
    return handler(req, ...args);
  };
};