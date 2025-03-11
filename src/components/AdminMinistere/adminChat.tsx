import React from 'react';
import { TextField, Button, List, Typography, Box, Avatar, Badge } from '@mui/material';
import { Send } from 'lucide-react';

interface AdminsChatUIProps {
  users: { email: string; role: string }[];
  onlineUsersSet: Set<string>;
  selectedUser: string | null;
  messages: { [key: string]: Array<{ from?: string; to?: string; message?: string; error?: string }> };
  input: string;
  globalError: string | null;
  userEmail: string | undefined;
  onSelectUser: (email: string) => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

const AdminsChatUI: React.FC<AdminsChatUIProps> = ({
  users,
  onlineUsersSet,
  selectedUser,
  messages,
  input,
  globalError,
  userEmail,
  onSelectUser,
  onInputChange,
  onSendMessage,
}) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {globalError && (
        <Typography color="error" sx={{ p: 2 }}>
          {globalError}
        </Typography>
      )}
      <List sx={{ width: '30%', bgcolor: '#f5f3f5', padding: 1 }}>
        {users.filter(u => u.email !== userEmail).map((u) => (
          <Button
            key={u.email}
            fullWidth
            onClick={() => onSelectUser(u.email)}
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
              color={onlineUsersSet.has(u.email) ? 'success' : 'default'}
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
      <Box sx={{ width: '70%', padding: 2 }}>
        {selectedUser ? (
          <>
            <Typography variant="h6">
              Discussion avec {selectedUser}
              {onlineUsersSet.has(selectedUser) && ' (En ligne)'}
            </Typography>
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
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={onSendMessage}
                startIcon={<Send />}
                sx={{ bgcolor: '#6d28d9', '&:hover': { bgcolor: '#5b21b6' } }}
              >
                Envoyer
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            👈 Sélectionnez un administrateur pour commencer
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminsChatUI;