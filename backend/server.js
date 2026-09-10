const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { initDb } = require('./database/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize persistent DB engine
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Path Normalizer Middleware for Serverless & Direct Express compatibility
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// API Routes
app.use('/', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'VIGIL AI Virtual Safety Companion',
    team: 'BUG BUSTERS',
    timestamp: new Date().toISOString()
  });
});

// Serve compiled static React Vite frontend assets for single-service deployment
const distPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🛡️ VIGIL Backend Server Running on Port ${PORT}`);
    console.log(`Team: BUG BUSTERS`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log(`API Base: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

module.exports = app;
