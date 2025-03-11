import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaGlobeAmericas, FaGlobeAsia, FaGlobeAfrica, FaUser, FaSignOutAlt, FaKey, FaEnvelope } from 'react-icons/fa';
import profile from '../../assets/profile.png';
import { useTranslation } from 'react-i18next';
import { getAuthStore } from '../../store/auth';
import Notifications from './Notifications';
import { Mail } from 'lucide-react';


const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; message: string; sender: string; time: string; read: boolean }[]
  >([]);
  const chatSocket = useRef<WebSocket | null>(null);
  const accessToken = getAuthStore((state) => state.accessToken);
  const currentUser = getAuthStore((state) => state.first_name || 'You');

  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8000/ws/chat/Admin/?token=${accessToken}`;
      chatSocket.current = new WebSocket(wsUrl);

      chatSocket.current.onopen = () => {
        console.log('Header WebSocket Connected');
        chatSocket.current?.send(JSON.stringify({ type: 'get_notifications' }));
      };

      chatSocket.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log('Header Received:', data);

        if (data.type === 'notification' && data.sender_name !== currentUser) {
          setNotifications((prev) => [
            {
              id: data.notification_id,
              message: data.message,
              sender: data.sender_name,
              time: data.time,
              read: data.read,
            },
            ...prev,
          ]);
          const audio = new Audio('/notification_sound.mp3');
          audio.play();
        } else if (data.type === 'notification_read') {
          setNotifications((prev) =>
            prev.map((n) => (n.id === data.notification_id ? { ...n, read: true } : n))
          );
        } else if (data.type === 'all_notifications_read') {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }
      };

      chatSocket.current.onclose = () => console.error('Header WebSocket closed');
    };

    if (accessToken) {
      connectWebSocket();
    }

    return () => chatSocket.current?.close();
  }, [accessToken, currentUser]);

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleNotificationMarkAsRead = (id: number) => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'mark_notification_as_read', notification_id: id }));
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (chatSocket.current) {
      chatSocket.current.send(JSON.stringify({ type: 'mark_all_notifications_as_read' }));
    }
  };

  return (
    <aside className="fixed top-1/2 -translate-y-1/2 right-0 h-[600px] w-20 bg-white shadow-lg flex flex-col items-center justify-between py-6 z-50 transition-all border-l rounded-l-2xl">
      <div className="flex flex-col items-center space-y-10">
        <img
          src={profile}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover border border-gray-300 hover:border-blue-400 transition-all cursor-pointer"
          onClick={toggleProfileMenu}
        />
      </div>

      {isProfileMenuOpen && (
        <div className="absolute top-20 right-20 bg-white shadow-lg rounded-lg w-48 p-4 space-y-4 border">
          <Link to="/MinistereProfile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <FaUser /> <span>{t('Mon Compte')}</span>
          </Link>
          <Link to="/email" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <FaEnvelope /> <span>{t('Email')}</span>
          </Link>
          <Link to="/ChangePassword" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <FaKey /> <span>{t('Changer le Mot de Passe')}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 w-full"
          >
            <FaSignOutAlt /> <span>{t('Se Déconnecter')}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col items-center space-y-6">
        <Notifications
          notifications={notifications}
          onMarkAsRead={handleNotificationMarkAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        />
      </div>
     
      <Link to="/Mail" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <Mail /> 
          </Link>

      <div className="flex flex-col items-center space-y-3">
        <button onClick={() => changeLanguage('en')}>
          <FaGlobeAmericas className="text-blue-600 text-2xl hover:text-blue-800" />
        </button>
        <button onClick={() => changeLanguage('fr')}>
          <FaGlobeAfrica className="text-blue-600 text-2xl hover:text-blue-800" />
        </button>
        <button onClick={() => changeLanguage('ar')}>
          <FaGlobeAsia className="text-blue-600 text-2xl hover:text-blue-800" />
        </button>
      </div>
    </aside>
  );
};

export default Header;