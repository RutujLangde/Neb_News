import React, { useState } from 'react';
import axios from 'axios';
import { getLocation } from '../Handlers/Getlocation'; 
import { fetchNearbyNews } from '../Handlers/GetNews';

const Home = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [nearbyNews, setNearbyNews] = useState([]);

  const handleGetLocation = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      setLatitude(latitude);
      setLongitude(longitude);
      handleFetchNews(latitude, longitude); // pass the coords directly
    } catch (err) {
      console.error('Error getting location:', err);
    }
  };

  const handleFetchNews = async (lat, lon) => {
    try {
      const news = await fetchNearbyNews(lat, lon);
      setNearbyNews(news);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !image || (!(latitude && longitude) && !address)) {
      alert('Please fill all fields and provide either coordinates or an address.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('address', address);
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:8000/api/news', formData);
      alert('News posted successfully!');
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert('Error posting news');
    }
  };

  return (
    <div className="mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">Post a News</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="What's the headline?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
        />
        <textarea
          placeholder="What's happening?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="Add address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGetLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            📍 Get Location
          </button>
          <p className="text-sm text-gray-500">Lat: {latitude} | Long: {longitude}</p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold w-full"
        >
          Tweet News
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-10 mb-4">Nearby News</h3>
      {nearbyNews.length > 0 ? (
        <ul className="space-y-4">
          {nearbyNews.map((news, index) => (
            <li
              key={index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-start space-x-4">
                {news.imageUrl && (
                  <img
                    src={`http://localhost:8000/${news.imageUrl}`}
                    alt="News"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}
                <div>
                  <h4 className="font-bold">{news.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{news.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-4">No nearby news available.</p>
      )}
    </div>
  );
};

export default Home;
