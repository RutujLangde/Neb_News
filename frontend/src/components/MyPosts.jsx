import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';

function MyPosts() {
  const { user } = useContext(AuthContext);
  const [currUser, setCurrUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setCurrUser(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userId = user?._id || currUser?._id;
        if (!userId) return;

        const res = await axios.get(`http://localhost:8000/api/user/${userId}`, {
          withCredentials: true
        });
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      }
    };

    fetchPosts();
  }, [user, currUser]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:8000/api/news/${postId}`, {
        withCredentials: true,
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      alert('Error deleting post');
      console.error(err);
    }
  };


  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Posts</h2>
    <div className='w-[60vw]'>
      {posts.length > 0 ? (
        <ul className="space-y-4">
          {posts.map((news, index) => (
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

              <p></p>

              <button
                onClick={() => handleEdit(post._id)}
                style={{ marginRight: '1rem', backgroundColor: 'orange', color: 'white', border: 'none', padding: '0.5rem' }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(news._id)}
                style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.5rem' }}
              >
                Delete
              </button>



            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-4 text-center">No nearby news available.</p>
      )}

      </div>



      {/* {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>

            <button
              onClick={() => handleEdit(post._id)}
              style={{ marginRight: '1rem', backgroundColor: 'orange', color: 'white', border: 'none', padding: '0.5rem' }}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(post._id)}
              style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.5rem' }}
            >
              Delete
            </button>
          </div>
        ))
      )} */}
    </div>
  );
}

export default MyPosts;
