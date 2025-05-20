import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getLocation } from '../Handlers/Getlocation';
import { fetchNearbyNews } from '../Handlers/GetNews';
import { getCurrentUser } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [nearbyNews, setNearbyNews] = useState([]);
  const [user, setUser] = useState('');
  const [range, setRange] = useState(5);
  // const [news, setNews] = useState([]);
  // const [page, setPage] = useState(1);
  // const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndNews = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        const { latitude, longitude } = await getLocation();
        setLatitude(latitude);
        setLongitude(longitude);

        

        console.log(latitude, " -", longitude)

        const news = await fetchNearbyNews(latitude, longitude, range);
        setNearbyNews(news);
      } catch (err) {
        console.error('Error initializing data:', err);
      }
    };

    // Fetch initially
    fetchUserAndNews();

    // Refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserAndNews();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [range]);



  const handleGetLocation = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      setLatitude(latitude);
      setLongitude(longitude);
      handleFetchNews(latitude, longitude);

      console.log(latitude)
      console.log(longitude)

    } catch (err) {
      console.error('Error getting location:', err);
    }
  };

  const handleFetchNews = async (lat, lon) => {
    try {
      const news = await fetchNearbyNews(lat, lon, range);
      setNearbyNews(news);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  const handleLike = async (newsId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:8000/api/news/${newsId}/like`,

      );

      const updatedNews = res.data.updatedNews;

      // Update just the liked/unliked item in the list
      setNearbyNews((prevNews) =>
        prevNews.map((item) =>
          item._id === updatedNews._id ? updatedNews : item
        )
      );
    } catch (error) {
      console.error('Failed to like/unlike the post:', error);
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
    formData.append('userId', user._id);
    formData.append('userName', user.username)
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('address', address);
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:8000/api/news', formData);
      alert('News posted successfully!');
      console.log(res.data);
      handleFetchNews(latitude, longitude);
    } catch (err) {
      console.error(err);
      alert('Error posting news');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-1/5 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between relative">
        <div className="md:fixed top-4 left-4">
          <h2 className="text-xl font-bold mb-2">Hi, {user.username}</h2>
          <p className="mb-2">Your Addr:</p>

          <button
            onClick={() => navigate('/myposts')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            My Posts
          </button>

          <select
            value={range}
            onChange={async (e) => {
              const newRange = e.target.value;
              setRange(newRange);
              if (latitude && longitude) {
                const updatedNews = await fetchNearbyNews(latitude, longitude, newRange);
                setNearbyNews(updatedNews);
              }
            }}
            className="border p-2 mt-4 rounded w-full"
          >
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="15">15 km</option>
            <option value="30">30 km</option>
            <option value="50">50 km</option>
            <option value="1000">1000 km</option>

          </select>
        </div>

        <button
        
          className="md:fixed bottom-4 left-4 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>

      {/* Main Content */}
      <div className="flex w-full md:w-4/5 lg:w-3/5 p-4 md:p-6 overflow-y-auto mx-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Post News</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="News Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded"
            />
            <textarea
              placeholder="News Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />

            <div className="flex">
              <input
                type="text"
                placeholder="Address (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded mr-1"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                📍 Get Location
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded-full font-semibold"
            >
              Post News 📤
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-2xl font-bold my-6 text-center">Nearby News</h2>
            {nearbyNews.length > 0 ? (
              <ul className="space-y-4">
                {nearbyNews.map((news, index) => (
                  <li
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4"
                  >
                    {news.imageUrl && (
                      <img
                        src={`http://localhost:8000/${news.imageUrl}`}
                        alt="News"
                        className="w-full max-h-64 object-cover rounded-md mb-2"
                      />
                    )}
                    <h4 className="font-bold">{news.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{news.description}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleLike(news._id)}
                        className="text-blue-500 hover:text-blue-700 font-semibold mr-2"
                      >
                        👍 Like
                      </button>
                      <span>{news.likes.length} likes</span>



                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mt-1">Author : {news.userName}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Posted at: {new Date(news.createdAt).toLocaleString()}
                    </p>



                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-4 text-center">No nearby news available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
