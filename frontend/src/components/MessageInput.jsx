import React, { useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, Image as ImageIcon, X } from 'lucide-react';

const QUICK_EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '🎉', '🚀', '💯', '👏', '👀'];

export default function MessageInput() {
  const { sendMessage, notifyTyping } = useSocket();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (!val.trim()) {
      // Immediately stop typing indicator if text was deleted/cleared
      notifyTyping(false);
    } else {
      notifyTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        notifyTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    notifyTyping(false);
    sendMessage(text.trim(), 'text');
    setText('');
  };

  const handleSendImage = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    sendMessage(imageUrl.trim(), 'image');
    setImageUrl('');
    setShowImageModal(false);
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="chat-input-container" style={{
      padding: '16px 24px',
      background: 'var(--panel-bg)',
      borderTop: '1px solid var(--panel-border)',
      position: 'relative'
    }}>
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '24px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '16px',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(16px)',
          zIndex: 100
        }}>
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              style={{
                fontSize: '20px',
                padding: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'transform 0.1s ease'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Image Attachment Modal */}
      {showImageModal && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '24px',
          right: '24px',
          maxWidth: '400px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(16px)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Attach Image URL</span>
            <button onClick={() => setShowImageModal(false)} className="btn-icon">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSendImage}>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                marginBottom: '12px',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}>
              Send Image
            </button>
          </form>
        </div>
      )}

      {/* Main Input Bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowImageModal(false);
          }}
          className="btn-icon"
          title="Add Emoji"
        >
          <Smile size={20} />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowImageModal(!showImageModal);
            setShowEmojiPicker(false);
          }}
          className="btn-icon"
          title="Attach Image"
        >
          <ImageIcon size={20} />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '14px',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            color: 'var(--text-main)',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.2s ease'
          }}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="btn btn-primary"
          style={{
            padding: '12px 18px',
            borderRadius: '14px',
            opacity: text.trim() ? 1 : 0.5,
            cursor: text.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
