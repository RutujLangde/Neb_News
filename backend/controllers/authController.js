const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = "SXDFCGVBHJNK$$%^%^&FCGVBHJN"

const generateToken = (user) => {
  return jwt.sign({ id: user._id },secret , { expiresIn: '1d' });
};

exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({ username, password, email });
    await user.save();

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // ✅ Set to true in production
      sameSite: 'Lax', // ✅ Or 'None' if using cross-site
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};


exports.getUser = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
};


