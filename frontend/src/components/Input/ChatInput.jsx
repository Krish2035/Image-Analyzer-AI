import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Paperclip } from 'lucide-react';
import { ImagePreview } from './ImagePreview';

export function ChatInput({
  input,
  setInput,
  image,
  setImage,
  isGenerating,
  onSend,
  onStop,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea height up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!input.trim() && !image) || isGenerating) return;
    onSend();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage({
        file,
        dataUrl: event.target.result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const canSubmit = (input.trim().length > 0 || image) && !isGenerating;

  return (
    <div className="input-container-wrapper">
      <div className="input-box-card">
        {image && (
          <ImagePreview image={image} onRemove={() => setImage(null)} />
        )}

        <div className="input-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/gif"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach screenshot or image (or press Ctrl+V to paste)"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={
              image
                ? 'Ask anything about this screenshot (or press Enter to analyze)...'
                : 'Paste a screenshot (Ctrl+V) or type a question...'
            }
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="action-btn-group">
            {isGenerating ? (
              <button
                type="button"
                className="stop-btn"
                onClick={onStop}
                title="Stop response"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                className="send-btn"
                disabled={!canSubmit}
                onClick={handleSubmit}
                title="Send message"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="input-disclaimer">
        VisionGPT uses Gemini 1.5 Flash with Groq Llama 3.2 Vision failover. Paste screenshots directly with Ctrl+V.
      </div>
    </div>
  );
}
