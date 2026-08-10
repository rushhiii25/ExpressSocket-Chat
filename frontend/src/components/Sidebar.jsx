import React from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Hash, Users, Moon, Sun, LogOut, Circle } from 'lucide-react';

export default function Sidebar({ showMobile, onCloseMobile }) {
  const {
    user,
    logout,
    currentRoom,
    rooms,
    switchRoom,
    usersList,
    theme,
    toggleTheme
  } = useSocket();

  const handleRoomClick = (roomId) => {
    switchRoom(roomId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`sidebar ${showMobile ? 'sidebar-mobile-open' : ''}`}
      style={{
        width: '280px',
        height: '100%',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--panel-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'transform 0.3s ease'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--panel-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>PulseChat</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-Time Messenger</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Channels & Users Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {/* Rooms Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 8px 8px 8px'
          }}>
            Channels
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {rooms.map(room => {
              const isActive = currentRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--primary-accent)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Hash size={18} opacity={isActive ? 1 : 0.7} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {room.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Users List Section */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 8px 8px 8px'
          }}>
            <span>Members ({usersList.length})</span>
            <Users size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {usersList.map(u => {
              const isSelf = user && u.id === user.id;
              const isOnline = u.status === 'online';
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text-main)'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                    />
                    <Circle
                      size={10}
                      fill={isOnline ? 'var(--online-status)' : 'var(--offline-status)'}
                      color="transparent"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        stroke: 'var(--sidebar-bg)',
                        strokeWidth: 2
                      }}
                    />
                  </div>
                  <span style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: isSelf ? 600 : 400
                  }}>
                    {u.username} {isSelf && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(You)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer Card */}
      {user && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--panel-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img
            src={user.avatar}
            alt={user.username}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary-accent)' }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--online-status)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Circle size={8} fill="currentColor" color="transparent" /> Online
            </div>
          </div>
          <button onClick={logout} className="btn-icon" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
