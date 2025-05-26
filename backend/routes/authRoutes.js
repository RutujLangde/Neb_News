const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
// const Post = require('../models/post');

const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 171234123.png
  }
});

const upload = multer({ storage });



// Public routes
router.post('/register',upload.single('profilePic'), authController.register);
router.post('/login', authController.login);

// Protected route
router.get('/me', authMiddleware, authController.getUser);

// router.get('/user/:username', async (req, res) => {
//   try {
//     const { username } = req.params;
//     const userPosts = await news.find({ author: username });
//     res.json(userPosts);
//   } catch (err) {
//     console.error('Error fetching user posts:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
