import React, { useState } from 'react';
import { useSocket } from './context/SocketContext';
import LoginModal from './components/LoginModal';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import TypingIndicator from './components/TypingIndicator';
import MessageInput from './components/MessageInput';

export default function App() {
  const { user } = useSocket();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="app-container">
      {!user && <LoginModal />}

      {showMobileSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <Sidebar
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <ChatHeader onOpenMobile={() => setShowMobileSidebar(true)} />
        <MessageList />
        <TypingIndicator />
        <MessageInput />
      </main>
    </div>
  );
}
