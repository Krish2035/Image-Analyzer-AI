import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export function ImagePreview({ image, onRemove }) {
  if (!image) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  return (
    <div className="attachment-preview-area">
      <div className="attachment-chip">
        <img src={image.dataUrl} alt="Screenshot preview" />
        <button
          type="button"
          className="chip-remove-btn"
          onClick={onRemove}
          title="Remove screenshot"
          aria-label="Remove screenshot"
        >
          <X size={12} />
        </button>
      </div>
      <div className="chip-meta">
        <span className="chip-name">{image.name || 'Screenshot'}</span>
        <span className="chip-size">{formatSize(image.size)} • Ready for analysis</span>
      </div>
    </div>
  );
}
