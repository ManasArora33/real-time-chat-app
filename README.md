# NexChat | Elite Messaging 🚀✨

![NexChat Banner](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge&logo=socket.io)

### 🌐 **Live Demo: [https://nexchat-i2mg.onrender.com/](https://nexchat-i2mg.onrender.com/)**

NexChat is a production-ready, full-stack real-time chat application engineered for performance and aesthetics. Featuring a sleek **glassmorphic design**, **instant read receipts (blue ticks)**, and **mobile responsive design**, NexChat delivers a premium, native-app-like messaging experience directly in the browser.

## ✨ Comprehensive Feature List

### 💬 Core Messaging
*   **Instant One-to-One Messaging**: Seamless, zero-latency chatting powered by WebSockets.
*   **Smart Read Receipts (Blue Ticks)**: Live "blue tick" updates that fire the precise millisecond a recipient views your message.
*   **Delivery Status (Grey Ticks)**: Real-time confirmation when a message successfully reaches the recipient's active device.
*   **Live Typing Indicators**: Immediate visual feedback when the person you are chatting with is typing.
*   **Live Presence Tracking**: Accurate, real-time online/offline status indicators mapped to active socket connections.
*   **Automated Catch-Up Delivery**: Automatically syncs and delivers any messages sent to you while you were offline the moment you reconnect.

### 🔍 Discovery & Navigation
*   **Global User Search**: Instantly find, filter, and initiate conversations with any registered user.
*   **Message Search**: Quickly search through your active conversations and message histories for specific content.
*   **Dynamic Chat History**: A dedicated, real-time updated sidebar preserving all your active conversations.

### 🎨 Modern UI / UX
*   **Light & Dark Mode**: Full theme-switching capabilities mapped to user preference for eye strain reduction.
*   **Mobile Responsiveness**: A fluid layout engineered to perfectly adapt to mobile browser viewports and virtual keyboards.

### 🛡️ Security & DevOps
*   **Bulletproof Auth**: Secure, cross-origin session persistence using HTTP-only cookies and JWTs.
*   **Containerized Backend**: The Node.js server is fully Dockerized for consistent, scalable hybrid-cloud deployments.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React (Vite)**
*   **Tailwind CSS** (v4.0)
*   **Socket.io-client**
*   **Lucide React** (Icons)
*   **React Router DOM**

### **Backend**
*   **Node.js & Express.js**
*   **MongoDB & Mongoose**
*   **Socket.io** (Real-Time Engine)
*   **JSON Web Tokens (JWT) & bcryptjs** (Authentication)

### **DevOps & Deployment**
*   **Docker** (Containerization)
*   **Render** (Hybrid Deployment: Static CDN + Web Service)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
*   Node.js (v18+)
*   MongoDB Cluster / Local Instance

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
```
Create a `.env` file in the `/client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Start the client:
```bash
npm run dev
```

---

## 🌐 Production Deployment 

This application is configured for a Hybrid Cloud Deployment on **Render**.

1.  **Backend**: Deploy the `/server` directory as a Dockerized Web Service. Ensure environment variables are set, particularly `NODE_ENV=production` and defining your frontend URL in CORS (`CLIENT_URL`).
2.  **Frontend**: Deploy the `/client` directory as a Static Site using Vite's build command (`npm run build`). Ensure `VITE_API_URL` and `VITE_SOCKET_URL` are mapped to the Render backend URL.

---

## 💡 Architecture Highlights
*   **Room-Based Socket Delivery**: Read receipts (`messages_read`) and event broadcasts are sent precisely to `chatId` socket rooms, preventing event loss across multiple user tabs.
*   **Robust Layout Engine**: The mobile UI is built with bulletproof layout structures that prevent oversized text inputs or virtual keyboards from breaking the user interface.

---
*Built to demonstrate full-stack proficiency, real-time optimization, and UI/UX design.*
