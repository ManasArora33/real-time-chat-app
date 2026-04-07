const Chat = require('../models/Chat');

/**
 * Access or create a one-to-one chat.
 * @desc    Find existing chat or start a new conversation
 * @route   POST /api/chat
 * @access  Private
 */
const createOrGetChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    // Look for an existing chat between these two users
    let chat = await Chat.findOne({
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    }).populate('participants', '-password');

    if (chat) {
      res.status(200).json(chat);
    } else {
      // Create a new chat if it doesn't exist
      const newChat = await Chat.create({
        participants: [req.user._id, userId],
      });

      const fullChat = await Chat.findById(newChat._id).populate('participants', '-password');
      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all chats for the currently logged-in user.
 * @desc    Get chat list for individual user
 * @route   GET /api/chat
 * @access  Private
 */
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', '-password')
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrGetChat, getChats };
