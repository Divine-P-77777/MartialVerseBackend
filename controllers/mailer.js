const nodemailer = require('nodemailer');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Store in memory (for demo); use Redis/DB for production
const verificationCodes = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  try {
    await transporter.sendMail({
      from: `"Dynamic News" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Password Reset Code',
      text: `Use this code to reset your password: ${code}`,
    });

    res.json({ message: 'Verification code sent to email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

exports.verifyCode = (req, res) => {
  const { email, code } = req.body;
  console.log("Verifying code for:", email, "Code:", code); // 🔍 DEBUG

  if (verificationCodes[email] === code) {
    return res.json({ message: 'Code verified' });
  } else {
    return res.status(400).json({ message: 'Invalid code' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    delete verificationCodes[email]; // Clean up
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
};
