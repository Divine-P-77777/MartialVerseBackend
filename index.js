// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load env and DB
dotenv.config();
require('./config/db');

// Import routes
const blogRoutes = require('./routes/blogRoutes');
const adminRequestRoutes = require('./routes/adminRequestRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const BlogRenderRoutes = require('./routes/BlogRenderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN
    : 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// API routes
app.use('/admin/upload', blogRoutes);
app.use('/api/access', adminRequestRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/', BlogRenderRoutes); // Must validate this file’s routes

// Production: serve React build
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA Fallback
  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Health & root
app.get('/health', (_, res) => res.status(200).send('Healthy'));
app.get('/', (_, res) => res.send('All is well'));

// Self-ping
if (process.env.SELF_URL) {
  setInterval(() => {
    axios.get(process.env.SELF_URL)
      .then(() => console.log('Self-ping successful'))
      .catch(err => console.error('Self-ping failed:', err.message));
  }, 12 * 60 * 1000); // every 12 minutes
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
