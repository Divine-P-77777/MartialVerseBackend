const express = require('express');
const router = express.Router();
const Upload = require('../models/UploadSchema');
const {verifyFrontendSecret} = require("../middleware/authmiddleware")

// Primary admin email
const PRIMARY_ADMIN_EMAIL = process.env.PRIMARY_ADMIN_EMAIL;



// PUBLIC: Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Upload.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUBLIC: Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Upload.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Article not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});


// ADMIN: Get all admin blogs
router.get('/admin', verifyFrontendSecret, async (req, res) => {
  console.log('[DEBUG] Headers:', req.headers);
  console.log('[DEBUG] Query params:', req.query);

  const email = req.headers['x-user-email']?.toLowerCase().trim(); // fallback manually
  const page = parseInt(req.query.page || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  if (!email) {
    return res.status(401).json({ error: 'Missing user email in headers.' });
  }

  const isPrimaryAdmin = email === PRIMARY_ADMIN_EMAIL;
  const query = isPrimaryAdmin ? {} : { authorEmail: email };

  console.log('[DEBUG] Mongo query:', query);

  try {
    const blogs = await Upload.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(`[DEBUG] Fetched ${blogs.length} blog(s)`);
    res.json(blogs);
  } catch (err) {
    console.error('❌ Admin GET error stack:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch admin blogs' });
  }
});



// ADMIN: Create blog
router.post('/', verifyFrontendSecret, async (req, res) => {
  try {
    const { title, category, customCategory, featured, authorName, authorLink, sections } = req.body;
    const { email } = req.user;

    if (!title || !authorName || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resolvedCategory = category === 'Others' ? (customCategory?.trim() || 'Uncategorized') : category;

    const upload = new Upload({
      title,
      category: resolvedCategory,
      customCategory: category === 'Others' ? customCategory : '',
      featured,
      authorName,
      authorLink,
      authorEmail: email,
      sections,
    });

    await upload.save();
    res.status(201).json(upload);
  } catch (err) {
    console.error('❌ Submission Error:', err);
    res.status(400).json({ error: err.message || 'Failed to create article' });
  }
});

// ADMIN: Update blog
router.put('/:id', verifyFrontendSecret, async (req, res) => {
  try {
    const { title, category, customCategory, featured, authorName, authorLink, sections } = req.body;
    const { email } = req.user;

    const blog = await Upload.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Article not found' });
    if (email !== PRIMARY_ADMIN_EMAIL && blog.authorEmail !== email) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit others\' articles' });
    }

    blog.title = title;
    blog.category = category === 'Others' ? (customCategory?.trim() || 'Uncategorized') : category;
    blog.customCategory = category === 'Others' ? customCategory : '';
    blog.featured = featured;
    blog.authorName = authorName;
    blog.authorLink = authorLink;
    blog.sections = sections;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error('❌ Update Error:', err);
    res.status(400).json({ error: 'Failed to update article' });
  }
});

// ADMIN: Delete blog
router.delete('/:id', verifyFrontendSecret, async (req, res) => {
  try {
    const { email } = req.user;
    const blog = await Upload.findById(req.params.id);

    if (!blog) return res.status(404).json({ error: 'Article not found' });
    if (email !== PRIMARY_ADMIN_EMAIL && blog.authorEmail !== email) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete others\' articles' });
    }

    await blog.deleteOne();
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
