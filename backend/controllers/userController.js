const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return 'Password must be at least 8 characters long.';
  if (!hasUpperCase) return 'Password must contain at least one uppercase letter.';
  if (!hasLowerCase) return 'Password must contain at least one lowercase letter.';
  if (!hasNumber) return 'Password must contain at least one number.';
  if (!hasSpecialChar) return 'Password must contain at least one special character.';
  
  return null; // Valid
};

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, adminSecret } = req.body;

    console.log('🔍 Register Request:', { name, email, isAdmin });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Security check for Admin registration
    const wantsAdmin = isAdmin === true || isAdmin === 'true';
    if (wantsAdmin) {
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: 'Invalid Admin Secret Key. Registration denied.' });
      }
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ DON'T HASH HERE - Schema will do it automatically!
    user = new User({
      name,
      email,
      password,  // ✅ Just pass plain password
      isAdmin: wantsAdmin
    });

    await user.save();  // ✅ This triggers pre('save') hook which hashes it
    console.log('✅ User saved:', user._id);

    // Create JWT token
    const payload = {
      userId: user._id,
      isAdmin: user.isAdmin
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Login Request - Email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);

    // Compare password with hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      userId: user._id,
      isAdmin: user.isAdmin
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('❌ Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot Password - Check if email exists
const forgotPasswordCheck = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    res.json({ message: 'Email verified. You can now reset your password.', email });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Password - Directly update password by email
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPasswordCheck,
  resetPassword
};