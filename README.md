# TypeFast

An AI-powered typing assistant designed to help people with motor disabilities type faster and with less effort. As you type, TypeFast predicts how your current word ends and suggests a natural sentence continuation — accept it with a single keystroke.

---

## How It Works

1. Type naturally in the editor
2. After 3+ words, TypeFast sends your recent text to GPT-4o-mini
3. A ghost suggestion appears inline — completing your partial word and continuing the sentence
4. Accept with **Space** (word only) or **Tab** (word + full sentence continuation)
5. Press **`** to open the alternatives picker, then a number key to swap in a different word

---

## Features

- **Inline ghost text** — suggestions appear directly after your cursor, not in a separate panel
- **Word + sentence completion** — finishes the word you're mid-typing *and* suggests how the sentence continues
- **Space to accept word** — inserts just the completed word and immediately queues the next suggestion
- **Tab to accept sentence** — accepts the full word + sentence continuation in one keystroke, minimizing motor effort
- **Word alternatives** — up to 5 alternative word completions shown in a sidebar panel; press **`** then a number key to pick one, or click directly
- **Copy button** — one click copies the full document text to the clipboard, ready to paste anywhere
- **Google Docs-matching layout** — 816px wide, 96px margins, Arial 11pt, 1.15 line-height; text fills pages identically to Google Docs
- **Page break hairlines** — a subtle divider appears every 1056px (one US Letter page at 96 dpi) so you can see page boundaries while writing
- **Request cancellation** — in-flight API calls are aborted when you type again, preventing stale completions and wasted quota
- **Daily usage cap** — limits the app to 20 completions per day across all users, with a banner shown when the limit is reached

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Accept the suggested word completion |
| `Tab` | Accept the word + full sentence continuation |
| `` ` `` | Toggle the word alternatives picker |
| `1`–`5` | (While picker is open) select an alternative word |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Python + Flask |
| AI Model | OpenAI GPT-4o-mini |
| Server | Gunicorn (1 worker, 4 threads) |
| Containerization | Docker + Docker Compose |

---

## System Design

### Model choice: GPT-4o-mini
GPT-4o-mini was chosen over running a local model (e.g. GPT-2) for three reasons:
- **Quality** — produces far more natural and contextually accurate completions
- **Cost** — at ~$0.15/1M input tokens, a full essay costs under $0.01
- **No local dependencies** — eliminates PyTorch (~2GB) and the need for GPU hardware

### Frontend: two-layer editor
The text editor uses a transparent `<textarea>` overlaid on a display `<div>`. The textarea captures all keyboard input while the display layer renders the real text plus the grey ghost spans. This avoids the complexity of `contenteditable` while keeping cursor behavior native and accessible.

### Request lifecycle
- Completions are **debounced at 400ms** — no request fires while the user is actively typing
- Each new debounce cycle **aborts the previous in-flight request** via `AbortController`, preventing race conditions where a slow response overwrites a newer suggestion
- Completions only trigger after **3+ words** of context, avoiding meaningless suggestions on short input
- Only the **last 3,000 characters** of the document are sent to the API — roughly 4 pages of text. This keeps token costs low and actually improves suggestion quality, since recent context is more relevant than the beginning of a long document

### Daily rate limit: no database required
The app enforces a global cap of 20 completions per day across all users using an **in-memory counter** protected by a `threading.Lock()`. A stored date is compared to today's date on every request; if the date has changed, the counter resets automatically.

This works without a database because the app runs as a **single Gunicorn worker with 4 threads**. A single worker means all threads share the same process memory, so the counter is truly global. Four workers would create four separate memory spaces and allow up to 4×20 = 80 requests — defeating the limit. The thread-based model gives the same concurrency benefit (non-blocking I/O across simultaneous requests) without fragmenting state.

This is a deliberate tradeoff: the limit resets if the server restarts, but for a portfolio project with light traffic this is acceptable and removes all operational complexity.

### Gunicorn: 1 worker, 4 threads
```
gunicorn -w 1 --threads 4 -b 0.0.0.0:5000 main:app
```
- **1 worker** — keeps shared in-memory state (the rate limit counter) consistent
- **4 threads** — allows up to 4 concurrent requests without blocking; since most time is spent waiting on the OpenAI API (I/O), threads are sufficient

### Page dimensions
The document area exactly mirrors Google Docs default settings:
- **Width:** 816px (8.5in at 96 dpi)
- **Margins:** 96px (1in) on all sides
- **Page height:** 1056px (11in at 96 dpi)
- **Font:** Arial 11pt (14.67px), line-height 1.15

A user who fills one page on TypeFast and pastes into Google Docs will see exactly one page.

---

## Running Locally

### Prerequisites
- Docker and Docker Compose
- An OpenAI API key

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/TypeFast.git
cd TypeFast

# 2. Add your API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...

# 3. Build and run
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Running without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
OPENAI_API_KEY=sk-... python main.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Checking the rate limit

```bash
curl http://localhost:5000/status
# {"requests_today": 4, "limit": 20, "remaining": 16}
```

---

## Project Structure

```
TypeFast/
├── backend/
│   ├── main.py          # Flask API — /complete and /status endpoints
│   ├── llmbackend.py    # OpenAI GPT-4o-mini integration + prompt
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root layout, limit state, copy button
│   │   ├── App.css               # Page layout, wordmark, panels
│   │   ├── api.js                # fetch wrapper with AbortController
│   │   └── components/
│   │       ├── GhostEditor.jsx   # Two-layer ghost text editor + suggestion panel
│   │       └── GhostEditor.css   # Editor and suggestion panel styles
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .gitignore
```
