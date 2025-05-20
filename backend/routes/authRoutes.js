const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
// const Post = require('../models/post');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route
router.get('/me', authMiddleware, authController.getUser);

router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userPosts = await news.find({ author: username });
    res.json(userPosts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
