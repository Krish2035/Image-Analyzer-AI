import React from 'react';
import { Eye, Bug, Code, Network, FileText } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Bug,
    title: 'Debug Error Screenshot',
    desc: 'Paste a terminal or IDE error to get root cause & fix.',
    prompt: 'Analyze this error screenshot, find the root cause, and provide the exact corrected code.',
  },
  {
    icon: Code,
    title: 'UI Mockup to Code',
    desc: 'Paste a website or app design to generate clean HTML/CSS.',
    prompt: 'Convert the UI components visible in this screenshot into clean, responsive HTML and CSS.',
  },
  {
    icon: Network,
    title: 'Explain System Architecture',
    desc: 'Understand complex flowcharts, cloud diagrams & schemas.',
    prompt: 'Explain the architecture and data flows illustrated in this diagram step-by-step.',
  },
  {
    icon: FileText,
    title: 'OCR & Data Extraction',
    desc: 'Extract tables, receipts, or dense text with formatting.',
    prompt: 'Extract all text and tabular data from this image and format it cleanly into Markdown.',
  },
];

export function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="empty-state">
      <div className="hero-icon-wrapper">
        <Eye size={32} />
      </div>

      <div>
        <h1 className="hero-title">What would you like to analyze?</h1>
        <p className="hero-subtitle">
          Capture any screen with <code>Win + Shift + S</code> or <code>Cmd + Shift + 4</code>, then simply press <code>Ctrl + V</code> anywhere in this window to start.
        </p>
      </div>

      <div className="prompt-suggestions-grid">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              className="suggestion-card"
              onClick={() => onSelectSuggestion(item.prompt)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} color="var(--accent-green)" />
                <span className="suggestion-card-title">{item.title}</span>
              </div>
              <span className="suggestion-card-desc">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
