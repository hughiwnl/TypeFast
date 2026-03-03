# TypeFast

An AI-powered typing assistant designed to help people with motor disabilities type faster and with less effort. As you type, TypeFast predicts how your current word ends and suggests a natural sentence continuation — press **Tab** to accept it instantly.

---

## How It Works

1. Type naturally in the editor
2. After 3+ words, TypeFast sends your text to GPT-4o-mini
3. A grey ghost suggestion appears inline — completing your partial word and continuing the sentence
4. Press **Tab** to accept the full suggestion, or keep typing to ignore it

---

## Features

- **Inline ghost text** — suggestions appear directly after your cursor, not in a separate panel
- **Word + sentence completion** — finishes the word you're mid-typing *and* continues the sentence in one suggestion
- **Tab to accept** — single keystroke to accept, minimizing motor effort
- **Optional writing context** — set a topic (e.g. "a cover letter") to make suggestions more relevant
- **Request cancellation** — in-flight API calls are aborted when you type again, preventing stale completions and wasted API quota

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Python + Flask |
| AI Model | OpenAI GPT-4o-mini |
| Server | Gunicorn (4 workers) |
| Containerization | Docker + Docker Compose |

---

## System Design

### Model choice: GPT-4o-mini
GPT-4o-mini was chosen over running a local model (e.g. GPT-2) for three reasons:
- **Intelligence** — GPT-4o-mini produces far more natural and contextually accurate completions
- **Cost** — at ~$0.15/1M input tokens, a full essay costs under $0.01
- **No local dependencies** — eliminates PyTorch (~2GB) and the need for GPU hardware

### Frontend: two-layer editor
The text editor uses a transparent `<textarea>` overlaid on a display `<div>`. The textarea captures all keyboard input while the display layer renders the real text plus the grey ghost span. This avoids the complexity of managing a `contenteditable` div while keeping cursor behavior native.

### Request lifecycle
- Completions are **debounced at 400ms** — no request fires while the user is actively typing
- Each new debounce cycle **aborts the previous in-flight request** via `AbortController`, preventing race conditions where a slow response overwrites a newer suggestion
- Completions only trigger after **3+ words** of context, avoiding meaningless suggestions on short input

### Production server: Gunicorn
The Flask dev server is single-threaded and unsuitable for concurrent users. Gunicorn with 4 workers allows multiple requests to be handled in parallel, so a slow OpenAI response for one user does not block others.

### Scaling target
Designed for **up to 200 concurrent users / 5,000 total users**. At this scale, a single server with Gunicorn is sufficient — no load balancer or horizontal scaling is needed.

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

---

## Project Structure

```
TypeFast/
├── backend/
│   ├── main.py          # Flask API — /complete endpoint
│   ├── llmbackend.py    # OpenAI GPT-4o-mini integration
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js                    # Fetch with AbortController
│   │   └── components/
│   │       ├── GhostEditor.jsx       # Two-layer ghost text editor
│   │       └── GhostEditor.css
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .gitignore
```
