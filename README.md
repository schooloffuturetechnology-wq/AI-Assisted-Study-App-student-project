# AI Study Assistant

AI Study Assistant is a Node.js + Express web app for students to organize study resources, ask AI questions, and review previous explanations.

## Current Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    app.js
    server.js
  public/
    assets/
    index.html
    login.html
    signup.html
    dashboard.html
    history.html
  .env
  package.json
render.yaml
```

## Features

- Student signup and login
- Dashboard with subject-wise resource organization
- Save links, PDFs, images, notes, and YouTube resources
- AI study explanations
- Question history stored in MongoDB
- Static frontend served directly by Express

## Local Run

```bash
cd backend
npm install
copy .env.example .env
```

Set the required values in `.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `USE_MEMORY_DB=false` if you want MongoDB Atlas
- `GEMINI_API_KEY` if you want live Gemini responses

Start the app:

```bash
npm run dev
```

Open:

- `http://localhost:5000/`

## Render Deployment

This repo is ready for Render using the root [render.yaml](c:/Users/Lenovo/OneDrive/Desktop/TechUp/A_school%20of%20future%20technology/Akshat/render.yaml).

### Render settings

- Service type: `Web Service`
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

### Required environment variables on Render

- `MONGODB_URI`
- `JWT_SECRET`
- `USE_MEMORY_DB=false`

Optional:

- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Health check

Render health check path:

- `/api/health`

## Important

- Do not commit `backend/.env`
- Rotate any MongoDB or API credentials that were exposed while testing
