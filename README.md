# VisionGPT — Multimodal AI Image & Screenshot Analyzer

[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js_%2B_Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/AI_Primary-Google_Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Groq](https://img.shields.io/badge/AI_Failover-Groq_Cloud-F55036?logo=groq&logoColor=white)](https://console.groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-fidelity **ChatGPT clone** engineered specifically for **unrestricted, zero-cost multimodal image and screenshot analysis**. 

Users can capture any screen (error logs, code snippets, UI designs, system architectures, receipts, math equations) and paste it directly into the chatbox using `Ctrl + V`. The system streams deep, first-principles explanations powered by **Google Gemini** with automatic, seamless failover to **Groq Vision** if rate limits (HTTP 429) or transient downtimes occur.

---

## 🌟 Key Features

### 1. ChatGPT-Parity Dark UI & UX
* **Sleek Aesthetic:** Curated dark palette (`#212121`, `#171717`, `#2f2f2f`) with typography powered by *Inter* and *JetBrains Mono*.
* **Collapsible Sidebar:** Navigation drawer with persistent conversation history, active indicator, and conversation delete actions.
* **Auto-Growing Textarea:** Dynamically expands from 48px up to 200px before introducing inner scrollbars.
* **Streaming Markdown & Code Blocks:** Renders headings, tables, quotes, and syntax-highlighted code blocks with 1-click **"Copy code"** buttons.

### 2. Zero-Friction Screenshot Ingestion
* **Global Clipboard Listener (`Ctrl + V` / `Cmd + V`):** Capture any region with `Win + Shift + S` or `Cmd + Shift + 4` and paste directly anywhere on the page—no need to save a file first.
* **Full-Window Drag-and-Drop:** Drag screenshots onto the viewport to reveal an interactive drop overlay.
* **Floating Attachment Preview Chip:** Shows an instant 56px rounded thumbnail preview, file size metadata, and a remove button before sending.
* **Image Modal Viewer:** Click on any attached screenshot in the chat thread to view full-size.

### 3. Dual-Provider Resilient Architecture (Zero User Downtime)
* **Primary Engine (Google Gemini):** Utilizes Gemini's state-of-the-art OCR and deep reasoning to parse dense code, terminal stack traces, and complex diagrams.
* **Failover Engine (Groq Vision):** High-speed fallback model standing by.
* **Smart Circuit Breaker:** When the primary provider encounters HTTP `429 Too Many Requests` or quota exhaustion, requests immediately divert to Groq with an automatic 30-second cooldown recovery window.
* **Real-Time Streaming:** Server-Sent Events (SSE) stream answers token-by-token with active provider badges.

### 4. Privacy & Bring-Your-Own-Key (BYOK)
* **API Key Settings Modal:** Users can supply their personal free Gemini or Groq keys stored locally in the browser, bypassing server limits without cloud storage costs.
* **Client-Side History:** Chat threads and base64 thumbnail caches stay saved in browser `localStorage`.

---

## 🏗️ System Architecture

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
      [ Priority 1: Google Gemini ]     [ Priority 2: Groq Vision ]
       - SOTA OCR & Image Reasoning      - Failover on HTTP 429/5xx
       - 1,000,000+ token context        - Ultra-low latency LPU engine
       - Primary default route           - OpenAI-compatible vision schema
                 │                             │
                 └──────────────┬──────────────┘
                                │
                                ▼
               [ Server-Sent Events (SSE) Stream ]
                                │
                                ▼
            [ Frontend Markdown + Syntax Highlighting ]
```

---

## 📁 Repository Structure

```
Image-Analyzer-AI/
├── .gitignore
├── README.md
├── MASTER_PROMPT.md
│
├── backend/                          # Node.js & Express API Gateway
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   └── src/
│       ├── server.js                 # Express entry point & middleware (25MB limit)
│       ├── config/
│       │   └── env.js                # Environment configuration & validation
│       ├── controllers/
│       │   └── chat.controller.js    # SSE stream handler & health checks
│       ├── routes/
│       │   └── chat.routes.js        # /api/chat/stream, /api/health
│       ├── services/
│       │   ├── ai-orchestrator.js    # Circuit breaker & failover coordinator
│       │   ├── gemini.service.js     # Google Gemini streaming adapter
│       │   └── groq.service.js       # Groq Vision streaming adapter
│       └── utils/
│           ├── image-helper.js       # Base64 parser, mime detector, size guard
│           └── logger.js             # Formatted terminal logger
│
└── frontend/                         # React + Vite Client Application
    ├── index.html                    # HTML shell with Inter & JetBrains Mono fonts
    ├── vite.config.js                # Vite configuration with API proxy to port 5000
    ├── package.json
    └── src/
        ├── main.jsx                  # React application root mount
        ├── App.jsx                   # Layout, drag-and-drop & clipboard paste listener
        ├── components/
        │   ├── Sidebar/
        │   │   ├── Sidebar.jsx       # Collapsible navigation drawer
        │   │   ├── ChatList.jsx      # Conversation thread history & delete
        │   │   └── ProfileCard.jsx   # API key settings modal trigger
        │   ├── Chat/
        │   │   ├── ChatContainer.jsx # Message list with auto-scroll management
        │   │   ├── MessageItem.jsx   # Bubbles with attachments & provider badges
        │   │   ├── MarkdownView.jsx  # Code syntax highlighter with Copy button
        │   │   └── EmptyState.jsx    # Hero greeting with 4 suggested prompt cards
        │   └── Input/
        │       ├── ChatInput.jsx     # Auto-growing textarea & action buttons
        │       └── ImagePreview.jsx  # Floating thumbnail chip with ✕ remove button
        ├── hooks/
        │   ├── useChat.js            # Message state, localStorage sync & SSE listener
        │   └── useClipboardPaste.js  # Global Ctrl+V screenshot interceptor
        └── styles/
            ├── index.css             # Design tokens & dark mode color variables
            ├── sidebar.css           # Sidebar & modal dialog styles
            ├── chat.css              # Message threads & markdown typography
            └── input.css             # Chatbox, attachment chip & drag overlay
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **API Keys (100% Free Tiers):**
  * [Google AI Studio](https://aistudio.google.com/) (1,500 free requests/day)
  * [Groq Console](https://console.groq.com/) (Free developer tier)

---

### Installation & Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Krish2035/Image-Analyzer-AI.git
cd Image-Analyzer-AI
```

#### 2. Configure Backend Environment
Navigate into `backend/` and create your `.env` configuration:
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and add your free API keys:
```env
PORT=5000
NODE_ENV=development

# Priority 1: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Priority 2: Groq Cloud API Key
GROQ_API_KEY=your_groq_api_key_here

# Cooldown duration in milliseconds when Gemini hits rate limit
GEMINI_COOLDOWN_MS=30000
MAX_IMAGE_SIZE_MB=10
```

#### 3. Install Dependencies
Install packages for both backend and frontend:

```bash
# In backend directory:
npm install

# In frontend directory:
cd ../frontend
npm install
```

---

### Running the Application

Open two terminal windows:

**Terminal 1 — Backend API Gateway:**
```bash
cd backend
npm run dev
# Server listening on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
# Application running at http://localhost:3000
```

Open **`http://localhost:3000`** in your browser.

---

## 💡 How to Use

1. **Take a Screenshot:**
   * **Windows:** Press `Win + Shift + S`
   * **macOS:** Press `Cmd + Shift + 4`
2. **Paste Directly:**
   * Click anywhere in the VisionGPT browser tab and press **`Ctrl + V`** (or **`Cmd + V`**).
   * A thumbnail chip with the file size will appear above the input box.
3. **Analyze:**
   * Type any prompt (e.g., *"Find the root cause of this error"* or *"Generate clean React code for this UI mockup"*).
   * Press **Enter** or click the send button.
4. **Copy Code:**
   * Use the **"Copy code"** button on any generated code block to copy clean snippets directly to your clipboard.

---

## 🔌 API Endpoints

### `POST /api/chat/stream`
Streams token-by-token multimodal chat responses via Server-Sent Events (SSE).

* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "prompt": "Explain what this diagram shows.",
    "image": "data:image/png;base64,iVBORw0KGgoAAA...",
    "userGeminiKey": "optional_override_key",
    "userGroqKey": "optional_override_key"
  }
  ```
* **Event Stream Format:**
  ```
  data: {"type": "meta", "provider": "gemini-3.8-flash", "fallback": false}
  data: {"type": "token", "token": "This "}
  data: {"type": "token", "token": "diagram "}
  data: [DONE]
  ```

### `GET /api/health`
Health check and provider circuit breaker monitoring.

* **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-20T12:00:00.000Z",
    "providers": {
      "gemini": {
        "configured": true,
        "coolingDown": false,
        "cooldownRemainingSeconds": 0
      },
      "groq": {
        "configured": true
      }
    }
  }
  ```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
