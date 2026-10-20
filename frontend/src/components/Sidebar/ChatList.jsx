import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

export function ChatList({ threads, activeThreadId, onSelectThread, onDeleteThread }) {
  if (threads.length === 0) {
    return (
      <div className="chat-list-section">
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 8px' }}>
          No previous chats yet.
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-section">
      <span className="chat-list-label">Recent Chats</span>
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId;
        return (
          <div
            key={thread.id}
            className={`chat-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectThread(thread.id)}
          >
            <MessageSquare size={15} style={{ flexShrink: 0, opacity: 0.7 }} />
            <span className="chat-item-title">{thread.title || 'Conversation'}</span>
            <button
              type="button"
              className="chat-item-delete"
              onClick={(e) => onDeleteThread(thread.id, e)}
              title="Delete conversation"
              aria-label="Delete conversation"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
