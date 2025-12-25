export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User tidak terautentikasi' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Akses ditolak. Role tidak memiliki permission untuk mengakses resource ini',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }

      next();
    } catch (err) {
      console.error('Role middleware error:', err);
      return res.status(500).json({ message: 'Error server pada authorization' });
    }
  };
};

export const adminOnly = roleMiddleware(['admin']);
export const adminOrModerator = roleMiddleware(['admin', 'moderator']);
export const userOrAbove = roleMiddleware(['admin', 'moderator', 'user']);