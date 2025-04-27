import { useState, useEffect } from 'react';
import { Bold, Italic, List, AlignLeft, Image, Paperclip, SmilePlus, X } from 'lucide-react';
import { emails } from '../../services/mail.service';
import { EmailCreateRequest } from '../../types/auth'; // Importer depuis auth.ts

interface EmailContentProps {
  onClose: () => void;
  initialData?: Partial<EmailCreateRequest>;
  onSend?: (data: EmailCreateRequest) => void;
}

const EmailContent = ({ onClose, initialData = {}, onSend }: EmailContentProps) => {
  const [newEmail, setNewEmail] = useState<EmailCreateRequest>({
    subject: initialData.subject || '',
    content: initialData.content || '',
    recipients: initialData.recipients || [],
    attachments: [], // Toujours un tableau, jamais undefined
  });
  const [recipientInput, setRecipientInput] = useState('');

  useEffect(() => {
    if (initialData.recipients && initialData.recipients.length > 0) {
      setRecipientInput(initialData.recipients.join(', '));
    }
  }, [initialData.recipients]);

  const handleSend = async () => {
    try {
      const emailData: EmailCreateRequest = {
        recipients: newEmail.recipients,
        subject: newEmail.subject,
        content: newEmail.content,
        attachments: newEmail.attachments || [],
      };

      if (onSend) {
        onSend(emailData);
      } else {
        await emails.send(emailData);
      }

      setNewEmail({ subject: '', content: '', recipients: [], attachments: [] });
      setRecipientInput('');
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRecipientInput(input);
    const recipientList = input
      .split(',')
      .map(id => id.trim())
      .filter(id => id);
    setNewEmail(prev => ({ ...prev, recipients: recipientList }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewEmail(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), file],
      }));
      const imageUrl = URL.createObjectURL(file);
      setNewEmail(prev => ({
        ...prev,
        content: prev.content + `\n![Image](${imageUrl})\n`,
      }));
    }
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewEmail(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...(e.target.files ? Array.from(e.target.files || []) : [])],
      }));
    }
  };

  const handleEmoji = () => {
    setNewEmail(prev => ({
      ...prev,
      content: prev.content + ' 😊 ',
    }));
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-4" style={{ minWidth: '10px', minHeight: '30rem' }}>
      <div className="border-b p-4 flex justify-between items-center bg-blue-100">
        <span className="text-lg font-semibold text-gray-900">New Message</span>
        <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg">
          <X size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
      <input
          type="text"
          placeholder="To (e.g., 1, 2 for user IDs)"
          value={recipientInput}
          onChange={handleRecipientChange}
          className="text-lg text-gray-900 w-full border-none focus:outline-none mb-2"
          // Supprimer ou ajuster la condition disabled
          disabled={false} // Forcer l'activation pour permettre la saisie
        />
        <input
          type="text"
          placeholder="Subject"
          value={newEmail.subject}
          onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
          className="text-lg text-gray-900 w-full border-none focus:outline-none"
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          placeholder="Write your message..."
          value={newEmail.content}
          onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
          className="w-full h-full resize-none focus:outline-none text-gray-700"
        />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bold size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Italic size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <List size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignLeft size={18} className="text-gray-600" />
            </button>
            <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <Image size={18} className="text-gray-600" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <Paperclip size={18} className="text-gray-600" />
              <input type="file" multiple onChange={handleAttachment} className="hidden" />
            </label>
            <button onClick={handleEmoji} className="p-2 hover:bg-gray-100 rounded-lg">
              <SmilePlus size={18} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleSend}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailContent;