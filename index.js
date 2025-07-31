const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

require('./config/db'); 


const blogRoutes = require('./routes/blogRoutes');
const adminRequestRoutes = require('./routes/adminRequestRoutes');



const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://martialverse.vercel.app"
    : "http://localhost:5173";

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());


app.use('/admin/upload', blogRoutes);
app.use('/api/access-request', adminRequestRoutes);



// Health and root endpoints
app.get('/', (_, res) => res.send('Martial Verse Backend API is Live'));
app.get('/health', (_, res) => res.status(200).send('Healthy'));

// Self-ping to keep server alive
const SELF_URL = process.env.SELF_URL || "https://martialversebackend.onrender.com";
setInterval(() => {
  axios.get(SELF_URL)
    .then(() => console.log("Self-ping successful!"))
    .catch(err => console.error("Self-ping failed:", err.message));
}, 720000); // 12 minutes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));