import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'visiongpt_conversations';
const SETTINGS_KEY = 'visiongpt_api_keys';

export function useChat() {
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[0]?.id || null;
      }
    } catch {}
    return null;
  });

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : { geminiKey: '', groqKey: '' };
    } catch {
      return { geminiKey: '', groqKey: '' };
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

  // Sync threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [threads]);

  // Sync API keys to localStorage
  const saveApiKeys = (keys) => {
    setApiKeys(keys);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(keys));
  };

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const messages = activeThread?.messages || [];

  const createNewChat = useCallback(() => {
    const newThread = {
      id: Date.now().toString(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  }, []);

  const deleteThread = useCallback((threadId, e) => {
    e?.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    setActiveThreadId((prev) => (prev === threadId ? null : prev));
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const sendMessage = useCallback(
    async ({ prompt, image }) => {
      if ((!prompt?.trim() && !image) || isGenerating) return;

      let currentThreadId = activeThreadId;

      // Auto-create thread if none active
      if (!currentThreadId) {
        const newThread = {
          id: Date.now().toString(),
          title: prompt?.slice(0, 30) || (image ? 'Screenshot Analysis' : 'New Chat'),
          createdAt: new Date().toISOString(),
          messages: [],
        };
        setThreads((prev) => [newThread, ...prev]);
        currentThreadId = newThread.id;
        setActiveThreadId(newThread.id);
      }

      const userMessage = {
        id: 'u_' + Date.now(),
        role: 'user',
        content: prompt?.trim() || '',
        image: image?.dataUrl || null,
        timestamp: new Date().toISOString(),
      };

      const assistantMessageId = 'a_' + (Date.now() + 1);
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        provider: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
      };

      // Append user message and empty streaming assistant message
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === currentThreadId) {
            const isFirst = thread.messages.length === 0;
            return {
              ...thread,
              title: isFirst ? prompt?.slice(0, 30) || 'Screenshot Analysis' : thread.title,
              messages: [...thread.messages, userMessage, assistantMessage],
            };
          }
          return thread;
        })
      );

      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            prompt: prompt?.trim(),
            image: image?.dataUrl,
            userGeminiKey: apiKeys.geminiKey,
            userGroqKey: apiKeys.groqKey,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}: Failed to reach AI service.`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep partial line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;

            const dataContent = trimmed.slice(5).trim();
            if (dataContent === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.type === 'token') {
                setThreads((prev) =>
                  prev.map((t) => {
                    if (t.id === currentThreadId) {
                      return {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: m.content + parsed.token }
                            : m
                        ),
                      };
                    }
                    return t;
                  })
                );
              } else if (parsed.type === 'meta') {
                setThreads((prev) =>
                  prev.map((t) => {
                    if (t.id === currentThreadId) {
                      return {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, provider: parsed.provider, fallback: parsed.fallback }
                            : m
                        ),
                      };
                    }
                    return t;
                  })
                );
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error);
              }
            } catch (err) {
              console.warn('SSE Parse error:', err);
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Stream aborted by user');
        } else {
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === currentThreadId) {
                return {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content:
                            m.content +
                            `\n\n> ⚠️ **Error:** ${err.message}\n> *Tip: Make sure you have configured a valid GEMINI_API_KEY or GROQ_API_KEY in Settings.*`,
                        }
                      : m
                  ),
                };
              }
              return t;
            })
          );
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === currentThreadId) {
              return {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return t;
          })
        );
      }
    },
    [activeThreadId, isGenerating, apiKeys]
  );

  return {
    threads,
    activeThreadId,
    activeThread,
    messages,
    isGenerating,
    apiKeys,
    saveApiKeys,
    setActiveThreadId,
    createNewChat,
    deleteThread,
    sendMessage,
    stopGeneration,
  };
}
