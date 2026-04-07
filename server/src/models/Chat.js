const mongoose = require('mongoose');

/**
 * Chat Schema for storing metadata about a conversation between two users.
 */
const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Chat', chatSchema);
