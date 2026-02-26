# stockPort

This repository contains a simple stock portfolio tracker with a React front-end (`/client`) and an Express/MongoDB back-end (`/server`).

## Overview
- **Front-end:** React (Create React App)
- **Back-end:** Node/Express with Mongoose
- **Database:** MongoDB (local or Atlas)
- **Deploy targets:**
  - Back-end on [Render](https://render.com)
  - Front-end on [Netlify](https://netlify.com)

Configurations are environment‑driven so that the same codebase works locally and in the cloud.

---

## Local Development

1. **MongoDB**
   - Install and run MongoDB locally, or create a free Atlas cluster.
   - If you use Atlas copy the connection string and set it as `MONGO_URI` in `.env`.

2. **Server**
   ```bash
   cd server
   cp .env.example .env               # adjust values as needed
   npm install
   npm run start                      # or npm run dev if you use nodemon
   ```
   The server listens on `http://localhost:5000` (or `PORT` from `.env`).

3. **Client**
   ```bash
   cd client
   cp .env.example .env              # set REACT_APP_API_URL if you want to override
   npm install
   npm start                          # http://localhost:3000
   ```

   By default the client will proxy API calls to `http://localhost:5000` but the
   `REACT_APP_API_URL` variable is used by the axios instance if you prefer an
   explicit URL.

4. Navigate to `http://localhost:3000` and use the app; the backend will connect
   to the local or Atlas database depending on your configuration.

---

## Deployment

### 1. Back-end (Render)

1. Push your repository to GitHub (or another Git provider).
2. Create a new **Web Service** on Render and connect to the repo.
   - Environment: `Node` (auto-detects `package.json`).
   - **Build Command:**
     ```bash
     cd server && npm install
     # if you want to serve the React app from the same service,
     # also build the frontend before starting
     cd ../client && npm install && npm run build
     ```
   - **Start Command:** `cd server && npm run start`
   - **Root directory:** you may set to `/server` depending on Render's UI.
3. Add the following environment variables in Render's dashboard:
   - `MONGO_URI` – your Atlas connection string (make sure the cluster is
     accessible from Render's IP ranges).
   - `FRONTEND_URL` – your Netlify site's URL (e.g. `https://my-app.netlify.app`).
   - `PORT` – optional (Render provides one automatically).
4. Deploy. The URL Render gives you (e.g. `https://stockport-backend.onrender.com`)
   becomes the `REACT_APP_API_URL` for the front‑end.

### 2. Front-end (Netlify)

1. In Netlify, create a new site from GitHub.
2. Set the **Base directory** to `/client`.
3. **Build command:** `npm run build`
4. **Publish directory:** `build`
5. Add an environment variable:
   - `REACT_APP_API_URL` – set it to your Render service URL (above).
6. Deploy the site.

Once both services are live, users will access the Netlify URL. The React
application will call the Render URL to interact with the API, and the API will
connect to MongoDB Atlas.

---

## Notes

- You can keep working locally even after deployment by changing `REACT_APP_API_URL`.
- Ensure that CORS is configured correctly (the server accepts requests from the
  front-end URL via `FRONTEND_URL` env var).
- For small projects you can also serve the build from the Express app and deploy
  a single service; however the split setup above gives you free SSL, CDN and
  independent scaling.

---

Happy coding!