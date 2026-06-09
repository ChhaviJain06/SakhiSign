# SakhiSign — Full-Stack Setup

Three services run together:

```
React/Vite frontend (web/, :5173)
        │  /api  (proxied)
        ▼
Node/Express backend (server/, :4000) ──► MongoDB Atlas
        │  /evaluate_sign
        ▼
Python FastAPI AI service (service/, :8000) ──► engine/
```

The frontend **never** calls FastAPI directly — all AI calls go through Node.

---

## 0. Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A free **MongoDB Atlas** cluster

## 1. MongoDB Atlas (one-time)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. **Database Access** → add a user (username + password).
3. **Network Access** → add your IP (or `0.0.0.0/0` for a demo).
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/sakhisign?retryWrites=true&w=majority`

## 2. AI service (Python / FastAPI)
```bash
cd D:\sakhi_sign
pip install -r requirements.txt
uvicorn service.app:app --port 8000
```
References for all 5 signs are already built in `data/references/`.

## 3. Backend (Node / Express)
```bash
cd server
copy .env.example .env        # then edit .env:
#   MONGODB_URI = <your Atlas string>
#   JWT_SECRET  = <any long random string>
#   AI_SERVICE_URL = http://localhost:8000
npm install
npm run seed                  # loads the 5 signs into MongoDB (AI service must be up)
npm run dev                   # starts API on :4000
```

## 4. Frontend (React / Vite)
```bash
cd web
npm install
npm run dev                   # http://localhost:5173
```
Open http://localhost:5173 → **Continue as Guest** (or sign up) → pick a sign →
watch tutorial → **Practice** → allow camera → perform the sign → see your score.

---

## Notes
- **Webcam landmark extraction runs in the browser** (MediaPipe HandLandmarker,
  loaded from CDN). The browser sends landmark frames — never raw video — to the
  backend, which forwards them to the AI service.
- **Guest mode** works fully (practice + dashboard); attempts are stored against a
  guest record. Email/password unlocks cross-device progress.
- **Signs are seeded from the engine** (`npm run seed`), so the UI always reflects
  the real signs. Add a sign in `engine/config.py`, record it, re-run `npm run seed`.
- Backend integration is covered by `server/test_e2e.mjs` (in-memory Mongo + live
  FastAPI): `cd server && node test_e2e.mjs` (requires the AI service running).
