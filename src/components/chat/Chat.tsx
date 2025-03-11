import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthStore } from '../../store/auth';
import MessageComponent from './Message';

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  received: boolean;
  replyToId?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: { [username: string]: string };
  readBy?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [members, setMembers] = useState<{ first_name: string; isOnline: boolean }[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notifications, setNotifications] = useState<{ message: string; sender: string }[]>([]);
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const chatSocket = useRef<WebSocket | null>(null);
  const accessToken = getAuthStore((state) => state.accessToken);
  const currentUser = getAuthStore((state) => state.first_name || 'You');
  const roomName = 'Admin';
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8000/ws/chat/${roomName}/?token=${accessToken}`;
      chatSocket.current = new WebSocket(wsUrl);

      chatSocket.current.onopen = () => {
        console.log('Connected to WebSocket');
        chatSocket.current?.send(JSON.stringify({ type: 'get_members' }));
      };

      chatSocket.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log('Received:', data);

        switch (data.type) {
          case 'chat_message':
            setMessages((prev) => [
              ...prev,
              {
                id: data.id, // Rely solely on backend ID
                sender: data.first_name,
                text: data.message,
                time: new Date(data.time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }),
                received: data.first_name !== currentUser,
                replyToId: data.reply_to,
              },
            ]);
            break;

          case 'notification':
            if (data.sender_name !== currentUser) {
              setNotifications((prev) => [
                ...prev,
                { message: data.message, sender: data.sender_name },
              ]);
              setShowNotificationBox(true);
              const audio = new Audio('/notification_sound.mp3');
              audio.play();
              setTimeout(() => setShowNotificationBox(false), 5000);
            }
            break;

          case 'members':
            setMembers(data.members);
            break;

          case 'member_status':
            setMembers((prev) =>
              prev.map((m) =>
                m.first_name === data.first_name ? { ...m, isOnline: data.isOnline } : m
              )
            );
            break;

          case 'typing':
            if (data.first_name !== currentUser) {
              setTypingUsers((prev) => [...new Set([...prev, data.first_name])]);
              setTimeout(() => setTypingUsers((prev) => prev.filter((u) => u !== data.first_name)), 2000);
            }
            break;

          case 'message_read':
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id
                  ? { ...msg, readBy: [...(msg.readBy || []), data.first_name] }
                  : msg
              )
            );
            break;

          default:
            console.warn('Unhandled message type:', data.type);
        }
      };

      chatSocket.current.onclose = () => console.error('WebSocket closed');
    };

    connectWebSocket();
    return () => chatSocket.current?.close();
  }, [accessToken, roomName, currentUser]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleSendMessage = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (newMessage.trim() && chatSocket.current) {
      const messageData = {
        type: 'chat_message',
        message: newMessage,
        reply_to: replyingTo || null,
      };
      chatSocket.current.send(JSON.stringify(messageData));
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'edit_message', message_id: messageId, new_text: newText }));
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, text: newText, isEdited: true } : m)));
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'delete_message', message_id: messageId }));
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true } : m)));
    }
  };

  const handlePinMessage = (messageId: string) => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'pin_message', message_id: messageId }));
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isPinned: true } : m)));
    }
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'react_to_message', message_id: messageId, emoji }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: { ...m.reactions, [currentUser]: emoji } }
            : m
        )
      );
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    console.log(`Marking message as read: ${messageId}`); // Debug log
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'mark_as_read', message_id: messageId }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, readBy: [...(m.readBy || []), currentUser] } : m
        )
      );
    }
  };

  const handleTyping = () => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'typing' }));
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-72 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl m-4 p-6 transition-all duration-300 hover:shadow-2xl flex flex-col">
        <h2 className="text-xl font-bold text-purple-700 mb-4">Membres ({members.length})</h2>
        <div className="overflow-y-auto h-[calc(100vh-8rem)] scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
          {members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors mb-2"
            >
              <div className="relative">
                <img
                  src={`https://github.com/identicons/${member.first_name}.png`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full mr-3"
                />
                {member.isOnline && (
                  <div className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">{member.first_name}</span>
                <div className="text-xs" style={{ color: member.isOnline ? '#34D399' : '#9CA3AF' }}>
                  {member.isOnline ? 'En ligne' : 'Hors ligne'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl m-4 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">Discussion - {roomName}</h2>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 rounded-xl space-y-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-purple-500 italic"
            >
              {typingUsers.join(', ')} écrit...
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              !msg.isDeleted && (
                <MessageComponent
                  key={msg.id}
                  message={msg}
                  currentUser={currentUser}
                  setReplyingTo={setReplyingTo}
                  handleEditMessage={handleEditMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  handleReactToMessage={handleReactToMessage}
                  handleMarkAsRead={handleMarkAsRead}
                  handlePinMessage={handlePinMessage}
                />
              )
            ))}
          </AnimatePresence>
          <div ref={chatContainerRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="mt-6">
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2 p-2 bg-purple-50 rounded-lg flex justify-between items-center"
            >
              <span className="text-xs text-purple-600">
                Réponse à : {messages.find((m) => m.id === replyingTo)?.text}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-xs text-purple-400 hover:text-purple-600"
              >
                Annuler
              </button>
            </motion.div>
          )}

          <div className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onInput={handleTyping}
              placeholder="Écrivez votre message..."
              className="w-full p-3 pr-20 bg-white rounded-full shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
              >
                😊
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors"
              >
                Envoyer
              </motion.button>
            </div>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1 },
                    exit: { scale: 0 },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute bottom-14 right-0 bg-white p-3 rounded-xl shadow-lg grid grid-cols-6 gap-2 border"
                >
                  {['😀', '😂', '❤️', '👍', '🎉', '😢'].map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-xl p-1 hover:bg-gray-100 rounded"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Notification Box */}
      <AnimatePresence>
        {showNotificationBox && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200"
          >
            <p className="text-sm text-gray-700">
              Nouveau message de <strong>{notifications[notifications.length - 1]?.sender}</strong>:
              <br />
              {notifications[notifications.length - 1]?.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;