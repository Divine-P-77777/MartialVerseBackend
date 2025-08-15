const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch blog data from your existing API endpoint
        const API_URL = process.env.NODE_ENV === 'production'
            ? process.env.SELF_URL
            : 'http://localhost:5000';

        const blogRes = await fetch(`${API_URL}/admin/upload/${id}`);
        const blog = await blogRes.json();

        if (!blog || blog.error) {
            return res.status(404).send('Blog not found');
        }

        const firstSection = blog.sections?.[0] || {};
        const metaDescription = firstSection.description
            ? firstSection.description.replace(/<[^>]+>/g, '').slice(0, 160) + '...'
            : blog.title;

        let indexFile;
        if (process.env.NODE_ENV === 'production') {
            indexFile = path.resolve(__dirname, '../../frontend/dist/index.html');
        } else {
            // In dev, we just serve frontend directly
            return res.redirect(`http://localhost:5173/blog/${id}`);
        }

        let html = fs.readFileSync(indexFile, 'utf8');

        // Replace <title>React App</title> with OG tags
        html = html.replace(
            '<title>React App</title>',
            `
        <title>${blog.title} - Read Now</title>
        <meta name="description" content="${metaDescription}" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${blog.title}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${firstSection.imageUrl || ''}" />
        <meta property="og:url" content="http://localhost:5173/blog/${id}" />
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
