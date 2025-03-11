import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthStore } from '../../store/auth';
import axios from 'axios';
import { debounce } from 'lodash';
import AdminsChatUI from './adminChat';

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

interface WSMessage {
  type?: string;
  users?: any[];
  email?: string;
  status?: string;
  error?: string;
  from?: string;
  to?: string;
  message?: string;
}

const AdminsChatContainer = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [input, setInput] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  // Stabilize store subscription
  const { accessToken, user } = useMemo(
    () =>
      getAuthStore(state => {
        console.log('Auth store accessed:', state); // Debug
        return { accessToken: state.accessToken, user: state.user };
      }),
    []
  );
  const userEmail = user?.email ?? '';
  const roomName = 'Admins';
  const hasMounted = useRef(false);

  // Inline fetchUsers logic into useEffect
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    if (!accessToken) {
      navigate('/login');
      return;
    }

    console.log('Fetching users'); // Debug
    axios
      .get<User[]>('http://127.0.0.1:8000/users/usersChat/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(response => {
        const adminRoles = ['Admin Ministère', 'Admin Entreprise', 'Sous Admin'];
        const adminUsers = response.data.filter(u => adminRoles.includes(u.role));
        setUsers(adminUsers);
      })
      .catch(error => {
        setGlobalError('Échec du chargement des utilisateurs');
        console.error('Error fetching users:', error);
      });
  }, [accessToken, navigate]); // Dependencies moved here

  // Debounced state updates
  const updateOnlineUsers = useMemo(
    () =>
      debounce((newUsers: string[]) => {
        setOnlineUsers(prev => {
          const isEqual = JSON.stringify(prev) === JSON.stringify(newUsers);
          if (!isEqual) console.log('Updating onlineUsers:', newUsers);
          return isEqual ? prev : newUsers;
        });
      }, 100),
    []
  );

  const updateMessages = useMemo(
    () =>
      debounce((partner: string, newMessages: Message[]) => {
        setMessages(prev => {
          const isEqual = JSON.stringify(prev[partner]) === JSON.stringify(newMessages);
          if (!isEqual) console.log('Updating messages for', partner, ':', newMessages);
          return isEqual ? prev : { ...prev, [partner]: newMessages };
        });
      }, 100),
    []
  );

  // Inline WebSocket logic into useEffect
  useEffect(() => {
    if (!accessToken || !userEmail) {
      navigate('/login');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Setting up WebSocket for', userEmail); // Debug
    const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/?token=${accessToken}`);
    wsRef.current = websocket;

    websocket.onopen = () => {
      console.log('WebSocket connected to Admins room');
    };

    websocket.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.type === 'online_users') {
          const emails = data.users?.map((u: any) => (typeof u === 'string' ? u : u.email)) || [];
          updateOnlineUsers(emails);
        } else if (data.type === 'user_status') {
          const newUsers = data.status === 'online'
            ? [...onlineUsers, data.email!].filter((v, i, a) => a.indexOf(v) === i)
            : onlineUsers.filter(email => email !== data.email);
          updateOnlineUsers(newUsers);
        } else if (data.error && data.to) {
          const newMessages = [...(messages[data.to as string] || []), { error: data.error }];
          updateMessages(data.to as string, newMessages);
        } else if (data.error) {
          setGlobalError(data.error);
        } else {
          const message = data;
          const partner = message.from === userEmail ? message.to : message.from;
          const prevMessages = messages[partner!] || [];
          if (!prevMessages.some(msg => msg.message === message.message && msg.from === message.from)) {
            const newMessages = [...prevMessages, message];
            updateMessages(partner!, newMessages);
          }
        }
      } catch (Error) {
        setGlobalError('Format de message invalide');
        console.error('WebSocket message parsing error:', Error);
      }
    };

    websocket.onclose = () => {
      setGlobalError('Connexion au chat interrompue');
      wsRef.current = null;
      console.log('WebSocket closed');
    };

    websocket.onerror = (error) => {
      setGlobalError('Erreur de connexion au chat');
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        console.log('WebSocket cleaned up');
      }
      wsRef.current = null;
    };
  }, [accessToken, userEmail, navigate, onlineUsers, messages]); // All dependencies here

  // Inline sendMessage logic into a handler
  const handleSendMessage = () => {
    if (!userEmail || !wsRef.current || !input.trim() || !selectedUser) return;
    const messagePayload = { message: input, to: selectedUser };
    wsRef.current.send(JSON.stringify(messagePayload));
    console.log('Sending message:', messagePayload);
    setMessages(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), { from: userEmail, to: selectedUser, message: input }],
    }));
    setInput('');
  };

  const onlineUsersSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  return (
    <AdminsChatUI
      users={users}
      onlineUsersSet={onlineUsersSet}
      selectedUser={selectedUser}
      messages={messages}
      input={input}
      globalError={globalError}
      userEmail={userEmail}
      onSelectUser={setSelectedUser}
      onInputChange={setInput}
      onSendMessage={handleSendMessage} // Pass inline handler
    />
  );
};

export default AdminsChatContainer;


