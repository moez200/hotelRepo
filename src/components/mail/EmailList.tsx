// components/EmailList.tsx
import { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { emails } from '../../services/mail.service';
import { Email } from '../../types/auth';
import EmailDetail from './EmailDetail';

type EmailType = 'received' | 'sent' | 'favorites';

interface EmailListProps {
  emailType: EmailType;
}

const EmailList = ({ emailType }: EmailListProps) => {
  const [emailList, setEmailList] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        let data: Email[];
        switch (emailType) {
          case 'sent':
            data = await emails.getSent();
            break;
          case 'favorites':
            data = await emails.getFavorites();
            break;
          case 'received':
          default:
            data = await emails.getReceived();
            break;
        }
        setEmailList(data);
      } catch (err) {
        setError('Failed to load emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [emailType]);

  const handleToggleFavorite = async (id: number, currentFavorite: boolean) => {
    try {
      await emails.toggleFavorite(id);
      setEmailList(prev =>
        prev.map(email =>
          email.id === id ? { ...email, is_favorite: !currentFavorite } : email
        )
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  const handleReply = (emailId: number) => {
    // Vous pouvez ajouter une logique supplémentaire ici si nécessaire
    console.log('Replying to email:', emailId);
    setSelectedEmail(null); // Fermer les détails après réponse
  };

  const handleForward = (emailId: number) => {
    console.log('Forwarding email:', emailId);
    setSelectedEmail(null); // Fermer les détails après transfert
  };

  if (loading) {
    return (
      <div className="p-4 pr-5 min-h-screen w-3/4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pr-5 min-h-screen w-3/4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 pr-5 min-h-screen w-3/4">
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          onClose={handleCloseDetail}
          onReply={handleReply}
          onForward={handleForward}
        />
      )}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-y-auto">
        {emailList.length === 0 ? (
          <p className="text-gray-500 p-4">No emails found.</p>
        ) : (
          emailList.map((email) => (
            <div
              key={email.id}
              onClick={() => handleEmailClick(email)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.sender_username)}&background=random`}
                  alt={email.sender_username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{email.sender_username}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{email.subject}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Empêche l'ouverture des détails
                  handleToggleFavorite(email.id, email.is_favorite);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Star
                  size={20}
                  className={email.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}
                />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;