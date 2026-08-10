const API_BASE_URL = '/api';

export const api = {
  // Login or create user with password authentication
  async loginUser(username, password, avatar) {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data.data;
  },

  // Fetch chat history for a room
  async fetchMessages(room = 'general') {
    const res = await fetch(`${API_BASE_URL}/messages?room=${encodeURIComponent(room)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');
    return data.data;
  },

  // Send message via REST API
  async sendMessage(messageData) {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data.data;
  },

  // Fetch list of rooms/channels
  async fetchRooms() {
    const res = await fetch(`${API_BASE_URL}/messages/rooms`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch rooms');
    return data.data;
  },

  // Fetch active registered users
  async fetchUsers() {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.data;
  }
};
