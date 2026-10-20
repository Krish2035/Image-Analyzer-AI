import React from 'react';
import { Plus, PanelLeftClose } from 'lucide-react';
import { ChatList } from './ChatList';
import { ProfileCard } from './ProfileCard';

export function Sidebar({
  isOpen,
  onToggle,
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  onNewChat,
  apiKeys,
  onSaveApiKeys,
}) {
  return (
    <aside className={`sidebar-container ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button type="button" className="new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          <span>New chat</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggle}
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <ChatList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={onSelectThread}
        onDeleteThread={onDeleteThread}
      />

      <ProfileCard apiKeys={apiKeys} onSaveApiKeys={onSaveApiKeys} />
    </aside>
  );
}
