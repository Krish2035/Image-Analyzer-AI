# MASTER SPECIFICATION & IMPLEMENTATION PROMPT: CHATGPT-STYLE MULTIMODAL IMAGE ANALYZER AI

> **Target Application:** High-fidelity ChatGPT clone specialized in multimodal screenshot and image analysis with zero user costs, powered by an intelligent failover engine between Google Gemini 1.5 Flash and Groq Llama 3.2 Vision.

---

## 1. PROJECT OBJECTIVE & VALUE PROPOSITION
Build a modern, responsive web application with a user interface identical to ChatGPT (clean dark-mode styling, collapsible sidebar, responsive chat history, markdown code highlighting, and streaming responses).
The core differentiator is **unrestricted, zero-cost image & screenshot analysis**:
- Users can capture any screen (error logs, UI designs, code snippets, diagrams, homework, documents) and paste it directly (`Ctrl+V` / `Cmd+V`) or drag-and-drop it into the chat input.
- An input-level thumbnail chip previews the image with an instant remove button before sending.
- A resilient backend routes requests primarily to **Google Gemini 1.5 Flash** (for state-of-the-art OCR and deep reasoning), with automatic failover to **Groq Llama 3.2 Vision** if Gemini experiences rate-limits (HTTP 429) or transient downtime, streaming the response token-by-token via Server-Sent Events (SSE).

---

## 2. SYSTEM ARCHITECTURE & RESILIENT INFERENCE PIPELINE

```
                      [ User Input Box ]
                (Text Prompt + Pasted Screenshot)
                                │
                                ▼
                       [ Frontend Client ]
                (Converts Image to Base64/DataURL)
                                │
                                ▼ (POST /api/chat/stream)
                    [ Express Backend Gateway ]
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
      [ Priority 1: Gemini 1.5 Flash ]   [ Priority 2: Groq Llama 3.2 Vision ]
       - SOTA OCR & Image Reasoning        - Fallback on HTTP 429/5xx
       - 1,000,000 token context           - Ultra-low latency LPU engine
       - 15 RPM / 1,500 RPD free tier      - OpenAI-compatible vision schema
                 │                             │
                 └──────────────┬──────────────┘
                                │
                                ▼
               [ Server-Sent Events (SSE) Stream ]
                                │
                                ▼
            [ Frontend Markdown + Syntax Highlighting ]
```

### Circuit Breaker & Failover Rules
1. **Primary Provider:** Always dispatch requests to Google Gemini 1.5 Flash.
2. **Burst Limit vs. Cooldown:** If Gemini returns HTTP `429 Too Many Requests`, set a `cooldownUntil = Date.now() + 30_000` (30 seconds) and immediately divert the current request to Groq without failing the user's turn.
3. **Payload Normalizer:**
   - **Gemini Adapter:** Transforms base64 image into `{ inlineData: { mimeType, data } }`.
   - **Groq Adapter:** Transforms base64 image into `{ type: "image_url", image_url: { url: `data:${mimeType};base64,...` } }`.
4. **Streaming Protocol:** Standardize SSE events (`data: {"text": "token"}\n\n` and `data: [DONE]\n\n`).

---

## 3. COMPLETE REPOSITORY FOLDER STRUCTURE

```
Image-Analyzer-AI/
├── .env.example
├── .gitignore
├── README.md
├── MASTER_PROMPT.md
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.js                 # Express server entry point & middleware
│   │   ├── config/
│   │   │   └── env.js                # Environment variable validation & defaults
│   │   ├── controllers/
│   │   │   └── chat.controller.js    # Request validator & SSE stream coordinator
│   │   ├── routes/
│   │   │   └── chat.routes.js        # /api/chat/stream, /api/health
│   │   ├── services/
│   │   │   ├── ai-orchestrator.js    # Resilient provider router & circuit breaker
│   │   │   ├── gemini.service.js     # Gemini 1.5 Flash streaming adapter
│   │   │   └── groq.service.js       # Groq Llama 3.2 Vision streaming adapter
│   │   └── utils/
│   │       ├── image-helper.js       # Base64 validation, mime-type sniffer, size limits
│   │       └── logger.js             # Formatted terminal logging
│   └── tests/
│       └── orchestrator.test.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx                  # Application mount point
    │   ├── App.jsx                   # Main layout container & chat orchestration
    │   ├── styles/
    │   │   ├── index.css             # Design tokens (dark mode colors, typography)
    │   │   ├── chat.css              # Message feed, user/assistant bubble styles
    │   │   ├── input.css             # ChatGPT-style textarea, paste chip, actions
    │   │   └── sidebar.css           # Navigation drawer, thread history, buttons
    │   ├── components/
    │   │   ├── Sidebar/
    │   │   │   ├── Sidebar.jsx       # Collapsible drawer
    │   │   │   ├── ChatList.jsx      # Conversation thread list
    │   │   │   └── ProfileCard.jsx   # User profile / settings trigger
    │   │   ├── Chat/
    │   │   │   ├── ChatContainer.jsx # Main viewport (scroll management)
    │   │   │   ├── MessageItem.jsx   # Individual bubble with avatar & metadata
    │   │   │   ├── MarkdownView.jsx  # Code highlighter with 'Copy Code' button
    │   │   │   └── EmptyState.jsx    # Hero greeting with quick screenshot prompt chips
    │   │   └── Input/
    │   │       ├── ChatInput.jsx     # Auto-resizing textarea & submit handler
    │   │       ├── ImagePreview.jsx  # Floating thumbnail chip with ✕ remove button
    │   │       └── DropZone.jsx      # Full-window drag-and-drop backdrop
    │   ├── hooks/
    │   │   ├── useChat.js            # Chat message state, SSE listener & abort controller
    │   │   ├── useClipboardPaste.js  # Intercepts Ctrl+V for screenshot blobs
    │   │   └── useLocalStorage.js   # Offline chat history persistence
    │   └── utils/
    │       └── formatters.js         # Date & token formatters
```

