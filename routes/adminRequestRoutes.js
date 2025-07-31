// File: /routes/adminRequestRoutes.js

const express = require('express');
const router = express.Router();
const Admin = require('../models/AdminRequest');
const { requireAuth } = require('@clerk/express');

// Clerk Auth Middleware
function requireClerkAuth(req, res, next) {
  const { sessionClaims } = req.auth?.() || {};

  if (!sessionClaims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    email: sessionClaims.email,
    id: sessionClaims.sub,
  };

  next();
}

// Admin-only middleware
function requireSuperAdmin(req, res, next) {
  if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
}

// ✅ PUBLIC: Submit access request
router.post('/', async (req, res) => {
  try {
    const { email, fullName, country, state, profession, phone, socialLink } = req.body;

    if (!email || !fullName || !country || !state || !profession || !socialLink) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a request with this email.' });
    }

    const newRequest = new Admin({
      email, fullName, country, state, profession, phone, socialLink
    });

    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Error:', err);
    res.status(500).json({ error: 'Server error: could not create admin request.' });
  }
});

// ✅ GET all requests — Admin only
router.get('/', requireAuth(), requireClerkAuth, requireSuperAdmin, async (req, res) => {
  try {
    const requests = await Admin.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Fetch All Requests Error:', err);
    res.status(500).json({ error: 'Server error: failed to fetch requests.' });
  }
});

// ✅ GET one request — Admin only
router.get('/:id', requireAuth(), requireClerkAuth, requireSuperAdmin, async (req, res) => {
  try {
    const request = await Admin.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    console.error('Fetch One Error:', err);
    res.status(500).json({ error: 'Server error: failed to fetch request.' });
  }
});

// ✅ UPDATE request — Admin only
router.put('/:id', requireAuth(), requireClerkAuth, requireSuperAdmin, async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found for update.' });
    res.json(updated);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(400).json({ error: 'Failed to update request.' });
  }
});

// ✅ DELETE request — Admin only
router.delete('/:id', requireAuth(), requireClerkAuth, requireSuperAdmin, async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Request not found for deletion.' });
    res.json({ message: 'Request successfully deleted.' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: 'Server error: failed to delete request.' });
  }
});

module.exports = router;
