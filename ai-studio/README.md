# AI Studio — Image & Video Generation

A ChatGPT-style web UI for generating **images** and **videos** using free-tier APIs from
**Google Gemini** and **xAI Grok**.

- **Image generation:** Gemini (`gemini-2.5-flash-image-preview`) or Grok (`grok-2-image-1212`)
- **Video generation:** Gemini Veo (`veo-3.0-generate-preview`, falls back to `veo-2.0-generate-001`)

> Note: xAI does not currently expose a public video-generation API, so video mode is Gemini-only.

## Quick start

```bash
cd ai-studio
npm install
cp .env.local.example .env.local
# Fill in GEMINI_API_KEY and (optionally) GROK_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Get free API keys

- **Gemini:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free tier covers
  image generation; Veo video has limited free quota.
- **Grok:** [console.x.ai](https://console.x.ai) — sign up for free credits.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS for the dark ChatGPT-like theme
- Server-side API routes proxy requests to Gemini and Grok so keys never reach the browser
- Conversations persisted to `localStorage`

## Project layout

```
app/
  page.tsx              Main chat UI + state
  layout.tsx            Root layout
  globals.css
  api/image/route.ts    POST { prompt, provider } -> { media, text }
  api/video/route.ts    POST { prompt }           -> { media, text }
components/
  Sidebar.tsx           Conversation list
  ChatArea.tsx          Message list + empty state
  Message.tsx           User / assistant bubble (image, video, errors)
  Composer.tsx          Input + mode/provider selector
lib/
  gemini.ts             Gemini image (sync) + Veo video (long-running poll)
  grok.ts               Grok image (OpenAI-compatible)
```

## How it works

- **Image** requests go to `/api/image` which calls either Gemini's `generateContent`
  endpoint with `responseModalities: ["TEXT","IMAGE"]` or Grok's OpenAI-compatible
  `/v1/images/generations`. Returned base64 is sent back as a `data:` URL so the client
  can display and download it without any storage layer.
- **Video** requests go to `/api/video` which calls Gemini's `predictLongRunning`,
  polls the operation, fetches the resulting MP4 with the API key, and returns it
  inline as a base64 `data:` URL. (Generation typically takes 30–90s.)

## Limitations

- Video generation depends on Veo quota of your Gemini API key.
- Conversation history is local to your browser (no auth/database).
- Streaming is not implemented; responses are returned once complete.
