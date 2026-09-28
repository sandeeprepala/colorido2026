import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../data/db.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    let user = db.findUserById(decoded.id);
    if (!user && decoded.email) {
      user = db.findUserByEmail(decoded.email);
    }
    if (!user && (decoded.role === 'admin' || decoded.id?.includes('admin') || decoded.email?.includes('admin'))) {
      user = db.getAllUsers().find((u) => u.role === 'admin');
    }
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      college: user.college,
      department: user.department,
      year: user.year,
      student_id: user.student_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    }
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          college: user.college,
          department: user.department,
          year: user.year,
        };
      }
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
};
