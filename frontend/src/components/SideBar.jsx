import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getLocation } from './Handlers/Getlocation';
import { fetchNearbyNews } from './Handlers/GetNews';
import { getCurrentUser } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import locationIcon from '../assets/icons/location icon.png';

const SideBar = ({
  setNearbyNews,
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  range,
  setRange,
  fetchAddressFromCoordinates
}) => {
  const [user, setUser] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    const getAddress = async () => {
      if (latitude && longitude) {
        const addr = await fetchAddressFromCoordinates(latitude, longitude);
        setCurrentAddress(addr);
      }
    };
    getAddress();
  }, [latitude, longitude]);

  const handleAddressChange = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/forward-geocode?address=${customAddress}`);
      const data = await response.json();
      setLatitude(data.lat);
      setLongitude(data.log);
      const freshNews = await fetchNearbyNews(data.lat, data.log, range, 1);
      setNearbyNews(freshNews);
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
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="ml-[3vw] h-[90vh] transform translate-y-10 rounded-2xl md:block md:w-2/9 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between sticky top-0 border border-gray-200 dark:border-gray-700 ">
      <div className='mt-[6vh]'>
        {user && (
          <>
            <img
              src={`http://localhost:8000/uploads/${user.profilePic}`}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <h2 className="text-xl font-bold mb-2">Hi, {user.username}</h2>
          </>
        )}
        <div className="mb-2 text-sm">
          <div className='flex '>
            <img className="h-[25px] w-[25px]" src={locationIcon} alt="" />
            <strong> Address:</strong><br />
          </div>
          {currentAddress || "Fetching address..."}
        </div>

        <button
          onClick={() => setShowAddressInput(prev => !prev)}
          className="w-[100%] mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Change Address
        </button>

        {showAddressInput && (
          <div className="mt-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="border p-1 w-full mt-1"
            />
            <button
              onClick={handleAddressChange}
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
            >
              Submit Address
            </button>
          </div>
        )}

        <button
          onClick={() => navigate('/myposts')}
          className="w-[100%] mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          My Posts
        </button>

        <p className='mt-4'>Range:</p>

        <select
          value={range}
          onChange={async (e) => {
            const newRange = e.target.value;
            setRange(newRange);
            if (latitude && longitude) {
              const data = await fetchNearbyNews(latitude, longitude, newRange, 1);
              setNearbyNews(data);
            }
          }}
          className="border bg-gray-100 dark:bg-gray-900 p-2 rounded w-full"
        >
          {[2, 5, 10, 15, 30, 50, 1000].map(km => (
            <option key={km} value={km}>{km} km</option>
          ))}
        </select>

        <button
          onClick={logout}
          className="w-[100%] mt-4 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
