# PulseChat - Real-Time Chat Application

PulseChat is a full-stack real-time chat application built with **React**, **Node.js**, **Express**, **Socket.io**, and **SQLite**. It enables instant bidirectional messaging across multiple channels with chat history persistence, typing indicators, active user status, and message delivery receipts.

---

## 🌟 Key Features

### Core Requirements
- **Instant Messaging**: Real-time message delivery powered strictly by Socket.io WebSockets.
- **Chat History Persistence**: Previous messages are stored in an SQLite database and fetched via REST API on initial load or page refresh.
- **Message Timestamps**: Formatted timestamps (e.g. `09:35 AM`) and date dividers (Today, Yesterday).
- **REST API & WebSockets**: Combined architecture for REST data retrieval and WebSocket real-time events.

### Bonus Features Included
- 👤 **Username & Avatar Login**: Simple user authentication session with customizable avatars.
- 💬 **Multi-Channel Rooms**: Dynamic channel switching (`#General Chat`, `#Tech Talk`, `#Random`).
- ✍️ **Real-Time Typing Indicators**: Visual indicator when other users in the channel are typing.
- 🟢 **Online/Offline Status**: Live user roster showing member activity states.
- ✔️ **Message Read Receipts**: Delivery status indicators (✓ sent/delivered, ✓✓ read).
- 🖼️ **Image & Media Attachment**: Support for sending image URLs inline.
- 🎨 **Dark / Light Glassmorphism UI**: Modern theme switcher with Glassmorphic visual accents.

---

## 📁 Project Architecture & Folder Structure

```
ExpressSocket-Chat/
├── backend/
│   ├── config/
│   │   └── db.js                 # SQLite database setup & table schemas
│   ├── controllers/
│   │   ├── messageController.js  # REST controller for history & messaging
│   │   └── userController.js     # REST controller for user authentication
│   ├── routes/
│   │   ├── messageRoutes.js      # Express message API endpoints
│   │   └── userRoutes.js         # Express user API endpoints
│   ├── sockets/
│   │   └── chatSocket.js         # Modular Socket.io real-time event handlers
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Environment variables template
│   ├── chat.db                   # SQLite database file
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server & Socket.io initialization
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader.jsx    # Top channel bar & socket connection pill
│   │   │   ├── LoginModal.jsx    # User login & avatar selection modal
│   │   │   ├── MessageInput.jsx  # Input bar with emoji & attachment triggers
│   │   │   ├── MessageList.jsx   # Message history & bubble renderer
│   │   │   ├── Sidebar.jsx       # Channel navigation & active members list
│   │   │   └── TypingIndicator.jsx# Animated typing status bubble
│   │   ├── context/
│   │   │   └── SocketContext.jsx # React Context for socket & app state
│   │   ├── services/
│   │   │   └── api.js            # REST API client helper
│   │   ├── styles/
│   │   │   └── index.css         # Glassmorphism design system & CSS variables
│   │   ├── App.jsx               # Main React layout
│   │   └── main.jsx              # React app entry point
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration & API proxy
├── package.json                  # Root package setup
└── README.md                     # Project documentation
```

---

## 🛠️ Environment Variables

Create a `.env` file in the `backend/` directory (or use `.env.example`):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Option 1: Run Full App from Root Directory

1. Clone the repository:
   ```bash
   git clone https://github.com/rushhiii25/ExpressSocket-Chat.git
   cd ExpressSocket-Chat
   ```

2. Install dependencies & build frontend:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your browser.

---

### Option 2: Run Backend and Frontend Separately (Development Mode)

#### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

#### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 REST API & Socket.io Event Specification

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/messages?room=general` | Fetch chat message history for a channel |
| `POST` | `/api/messages` | Send message via REST API |
| `GET` | `/api/messages/rooms` | Get list of available chat channels |
| `POST` | `/api/users/login` | Register / Login user session |
| `GET` | `/api/users` | Fetch list of registered users and status |

### Socket.io Real-Time Events

| Event | Direction | Description |
| :--- | :--- | :--- |
| `user_join` | Client -> Server | Register user socket connection and broadcast online status |
| `join_room` | Client -> Server | Join specific socket channel room |
| `leave_room` | Client -> Server | Leave channel room |
| `send_message` | Client -> Server | Send message to channel room |
| `receive_message` | Server -> Client | Broadcast new message to channel members |
| `typing_start` | Client -> Server | Notify room that user started typing |
| `typing_stop` | Client -> Server | Notify room that user stopped typing |
| `user_typing` | Server -> Client | Broadcast typing indicator state |
| `mark_read` | Client -> Server | Mark messages as read by recipient |
| `user_status_change` | Server -> Client | Broadcast online/offline user updates |

---

## 🧠 Design Decisions & Assumptions

1. **SQLite Database Choice**: SQLite was chosen for message persistence because it requires zero external database server setup while providing structured relational data storage and instant local startup.
2. **Dual Transport Architecture**: Socket.io handles instant real-time events, while Express REST endpoints handle initial history loading on page refreshes and room switches for optimal reliability.
3. **State Management with React Context**: A unified `SocketContext` centralizes WebSocket connection state, active user profile, room channels, and message lists across components.
4. **Vite + Production Bundling**: Vite provides lightning-fast HMR during development, while the Express server hosts the static production build (`frontend/dist`) in production.

---

## 🌐 Deployment Guide

### Option 1: Single Web Service on Render (Recommended)

Render allows hosting both the Express backend and Vite frontend together in a single free Web Service:

1. **Push your code to GitHub** (see instructions below).
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository: `ExpressSocket-Chat`.
4. Configure the Web Service:
   - **Name**: `pulse-chat-app` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose nearest region
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `5000` (or leave default assigned by Render)
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Render will automatically run `npm install` (which executes `postinstall` to build frontend assets) and start the backend.
7. Access your live application at the generated Render URL (e.g., `https://pulse-chat-xyz.onrender.com`).

---

### Option 2: Decoupled Deployment (Backend on Render + Frontend on Vercel)

#### Backend Deployment (Render):
1. Create a **Web Service** on Render pointing to the `backend/` directory or repository root.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `NODE_ENV`: `production`

#### Frontend Deployment (Vercel):
1. Connect your repository to [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`
3. Framework Preset: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Deploy and obtain your live URL.

---

## 🎥 Demonstration & Screen Recording

If deploying as a web application or testing locally, capture a short video walkthrough (1-2 minutes) demonstrating:
1. **User Login**: Entering a username and picking an avatar.
2. **Real-Time Chat**: Opening two browser windows (or normal + incognito window) side-by-side to send messages back and forth instantly.
3. **Typing Indicators & User Roster**: Demonstrating the live active status and typing feedback.
4. **Chat History Persistence**: Refreshing the page to show message history retrieved from SQLite.

### How to Upload & Share Video:
1. Record your screen using **Windows Game Bar** (`Win + Alt + R`), **Loom**, or **OBS Studio**.
2. Upload the video file (MP4/WebM) to **Google Drive**.
3. Right-click the uploaded video file in Google Drive -> **Share** -> **General access** -> Change to **"Anyone with the link can view"**.
4. Copy the link for your submission.

---

## 👤 Author
**Rushikesh Bhosale**

