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
    socket.on('user_connected', async (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} is now online`);

        io.emit('user_online', userId);

        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit('online_users_list', onlineUserIds);

        // --- CATCH-UP DELIVERY LOGIC ---
        try {
          // 1. Find all messages sent to THIS user that are still at 'sent'
          const undeliveredMessages = await Message.find({
            recipientId: userId,
            status: 'sent'
          });

          if (undeliveredMessages.length > 0) {
            // 2. Mark them all as delivered
            await Message.updateMany(
              { recipientId: userId, status: 'sent' },
              { status: 'delivered' }
            );

            // 3. Notify the senders of these messages that they've been delivered
            const senderIds = [...new Set(undeliveredMessages.map(m => m.senderId.toString()))];

            senderIds.forEach(senderId => {
              const senderSocketId = onlineUsers.get(senderId);
              if (senderSocketId) {
                io.to(senderSocketId).emit('messages_delivered', {
                  deliveredBy: userId
                });
              }
            });
          }
        } catch (error) {
          console.error('Error in catch-up delivery:', error);
        }
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
      socket.to(chatId).emit('user_typing', { chatId, username });
    });

    // Event: User stops typing
    socket.on('stop_typing', (chatId) => {
      socket.to(chatId).emit('user_stop_typing', chatId);
    });

    // Event: User sends a message
    socket.on('send_message', async (data) => {
      const { chatId, senderId, content, recipientId } = data;

      if (!content || !chatId || !senderId || !recipientId) {
        console.log('Invalid message data received');
        return;
      }

      try {
        // 1. Save the message (initially 'sent')
        const newMessage = new Message({
          chatId,
          senderId,
          recipientId,
          content,
          status: 'sent'
        });

        // 2. If recipient is online, immediately upgrade to 'delivered'
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          newMessage.status = 'delivered';
        }

        await newMessage.save();

        // 3. Fetch populated message to broadcast
        const populatedMessage = await Message.findById(newMessage._id).populate(
          'senderId', 'username email'
        );

        io.to(chatId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error saving/emitting message:', error.message);
      }
    });

    // Event: Recipient opens a conversation — mark all as 'read'
    socket.on('mark_read', async ({ chatId, userId, senderId }) => {
      try {
        await Message.updateMany(
          { chatId, senderId, status: { $ne: 'read' } },
          { status: 'read' }
        );

        // Broadcast to the whole chat room so UI (blue ticks) updates reliably across multiple tabs/devices
        io.to(chatId).emit('messages_read', { chatId,senderId, readBy: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User ${socket.userId} is now offline`);
        io.emit('user_offline', socket.userId);
      }
    });
  });
};

module.exports = socketSetup;
