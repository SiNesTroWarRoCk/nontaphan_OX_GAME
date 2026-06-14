1. ### BACKEND ###

## Prerequisites
- Node.js 22+
- npm or yarn
- Docker Desktop or local PostgreSQL
- Google Cloud OAuth Client

*** you must install docker and docker compose before do it***
- docker compose up -d
- docker compose ps (looking status of container)
- go to backend folder
- copy .env values from google drive in email and paste into backend folder
  
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
- copy .env values from google drive in email and paste into frontend folder
- yarn install
- yarn dev
- open http://localhost:5173
