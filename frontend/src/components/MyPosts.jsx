import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';
import { getCurrentUser } from '../utils/api';
import MyPostsSidebar from './MyPostsSidebar';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [currUser, setCurrUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // post being edited
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
          withCredentials: true,
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

  // Open modal and fill form fields
  const handleEditClick = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
  };

  // Close modal
  const closeModal = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditDescription('');
  };

  // Submit updated post data
  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      alert('Title and description cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/news/${editingPost._id}`,
        {
          title: editTitle,
          description: editDescription,
        },
        { withCredentials: true }
      );
      // Update post in local state
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === editingPost._id ? res.data : p))
      );
      closeModal();
    } catch (err) {
      alert('Failed to update post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <MyPostsSidebar />

      <main className="flex-1 p-8 overflow-auto max-w-5xl mx-auto">
        {/* User Info */}
        <section className="flex items-center space-x-6 mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <img
            src={`http://localhost:8000/uploads/${user.profilePic}`|| '/default-profile.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {currUser?.username || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
            </p>
          </div>
        </section>

        {/* Posts */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            My Posts
          </h2>

          {posts.length > 0 ? (
            <ul className="space-y-6">
              {posts.map((news) => (
                <li
                  key={news._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6"
                >
                  {news.imageUrl && (
                    <img
                      src={`http://localhost:8000/${news.imageUrl}`}
                      alt="News"
                      className="w-full max-h-64 object-cover rounded-md mb-4"
                    />
                  )}
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {news.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{news.description}</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Posted at: {new Date(news.createdAt).toLocaleString()}
                    </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {news.likes.length} Likes
                    </span>
                    <div className="space-x-3">
                      <button
                        onClick={() => handleEditClick(news)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(news._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No posts available.</p>
          )}
        </section>

        {/* Edit Modal */}
        {editingPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()} // prevent closing modal on click inside
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Edit Post
              </h3>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
