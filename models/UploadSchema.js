const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  subtitle: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  imageUrl: { type: String, trim: true },
});

const UploadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    customCategory: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    authorEmail: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorLink: { type: String, trim: true },
sections: {
  type: [SectionSchema],
  validate: {
    validator: (val) => Array.isArray(val) && val.length > 0,
    message: 'At least one section is required.'
  }
}

  },
  {
    timestamps: true,
    collection: 'uploads',
  }
);



module.exports = mongoose.model('Upload', UploadSchema);
