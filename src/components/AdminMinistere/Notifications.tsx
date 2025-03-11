import React, { useState, useEffect } from 'react';
import { FaBell, FaRegBell } from 'react-icons/fa';
import { MdOutlineMarkEmailRead } from 'react-icons/md';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender: string;
}

interface NotificationProps {
  notifications: { id: number; message: string; sender: string; time: string; read: boolean }[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const Notifications: React.FC<NotificationProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const formattedNotifications = notifications.map((n) => ({
      id: n.id,
      title: 'Nouveau message',
      message: n.message,
      timestamp: new Date(n.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: n.read,
      sender: n.sender,
    }));
    setNotificationList(formattedNotifications);
  }, [notifications]);

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const handleNotificationClick = (id: number) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onMarkAsRead(id);
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllAsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-600 relative transition-colors"
      >
        {unreadCount > 0 ? <FaBell className="w-6 h-6" /> : <FaRegBell className="w-6 h-6" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transform origin-top-right transition-all">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <button onClick={markAllAsRead} className="text-blue-600 text-sm hover:underline">
              Tout marquer comme lu
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificationList.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">Aucune notification</div>
            ) : (
              notificationList.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MdOutlineMarkEmailRead className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        De <strong>{notification.sender}</strong>: {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;