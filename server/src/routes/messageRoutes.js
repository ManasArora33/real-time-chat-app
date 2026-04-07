const express = require('express');
const { getMessages, searchMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Routes to fetch message history and search within a chat.
 * All routes protected by the 'protect' middleware.
 */
router.get('/search', protect, searchMessages);
router.get('/:chatId', protect, getMessages);

module.exports = router;
