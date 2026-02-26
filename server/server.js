const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
// allow configuration via environment variables (Render, Heroku, etc.)
const PORT = process.env.PORT || 5000;

// Routes
const stockRoutes = require('./routes/stocks');
const fundRoutes = require('./routes/fundsRoutes');
const capitalRoutes = require('./routes/capitalRoutes');

// Middleware
// build a whitelist of allowed origins; FRONTEND_URL can point to localhost during dev or your Netlify URL in prod
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// MongoDB config
mongoose.set('strictQuery', false);
const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/stockPortfolio'; // fallback to local when env var not supplied

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`✅ MongoDB connected (${mongoUri.startsWith('mongodb://localhost') ? 'local' : 'Atlas/remote'})`))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Use Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/capital', capitalRoutes);

// If we run in production (e.g. Render with build output or a single-service
// deployment), serve the React build from the client folder.  This makes it
// possible to have one service instead of two.
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`)
);
