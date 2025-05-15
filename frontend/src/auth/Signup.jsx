import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

function SignUp() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // ✅ Add email state

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, email); // ✅ Include email
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <a href="/login" style={{ color: 'blue' }}>Login here</a>
      </p>
    </>
  );
}

export default SignUp;
