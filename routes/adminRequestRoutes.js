const express = require('express');
const router = express.Router();
const Admin = require('../models/AdminRequest');



// GET all articles
router.get('/', async (req, res) => {
  try {
    const uploads = await Admin.find().sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// GET article by ID
router.get('/:id', async (req, res) => {
  try {
    const upload = await Admin.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: 'Article not found.' });
    res.json(upload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});
// CREATE article
router.post('/', async (req, res) => {
  try {
    const { email, fullName,  country, state, profession,phone,socialLink } = req.body;

    if (!email || !) {
      return res.status(400).json({ error: 'At least one section is required.' });
    }

    const upload = new Upload({ title, category, subcategory, section, featured, sections });
    await upload.save();
    res.status(201).json(upload);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create article.' });
  }
});

// UPDATE article
router.put('/:id', async (req, res) => {
  try {
    const { title, category, subcategory, section, featured, sections } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one section is required.' });
    }

    const upload = await Upload.findByIdAndUpdate(
      req.params.id,
      { title, category, subcategory, section, featured, sections },
      { new: true }
    );

    if (!upload) return res.status(404).json({ error: 'Article not found.' });
    res.json(upload);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update article.' });
  }
});


// DELETE article
router.delete('/:id', async (req, res) => {
  try {
    const upload = await Upload.findByIdAndDelete(req.params.id);
    if (!upload) return res.status(404).json({ error: 'Article not found.' });
    res.json({ message: 'Article deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

module.exports = router;
