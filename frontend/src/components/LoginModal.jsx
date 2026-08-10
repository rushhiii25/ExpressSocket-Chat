import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, User, Lock, ArrowRight } from 'lucide-react';

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Zack', 'Callie', 'Milo', 'Bella'];

export default function LoginModal() {
  const { login } = useSocket();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSeed, setSelectedSeed] = useState(AVATAR_SEEDS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedSeed}-${encodeURIComponent(username.trim())}`;
      await login(username.trim(), password.trim(), avatarUrl);
    } catch (err) {
      setError(err.message || 'Failed to enter chat. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
          }}>
            <MessageSquare size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Welcome to PulseChat</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in or register with your credentials</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Choose your Avatar
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {AVATAR_SEEDS.map((seed) => {
                const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                const isSelected = selectedSeed === seed;
                return (
                  <img
                    key={seed}
                    src={avatar}
                    alt={seed}
                    onClick={() => setSelectedSeed(seed)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      padding: '2px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary-accent)' : '2px solid transparent',
                      background: isSelected ? 'var(--primary-glow)' : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                maxLength={20}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In / Register'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
