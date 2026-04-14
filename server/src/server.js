const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Start Server function
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    const app = express();

    // Trust Render's proxy for secure cookies
    app.set('trust proxy', 1);

    // Middleware
    app.use(express.json());
    app.use(cookieParser());

    // CORS setup
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }));

    // Basic route
    app.get('/', (req, res) => {
      res.send('Chat App API is running...');
    });

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/message', messageRoutes);

    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    const socketSetup = require('./sockets/socket');
    socketSetup(io);

    // Port setting
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
