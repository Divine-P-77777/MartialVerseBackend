const express = require('express');
const router = express.Router();
const Upload = require('../models/UploadSchema');
const { requireAuth } = require('@clerk/express');

// Primary admin email for full access
const PRIMARY_ADMIN_EMAIL = process.env.PRIMARY_ADMIN_EMAIL || 'dynamicphillic77777@gmail.com';

router.get('/auth', requireAuth(), requireClerkAuth, async (req, res) => {
  console.log('req.user:', req.user);
  const { email } = req.user;
  const { page = 1 } = req.query;
  const limit = 10;
  try {
    const query = email === PRIMARY_ADMIN_EMAIL ? {} : { authorEmail: email };
    console.log('Mongo query:', query);
    const blogs = await Upload.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Admin GET error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch admin blogs' });
  }
});

// Clerk authentication middleware
function requireClerkAuth(req, res, next) {
  const { sessionClaims } = req.auth?.() || {};
  if (!sessionClaims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = {
    email: sessionClaims.email,
    id: sessionClaims.sub,
  };
  console.log('req.auth:', req.auth?.());
console.log('req.user:', req.user);
  next();
}



router.get('/test', async (req, res) => {
  try {
    const docs = await Upload.find({});
    res.json({ count: docs.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * PUBLIC ROUTES
 */

// Get all blog posts (public/user panel)
router.get('/', async (req, res) => {
  try {
    const blogs = await Upload.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
      console.error(error); // Add this!
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get single blog post by ID (public/user panel)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Upload.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Article not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * ADMIN ROUTES (require Clerk Auth)
 */

// Get blog posts for admin panel
// - Primary admin sees all, others see only their posts
router.get('/admin', requireAuth(), requireClerkAuth, async (req, res) => {
  const { email } = req.user;
  const { page = 1 } = req.query;
  const limit = 10;

  try {
    const query = email === PRIMARY_ADMIN_EMAIL ? {} : { authorEmail: email };
    const blogs = await Upload.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
      console.error(error); // Add this!
    res.status(500).json({ error: 'Failed to fetch admin blogs' });
  }
});

// Create a blog post (admin only)
router.post('/', requireAuth(), requireClerkAuth, async (req, res) => {
  try {
    const { title, category, customCategory, featured, authorName, authorLink, sections } = req.body;
    const { email } = req.user;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one section is required' });
    }
    if (!authorName || authorName.trim() === '') {
      return res.status(400).json({ error: 'Author name is required' });
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
    const serverError = err?.message || 'Something went wrong';
    res.status(400).json({ error: serverError });
  }
});

// Update a blog post (only owner or primary admin)
router.put('/:id', requireAuth(), requireClerkAuth, async (req, res) => {
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

// Delete a blog post (only owner or primary admin)
router.delete('/:id', requireAuth(), requireClerkAuth, async (req, res) => {
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