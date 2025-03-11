// components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { Mail, Send, Star, FileEdit, Trash2, Plus, Briefcase, ChevronDown } from 'lucide-react';
import { labels } from '../../services/mail.service';
import { Label } from '../../types/auth';

interface SidebarProps {
  onNewMessage: () => void;
  onEmailTypeChange: (type: 'received' | 'sent' | 'favorites') => void; // Callback to change email type
}

const Sidebar = ({ onNewMessage, onEmailTypeChange }: SidebarProps) => {
  const [userLabels, setUserLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const data = await labels.getAll();
        setUserLabels(data);
      } catch (error) {
        console.error('Failed to fetch labels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, []);

  return (
    <div className="w-64 bg-white h-screen p-4 border-r">
      <button 
        onClick={onNewMessage}
        className="w-full bg-emerald-500 text-white rounded-lg p-3 flex items-center justify-center gap-2 mb-6 hover:bg-emerald-600 transition-colors"
      >
        <Plus size={20} />
        <span>New message</span>
      </button>

      <div className="space-y-1">
        <div 
          onClick={() => onEmailTypeChange('received')}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <Mail className="text-gray-600" size={20} />
          <span className="text-gray-800">received</span>
          <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">1</span>
        </div>
        <SidebarItem icon={<Send size={20} />} label="Sent Emails" onClick={() => onEmailTypeChange('sent')} />
        <SidebarItem icon={<Star size={20} />} label="Favourite" onClick={() => onEmailTypeChange('favorites')} />
        <SidebarItem icon={<FileEdit size={20} />} label="Draft" />
        <SidebarItem icon={<Trash2 size={20} />} label="Deleted" />
      </div>

      <div className="mt-6">
        <button className="flex items-center gap-2 p-2 text-gray-600 w-full">
          <ChevronDown size={16} />
          <span>More</span>
        </button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Labels</span>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-1">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            userLabels.map((label) => (
              <LabelItem key={label.id} color={label.color} label={label.name} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
  >
    <span className="text-gray-600">{icon}</span>
    <span className="text-gray-800">{label}</span>
  </div>
);

const LabelItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
    <Briefcase className={`text-${color}-500`} size={20} />
    <span className="text-gray-800">{label}</span>
  </div>
);

export default Sidebar;