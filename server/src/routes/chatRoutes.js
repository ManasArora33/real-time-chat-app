const express = require('express');
const { createOrGetChat, getChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Route to access/create a one-to-one chat.
 * Protected by the 'protect' middleware.
 */
router.post('/', protect, createOrGetChat);

/**
 * Route to fetch all chats for a user.
 * Protected by the 'protect' middleware.
 */
router.get('/', protect, getChats);

module.exports = router;
