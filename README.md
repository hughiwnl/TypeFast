# What is TypeFast

A typing assistant targetted towards people with motor disabilities to help them type faster with automatic word and sentence completion. As you type, TypeFast predicts how your current word ends and also suggests a natural sentence continuation, which you can accept with one  button.

---

## What is the purpose

The purpose of TypeFast is to help people with motor disabilities have an easier time typing through word and sentence auto completion. The goal is SOLELY this. Once the user is finished typing, editing things like font, spacing, and font size should be done in another document editor.

---

## How It Works

1. Type naturally in the editor
2. After, TypeFast sends your recent text to GPT-4o-mini
3. A ghost suggestion appears inline — completing your partial word and continuing the sentence
4. Accept with **Space** (word only) or **Tab** (word + full sentence continuation)
5. If the suffix is incorrect, you can press **`** to open the alternatives picker, then a number key to swap in a different word

---

## Features

- **Inline ghost text** — suggestions appear directly after your cursor, not in a separate panel
- **Word + sentence completion** — finishes the word you're mid typing *and* suggests how the sentence continues
- **Space to accept word** — inserts just the completed word and immediately queues the next suggestion
- **Tab to accept sentence** — accepts the full word + sentence continuation in one keystroke, minimizing motor effort
- **Word alternatives** — up to 5 alternative word completions shown in a sidebar panel; press **`** then a number key to pick one, or click directly
- **Copy button** — one click copies the full document text to the clipboard, ready to paste anywhere

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
| Server | Gunicorn |
| Containerization | Docker + Docker Compose |

---

## System Design

### Model choice: GPT-4o-mini
- **Cost** — at ~$0.15/1M input tokens, a full essay costs under $0.01


### Request lifecycle
- Completions are **debounced at 400ms** — no request fires while the user is actively typing. You can change this if it's too slow or too fast by adjusting `const DEBOUNCE_MS = 400;` in the `'frontend/src/components/GhostEditor.jsx'` file. The purpose of this, is because people with motor disabilities usually type in characters at a slow rate, so this min-maxes calls to OpenAPI while providing a smooth typing experience.
- Each new debounce cycle **aborts the previous in-flight request** via `AbortController`, preventing race conditions where a slow response overwrites a newer suggestion
- Completions only trigger after **3+ words** of context, avoiding meaningless suggestions on short input
- Only the **last 3,000 characters** of the document are sent to the API — roughly 4 pages of text. This keeps token costs low and actually improves suggestion quality, since recent context is more relevant than the beginning of a long document

### Gunicorn: 1 worker, 4 threads
```
gunicorn -w 1 --threads 4 -b 0.0.0.0:5000 main:app
```
- **4 threads** — allows up to 4 concurrent requests without blocking; since most time is spent waiting on the OpenAI API (I/O), threads are sufficient
- **1 worker** — plenty for a single user or small group. The backend is stateless, so if you need more throughput you can raise `-w` in `backend/Dockerfile`

---

## Installation

### Prerequisites
- Docker and Docker Compose
- An OpenAI API key

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/hughiwnl/TypeFast.git
cd TypeFast

# 2. Add your API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...

# 3. Build and run
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

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

### Configuration

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `OPENAI_API_KEY` | backend | — | Your OpenAI API key (required) |
| `VITE_API_URL` | frontend (build/dev time) | `http://localhost:5001` | Where the frontend finds the backend |
| `CORS_ORIGINS` | backend | `*` | Comma-separated list of origins allowed to call the backend. Set this if you deploy publicly |

Completions are billed directly to your own OpenAI account, so if you expose the backend publicly, restrict `CORS_ORIGINS` and consider adding your own rate limiting.

---

## Project Structure

```
TypeFast/
├── backend/
│   ├── main.py          # Flask API — /complete endpoint
│   ├── llmbackend.py    # OpenAI GPT-4o-mini integration + prompt
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root layout, copy button
│   │   ├── App.css               # Page layout, wordmark, panels
│   │   ├── api.js                # fetch wrapper with AbortController
│   │   └── components/
│   │       ├── GhostEditor.jsx   # Two-layer ghost text editor + suggestion panel
│   │       └── GhostEditor.css   # Editor and suggestion panel styles
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── LICENSE
└── .gitignore
```

---

## License

[MIT](LICENSE)
