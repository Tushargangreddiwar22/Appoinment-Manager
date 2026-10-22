# Appointment Manager

A React and Vite appointment manager with user registration, sign-in, and appointment creation, viewing, editing, and deletion. JSON Server provides the local API and stores data in `db.json`.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

Install dependencies once:

```sh
npm install
```

Start the API in one terminal:

```sh
npm run api
```

Start the app in another terminal:

```sh
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Validate

```sh
npm run lint
npm run build
```

The API runs on `http://localhost:3000`; user and appointment data is stored in `db.json`.
