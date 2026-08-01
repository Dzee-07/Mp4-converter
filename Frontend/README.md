# Omega Converter — frontend (Vite + React)

## Run it

```bash
npm install
cp .env.example .env    # then fill in VITE_API_BASE_URL
npm run dev              # http://localhost:5173
```

This is a real project now (not just the single-file artifact): `index.html` →
`src/main.jsx` → `src/App.jsx`, with Tailwind actually compiled by PostCSS,
so all the styling (including hex colors) works reliably — unlike the
in-chat preview, this has a real build step.

## Connecting to the backend

`src/App.jsx` reads `VITE_API_BASE_URL` and, when a link is pasted, calls
`POST {VITE_API_BASE_URL}/resolve` (the endpoint from the `backend/` folder)
to fetch real title/thumbnail for YouTube and TikTok. If `VITE_API_BASE_URL`
is empty or the backend isn't reachable, it quietly falls back to the demo
placeholder data — so the app never hard-crashes without a backend.

To run both together locally:
```bash
# terminal 1
cd backend && npm install && npm start        # http://localhost:4000

# terminal 2
cd frontend && npm install && npm run dev      # http://localhost:5173
```
with `frontend/.env` set to `VITE_API_BASE_URL=http://localhost:4000/api`.

## Can I use Supabase?

Yes, for the pieces that are just data storage/auth — Supabase doesn't
replace the platform adapters, but it's a good fit for:
- **Auth** — swap the mock `AuthForm` in `App.jsx` for `supabase.auth.signUp` /
  `signInWithPassword`, and use `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **Download history** — write to a `downloads` Postgres table instead of
  React state, so history survives a refresh and syncs across devices.
- **Hosting the backend logic** — you can port `backend/src/routes/downloader.js`
  into a Supabase Edge Function instead of running Express yourself, and call
  it the same way from the frontend.
What Supabase can't do is fetch video content from YouTube/TikTok/Facebook/
Instagram for you — that's still the `backend/` adapters' job (see its
README for what's real vs. stubbed there).

## Where does the YouTube API key go?

The current YouTube adapter uses the public oEmbed endpoint, which needs no
key at all. If you upgrade it to the official **Data API v3** (for things
oEmbed doesn't give you, like duration or view count):
1. Get a key from console.cloud.google.com → APIs & Services → Credentials.
2. Put it in `backend/.env` as `YOUTUBE_API_KEY=...` — **backend only**.
3. Never put it in the frontend `.env` as a `VITE_...` variable — anything
   prefixed `VITE_` gets bundled into the public JS and anyone can read it
   in devtools. API keys belong on the server.

## "Will it convert videos for TikTok/Facebook/Instagram without an API?"

No — and to be direct about it: nothing can. There's no way for this (or
any) app to turn a pasted link into an actual downloadable video file
without something on the other end actually fetching that file. Without a
real API or licensed provider wired in, "convert" has nothing to convert —
it's not something that can be talked around by prompting or configuration.

The honest state of things right now:
- **YouTube & TikTok**: real, working *metadata* (title/thumbnail/author)
  via public oEmbed endpoints. Not the video file itself.
- **Facebook & Instagram**: metadata is stubbed — needs an approved Meta
  app + access token.
- **Actual video files, on any platform**: intentionally not implemented.
  None of these four platforms offer a public API for that, and building it
  yourself means reverse-engineering private endpoints, which breaks their
  Terms of Service. If you want this to actually download video, you'd need
  to license a legitimate third-party extraction API and plug it into
  `getDownloadInfo()` in each `backend/src/platforms/*.js` file.

## Is there a web version of this?

The interactive preview you've been testing in this chat *is* a web app —
it's rendering live in your browser right now, just not at a public URL.
To get a real link you can share:
1. Push this `frontend/` folder to a GitHub repo.
2. Deploy it on Vercel, Netlify, or Cloudflare Pages (all have a free tier
   and auto-deploy from GitHub) — connect the repo and it builds `npm run
   build` automatically.
3. Set `VITE_API_BASE_URL` as an environment variable in that host's
   dashboard, pointing at wherever you deploy `backend/` (Render, Railway,
   Fly.io, or a Supabase Edge Function all work).
