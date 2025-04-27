// components/MailingPage.tsx
import  { useState } from 'react';

import EmailList from './EmailList';
import EmailContent from './EmailContent';
import Sidebar from './SideBar';

function MailingPage() {
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [emailType, setEmailType] = useState<'received' | 'sent' | 'favorites'>('received'); // Default to Inbox

  const handleNewMessage = () => {
    setIsEmailComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsEmailComposerOpen(false);
  };

  const handleEmailTypeChange = (type: 'received' | 'sent' | 'favorites') => {
    setEmailType(type);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen pt-10">
      <Sidebar onNewMessage={handleNewMessage} onEmailTypeChange={handleEmailTypeChange} />
      <div className="p-4 pr-5 min-h-screen w-3/4">
        <EmailList emailType={emailType} />
      </div>
      {isEmailComposerOpen && (
        <div className="fixed inset-0 flex justify-end items-end p-4 pr-20 ">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg h-[80vh] flex flex-col">
            <EmailContent onClose={handleCloseComposer} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MailingPage;