const Message = require('../models/Message');

/**
 * Encapsulates all Socket.io logic for the application.
 * @param {object} io - The Socket.io server instance
 */
const socketSetup = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Event: User joins a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined room: ${chatId}`);
    });

    // Event: User sends a message
    socket.on('send_message', async (data) => {
      const { chatId, senderId, content } = data;

      if (!content || !chatId || !senderId) {
        console.log('Invalid message data received');
        return;
      }

      try {
        // 1. Save the message to the database
        const newMessage = await Message.create({
          chatId,
          senderId,
          content,
        });

        // 2. Fetch the populated message to send back
        const populatedMessage = await Message.findById(newMessage._id).populate(
          'senderId',
          'username email'
        );

        // 3. Emit the message to everyone in the room (including the sender for confirmation)
        io.to(chatId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error saving/emitting message:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports = socketSetup;
