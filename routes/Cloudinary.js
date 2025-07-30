const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    // Use JSON.stringify for better debug
    console.log("Uploaded file:", JSON.stringify(req.file, null, 2));
    res.status(200).json({ imageUrl: req.file.path });
  } catch (err) {
    console.error('Cloudinary upload error:', err && err.message, err && err.stack);
    res.status(500).json({ error: 'Image upload failed.', details: err?.message || err });
  }
});

module.exports = router;