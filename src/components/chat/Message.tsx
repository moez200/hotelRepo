import { motion } from 'framer-motion';
import { Message } from '../../types/auth';
// Importez l'interface Message depuis Chat.tsx

interface MessageProps {
  message: Message;
  currentUser: string;
  setReplyingTo: (id: string) => void;
  handleEditMessage: (id: string, newText: string) => void;
  handleDeleteMessage: (id: string) => void;
  handleReactToMessage: (id: string, emoji: string) => void;
  handleMarkAsRead: (id: string) => void;
  handlePinMessage: (id: string) => void;
}

const MessageComponent = ({
  message,
  currentUser,
  setReplyingTo,
  handleEditMessage,
  handleDeleteMessage,
  handleReactToMessage,
  handleMarkAsRead,
  handlePinMessage,
}: MessageProps) => {
  const isCurrentUser = message.sender === currentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`flex items-start ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex items-start gap-2 max-w-[80%]">
        {!isCurrentUser && (
          <img
            src={`https://github.com/identicons/${message.sender}.png`}
            alt="Profile"
            className="w-8 h-8 rounded-full self-start mt-1"
          />
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 rounded-2xl shadow-sm ${
            isCurrentUser
              ? 'bg-purple-50 border border-purple-100'
              : 'bg-white border border-gray-100'
          } ${message.isPinned ? 'ring-2 ring-yellow-400' : ''}`}
        >
          {message.replyToId && (
            <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded-lg">
              ↪ {message.text}
            </div>
          )}

          <p className="text-sm text-gray-800 leading-relaxed">
            {message.text}
            {message.isEdited && (
              <span className="text-xs text-gray-400 ml-2">(modifié)</span>
            )}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{message.time}</span>
            <div className="flex items-center gap-1 ml-2">
              {message.readBy?.includes(currentUser) && (
                <span className="text-xs text-purple-400">✓✓</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setReplyingTo(message.id)}
              className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
            >
              Répondre
            </button>
            {isCurrentUser && (
              <>
                <button
                  onClick={() =>
                    handleEditMessage(message.id, prompt('Modifier le message', message.text) || message.text)
                  }
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </>
            )}
            <button
              onClick={() => handlePinMessage(message.id)}
              className="text-xs text-yellow-500 hover:text-yellow-700 transition-colors"
            >
              Épingler
            </button>
            <button
              onClick={() => handleReactToMessage(message.id, '👍')}
              className="text-xs"
            >
              👍
            </button>
            <button
              onClick={() => handleMarkAsRead(message.id)}
              className="text-xs text-green-500 hover:text-green-700 transition-colors"
            >
              Lu
            </button>
          </div>

          {message.reactions && (
            <div className="flex gap-1 mt-2">
              {Object.entries(message.reactions).map(([user, emoji]) => (
                <motion.span
                  key={user}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs bg-white px-1.5 py-0.5 rounded-full border"
                >
                  {emoji as string}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageComponent;