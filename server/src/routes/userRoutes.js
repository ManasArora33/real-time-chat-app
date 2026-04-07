const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Route to fetch all users (except the logged-in user).
 * Protected by the 'protect' middleware.
 */
router.get('/', protect, getUsers);

module.exports = router;
