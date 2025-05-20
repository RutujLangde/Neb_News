// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const News = require('../models/newsModel'); // Ensure this path matches your file structure
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/news/:id/like
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    const userId = req.user.id;

    // Toggle like
    const index = news.likes.indexOf(userId);
    if (index === -1) {
      news.likes.push(userId);
    } else {
      news.likes.splice(index, 1);
    }

    await news.save();
    res.status(200).json({ message: 'Success', likes: news.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
