import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextField, Button, List, Typography, Box, Avatar, Badge } from '@mui/material';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuthStore } from '../../store/auth'; // Adjust path as needed

interface User {
  email: string;
  role: string;
}

interface Message {
  from?: string;
  to?: string;
  message?: string;
  role?: string;
  error?: string;
}

const Chat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const { accessToken, user } = getAuthStore(state => ({
    accessToken: state.accessToken,
    user: state.user,
  }));
  const userEmail = user?.email;

  // Fetch users on mount
  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [accessToken, navigate]);

  // WebSocket setup
  useEffect(() => {
    if (!accessToken) return;

    const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${accessToken}`);
    wsRef.current = websocket;

    websocket.onopen = () => console.log('WebSocket connected');

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'online_users') {
        setOnlineUsers(new Set(data.users));
      } else if (data.type === 'user_status') {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          data.status === 'online' ? newSet.add(data.email) : newSet.delete(data.email);
          return newSet;
        });
      } else if (data.error && data.to) {
        setMessages(prev => ({
          ...prev,
          [data.to]: [...(prev[data.to] || []), { error: data.error }],
        }));
      } else {
        const message = data;
        const partner = message.from === userEmail ? message.to : message.from;
        setMessages(prev => ({
          ...prev,
          [partner]: [...(prev[partner] || []), message],
        }));
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      navigate('/login');
    };

    websocket.onerror = (error) => console.error('WebSocket error:', error);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) websocket.close();
      wsRef.current = null;
    };
  }, [accessToken, navigate, userEmail]);

  // Send message function
  const sendMessage = useCallback(() => {
    if (wsRef.current && input.trim() && selectedUser) {
      const messagePayload = { message: input, to: selectedUser };
      wsRef.current.send(JSON.stringify(messagePayload));
      setInput('');
    }
  }, [input, selectedUser]);

  // UserList component with Button
  const UserList = () => (
    <List sx={{ width: '30%', bgcolor: '#f5f3f5', padding: 1 }}>
      {users.filter(u => u.email !== userEmail).map((u) => (
        <Button
          key={u.email}
          fullWidth
          onClick={() => setSelectedUser(u.email)}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            bgcolor: selectedUser === u.email ? '#e0e0e0' : 'transparent',
            '&:hover': { bgcolor: '#e0e0e0' },
            padding: 1,
            marginBottom: 1,
            borderRadius: 1,
          }}
        >
          <Badge
            color={onlineUsers.has(u.email) ? 'success' : 'default'}
            variant="dot"
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Avatar sx={{ bgcolor: '#6d28d9', marginRight: 1 }}>
              {u.email[0].toUpperCase()}
            </Avatar>
          </Badge>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1">{u.email}</Typography>
            <Typography variant="body2" color="textSecondary">{u.role}</Typography>
          </Box>
        </Button>
      ))}
    </List>
  );

  // ChatBox component
  const ChatBox = () => (
    <Box sx={{ width: '70%', padding: 2 }}>
      {selectedUser ? (
        <>
          <Typography variant="h6">Discussion avec {selectedUser}</Typography>
          <List sx={{ maxHeight: 400, overflowY: 'auto', bgcolor: '#fff', borderRadius: 1, padding: 1 }}>
            {(messages[selectedUser] || []).map((msg, index) => (
              msg.error ? (
                <Typography key={index} sx={{ color: 'red', padding: 1 }}>{msg.error}</Typography>
              ) : (
                <Box
                  key={index}
                  sx={{
                    textAlign: msg.from === userEmail ? 'right' : 'left',
                    marginBottom: 1,
                  }}
                >
                  <Typography
                    sx={{
                      display: 'inline-block',
                      bgcolor: msg.from === userEmail ? '#e0f7fa' : '#f0f0f0',
                      padding: 1,
                      borderRadius: 1,
                    }}
                  >
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    {msg.from === userEmail ? 'Vous' : msg.from}
                  </Typography>
                </Box>
              )
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              startIcon={<Send />}
              sx={{ bgcolor: '#6d28d9', '&:hover': { bgcolor: '#5b21b6' } }}
            >
              Envoyer
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="h6">Sélectionnez un utilisateur pour commencer la discussion</Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <UserList />
      <ChatBox />
    </Box>
  );
};

export default Chat;