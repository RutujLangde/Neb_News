// ./Handlers/GetNews.js
import axios from 'axios';

export const fetchNearbyNews = async (lat, lon, range = 5, page = 1, limit = 10) => {
  try {
    const res = await axios.get('http://localhost:8000/api/news/nearby', {
      params: {
        latitude: lat,
        longitude: lon,
        range,
        page,
         limit  // send range to the backend
      },
    });

    console.log(res.data);
    
    return res.data;
  } catch (err) {
    console.error('Error fetching nearby news:', err);
    return [];
  }
};

