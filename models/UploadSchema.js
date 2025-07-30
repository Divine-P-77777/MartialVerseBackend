const mongoose = require('mongoose');


const SectionSchema = new mongoose.Schema({
  subtitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
});

// Upload schema
const UploadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorLink: {
      type: String,
      trim: true, // optional
    },

    sections: {
      type: [SectionSchema],
      validate: (val) => Array.isArray(val) && val.length > 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Upload', UploadSchema);
