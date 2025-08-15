const express = require('express');
const router = express.Router();
const Admin = require('../models/AdminRequest');
const {verifyFrontendSecret} = require("../middleware/authmiddleware")


//  PUBLIC ROUTE 


router.post('/', async (req, res) => {
  try {
    const { email, fullName, country, state, profession, phone, socialLink } = req.body;

    if (!email || !fullName || !country || !state || !profession || !socialLink || !phone) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a request with this email.' });
    }

    const newRequest = new Admin({ email, fullName, country, state, profession, phone, socialLink });
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Error:', err);
    res.status(500).json({ error: 'Server error: could not create admin request.' });
  }
});


// ADMIN ROUTES (Protected by header secret only)

router.get('/', verifyFrontendSecret, async (req, res) => {
  try {
    const requests = await Admin.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Fetch All Requests Error:', err);
    res.status(500).json({ error: 'Server error: failed to fetch requests.' });
  }
});

router.get('/:id', verifyFrontendSecret, async (req, res) => {
  try {
    const request = await Admin.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    console.error('Fetch One Error:', err);
    res.status(500).json({ error: 'Server error: failed to fetch request.' });
  }
});

router.put('/:id', verifyFrontendSecret, async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found for update.' });
    res.json(updated);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(400).json({ error: 'Failed to update request.' });
  }
});

router.delete('/:id', verifyFrontendSecret, async (req, res) => {
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
