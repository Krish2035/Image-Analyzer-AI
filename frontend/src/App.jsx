import React, { useState } from 'react';
import { PanelLeft, Sparkles, ImageUp } from 'lucide-react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatContainer } from './components/Chat/ChatContainer';
import { ChatInput } from './components/Input/ChatInput';
import { useChat } from './hooks/useChat';
import { useClipboardPaste } from './hooks/useClipboardPaste';
import './styles/sidebar.css';
import './styles/chat.css';
import './styles/input.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    threads,
    activeThreadId,
    messages,
    isGenerating,
    apiKeys,
    saveApiKeys,
    setActiveThreadId,
    createNewChat,
    deleteThread,
    sendMessage,
    stopGeneration,
  } = useChat();

  // Window-wide Ctrl+V screenshot paste interceptor!
  useClipboardPaste({
    onImagePasted: (pastedImg) => {
      setImage(pastedImg);
    },
    enabled: true,
  });

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
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
    }
  };

  const handleSend = () => {
    sendMessage({ prompt: input, image });
    setInput('');
    setImage(null);
  };

  const handleSelectSuggestion = (promptText) => {
    setInput(promptText);
  };

  return (
    <div
      className="app-layout"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Backdrop */}
      {isDragging && (
        <div className="drag-overlay">
          <ImageUp size={48} color="var(--accent-green)" />
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Drop your screenshot here</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Instant multimodal analysis with Gemini & Groq
          </p>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onDeleteThread={deleteThread}
        onNewChat={createNewChat}
        apiKeys={apiKeys}
        onSaveApiKeys={saveApiKeys}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        {/* Top Header Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!sidebarOpen && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar"
                aria-label="Open sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}
            <div className="model-selector-pill">
              <span className="status-dot" />
              <span>VisionGPT (Gemini 3.8 Flash + Groq Failover)</span>
            </div>
          </div>
        </header>

        {/* Message Thread Scroll Area */}
        <ChatContainer
          messages={messages}
          onSelectSuggestion={handleSelectSuggestion}
          isGenerating={isGenerating}
        />

        {/* Bottom Floating Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          image={image}
          setImage={setImage}
          isGenerating={isGenerating}
          onSend={handleSend}
          onStop={stopGeneration}
        />
      </main>
    </div>
  );
}
