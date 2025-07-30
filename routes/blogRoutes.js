// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const Upload = require('../models/UploadSchema');
const { requireAuth } = require('@clerk/express');

// Updated middleware using req.auth() instead of req.auth
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

// PUBLIC - Get all articles (User Panel)
router.get('/', async (req, res) => {
  try {
    const blogs = await Upload.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// PROTECTED - Get articles by admin (Admin Panel)
router.get('/admin', requireAuth(), requireClerkAuth, async (req, res) => {
  const { email } = req.user;
  const { page = 1 } = req.query;
  const limit = 10;

  try {
    const query = email === 'dynamicphillic77777@gmail.com'
      ? {}
      : { authorEmail: email };

    const blogs = await Upload.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin blogs' });
  }
});

// GET article by ID (for detailed view - public)
router.get('/:id', async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: 'Article not found' });
    res.json(upload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// CREATE article (protected - only admins)
router.post('/', requireAuth(), requireClerkAuth, async (req, res) => {
  try {
    const { title, category, featured, authorName, authorLink, sections } = req.body;
    const { email } = req.user;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one section is required' });
    }

    if (!authorName || authorName.trim() === '') {
      return res.status(400).json({ error: 'Author name is required' });
    }

    const upload = new Upload({
      title,
      category,
      featured,
      authorName,
      authorLink,
      authorEmail: email,
      sections,
    });

    await upload.save();
    res.status(201).json(upload);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create article' });
  }
});

// UPDATE article (protected - only owner or primary admin)
router.put('/:id', requireAuth(), requireClerkAuth, async (req, res) => {
  try {
    const { title, category, featured, authorName, authorLink, sections } = req.body;
    const { email } = req.user;

    const existing = await Upload.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Article not found' });

    if (email !== 'dynamicphillic77777@gmail.com' && existing.authorEmail !== email) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit others\' articles' });
    }

    existing.title = title;
    existing.category = category;
    existing.featured = featured;
    existing.authorName = authorName;
    existing.authorLink = authorLink;
    existing.sections = sections;

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update article' });
  }
});

// DELETE article (protected - only owner or primary admin)
router.delete('/:id', requireAuth(), requireClerkAuth, async (req, res) => {
  try {
    const { email } = req.user;
    const existing = await Upload.findById(req.params.id);

    if (!existing) return res.status(404).json({ error: 'Article not found' });

    if (email !== 'dynamicphillic77777@gmail.com' && existing.authorEmail !== email) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete others\' articles' });
    }

    await existing.deleteOne();
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
