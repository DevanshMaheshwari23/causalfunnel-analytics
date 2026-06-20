# CausalFunnel User Analytics Application

A full-stack MERN application for tracking user interactions (page views, clicks) and visualizing them through a real-time analytics dashboard with session tracking and click heatmaps.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, React Router v6   |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB with Mongoose ODM         |
| Tracker   | Vanilla JS (no dependencies)      |
| Styling   | Pure CSS-in-JS (no dependencies)  |

---

## Setup Steps

### Prerequisites
- Node.js >= 18
- MongoDB running locally OR MongoDB Atlas URI

### 1. Clone and install

```bash
git clone https://github.com/DevanshMaheshwari23/causalfunnel-analytics
cd causalfunnel-analytics

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/causalfunnel
FRONTEND_URL=http://localhost:5173
```

### 3. Start backend

```bash
cd backend
npm run dev
# Server: http://localhost:5000
```

### 4. Start frontend dashboard

```bash
cd frontend
npm run dev
# Dashboard: http://localhost:5173
```

### 5. Open the demo tracking page

Open `tracker/demo.html` directly in your browser.  
Click around — events are sent to the backend in batches every 3 seconds.  
Refresh the dashboard to see sessions and heatmap data populate.

---

## API Endpoints

| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | /api/events                       | Track a single event              |
| POST   | /api/events/batch                 | Track multiple events (batch)     |
| GET    | /api/sessions                     | List all sessions with counts     |
| GET    | /api/sessions/:session_id/events  | Get user journey for a session    |
| GET    | /api/heatmap?page_url=<url>       | Get click data for heatmap        |
| GET    | /api/stats                        | Overall analytics summary         |

---

## Assumptions & Trade-offs

- **Session ID**: Stored in `localStorage` for simplicity. A production system would use a secure HttpOnly cookie tied to a fingerprint.
- **Batching**: Events are queued client-side and flushed every 3 seconds (or on page hide/close via `sendBeacon`) to minimize HTTP overhead.
- **Heatmap normalization**: Click coordinates are normalized against the screen dimensions captured at event time, so dots render proportionally across different screen sizes.
- **No auth**: Dashboard has no authentication. For production, add JWT-based auth to all `/api` routes.
- **CORS**: Backend allows all origins to support cross-domain tracking script injection on any client site.
- **Canvas heatmap**: Built with native Canvas API (no external library like `heatmap.js`) to keep dependencies minimal.
