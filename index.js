const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();
require('./config/db');

// Routes
const blogRoutes = require('./routes/blogRoutes');
const adminRequestRoutes = require('./routes/adminRequestRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const BlogRenderRoutes = require('./routes/BlogRenderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS origin
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_ORIGIN
    : "http://localhost:5173";

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// API routes
app.use('/admin/upload', blogRoutes);
app.use('/api/access', adminRequestRoutes);
app.use("/api/playlist", playlistRoutes);

// Blog OG rendering route (outside production check so it works locally too)
app.use('/', BlogRenderRoutes);

// Serve React static files (for production)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA Fallback (other React routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.get('/',(req, res) => {
  res.send('All is well')
})
// Health and root endpoints
app.get('/health', (_, res) => res.status(200).send('Healthy'));

// Self-ping to keep server alive
const SELF_URL = process.env.SELF_URL || "https://martialversebackend.onrender.com";
setInterval(() => {
  axios.get(SELF_URL)
    .then(() => console.log("Self-ping successful!"))
    .catch(err => console.error("Self-ping failed:", err.message));
}, 720000); // 12 minutes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
