import { useState, useEffect } from 'react';
import { ArrowLeft, Reply, Forward, X, Paperclip } from 'lucide-react';
import { emails } from '../../services/mail.service';
import { Email, EmailAttachment, EmailCreateRequest } from '../../types/auth';
import EmailContent from './EmailContent';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onReply: (emailId: number) => void;
  onForward: (emailId: number) => void;
}

const EmailDetail = ({ email, onClose, onReply, onForward }: EmailDetailProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [thread, setThread] = useState<Email[]>([]);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);

  useEffect(() => {
    const fetchThreadAndAttachments = async () => {
      try {
        const threadData = await emails.getThread(email.id);
        const attachmentsData = await emails.getAttachments(email.id);
        console.log('Thread data:', threadData); // Débogage
        console.log('Attachments data:', attachmentsData); // Débogage
        setThread(Array.isArray(threadData) ? threadData : []);
        setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
      } catch (error) {
        console.error('Failed to fetch thread or attachments:', error);
        setThread([]);
        setAttachments([]); // Réinitialiser en cas d'erreur
      }
    };

    fetchThreadAndAttachments();
  }, [email.id]);

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleForward = () => {
    setIsForwarding(true);
  };

  const handleSendReplyOrForward = async (data: EmailCreateRequest) => {
    try {
      if (isReplying) {
        await emails.reply(email.id, data);
      } else if (isForwarding) {
        await emails.forward(email.id, data);
      }
      setIsReplying(false);
      setIsForwarding(false);
      onClose();
      const updatedThread = await emails.getThread(email.id);
      setThread(Array.isArray(updatedThread) ? updatedThread : []);
    } catch (error) {
      console.error('Failed to send reply/forward:', error);
    }
  };

  if (isReplying || isForwarding) {
    return (
      <EmailContent
        onClose={() => {
          setIsReplying(false);
          setIsForwarding(false);
          onClose();
        }}
        initialData={{
          subject: isReplying ? `Re: ${email.subject}` : `Fwd: ${email.subject}`,
          content: isReplying ? `\n\nOn ${new Date(email.created_at).toLocaleString()}, ${email.sender_username} wrote:\n${email.content}` : email.content,
          recipients: isReplying ? [String(email.sender_id)] : [],
        }}
        onSend={handleSendReplyOrForward}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-3/4 h-3/4 flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-900">Email Thread</span>
          <div className="flex gap-2">
            <button onClick={handleReply} className="p-2 hover:bg-gray-100 rounded-lg">
              <Reply size={18} className="text-gray-600" />
            </button>
            <button onClick={handleForward} className="p-2 hover:bg-gray-100 rounded-lg">
              <Forward size={18} className="text-gray-600" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Discussion</h2>
            {[...thread, email].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((message) => (
              <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_username)}&background=random`}
                    alt={message.sender_username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-800 font-medium">{message.sender_username}</span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          {Array.isArray(attachments) && attachments.length > 0 ? (
  <div className="space-y-4">
    <h2 className="text-xl font-bold">Attachments</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {attachments.map((attachment) => {
        const isImage = attachment.file.includes('.jpg') || attachment.file.includes('.jpeg') || attachment.file.includes('.png') || false;
        return (
          <div key={attachment.id} className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
            {isImage ? (
              <img
                src={attachment.file.url}
                alt="Attachment"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <Paperclip size={20} className="text-gray-600" />
            )}
<span className="text-gray-800 truncate">{(typeof attachment.file === 'string' ? (attachment.file as string).split('/').pop() : 'Attachment') || 'Attachment'}</span>            {isImage && (
              <a
                href={attachment.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-500 hover:underline"
              >
                View
              </a>
            )}
          </div>
        );
      })}
    </div>
  </div>
) : (
  <p>No attachments available.</p>
)}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;