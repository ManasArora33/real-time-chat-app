const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication.
 * Checks for a 'token' cookie, verifies it, and attaches the user to the request object.
 */
const protect = async (req, res, next) => {
  // If database is not connected, return 503 so frontend retries instead of logging out
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection in progress' });
  }

  let token;
  // Read the token from the HttpOnly cookie we set during login/register
  token = req.cookies.token;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database and attach to req object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
