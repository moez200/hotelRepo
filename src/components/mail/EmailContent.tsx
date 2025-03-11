// components/EmailContent.tsx
import { useState } from 'react';
import { Bold, Italic, List, AlignLeft, Image, Paperclip, SmilePlus, X } from 'lucide-react';
import { emails } from '../../services/mail.service';
import { EmailCreateRequest } from '../../types/auth';

interface EmailContentProps {
  onClose: () => void;
}

const EmailContent = ({ onClose }: EmailContentProps) => {
  const [newEmail, setNewEmail] = useState({
    subject: '',
    content: '',
    recipients: [] as string[]
  });
  const [recipientInput, setRecipientInput] = useState('');

  const handleSend = async () => {
    try {
      const emailData: EmailCreateRequest = {
        recipients: newEmail.recipients,
        subject: newEmail.subject,
        content: newEmail.content
      };
      
      await emails.send(emailData);
      setNewEmail({ subject: '', content: '', recipients: [] });
      setRecipientInput('');
      onClose(); // Close the composer after sending
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRecipientInput(input);
    const recipientList = input.split(',').map(email => email.trim()).filter(email => email);
    setNewEmail(prev => ({ ...prev, recipients: recipientList }));
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-r100"
    style={{ minWidth: '10px', minHeight: '30rem' }} 
  >
      <div className="border-b p-4 flex justify-between items-center bg-blue-100">
        <span className="text-lg font-semibold text-gray-900">New Message</span>
        <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg">
          <X size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="To (e.g., user1@example.com, user2@example.com)"
          value={recipientInput}
          onChange={handleRecipientChange}
          className="text-lg text-gray-900 w-full border-none focus:outline-none mb-2"
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
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Image size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
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