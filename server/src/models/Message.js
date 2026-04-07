const mongoose = require('mongoose');

/**
 * Message Schema for storing individual messages within a chat.
 */
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add a compound index to optimize searching messages within a specific chat
messageSchema.index({ chatId: 1, content: 1 });

module.exports = mongoose.model('Message', messageSchema);
