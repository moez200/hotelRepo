import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, List, ListItem } from '@mui/material';
import { Send } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FaCircle, FaComments } from 'react-icons/fa';
import { getAuthStore } from '../../store/auth';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_online: boolean;
}

interface Message {
  id: number;
  text: string;
  status: 'pending' | 'sent' | 'received';
  isSentByUser: boolean;
  user: string;
  role: string;
}

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messageId, setMessageId] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(id ? parseInt(id) : null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const accessToken = getAuthStore((state) => state.accessToken);

  // Fetch users
  useEffect(() => {
    fetch('http://127.0.0.1:8000/users/usersChat/')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  // WebSocket connection
  const connectWebSocket = () => {
    if (!accessToken || !selectedUserId) {
      setConnectionStatus('error');
      console.error('Missing accessToken or selectedUserId');
      return;
    }

    const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/global/?token=${(accessToken)}`);
    setWs(websocket);
    setConnectionStatus('connecting');

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
    };

    websocket.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = JSON.parse(event.data);
      if (data.ackId !== undefined) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === data.ackId ? { ...msg, status: 'received' } : msg))
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            text: data.message,
            status: 'received',
            isSentByUser: false,
            user: data.user || 'Unknown',
            role: data.role || 'Unknown',
          },
        ]);
        setMessageId((prev) => prev + 1);
      }
    };

    websocket.onclose = (e) => {
      console.log('WebSocket disconnected:', e.code, e.reason);
      setConnectionStatus('disconnected');
      if (e.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts.current += 1;
          console.log(`Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          connectWebSocket();
        }, 1000 * Math.pow(2, reconnectAttempts.current));
      } else {
        setConnectionStatus('error');
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  // Manage WebSocket lifecycle
  useEffect(() => {
    if (selectedUserId && accessToken) {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [selectedUserId, accessToken]);

  const sendMessage = () => {
    if (ws && input.trim() && selectedUserId && ws.readyState === WebSocket.OPEN) {
      const newMessage: Message = {
        id: messageId,
        text: input,
        status: 'pending',
        isSentByUser: true,
        user: 'currentUser', // Replace with actual logged-in user (e.g., from getAuthStore)
        role: 'user', // Adjust based on your auth system
      };
      setMessages((prev) => [...prev, newMessage]);

      ws.send(
        JSON.stringify({
          message: input,
          id: messageId,
          recipient: selectedUserId,
        })
      );

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'sent' } : msg))
      );
      setMessageId((prev) => prev + 1);
      setInput('');
    } else {
      console.error('Cannot send message: WebSocket not connected or input empty');
      setError('WebSocket not connected. Please check your connection.');
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
      {/* User list */}
      <Box sx={{ width: '25%', bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Utilisateurs
        </Typography>
        {users.map((user) => (
          <ListItem
            key={user.id}
            onClick={() => {
              setSelectedUserId(user.id);
            
            }}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 1,
              bgcolor: selectedUserId === user.id ? '#6d28d9' : 'transparent',
              color: selectedUserId === user.id ? 'white' : 'inherit',
              '&:hover': { bgcolor: selectedUserId === user.id ? '#5b21b6' : '#f0f0f0' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{user.email}</Typography>
              <FaCircle color={user.is_online ? '#22c55e' : '#9ca3af'} size={12} />
            </Box>
          </ListItem>
        ))}
      </Box>

      {/* Chat area */}
      <Box sx={{ flex: 1, ml: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1, mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaComments /> Conversation avec {selectedUser?.email || 'Sélectionnez un utilisateur'}
          </Typography>
        </Box>

        {/* Messages */}
        <List sx={{ flex: 1, maxHeight: '70vh', overflowY: 'auto', bgcolor: 'white', borderRadius: 2, p: 2, boxShadow: 1 }}>
          {messages.map((msg) => (
            <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: msg.isSentByUser ? 'flex-end' : 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1,
                  borderRadius: 2,
                  bgcolor: msg.isSentByUser ? '#6d28d9' : '#e5e7eb',
                  color: msg.isSentByUser ? 'white' : 'black',
                }}
              >
                <Typography variant="body2">{`${msg.role} (${msg.user}): ${msg.text}`}</Typography>
                {msg.isSentByUser && (
                  <Typography variant="caption">
                    {msg.status === 'pending' ? '⏳' : msg.status === 'sent' ? '✅' : '✔✔'}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Connection status */}
        {connectionStatus === 'connecting' && (
          <Typography variant="body2" sx={{ color: 'orange', textAlign: 'center', mt: 1 }}>
            Connexion en cours...
          </Typography>
        )}
        {connectionStatus === 'connected' && (
          <Typography variant="body2" sx={{ color: 'green', textAlign: 'center', mt: 1 }}>
            Connecté
          </Typography>
        )}
        {connectionStatus === 'disconnected' && (
          <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center', mt: 1 }}>
            Déconnecté
          </Typography>
        )}
        {connectionStatus === 'error' && (
          <Typography variant="body2" sx={{ color: 'red', textAlign: 'center', mt: 1 }}>
            Erreur de connexion. Vérifiez votre réseau ou le serveur.
          </Typography>
        )}

        {/* Input area */}
        {selectedUserId && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, position: 'relative' }}>
            <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ minWidth: 'auto', p: 1 }}>
              😀
            </Button>
            {showEmojiPicker && (
              <Box sx={{ position: 'absolute', bottom: '60px', left: 0 }}>
                <EmojiPicker onEmojiClick={(emojiObject: EmojiClickData) => setInput(input + emojiObject.emoji)} />
              </Box>
            )}
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={connectionStatus !== 'connected'}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              startIcon={<Send />}
              sx={{ bgcolor: '#6d28d9', '&:hover': { bgcolor: '#5b21b6' } }}
              disabled={connectionStatus !== 'connected'}
            >
              Envoyer
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;