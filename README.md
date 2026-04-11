# NexChat | Elite Messaging 🚀✨

![NexChat Banner](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge&logo=socket.io)

### 🌐 **Live Demo: [https://nexchat-i2mg.onrender.com/](https://nexchat-i2mg.onrender.com/)**

NexChat is a production-ready, full-stack real-time chat application engineered for performance and aesthetics. Featuring a sleek **glassmorphic design**, **instant read receipts (blue ticks)**, and **GPU-accelerated mobile responsiveness**, NexChat delivers a premium, native-app-like messaging experience directly in the browser.

## ✨ Key Features

*   **⚡ Real-Time Engine**: Instant message delivery, typing indicators, and reliable online/offline status updates powered by robust Socket.io room broadcasting.
*   **✅ Smart Read Receipts**: Live "blue tick" updates that fire the precise millisecond a recipient views your message—no page reloads required.
*   **📱 Mobile Excellence**: Engineered with a fully fluid, dynamic layout that adapts perfectly to mobile screens and virtual keyboards, ensuring a buttery-smooth, native-app-like experience.
*   **🎨 Glassmorphic UI**: A stunning, modern interface built with Tailwind CSS, featuring active blur filters, dynamic gradients, and professional typography.
*   **🔒 Bulletproof Auth**: Secure, cross-origin session persistence using HTTP-only cookies and JWTs, optimized for hybrid cloud deployments.
*   **🐳 Containerized Backend**: The Node.js server is fully Dockerized for consistent, scalable deployments.

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
