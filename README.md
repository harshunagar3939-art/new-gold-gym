# New Gold Gym — Full MERN Stack Website

A complete gym website built with MongoDB, Express, React (Vite) and Node.js.

**Signature feature:** a scroll-scrubbed hero — as you scroll, weight plates load
onto a barbell one by one, then the whole dumbbell lifts up like a curl to reveal
the headline. Built with plain React + `IntersectionObserver` / scroll listeners,
no animation library required.

```
mern-gym/
├── client/     React (Vite) frontend
└── server/     Express + MongoDB backend (REST API)
```

## What's included

- **Frontend:** React 18 + Vite, black & gold design system, scroll-driven hero
  animation, animated stat counters, programs/trainers/pricing pulled live from
  the API, and a working lead-capture form (name, phone, goal, message).
- **Backend:** Express REST API + MongoDB (Mongoose models for Leads, Programs,
  Trainers, Plans), CORS configured for the frontend, a seed script to populate
  starter data, and a lightweight admin key to view submitted leads.

## Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Local MongoDB running on `mongodb://127.0.0.1:27017`, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
# edit .env if your MongoDB URI or port is different

npm run seed   # populates Programs, Trainers and Plans collections
npm run dev    # starts the API on http://localhost:5000
```

API endpoints:

| Method | Route              | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | `/api/programs`     | List all gym programs                 |
| GET    | `/api/trainers`     | List all trainers                     |
| GET    | `/api/plans`        | List membership plans                 |
| POST   | `/api/leads`        | Submit a trial/contact lead           |
| GET    | `/api/leads`        | List leads (needs `x-admin-key` header) |
| PATCH  | `/api/leads/:id`    | Update a lead's status (admin)        |

## 2. Frontend setup

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, default http://localhost:5000/api

npm run dev    # starts the site on http://localhost:5173
```

Open `http://localhost:5173` in your browser. The site will fetch programs,
trainers and pricing plans from the backend, and the "Book Free Trial" form
saves leads straight into MongoDB.

If the backend isn't running yet, the frontend still renders with built-in
fallback content, so you can preview the design immediately.

## 3. Production build

```bash
cd client
npm run build      # outputs static files to client/dist
```

Deploy `client/dist` to any static host (Vercel, Netlify, etc.) and deploy the
`server` folder to any Node host (Render, Railway, etc.), pointing
`VITE_API_URL` at your deployed backend URL and `CLIENT_URL` (server env) at
your deployed frontend URL.

## Customizing

- **Gym details / copy:** edit the components in `client/src/components/`.
- **Programs / Trainers / Plans data:** edit `server/seed.js` and re-run
  `npm run seed`, or add data directly via MongoDB / the API.
- **Colors & type:** all design tokens are CSS variables at the top of
  `client/src/index.css` (`--gold`, `--black`, `--cream`, etc).
- **Admin key:** set `ADMIN_KEY` in `server/.env` — send it as an
  `x-admin-key` header to view/manage submitted leads at `GET /api/leads`.
