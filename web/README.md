# Client Setup

The client builds API requests from `VITE_BASE_URL`. If that variable is missing, the app falls back to `https://benchmark-official.onrender.com` and appends `/api/v3` automatically.

For local development, create a `.env.local` file in this folder and set `VITE_BASE_URL` to your backend origin, for example:

`VITE_BASE_URL=http://localhost:5001`
