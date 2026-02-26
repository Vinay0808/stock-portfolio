const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Routes
const stockRoutes = require('./routes/stocks');
const fundRoutes = require('./routes/fundsRoutes');
const capitalRoutes = require('./routes/capitalRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB config
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockPortfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Use Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/capital', capitalRoutes);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
