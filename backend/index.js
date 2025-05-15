const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());
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
  imageUrl: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
newsSchema.index({ location: '2dsphere' }); 

const News = mongoose.model('news', newsSchema);

// POST API to submit news
app.post('/api/news', upload.single('image'), async (req, res) => {
  const { title, description, latitude, longitude, address } = req.body;
  const imageUrl = req.file ? req.file.path : '';

  let lat = latitude;
  let log = longitude;



  try {

    // const axios = require('axios');

    // const address = '66, Rathi Layout, Zingabai Takli Godhani Road, Zinga Bai Takli Nagpur, MAHARASHTRA 440030 India';

    // const geolocationResoursor = await axios.get('https://us1.locationiq.com/v1/search.php', {
    //   params: {
    //     key: process.env.LOCATIONIQ_API_KEY, // Or your actual key here
    //     q: address,
    //     format: 'json'
    //   }
    // });


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

    console.log(lat);
    console.log(log);

    if (!lat || !log) {
      return res.status(400).json({ message: 'Coordinates or a valid address is required' });
    }

    const news = new News({
      title,
      description,
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
app.get('/api/news/nearby', async (req, res) => {
  const { latitude, longitude } = req.query;

  try {
    const news = await News.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 10000 // 2kms
        }
      }
    });
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
