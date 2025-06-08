import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getLocation } from '../Handlers/Getlocation';
import { fetchNearbyNews } from '../Handlers/GetNews';
import { getCurrentUser } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// import {  Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';




import locationIcon from '../../assets/icons/location icon.png'
import SideBar from '../SideBar';

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [userAddress, setUserAddress] = useState(currentAddress); // current default location



  const currentUserId = user._id; // Or however you're storing the logged-in user







  const navigate = useNavigate();

  // if(!user){
  //   navigate('/login');
  // }

  // useEffect(() => {

  //   const fetchUserAndNews = async () => {

  //     setLoading(true);
  //     try {
  //       const userData = await getCurrentUser();
  //       setUser(userData);

  //       const { latitude, longitude } = await getLocation();
  //       setLatitude(latitude);
  //       setLongitude(longitude);

  //       if (!latitude || !longitude) return;



  //       console.log(latitude, " -", longitude)

  //       const data = await fetchNearbyNews(latitude, longitude, range, page);
  //       setNearbyNews((prevNews) => [...prevNews, ...data]);
  //     } catch (err) {
  //       console.error('Error initializing data:', err);
  //     }

  //     setLoading(false);
  //   };

  //   // Fetch initially
  //   fetchUserAndNews();

  //   // Refresh when tab becomes active
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       fetchUserAndNews();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [page, latitude, longitude, range]);

  // Initial location and user fetch

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        const { latitude, longitude } = await getLocation();
        setLatitude(latitude);
        setLongitude(longitude);
      } catch (err) {
        console.error('Error initializing user/location:', err);
      }
    };

    initialize();
  }, []);

  // Fetch paginated news based on current location, page, and range
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!latitude || !longitude || !hasMore) return;
      setLoading(true);

      try {
        const data = await fetchNearbyNews(latitude, longitude, range, page);
        setNearbyNews((prev) => [...prev, ...data]);
        if (data.length < 10) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      }

      setLoading(false);
    };

    fetchNews();
  }, [page, latitude, longitude, range]);



  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        if (latitude && longitude) {
          // setPage(1); // Reset page
          // setNearbyNews([]); // Clear existing news

          const freshNews = await fetchNearbyNews(latitude, longitude, range, 1);
          setNearbyNews(freshNews);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [latitude, longitude, range]);




  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;

      if (nearBottom && !loading) {
        setPage((prev) => prev + 1);
      }
    };



    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);




  useEffect(() => {
    const getAddress = async () => {
      if (latitude && longitude) {
        const addr = await fetchAddressFromCoordinates(latitude, longitude);
        setCurrentAddress(addr);
      }
    };
    getAddress();
  }, [latitude, longitude]);





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


  const handleAddressChange = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/forward-geocode?address=${customAddress}`);
      const data = await response.json();
      console.log(data)

      setLatitude(data.lat)
      setLongitude(data.log)


      // console.log(data)



      const freshNews = await fetchNearbyNews(data.lat, data.log, range, 1);
      setNearbyNews(freshNews);
      setCurrentAddress(currentAddress);
      setShowAddressInput(false);
    } catch (error) {
      console.error("Error fetching address coordinates:", error);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        withCredentials: true,
      });
      setUser(null);
      navigate('/login');
      window.location.reload();
      // Optionally redirect to login
    } catch (err) {
      console.error('Logout failed', err);
    }
  };




  const fetchAddressFromCoordinates = async (lat, lon) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      // console.log(data);
      return data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Unable to fetch address";
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
      // console.log(res.data);
      handleFetchNews(latitude, longitude);
      setTitle('');
      setDescription('');
      setImage(null);


    } catch (err) {
      console.error(err);
      alert('Error posting news');
    }
  };

  const [showModal, setShowModal] = useState(false);



  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white  flex-col md:flex-row">
      {/* Sidebar */}
      <div className="ml-[3vw] h-[90vh] transform translate-y-10 rounded-2xl md:block md:w-2/9 bg-white dark:bg-gray-800 p-6 flex flex-col sticky top-0 border border-gray-200 dark:border-gray-700 shadow-md">
        <div className="mt-4 flex flex-col gap-4">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <img
              src={`http://localhost:8000/uploads/${user.profilePic}`}
              alt="Profile"
              className="w-12 h-12 rounded-full shadow-md"
            />
            <div>
              <h2 className="text-lg font-semibold">Hi, {user.username}</h2>
            </div>
          </div>

          {/* Address */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <img className="w-5 h-5" src={locationIcon} alt="Location" />
              <strong className="text-sm">Address:</strong>
            </div>
            <p className="ml-7 mt-1">{currentAddress || "Fetching address..."}</p>
          </div>

          {/* Change Address */}
          <button
            onClick={() => setShowAddressInput(!showAddressInput)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Change Address
          </button>

          {showAddressInput && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="border p-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter new address"
              />
              <button
                onClick={handleAddressChange}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
              >
                Submit Address
              </button>
            </div>
          )}

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/myposts")}
            className="w-full mt-1 px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-800 transition"
          >
            My Dashboard
          </button>

          {/* Range Selector */}
          <div>
            <label className="block mb-1 text-sm font-medium">Range</label>
            <select
              value={range}
              onChange={async (e) => {
                const newRange = e.target.value;
                setRange(newRange);
                setPage(1);
                setHasMore(true);
                if (latitude && longitude) {
                  const data = await fetchNearbyNews(latitude, longitude, newRange, 1);
                  setNearbyNews(data);
                }
              }}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
            >
              {[2, 5, 10, 15, 30, 50, 1000].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-2 rounded-full shadow-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className=" flex-1 w-full md:w-4/5 lg:w-3/5 p-4 md:p-6 overflow-y-auto mx-auto">
        <div className=" lg:mx-[10vw] sm:mx-0.5 md:mx-0.5">
          <h2 className="text-lg font-semibold mb-4 text-center">Post News</h2>

          <form onSubmit={handleSubmit} className=" border border-gray-200 dark:border-gray-700 dark:bg-gray-800 space-y-2 p-3.5 rounded-2xl">
            <input
              type="text"
              placeholder="News Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl"
            />
            <textarea
              placeholder="News Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl"
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
                className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl mr-3"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="bg-blue-500 w-[25%] hover:bg-blue-600 text-white py-2 px-4 rounded-2xl"
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

          {/* <MapContainer center={[latitude , longitude ]} zoom={13} style={{ height: '500px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            // Current Location Marker

            {latitude && longitude && (
              <Marker position={[latitude, longitude]}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}

            // Nearby News Markers
            {nearbyNews.map((news) => {
              const coords = news.location?.coordinates;
              if (!coords || coords.length !== 2) return null;

              const [lng, lat] = coords; // Note: coordinates are [lng, lat]
              return (
                <Marker
                  key={news._id}
                  position={[lat, lng]} // Leaflet wants [lat, lng]
                  eventHandlers={{
                    click: () => onMarkerClick(news),
                  }}
                >
                  <Popup>{news.title}</Popup>
                </Marker>
              );
            })}

          </MapContainer> */}


          <div className="mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              Nearby News
            </h2>

            {nearbyNews.length > 0 ? (
              <ul className="space-y-5">
                {nearbyNews.map((news, index) => {
                  const formattedDate = new Date(news.createdAt).toLocaleDateString("en-GB", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <li
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                    >
                      {/* Author + Date */}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        {/* Author Info */}
                        <div className="flex items-center space-x-2">
                          <img
                            src={`http://localhost:8000/uploads/${news.createdBy?.profilePic}`}
                            alt="Author"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {news.createdBy?.username || news.userName}
                          </span>
                        </div>

                        {/* Time Ago */}
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {news.imageUrl && (
                        <img
                          src={`http://localhost:8000/${news.imageUrl}`}
                          alt="News"
                          className="w-full h-48 object-cover rounded-md mb-3 mt-3"
                        />
                      )}

                      {/* Like button + count */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleLike(news._id)}
                          className="text-2xl transition-transform hover:scale-110"
                          title="Like"
                        >
                          {news.likes.includes(currentUserId) ? '❤️' : '🤍'}
                        </button>
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {news.likes.length}
                        </span>
                      </div>




                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {news.title}
                      </h3>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-3 whitespace-pre-wrap">
                        {news.description}
                      </p>


                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No nearby news available.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
