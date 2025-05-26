import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

function Login() {
  const { login, register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [image, setImage] = useState(null); // New state

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
    <div>
      <form onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>

        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        {isRegister && (
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          

        )}

        {isRegister && (
          <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />

          

        )}

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>

        <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: 'blue' }}>
          {isRegister ? 'Already have an account? Login' : 'No account? Register'}
        </p>
      </form>
    </div>
  );
}

export default Login;
