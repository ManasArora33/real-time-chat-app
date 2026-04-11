const Message = require('../models/Message');

// Track online users: Map of userId -> socketId
const onlineUsers = new Map();

/**
 * Encapsulates all Socket.io logic for the application.
 * @param {object} io - The Socket.io server instance
 */
const socketSetup = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Event: User identifies themselves after connection
    socket.on('user_connected', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId; // Store for disconnect handling
        console.log(`User ${userId} is now online`);

        // Broadcast to all clients that this user is online
        io.emit('user_online', userId);

        // Send current online users list to the newly connected user
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit('online_users_list', onlineUserIds);
      }
    });

    // Event: User joins a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined room: ${chatId}`);
    });

    // Event: User starts typing
    socket.on('typing', (data) => {
      const { chatId, username } = data;
      // We use .to(chatId) but we exclude the sender (socket.to)
      socket.to(chatId).emit('user_typing', { username });
    });

    // Event: User stops typing
    socket.on('stop_typing', (chatId) => {
      socket.to(chatId).emit('user_stop_typing');
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
      console.log('User disconnected:', socket.id);

      // If the socket had an associated user, mark them offline
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User ${socket.userId} is now offline`);

        // Broadcast to all clients that this user is offline
        io.emit('user_offline', socket.userId);
      }
    });
  });
};

module.exports = socketSetup;
