import React, { useState } from 'react';
import { Sparkles, User, ShieldCheck, Zap } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

export function MessageItem({ message }) {
  const isUser = message.role === 'user';
  const [modalImage, setModalImage] = useState(null);

  return (
    <>
      <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
        {!isUser && (
          <div className="message-avatar assistant">
            <Sparkles size={16} />
          </div>
        )}

        <div className="message-content-wrapper">
          {isUser ? (
            <>
              {message.image && (
                <div
                  className="message-image-attachment"
                  onClick={() => setModalImage(message.image)}
                  title="Click to view full image"
                >
                  <img src={message.image} alt="User upload" />
                </div>
              )}
              {message.content && (
                <div className="message-bubble-user">{message.content}</div>
              )}
            </>
          ) : (
            <>
              {message.content ? (
                <MarkdownView content={message.content} />
              ) : (
                message.isStreaming && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Analyzing screenshot...
                  </div>
                )
              )}

              {message.isStreaming && <span className="cursor-blink" />}

              {!message.isStreaming && message.provider && (
                <div className="provider-badge">
                  {message.fallback ? (
                    <>
                      <Zap size={11} color="var(--accent-amber)" />
                      <span>Groq Qwen 3.8 Vision (Failover)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={11} color="var(--accent-green)" />
                      <span>Gemini 3.8 Flash</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {isUser && (
          <div className="message-avatar user">
            <User size={16} />
          </div>
        )}
      </div>

      {modalImage && (
        <div
          className="modal-backdrop"
          onClick={() => setModalImage(null)}
          style={{ cursor: 'zoom-out' }}
        >
          <img
            src={modalImage}
            alt="Full size preview"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
            }}
          />
        </div>
      )}
    </>
  );
}
