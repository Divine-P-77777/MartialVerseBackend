const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // API URL based on environment
    const API_URL =
      process.env.NODE_ENV === 'production'
        ? process.env.API_URL
        : 'http://localhost:5000';

    // Fetch blog data
    const blogRes = await fetch(`${API_URL}/admin/upload/${id}`);
    const blog = await blogRes.json();

    if (!blog || blog.error) {
      return res.status(404).send('Blog not found');
    }

    // Prepare meta data
    const firstSection = blog.sections?.[0] || {};
    const metaDescription = firstSection.description
      ? firstSection.description.replace(/<[^>]+>/g, '').slice(0, 160) + '...'
      : blog.title;

    // Path to built React index.html
    const indexFile = path.resolve(__dirname, '../../frontend/dist/index.html');
    let html = fs.readFileSync(indexFile, 'utf8');

    // Inject OG tags (replace <title>React App</title>)
    html = html.replace(
      '<title>React App</title>',
      `
        <title>${blog.title} - Read Now</title>
        <meta name="description" content="${metaDescription}" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${blog.title}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${firstSection.imageUrl || ''}" />
        <meta property="og:url" content="${process.env.SITE_URL}/blog/${id}" />
        <meta property="article:author" content="${blog.authorName || ''}" />
        <meta property="article:published_time" content="${blog.createdAt || ''}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${blog.title}" />
        <meta name="twitter:description" content="${metaDescription}" />
        <meta name="twitter:image" content="${firstSection.imageUrl || ''}" />
      `
    );

    res.send(html);
  } catch (err) {
    console.error('Error rendering blog page:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
