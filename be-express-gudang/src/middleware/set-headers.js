export const setResponseHeader = (req, res, next) => {
  try {
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  } catch (error) {
    console.error('Header middleware error:', error);
    next();
  }
};