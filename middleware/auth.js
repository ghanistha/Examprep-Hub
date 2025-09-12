const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Verify user still exists and is active (SQLite style)
    const userResult = await db.query(
      'SELECT id, email, full_name, exam_interest FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const userResult = await db.query(
      'SELECT id, email, full_name, exam_interest FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    req.user = userResult.rows.length > 0 ? userResult.rows[0] : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };

