const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? process.env.SELF_URL : 'http://localhost:5000';

    // Fetch blog data
    const blogRes = await fetch(`${baseUrl}/admin/upload/${id}`);
    const blog = await blogRes.json();

    if (!blog || blog.error) {
      return res.status(404).send('Blog not found');
    }

    const firstSection = blog.sections?.[0] || {};
    const stripHtml = (str) => str?.replace(/<[^>]+>/g, '') || '';
    const metaDescription =
      firstSection.description
        ? stripHtml(firstSection.description).slice(0, 160) + '...'
        : blog.title;

    if (!isProd) {
      // Redirect to frontend in dev
      return res.redirect(`http://localhost:5173/blog/${id}`);
    }

    const indexFile = path.resolve(__dirname, '../../frontend/dist/index.html');
    let html = await fs.readFile(indexFile, 'utf8');

    // Escape quotes in meta content
    const esc = (str) => String(str || '').replace(/"/g, '&quot;');

    html = html.replace(
      '<title>React App</title>',
      `
        <title>${esc(blog.title)} - Read Now</title>
        <meta name="description" content="${esc(metaDescription)}" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${esc(blog.title)}" />
        <meta property="og:description" content="${esc(metaDescription)}" />
        <meta property="og:image" content="${esc(firstSection.imageUrl)}" />
        <meta property="og:url" content="${esc(process.env.CLIENT_ORIGIN || '')}/blog/${id}" />
        <meta property="article:author" content="${esc(blog.authorName)}" />
        <meta property="article:published_time" content="${esc(blog.createdAt)}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${esc(blog.title)}" />
        <meta name="twitter:description" content="${esc(metaDescription)}" />
        <meta name="twitter:image" content="${esc(firstSection.imageUrl)}" />
      `
    );

    res.send(html);
  } catch (err) {
    console.error('Error rendering blog page:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
