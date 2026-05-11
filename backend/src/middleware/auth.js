import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export const checkOwnerOrAdmin = (req, res, next) => {
  // This will be checked in individual route handlers
  // For now, just ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
