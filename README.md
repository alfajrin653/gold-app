# Gold Transaction Management

## Setup Backend
1. Buat DB gratis di https://neon.tech dan akun gratis https://cloudinary.com
2. `cd backend && cp .env.example .env` lalu isi nilainya
3. `npm install`
4. `npx prisma migrate dev --name init`
5. `npm run seed`   (akun demo: sales@demo.com / manager@demo.com, password: password123)
6. `npm run dev`    (API di http://localhost:4000)

## Endpoint
POST /api/auth/login | GET /api/auth/me
POST /api/transactions (SALES, multipart) | GET /api/transactions/mine (SALES)
GET /api/transactions?sales=&location=&from=&to= (MANAGEMENT) | GET /api/transactions/:id
PATCH /api/transactions/:id/approve | PATCH /api/transactions/:id/reject {note} (MANAGEMENT)
GET /api/dashboard/summary | GET /api/dashboard/audit (MANAGEMENT)

## Socket.io (auth: { token })
MANAGEMENT menerima `transaction:new`; SALES menerima `transaction:reviewed`.

## Struktur
backend/prisma (schema, seed) | backend/src/{config,middleware,routes,utils,socket.js,server.js} | frontend/ (React + Vite + Tailwind)

## Setup Frontend
1. `cd frontend && cp .env.example .env`  (VITE_API_URL = alamat backend)
2. `npm install`
3. `npm run dev`  -> http://localhost:5173
Pastikan CLIENT_URL di backend/.env = http://localhost:5173
