# WaveLabs Digital Store

This project is split into two independent apps:

```
digital-store/
├── frontend/    ← Next.js app (UI, pages, components)
└── backend/     ← Express.js API server (payments, downloads)
```

---

## Running the Project

You need **two terminals** running simultaneously.

### Terminal 1 — Backend (Express API)
```bash
cd backend
npm install        # first time only
npm run dev        # starts on http://localhost:4000
```

### Terminal 2 — Frontend (Next.js)
```bash
cd frontend
npm install        # first time only
npm run dev        # starts on http://localhost:3000
```

Then visit: **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |
| `JWT_SECRET` | Secret key for signing download tokens |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:3000`) |
| `PORT` | Backend port (default: `4000`) |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay Key ID (safe for browser) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (`http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL for SEO/sitemap |
