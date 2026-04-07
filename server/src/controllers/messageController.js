const Message = require('../models/Message');
const Chat = require('../models/Chat');

/**
 * Fetch all messages for a specific conversation.
 * @desc    Get message history for a chat
 * @route   GET /api/message/:chatId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Fetch messages where chatId matches
    // Populate the senderId to get the user's name and details
    const messages = await Message.find({ chatId })
      .populate('senderId', 'username email')
      .sort({ createdAt: 1 }); // Important: 1 for Ascending (Oldest First)

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search messages within a specific chat.
 * @desc    Search message content in a chat using keyword
 * @route   GET /api/message/search
 * @access  Private
 */
const searchMessages = async (req, res) => {
  try {
    const { chatId, query } = req.query;

    if (!chatId || !query) {
      return res.status(400).json({ message: 'chatId and query are required' });
    }

    // 1. Security Check: Verify user is a participant of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to search in this chat' });
    }

    // 2. Perform Search: Use $regex for case-insensitive partial match
    const messages = await Message.find({
      chatId,
      content: { $regex: query, $options: 'i' },
    })
      .populate('senderId', 'username email')
      .sort({ createdAt: -1 }); // Show latest matches first

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, searchMessages };
