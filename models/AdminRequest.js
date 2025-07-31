
const mongoose = require('mongoose');

const AdminRequestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  profession: { type: String, required: true },
  phone: { type: String }, // optional
  socialLink: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminRequestSchema);
