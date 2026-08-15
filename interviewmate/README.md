# Interview Mate

Lovable Prompt: InterviewMate

Paste everything below into Lovable as your first message.

Build a full-stack web app called InterviewMate — an AI-powered technical interview practice platform. Use React + Vite + TypeScript + Tailwind + shadcn/ui for the frontend, and Supabase for auth, database, and backend logic (Postgres + Row Level Security + Edge Functions).

Core concept

Users pick a tech domain (e.g. React, Node.js, Python, SQL) and a difficulty level (Beginner / Intermediate / Advanced). The app generates 5 AI interview questions for that combo, the user answers each one, and the AI scores every answer plus gives an overall performance summary at the end. There's also a self-paced "Practice Mode" question bank, a leaderboard, bookmarks, and an admin panel.

Auth & roles

Use Supabase Auth (email/password + optionally Google OAuth) for sign up / sign in.

Two roles: user and admin, stored in a profiles table with a role column (default user).

On signup, auto-create a row in profiles linked to the auth user (id, email, username, first_name, last_name, avatar_url, role, status, total_points, practice_sessions_completed, mock_interviews_completed, bookmarked_questions).

Route protection: unauthenticated users can only see the landing page and auth pages. Logged-in admins are redirected to /admin/dashboard. Non-admins are blocked from any /admin/* route.

Database tables (Postgres via Supabase)

profiles — as described above, one row per user, RLS so users can only read/update their own row (admins can read/update all).

domains — id, name (unique), questions_count, active_users, status (active/inactive), created_at, updated_at.

questions — practice question bank: id, title, description, answer, hints (text array), domain, difficulty (Beginner/Intermediate/Advanced), created_at.

practice_sessions — self-paced sessions: id, user_id, domain, difficulty, total_questions, completed_questions, current_question_index, status (in-progress/completed/abandoned), question_ids (array), created_at, updated_at.

mock_sessions — AI mock interview sessions: id, session_id (unique text), user_id, domain, difficulty, questions (jsonb array of {id, title, domain, difficulty, description, time_limit, reference_answer}), answers (jsonb array of {question_id, answer, rating, feedback, time_spent}), overall_rating, total_time_spent, overall_feedback, strengths (text array), improvements (text array), recommendations (text array), completed_at, created_at, updated_at.

Add RLS policies so users can only see/modify their own sessions; admins can see all.

AI integration (Edge Functions)

Create Supabase Edge Functions that call an LLM (use the Lovable AI Gateway / OpenAI-compatible endpoint — I'll provide the API key as a secret) to:

generate-mock-questions — input: domain, difficulty. Prompt the model to act as an expert technical interviewer and return strict JSON only:

{ "questions": [
  { "id": number, "title": "string", "description": "string", "referenceAnswer": "string", "timeLimit": number }
]}


Rules for the system prompt: generate exactly 5 questions matching the difficulty; if the domain isn't a valid tech interview topic, return a reason instead of questions; reference answers should be brief and clear; timeLimit in minutes (3–8 depending on difficulty); no text outside the JSON object.

score-answer (optional, called per question or all at once) — input: question + user's answer. Returns a rating (1–10) and short feedback per answer.

generate-session-feedback — input: domain, difficulty, and the full list of question/answer/rating pairs. Returns strict JSON:

{ "overallFeedback": "string (3-4 sentences)", "strengths": ["string"], "improvements": ["string"], "recommendations": ["string"] }


Tone: encouraging but honest, with actionable next steps.

After scoring, update the user's total_points, mock_interviews_completed in profiles, and recalculate that domain's questions_count in domains.

Pages / routes

Public

/ — Landing page: hero section explaining the product, call-to-action to sign up, feature highlights (AI-generated questions, instant feedback, leaderboard).

/sign-in, /sign-up — Supabase auth forms.

User area (/user/*)

/user/dashboard — overview: points, sessions completed, recent activity, quick links.

/user/practice — browse/filter the question bank by domain & difficulty, answer questions, reveal reference answer, bookmark toggle.

/user/mockinterview — start a new mock interview: select domain + difficulty → generate questions → step through each question with a timer (based on timeLimit) → submit answer → see AI rating/feedback per question → after all questions, show the AI-generated overall summary (strengths, improvements, recommendations) and points earned.

/user/leaderboard — ranked list of users by total_points, with mock interviews/practice sessions completed.

/user/bookmarks — saved questions.

Admin area (/admin/*, admin-only)

/admin/dashboard — aggregate stats: total users, total sessions, most popular domains, average ratings (charts).

/admin/manageuser — table of all users, view/edit role & status, delete.

/admin/domains — CRUD for domains, view question counts.

/admin/leaderboard — full leaderboard view with admin controls.

UI/UX direction

Clean, modern SaaS look — dark-mode-friendly, generous whitespace, a primary accent color (e.g. indigo or teal) for CTAs and progress indicators.

Use shadcn/ui components: Card, Button, Dialog, Dropdown, Select, Switch, Table, Progress, Badge, Avatar, Toast for notifications.

Mock interview screen should feel focused: one question at a time, visible countdown timer, clear "Submit Answer" action, then a feedback reveal animation before moving to the next question.

Dashboard should use simple charts (bar/line) for progress over time and domain breakdown.

Fully responsive (mobile-friendly), since users may practice on the go.

Build order (do this incrementally)

Set up Supabase project, auth, and all tables/RLS policies above.

Build landing page + auth flow + profile auto-creation.

Build user dashboard shell and navigation (user vs admin nav).

Build Practice Mode (question bank browsing, bookmarking).

Build Mock Interview flow end-to-end, including the two AI edge functions (question generation, scoring/feedback).

Build leaderboard.

Build admin panel (user management, domain management, dashboard analytics).

Polish UI, add loading/error states, empty states, and toasts.

Start with step 1 and 2, then pause for my review before continuing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/03598fa0-819b-4f05-b4df-f0c3a0776b80).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
