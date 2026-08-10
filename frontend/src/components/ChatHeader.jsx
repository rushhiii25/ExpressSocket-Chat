import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Hash, Wifi, WifiOff, Menu } from 'lucide-react';

export default function ChatHeader({ onOpenMobile }) {
  const { currentRoom, rooms, isConnected } = useSocket();

  const activeRoomObj = rooms.find(r => r.id === currentRoom) || {
    name: currentRoom,
    description: 'Active chat channel'
  };

  return (
    <header style={{
      height: '64px',
      padding: '0 24px',
      borderBottom: '1px solid var(--panel-border)',
      background: 'var(--panel-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenMobile}
          className="btn-icon mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Hash size={18} />
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.2 }}>
            {activeRoomObj.name}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeRoomObj.description}
          </p>
        </div>
      </div>

      {/* Connection Status Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
        color: isConnected ? 'var(--online-status)' : '#f87171'
      }}>
        {isConnected ? (
          <>
            <Wifi size={14} />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="pulse-dot" />
            <span>Connecting...</span>
          </>
        )}
      </div>
    </header>
  );
}