---

## 4. FRONTEND UX/UI SPECIFICATIONS (CHATGPT PARITY)

### Theme Palette (Dark Mode First)
- Background Primary (Main Viewport): `#212121`
- Background Secondary (Sidebar & Cards): `#171717`
- Input Surface Background: `#2f2f2f`
- Borders & Dividers: `#383838`
- Primary Text: `#ececec`
- Muted / Secondary Text: `#b4b4b4`
- Accent / Brand: `#10a37f` (ChatGPT emerald) or `#3b82f6` (Vision blue)

### Key Micro-Interactions
1. **Seamless Screenshot Paste (`Ctrl+V` / `Cmd+V`):**
   - The user can press `PrintScreen` (or Win+Shift+S) on Windows/Mac and immediately press `Ctrl+V` inside the chat window.
   - The clipboard listener reads `event.clipboardData.items`, extracts `image/png` or `image/jpeg` blobs, converts to data URL, and populates the thumbnail preview chip above the input box.
2. **Auto-Growing Textarea:**
   - Starts at 1 row (`height: 48px`).
   - Automatically expands on multi-line text up to `200px` max height, then seamlessly enables smooth inner scrolling.
3. **Floating Image Attachment Chip:**
   - Displays a small thumbnail (56x56px rounded) with a subtle border and an absolute-positioned `✕` remove button.
   - Shows image filename or dimensions, with a quick zoom modal on click.
4. **Markdown & Code Presentation:**
   - Full Markdown support (tables, lists, blockquotes, bold/italic).
   - Code blocks rendered with dark-theme syntax highlighting, language badge (e.g., `javascript`, `python`), and a 1-click **"Copy Code"** button that changes to **"Copied!"** for 2 seconds.

---

## 5. BACKEND SPECIFICATIONS (STREAMING & FALLBACK)

### Environment Variables (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development

# Priority 1: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Priority 2: Groq Cloud API Key
GROQ_API_KEY=your_groq_api_key_here

# Rate Limit & Cooldown Configuration (in milliseconds)
GEMINI_COOLDOWN_MS=30000
MAX_IMAGE_SIZE_MB=10
```

### AI Orchestrator Logic (`backend/src/services/ai-orchestrator.js`)
```javascript
// High-level orchestration contract
class AIOrchestrator {
  constructor() {
    this.geminiCooldownUntil = 0;
  }

  async streamAnalyze({ prompt, imageBase64, mimeType }, onToken, onError, onDone) {
    const isGeminiCoolingDown = Date.now() < this.geminiCooldownUntil;

    if (!isGeminiCoolingDown && process.env.GEMINI_API_KEY) {
      try {
        await streamGemini({ prompt, imageBase64, mimeType }, onToken);
        return onDone('gemini-1.5-flash');
      } catch (err) {
        if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED')) {
          console.warn('[Orchestrator] Gemini 429 detected. Initiating 30s cooldown and falling back to Groq.');
          this.geminiCooldownUntil = Date.now() + (parseInt(process.env.GEMINI_COOLDOWN_MS) || 30000);
        } else {
          console.warn('[Orchestrator] Gemini error. Attempting Groq fallback:', err.message);
        }
      }
    }

    // Fallback: Groq Llama 3.2 Vision
    if (process.env.GROQ_API_KEY) {
      try {
        await streamGroq({ prompt, imageBase64, mimeType }, onToken);
        return onDone('groq-llama-3.2-vision');
      } catch (groqErr) {
        return onError(groqErr);
      }
    }

    throw new Error('All AI vision providers are currently unavailable or on cooldown.');
  }
}
```

---

## 6. SYSTEM PROMPT FOR THE VISION AI MODEL
The AI must act as a Senior Technical Troubleshooter & Visual Analyst:
> *"You are an elite Visual AI Analyst with supreme OCR, code comprehension, and diagram reverse-engineering abilities. When provided a screenshot, first identify the exact context (e.g. IDE error, terminal output, UI mockup, database schema, math equation, or architectural diagram). Quote exact error lines, identify root causes, and provide immediate, corrected code snippets with logical, first-principles explanations. Never offer vague advice—deliver actionable, production-grade solutions."*

---

## 7. IMPLEMENTATION ROADMAP
1. **Phase 1: Project Scaffolding:** Create `backend/` and `frontend/` workspaces with matching dependencies.
2. **Phase 2: Resilient Backend Engine:** Implement the dual-provider streaming proxy with circuit breaker cooldowns and SSE endpoints.
3. **Phase 3: ChatGPT UI System:** Build the dark theme design system, sidebar layout, message thread, and Markdown parser.
4. **Phase 4: Multimodal Input Engine:** Implement the clipboard paste listener (`Ctrl+V`), drag-and-drop boundary, and input thumbnail chip preview.
5. **Phase 5: End-to-End Testing & Polish:** Verify seamless failover, token streaming responsiveness, and error boundary handling.
