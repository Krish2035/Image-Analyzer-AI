import { useEffect } from 'react';

export function useClipboardPaste({ onImagePasted, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              onImagePasted({
                file: blob,
                dataUrl: event.target.result,
                name: blob.name || `screenshot_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.png`,
                size: blob.size,
                type: blob.type || 'image/png',
              });
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImagePasted, enabled]);
}
