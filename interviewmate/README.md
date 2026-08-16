# 🎯 InterviewMate

**AI-Powered Technical Interview Practice Platform**

InterviewMate is a full-stack web application that helps developers and engineers prepare for technical interviews with AI-generated questions, real-time code execution, instant scoring, and personalized feedback.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)

---

## ✨ Features

### 🧠 AI Mock Interviews
- Select a tech domain (React, Node.js, Python, SQL, DSA, System Design, and more) and difficulty level
- AI generates 10 calibrated interview questions per session (8 MCQs + 2 coding/theory)
- Step through questions with countdown timers
- Receive AI-powered scoring and detailed feedback per answer
- Get an overall performance summary with strengths, improvements, and recommendations

### 💻 Interactive Code Editor
- Built-in Monaco Editor (VS Code engine) with syntax highlighting
- Support for Python, JavaScript, TypeScript, C++, Java, Go, and C
- **Real code execution** via [Judge0 CE](https://judge0.com/) — your code actually runs against test cases
- LeetCode-style test case panel with expected vs actual output comparison
- Auto-save drafts per challenge and language

### 📝 Practice Mode
- Browse a curated question bank filtered by domain and difficulty
- 10+ coding challenges (Two Sum, LRU Cache, Top K Frequent Elements, etc.)
- Bookmark questions for later review
- AI Tutor chat for hints and explanations

### 📄 Resume-Based Interview Prep
- Upload your resume (PDF) for AI-parsed skill extraction
- Generate interview questions personalized to your skills, experience level, and target role
- Seniority-calibrated difficulty (Junior → fundamentals, Senior → architecture trade-offs)

### 🏢 Company-Specific Prep
- Browse interview patterns for 50+ companies (Google, Amazon, Meta, etc.)
- Company-tagged questions with difficulty breakdowns
- Acceptance rate and question frequency data

### 🏆 Leaderboard & Gamification
- Global leaderboard ranked by total points
- Practice streaks and session tracking
- Points earned from mock interviews and practice sessions

### 🔐 Authentication
- Google OAuth sign-in via [Better Auth](https://www.better-auth.com/)
- Session management with secure cookie handling
- Role-based access control (User / Admin)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS 4, shadcn/ui, Radix UI |
| **Routing** | TanStack Router + TanStack Start (SSR) |
| **Code Editor** | Monaco Editor (@monaco-editor/react) |
| **AI Engine** | Groq API (Llama 3.1 8B) with Pollinations fallback |
| **Code Execution** | Judge0 CE (free, sandboxed remote execution) |
| **Auth** | Better Auth v1.1 with Google OAuth |
| **Database** | SQLite via LibSQL + Kysely ORM |
| **Build Tool** | Vite 8.2 + Nitro (server runtime) |
| **Deployment** | Cloudflare Workers |
| **Package Manager** | Bun |

---

## 📁 Project Structure

```
interviewmate/
├── src/
│   ├── assets/              # Static images and assets
│   ├── components/          # Reusable UI components (shadcn/ui based)
│   │   ├── ui/              # Base UI primitives (Button, Card, Dialog, etc.)
│   │   ├── AuthForm.tsx     # Google OAuth sign-in form
│   │   ├── TestRunnerPanel.tsx  # Code execution results panel
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.tsx      # Authentication state hook
│   ├── lib/                 # Core business logic
│   │   ├── auth.ts          # Better Auth server configuration
│   │   ├── auth-client.ts   # Better Auth client
│   │   ├── challenges.ts    # Coding challenge definitions & test cases
│   │   ├── grok.ts          # AI question generation & chat streaming
│   │   ├── piston.ts        # Code execution engine (Judge0 CE integration)
│   │   ├── questionBank.ts  # Practice question repository
│   │   ├── resumeStore.ts   # Resume parsing & storage
│   │   └── ...
│   ├── routes/              # TanStack Router file-based routes
│   │   ├── index.tsx        # Landing page
│   │   ├── sign-in.tsx      # Sign in page
│   │   ├── sign-up.tsx      # Sign up page
│   │   ├── api/             # API route handlers
│   │   │   ├── auth/$.ts    # Auth API catch-all
│   │   │   ├── chat.ts      # AI chat streaming endpoint
│   │   │   ├── call.ts      # AI API proxy endpoint
│   │   │   └── questions.ts # Question generation endpoint
│   │   └── _authenticated/user/
│   │       ├── dashboard.tsx    # Main coding workspace + AI chat
│   │       ├── practice.tsx     # Question bank browser
│   │       ├── mockinterview.tsx # Mock interview flow
│   │       ├── resume.tsx       # Resume upload & analysis
│   │       ├── companies.tsx    # Company-specific prep
│   │       ├── bookmarks.tsx    # Saved questions
│   │       └── ...
│   ├── server/              # Server-side API handlers
│   │   └── api-handlers.ts  # Groq API proxy implementations
│   └── styles.css           # Global styles
├── public/                  # Static public assets
├── wrangler.toml            # Cloudflare Workers configuration
├── vite.config.ts           # Vite + TanStack Start + Nitro config
├── tsconfig.json            # TypeScript configuration
├── tsr.config.json          # TanStack Router config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ or [Bun](https://bun.sh/) v1.1+
- A [Groq API Key](https://console.groq.com/) (free tier available)
- A [Google OAuth Client](https://console.cloud.google.com/apis/credentials) for sign-in

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/interviewmate.git
cd interviewmate

# Install dependencies
bun install
# or
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Authentication
BETTER_AUTH_SECRET="your_secret_key_minimum_32_bytes"
VITE_BETTER_AUTH_SECRET="your_secret_key_minimum_32_bytes"
BETTER_AUTH_URL="http://localhost:8080"
VITE_BETTER_AUTH_URL="http://localhost:8080"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"

# Groq AI API
GROQ_API_KEY="your_groq_api_key"
VITE_GROQ_API_KEY="your_groq_api_key"
VITE_GROQ_API_URL="https://api.groq.com/openai/v1"
VITE_GROQ_MODEL="llama-3.1-8b-instant"
```

### Development

```bash
# Start the development server
bun run dev
# or
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

```bash
# Build for production
bun run build
# or
npm run build

# Preview the production build
npx vite preview
```

---

## ☁️ Deployment (Cloudflare Workers)

The project deploys to Cloudflare Workers via Wrangler:

```bash
# Login to Cloudflare
npx wrangler login

# Build and deploy
npm run build
npx wrangler deploy
```

For CI/CD (Cloudflare dashboard), set the **Build command** to:
```
npm install && npm run build && npx wrangler deploy
```

And the **Root directory** to `interviewmate` if the project is in a subdirectory.

---

## 🧪 Code Execution Architecture

InterviewMate uses **Judge0 CE** (Community Edition) for sandboxed code execution:

```
User clicks "Run" → executeCodeInSandbox()
  → Generates language-specific test harness
    (parses test inputs, calls user's function/class, captures output)
  → Sends wrapped code to Judge0 CE API
  → Parses stdout RESULT: lines
  → Compares actual vs expected output
  → Returns pass/fail per test case
```

**Supported problem types:**
- **Function-based** — `def twoSum(nums, target)` → auto-parses args and calls function
- **Class-based** — `class LRUCache` → instantiates class and calls methods in sequence
- **Linked List** — auto-generates `ListNode` helper and list builder utilities

---

## 🤖 AI Integration

InterviewMate uses **Groq Cloud** (Llama 3.1 8B Instant) for:

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Question Generation | `/api/questions` | Generates 10 domain-calibrated interview questions |
| AI Chat | `/api/chat` | Streaming AI tutor for hints, code review, explanations |
| Code Evaluation | `/api/call` | AI-powered code quality scoring and feedback |

Fallback chain: Groq API → Pollinations API → Offline domain-aware question bank

---

## 📸 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero section, feature highlights, CTA |
| Sign In | `/sign-in` | Google OAuth authentication |
| Dashboard | `/user/dashboard` | Code editor, AI chat, challenge workspace |
| Practice | `/user/practice` | Question bank with domain/difficulty filters |
| Mock Interview | `/user/mockinterview` | Timed AI mock interview sessions |
| Resume Prep | `/user/resume` | Upload resume for personalized questions |
| Companies | `/user/companies` | Company-specific interview patterns |
| Bookmarks | `/user/bookmarks` | Saved questions for review |
| History | `/user/history` | Past session history |
| Settings | `/user/settings` | Account preferences |

---

## 📄 License

This project is private and not licensed for redistribution.

---

## 🙏 Acknowledgments

- [Judge0](https://judge0.com/) — Open-source code execution system
- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible component library
- [TanStack](https://tanstack.com/) — Type-safe routing and state management
- [Better Auth](https://www.better-auth.com/) — Authentication framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code's editor engine
