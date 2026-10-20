import React, { useState } from 'react';
import { Settings, Key, X, Check } from 'lucide-react';

export function ProfileCard({ apiKeys, onSaveApiKeys }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(apiKeys.geminiKey || '');
  const [groqKey, setGroqKey] = useState(apiKeys.groqKey || '');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleOpen = () => {
    setGeminiKey(apiKeys.geminiKey || '');
    setGroqKey(apiKeys.groqKey || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSaveApiKeys({ geminiKey: geminiKey.trim(), groqKey: groqKey.trim() });
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <>
      <div className="sidebar-footer">
        <button type="button" className="footer-btn" onClick={handleOpen}>
          <Settings size={16} />
          <span>API Key Settings</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--accent-green)" />
                <h3 className="modal-title">Custom API Keys</h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Optional: If the server pool is depleted or you want to use your personal free quotas, provide your own keys here. They stay safely in your browser.
              </p>

              <div className="input-field-group">
                <label className="input-label">Google Gemini API Key (Priority 1)</label>
                <input
                  type="password"
                  className="text-input"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Free from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)' }}>Google AI Studio</a> (1,500 requests/day).
                </span>
              </div>

              <div className="input-field-group">
                <label className="input-label">Groq Cloud API Key (Priority 2 Fallback)</label>
                <input
                  type="password"
                  className="text-input"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Free from <a href="https://console.groq.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)' }}>Groq Console</a>.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {savedAlert ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Keys</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
