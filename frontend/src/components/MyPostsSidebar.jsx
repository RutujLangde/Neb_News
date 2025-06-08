// src/components/MyPostsSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyPostsSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[20vw] min-h-screen p-6 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 sticky top-0">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">My Dashboard</h2>
      
      <ul className="space-y-4">
        <li>
          <button
            onClick={() => navigate('/create')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
          >
            ➕ Create New Post
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-md transition"
          >
            🏠 Go to Home
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-md transition"
          >
            👤 My Profile
          </button>
        </li>
      </ul>

      {/* Add more features if needed */}
    </div>
  );
};

export default MyPostsSidebar;
