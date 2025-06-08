const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/authMiddleware');
const { Schema, model } = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {})
  .catch(err => {});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  userName: String,
  imageUrl: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  likes: { type: [String], default: [] },
});
newsSchema.index({ location: '2dsphere' });

const News = mongoose.model('news', newsSchema);

app.post('/api/news', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, userId, userName, latitude, longitude, address } = req.body;
  const imageUrl = req.file ? req.file.path : '';

  let lat = latitude;
  let log = longitude;

  try {
    if ((!lat || !log) && address) {
      const geolocationResoursor = await axios.get('https://us1.locationiq.com/v1/search.php', {
        params: {
          key: process.env.LOCATIONIQ_API_KEY,
          q: address,
          format: 'json'
        }
      });

      lat = geolocationResoursor.data[0].lat;
      log = geolocationResoursor.data[0].lon;
    }

    if (!lat || !log) {
      return res.status(400).json({ message: 'Coordinates or a valid address is required' });
    }

    const news = new News({
      title,
      description,
      userId,
      userName,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [parseFloat(log), parseFloat(lat)]
      },
      createdBy: req.userId,
    });



     await news.save();

    

    
    res.status(201).json({ message: 'News posted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.get('/api/news/nearby', authMiddleware, async (req, res) => {
  const { latitude, longitude, range = 5, page = 1, limit = 10 } = req.query;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const radius = range ? range : 5;

  try {
    const news = await News.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lon, lat] },
          $maxDistance: 1000 * radius
        }
      }
    })
      .populate('createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.get('/api/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const userPosts = await News.find({ userId }).sort({ createdAt: -1 });
    res.json(userPosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/news/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    await News.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/news/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description required' });
    }

    const post = await News.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.title = title;
    post.description = description;
    post.createdAt = new Date();

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/news/:id/like', authMiddleware, async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.userId;

    const news = await News.findById(newsId);
    if (!news) return res.status(404).json({ message: 'News not found' });

    const index = news.likes.indexOf(userId);

    if (index === -1) {
      news.likes.push(userId);
    } else {
      news.likes.splice(index, 1);
    }

    await news.save();

    res.json({ updatedNews: news });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=pk.4a07f0aea665ccea73187bfb7020ac82&lat=${lat}&lon=${lon}&format=json`);
  const data = await response.json();
  res.json(data);
});

app.get('/api/forward-geocode', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  const geolocationResoursor = await axios.get('https://us1.locationiq.com/v1/search.php', {
    params: {
      key: process.env.LOCATIONIQ_API_KEY,
      q: address,
      format: 'json'
    }
  });

  return res.json({
    lat: geolocationResoursor.data[0].lat,
    log: geolocationResoursor.data[0].lon
  });
});

app.post('/api/logout', async (req, res) => {
  await res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});
