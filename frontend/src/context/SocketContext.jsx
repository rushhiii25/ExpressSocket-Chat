import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chat_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General Chat', description: 'Public discussion for everyone' },
    { id: 'tech', name: 'Tech Talk', description: 'Discussion about technology and code' },
    { id: 'random', name: 'Random', description: 'Casual off-topic banter' }
  ]);

  const [messages, setMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('chat_theme') || 'dark');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Initialize theme on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chat_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Socket connection setup
  useEffect(() => {
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Sync user with socket server when logged in
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('user_join', user);
      socket.emit('join_room', currentRoom);
    }
  }, [socket, isConnected, user, currentRoom]);

  // Load message history from REST API on room change
  const loadRoomMessages = useCallback(async (room) => {
    setIsLoadingMessages(true);
    try {
      const history = await api.fetchMessages(room);
      setMessages(history);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Fetch initial rooms & user list
  useEffect(() => {
    api.fetchRooms().then(res => {
      if (res && res.length) setRooms(res);
    }).catch(err => console.error('Failed to fetch rooms:', err));

    api.fetchUsers().then(res => {
      if (res) setUsersList(res);
    }).catch(err => console.error('Failed to fetch users:', err));
  }, []);

  // Load history whenever active room changes
  useEffect(() => {
    loadRoomMessages(currentRoom);
  }, [currentRoom, loadRoomMessages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming real-time message
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.room === currentRoom) {
        setMessages(prev => {
          // Avoid duplicate messages if already sent locally
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Auto mark as read if in active room
        if (user && newMessage.sender_id !== user.id) {
          socket.emit('mark_read', { room: currentRoom, userId: user.id });
        }
      }
    };

    // User typing notification
    const handleUserTyping = ({ username, room, isTyping }) => {
      if (room === currentRoom) {
        setTypingUsers(prev => {
          if (isTyping) {
            if (!prev.includes(username)) return [...prev, username];
            return prev;
          } else {
            return prev.filter(u => u !== username);
          }
        });
      }
    };

    // User online/offline status updates
    const handleUserStatusChange = ({ users }) => {
      if (users && Array.isArray(users)) {
        setUsersList(users);
      }
    };

    // Read receipt updates
    const handleMessagesReadUpdate = ({ room }) => {
      if (room === currentRoom) {
        setMessages(prev =>
          prev.map(m => (m.status !== 'read' ? { ...m, status: 'read' } : m))
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_status_change', handleUserStatusChange);
    socket.on('messages_read_update', handleMessagesReadUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_status_change', handleUserStatusChange);
      socket.off('messages_read_update', handleMessagesReadUpdate);
    };
  }, [socket, currentRoom, user]);

  // Actions
  const login = async (username, password, avatar) => {
    try {
      const userData = await api.loginUser(username, password, avatar);
      setUser(userData);
      localStorage.setItem('chat_user', JSON.stringify(userData));
      if (socket && socket.connected) {
        socket.emit('user_join', userData);
      }
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chat_user');
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  const switchRoom = (roomName) => {
    if (socket && currentRoom) {
      socket.emit('leave_room', currentRoom);
    }
    setCurrentRoom(roomName);
    setTypingUsers([]);
    if (socket) {
      socket.emit('join_room', roomName);
    }
  };

  const sendMessage = (content, type = 'text') => {
    if (!user || !content.trim()) return;

    const messageData = {
      room: currentRoom,
      sender_id: user.id,
      sender_name: user.username,
      sender_avatar: user.avatar,
      content,
      type
    };

    // Send via socket.io for real-time delivery
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    } else {
      // REST API fallback
      api.sendMessage(messageData).then(savedMessage => {
        setMessages(prev => [...prev, savedMessage]);
      });
    }
  };

  const notifyTyping = (isTyping) => {
    if (socket && user) {
      const event = isTyping ? 'typing_start' : 'typing_stop';
      socket.emit(event, { room: currentRoom, username: user.username });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        user,
        login,
        logout,
        currentRoom,
        rooms,
        switchRoom,
        messages,
        isLoadingMessages,
        sendMessage,
        typingUsers,
        notifyTyping,
        usersList,
        theme,
        toggleTheme
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
