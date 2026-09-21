# SiteReportAI frontend

React and Vite client for the SiteReportAI construction operations platform.

## Run locally

1. Start the FastAPI backend from `../backend` after installing `requirements.txt` and setting up `.env` with your `GROQ_API_KEY`.
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` when the API URL differs from the local default (`http://localhost:8002/api`).
3. Install packages with `npm install`.
4. Run `npm run dev`.

## Backend AI stack

The backend uses **Groq** for AI-powered features:

- **Groq Whisper** (`large-v3`) for audio transcription (multilingual Hindi/Marathi/English)
- **Groq LLaMA** (`openai/gpt-oss-120b`) for structured data extraction from transcripts and images
- **Groq LLaMA** for cost narrative generation

Set `GROQ_API_KEY` in `backend/.env` to enable AI features.

## Frontend optional dependency

The `@google/genai` package is included as an optional client-side dependency for potential future Gemini integration. The core backend AI pipeline does not depend on it.
