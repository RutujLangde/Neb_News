const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/authMiddleware');
// const newsRoutes = require('./routes/newsRoutes');


const authRoutes = require('./routes/authRoutes');
const { console } = require('inspector');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// News Schema
const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  userName: String,
  imageUrl: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: { type: [String], default: [] },
});
newsSchema.index({ location: '2dsphere' });

const News = mongoose.model('news', newsSchema);

// POST API to submit news
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
      }
    });

    await news.save();
    res.status(201).json({ message: 'News posted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// GET API to fetch nearby news
app.get('/api/news/nearby', authMiddleware, async (req, res) => {
  const { latitude, longitude, range = 5, page = 1, limit = 10 } = req.query;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const radius = range ? range : 5

  try {
    const news = await News.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lon, lat] },
          $maxDistance: 1000 * radius // meters
        }
      }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});



app.get('/api/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const userPosts = await News.find({ userId }); // ✅ match field name
    res.json(userPosts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/news/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    await News.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/news/:id/like', authMiddleware, async (req, res) => {
  try {

    const newsId = req.params.id;
    const userId = req.userId;
    console.log(req);

    const news = await News.findById(newsId);
    if (!news) return res.status(404).json({ message: 'News not found' });

    const index = news.likes.indexOf(userId);

    if (index === -1) {
      news.likes.push(userId); // like
    } else {
      news.likes.splice(index, 1); // unlike
    }

    await news.save();

    res.json({ updatedNews: news });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// backend route (Node.js/Express)
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
})


// Node.js + Express example
app.post('/api/logout', async(req, res) => {
  await res.clearCookie('token'); // Name of your cookie
  res.status(200).json({ message: 'Logged out successfully' });
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
