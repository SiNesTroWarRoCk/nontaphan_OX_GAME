1. ### BACKEND ###

## Prerequisites
- Node.js 22+
- npm or yarn
- Docker Desktop or local PostgreSQL
- Google Cloud OAuth Client

*** you must install docker and docker compose before do it***
- docker compose up -d
- docker compose ps (looking status of container)
- go to backend folder and then copy and renaming .env.example -> .env
- copy values from email into .env:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GOOGLE_REDIRECT_URI
  - AUTH0_ISSUER_URL=https://accounts.google.com
  - AUTH0_JWKS_URI=https://www.googleapis.com/oauth2/v3/certs
  - AUTH0_AUDIENCE can be empty if GOOGLE_CLIENT_ID is set
  
## start service
- cd backend
- yarn install
- yarn prisma:generate
- npx prisma migrate dev --name init
- yarn start:dev

## Swagger API Docs

After backend starts, open:

```text
http://localhost:3000/api/docs
```

For protected APIs, click `Authorize` and paste the Google ID token as Bearer JWT.


2. ### FRONTEND ###

## Prerequisites
- Node.js 22+
- npm or yarn
- Google OAuth Client ID configured with Authorized JavaScript origin: http://localhost:5173

## start service
- cd frontend
- copy and renaming .env.example to .env
- copy values from email into .env:
  - VITE_API_BASE_URL
  - VITE_GOOGLE_CLIENT_ID
  - VITE_GOOGLE_REDIRECT_URI=http://localhost:5173
  - VITE_FRONTEND_URL=http://localhost:5173
- yarn install
- yarn dev
- open http://localhost:5173
