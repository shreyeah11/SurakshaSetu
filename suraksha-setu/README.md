# Guardian Path - Red Flag Detector

Full-stack project with:
- `client`: React + Vite + Tailwind CSS
- `server`: Node.js + Express + MongoDB

## Setup

### 1) Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 2) Configure backend env

```bash
cd server
copy .env.example .env
```

Update `MONGO_URI` if needed.

### 3) Run backend

```bash
cd server
npm run dev
```

### 4) Run frontend

```bash
cd client
npm run dev
```

## Features implemented

- Light mode by default with dark/light toggle icon on all pages
- Language selector icon in header across app
- Home page with cards in one row (`Red Flag Hunter`, `Security Quiz`, `Spot the Difference`)
- Upload/text spam detector container at bottom of home page
- Red Flag Hunter interactive suspicious text clicking
- Security Quiz with MCQs and wrong-answer sound
- Spot the Difference with wrong-answer sound
- Cyber-themed modern UI with rounded cards and glowing accents
- Express API with `/api/analyze` and MongoDB connection
