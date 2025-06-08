import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

function Login() {
  const { login, register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('email', email);
        if (image) formData.append('profilePic', image);
        await register(formData);
      } else {
        await login(username, password);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-4">
          {isRegister ? 'Create an Account' : 'Welcome Back'}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            required
            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full mt-1 text-gray-700 dark:text-gray-300"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-all"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>

        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mt-4">
          {isRegister ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <span
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
