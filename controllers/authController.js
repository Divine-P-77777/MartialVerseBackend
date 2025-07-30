const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const primaryAdminEmail = process.env.PRIMARY_ADMIN_EMAIL;
const jwtSecret = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, jwtSecret, {
    expiresIn: '1h',
  });
};

//  Uses pre-save hook for password hashing
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Default roles
    let isAdmin = false;
    let isAllowedToCreate = false;

    // If primary admin
    if (email === primaryAdminEmail) {
      isAdmin = true;
      isAllowedToCreate = true;
    }

    //  Don't hash password manually — pre-save will do it
    const newUser = new User({
      username,
      email,
      password, // raw password
      isAdmin,
      isAllowedToCreate,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

//LOGIN: Uses schema method for password check
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    const { _id, username, isAdmin, isAllowedToCreate } = user;
    res.status(200).json({
      token,
      user: { id: _id, username, email, isAdmin, isAllowedToCreate }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// ALLOW EMAILS TO CREATE ACCOUNTS
exports.allowCreation = async (req, res) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails)) {
      return res.status(400).json({ message: 'Emails must be an array' });
    }

    const users = await User.updateMany(
      { email: { $in: emails } },
      { isAllowedToCreate: true }
    );

    if (users.modifiedCount === 0) {
      return res.status(404).json({ message: 'No users found with provided emails' });
    }

    res.status(200).json({ message: 'Users updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating users' });
  }
};


exports.togglePermission = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isAllowedToCreate = !user.isAllowedToCreate;
    await user.save();

    res.status(200).json({ message: 'User permission updated', isAllowedToCreate: user.isAllowedToCreate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};


