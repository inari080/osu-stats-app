# osu! stats

English | [日本語](README.md)

A web app that searches and displays osu! player stats, beatmaps, and multi-player comparisons using the official osu! API. The UI can be switched between Japanese and English.

## Demo 🔗
https://osu-stats-app.vercel.app/
![Demo screenshot](img.png)

## Tech Stack

- **Frontend**: React, Vite, Recharts
- **Backend**: FastAPI (Python)
- **API**: [osu! API v2](https://osu.ppy.sh/docs/index.html) (Client Credentials Grant)

## Features

- Search for a player by osu! username (rank, pp, accuracy, play count, and more)
- Switch between game modes (osu!, Taiko, Catch, Mania)
- View top plays (best scores) with color-coded rank badges
- Charts for pp trend, activity hours, combo/miss counts, and BPM trend
- Beatmap search (by title/artist, with filters for difficulty, genre, language, etc.)
- Compare up to 8 players side by side, including stats, charts, and shared top-play beatmaps
- Japanese / English UI toggle

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [osu! OAuth application](https://osu.ppy.sh/home/account/edit#oauth) registered (you'll need a Client ID / Client Secret)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set OSU_CLIENT_ID and OSU_CLIENT_SECRET

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/user/{username}` | Get a user's stats |
| GET | `/api/user/{username}/scores/best` | Get a user's top plays |
| GET | `/api/beatmapsets/search` | Search beatmapsets |

## Planned Features

- [ ] Save favourite players
- [ ] More detailed stat charts

## License

MIT