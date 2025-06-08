const { Schema, model } = require('mongoose');

const newsSchema = new Schema({
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  likes: { type: [String], default: [] },
});

newsSchema.index({ location: '2dsphere' });

const News = model('News', newsSchema);
module.exports = { News };
