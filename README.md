# PromptCraft AI – Prompt Engineering Tutor

> **Learn to Communicate Better with AI.**
> A production-grade, AI-powered conversational learning assistant and prompt engineering workbench.

---

## 1. Product Overview

**PromptCraft AI** is an intelligent full-stack tutor and workbench designed to teach developers, students, researchers, and professionals how to design, evaluate, and master prompt engineering for modern Large Language Models (LLMs).

Unlike static documentation or basic chatbot demos, PromptCraft AI provides an end-to-end interactive suite:
- **AI Tutor Chat:** Real-time conversational tutoring with structured prompt engineering guidance, in-context learning, and adaptive explanations.
- **Improve My Prompt:** A structured refactoring engine that analyzes weak prompts, applies the RCTCO framework, highlights changes, explains the underlying prompt mechanics, and generates copy-ready prompts.
- **Guided Prompt Generator:** A 10-domain prompt architect that creates production prompts for software development, research, data analysis, marketing, and more.
- **Prompt Engineering Academy:** 10 comprehensive educational modules with learning objectives, weak vs. improved comparisons, and interactive knowledge checks.
- **Practice & Challenges:** Scenario-based interactive challenges across Beginner, Intermediate, and Advanced tiers with automated grading and constructive feedback.
- **Prompt Library:** A curated, searchable repository of 16+ production-ready prompts, with support for local favorites and user-created custom templates.
- **Settings & Diagnostics:** Live provider connectivity status, detailed setup guides, theme toggles, and safe local data backup/export.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with Vite 8 & TypeScript
- **Styling:** Tailwind CSS v4 & Lucide React Icons
- **Formatting:** React Markdown with GitHub Flavored Markdown (tables, syntax blocks)
- **Delight:** Canvas Confetti for celebratory challenge completion
- **Persistence:** Safe, type-safe LocalStorage with error boundaries

### Backend
- **Runtime:** Node.js (v20+) with Express.js & TypeScript
- **Architecture:** Multi-provider abstraction (`IAIProvider`) supporting OpenAI, Google Gemini, Groq, OpenRouter, and local Ollama
- **Security:** In-memory IP rate limiting, Zod schema validation, server-side credential isolation, sanitized logging
- **Reliability:** Timeout protection, graceful error handling for quota/rate limits, transparent status reporting

---

## 3. Project Structure

```text
promptcraft-ai/
├── package.json               # Root scripts to run & build client/server
├── .env.example               # Environment variables template
├── README.md                  # Comprehensive documentation
├── server/                    # Node.js + Express backend service
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts           # Server entry point & middleware
│       ├── config.ts          # Environment & provider configuration
│       ├── prompts/
│       │   └── systemPrompt.ts# Core tutor personality & structured schemas
│       ├── services/
│       │   └── aiProvider.ts  # Multi-provider abstraction (OpenAI, Gemini, Groq, Ollama)
│       └── routes/
│           └── api.ts         # /chat, /improve-prompt, /generate-prompt, /evaluate-answer, /health
└── client/                    # Vite + React + TypeScript frontend
    ├── package.json
    ├── vite.config.ts         # Vite setup with Tailwind v4 & /api proxying
    ├── index.html
    └── src/
        ├── App.tsx            # Main application layout & global state
        ├── index.css          # Tailwind imports & typography
        ├── types/             # TypeScript models & interfaces
        ├── services/
        │   └── api.ts         # Client HTTP API client
        ├── utils/
        │   └── storage.ts     # LocalStorage persistence & backup
        ├── data/
        │   ├── lessons.ts     # 10 comprehensive learning modules
        │   ├── challenges.ts  # 9 interactive practice challenges
        │   └── promptLibrary.ts # 16+ curated prompt templates
        └── components/
            ├── layout/        # Header, Sidebar, Navigation
            ├── chat/          # ChatView, Composer, Markdown bubbles
            ├── improve/       # ImprovePromptView with side-by-side diff
            ├── generate/      # Guided PromptGeneratorView
            ├── learn/         # LearnView & interactive quizzes
            ├── practice/      # PracticeView with rubric scoring
            ├── library/       # PromptLibraryView & custom prompts
            ├── settings/      # SettingsView & diagnostic guides
            └── common/        # Toast notifications, Modal dialogs
```

---

## 4. Installation & Quick Start

### Prerequisites
- Node.js (v18 or higher recommended; tested on v20.20.0)
- npm (v9 or higher)

### Step 1: Install Dependencies
From the `promptcraft-ai` directory, install dependencies for both server and client:
```bash
# In promptcraft-ai/server
cd server
npm install

# In promptcraft-ai/client
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` in `promptcraft-ai/server`:
```bash
cd server
cp .env.example .env
```
Edit `.env` with your preferred AI provider:
```env
PORT=5000
AI_PROVIDER=gemini        # 'openai' | 'gemini' | 'groq' | 'openrouter' | 'ollama'
AI_API_KEY=your_key_here
AI_MODEL=gemini-1.5-flash # or 'gpt-4o-mini' / 'llama-3.3-70b-versatile'
```
*(If no API key is set, the application honestly reports `API Key Not Configured` with full access to lessons, prompt library, and setup guides).*

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1: Start Backend (Port 5000)**
```bash
cd server
npm run dev
```

**Terminal 2: Start Frontend (Port 3000)**
```bash
cd client
npm run dev
```

Open your browser to:
```text
http://localhost:3000
```

---

## 5. Supported AI Providers

| Provider | `AI_PROVIDER` | Default `AI_MODEL` | Notes |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `openai` | `gpt-4o-mini` | Production standard (`https://api.openai.com/v1`) |
| **Google Gemini** | `gemini` | `gemini-1.5-flash` | Generous free tier via Google AI Studio |
| **Groq** | `groq` | `llama-3.3-70b-versatile` | Ultra-fast inference with Llama 3 models |
| **OpenRouter** | `openrouter` | `meta-llama/llama-3.3-70b-instruct` | Universal gateway to dozens of open & proprietary models |
| **Local Ollama** | `ollama` | `llama3:latest` | Completely free, local, and offline (`http://localhost:11434/v1`) |

---

## 6. Security & Architectural Highlights

1. **Zero Frontend Secret Leaks:** All API calls are routed through the Node.js backend. API keys never touch client JavaScript bundles or browser memory.
2. **Graceful Handling of Unconfigured States:** If a key is missing or invalid, PromptCraft AI honestly indicates setup requirements rather than hallucinating or presenting canned responses as live AI output.
3. **The RCTCO Prompting Framework:** Standardizes prompt construction across Role, Context, Task, Constraints, and Output Format.
4. **Resilient Local Persistence:** Stores chats, lesson progress, challenge scores, and custom templates safely in LocalStorage with JSON export/import and one-click reset.
