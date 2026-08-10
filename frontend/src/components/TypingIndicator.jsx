import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function TypingIndicator() {
  const { typingUsers, user } = useSocket();

  // Filter out current logged in user from typing indicator
  const activeTypers = typingUsers.filter(u => !user || u !== user.username);

  if (activeTypers.length === 0) return null;

  const text =
    activeTypers.length === 1
      ? `${activeTypers[0]} is typing...`
      : activeTypers.length === 2
      ? `${activeTypers[0]} and ${activeTypers[1]} are typing...`
      : 'Multiple people are typing...';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 16px 8px 16px',
      fontSize: '12px',
      color: 'var(--text-muted)',
      fontStyle: 'italic',
      animation: 'fadeIn 0.2s ease-in'
    }}>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span>{text}</span>
    </div>
  );
}
