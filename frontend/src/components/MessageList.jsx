import React, { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Check, CheckCheck, Image as ImageIcon } from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateDivider = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function MessageList() {
  const { messages, user, isLoadingMessages } = useSocket();
  const bottomRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading message history...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: 'var(--primary-accent)'
        }}>
          💬
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No messages yet</h3>
        <p style={{ fontSize: '13px' }}>Be the first to send a message in this channel!</p>
      </div>
    );
  }

  let lastDate = '';

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {messages.map((msg, index) => {
        const isSelf = user && msg.sender_id === user.id;
        const msgDateStr = formatDateDivider(msg.created_at);
        const showDateDivider = msgDateStr !== lastDate;
        if (showDateDivider) lastDate = msgDateStr;

        return (
          <React.Fragment key={msg.id || index}>
            {showDateDivider && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '12px 0'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1px solid var(--panel-border)'
                }}>
                  {msgDateStr}
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: isSelf ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '10px',
              maxWidth: '80%',
              alignSelf: isSelf ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {!isSelf && (
                <img
                  src={msg.sender_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender_name}`}
                  alt={msg.sender_name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginBottom: '2px'
                  }}
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                {!isSelf && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>
                    {msg.sender_name}
                  </span>
                )}

                <div style={{
                  padding: '12px 16px',
                  borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isSelf ? 'var(--chat-bubble-self)' : 'var(--chat-bubble-other)',
                  color: isSelf ? 'var(--chat-bubble-self-text)' : 'var(--chat-bubble-other-text)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  border: isSelf ? 'none' : '1px solid var(--panel-border)'
                }}>
                  {msg.type === 'image' ? (
                    <div>
                      <img
                        src={msg.content}
                        alt="Attachment"
                        style={{ maxWidth: '280px', maxHeight: '280px', borderRadius: '12px', display: 'block', marginBottom: '4px' }}
                      />
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  padding: '0 4px'
                }}>
                  <span>{formatTime(msg.created_at)}</span>
                  {isSelf && (
                    <span style={{ color: msg.status === 'read' ? '#38bdf8' : 'inherit' }}>
                      {msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
