import React, { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

export function ChatContainer({ messages, onSelectSuggestion, isGenerating }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on streaming messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="chat-scroll-area">
      {messages.length === 0 ? (
        <EmptyState onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <div className="messages-wrapper">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={bottomRef} style={{ height: '1px' }} />
        </div>
      )}
    </div>
  );
}
