import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
  axios.get('http://localhost:8000/api/auth/me', {
    withCredentials: true
  })
    .then(res => setUser(res.data))
    .catch(() => setUser(null));
}, []);


  const login = async (username, password) => {
    const res = await axios.post('http://localhost:8000/api/auth/login', { username, password },
      {
  withCredentials: true ,
}
    );
    localStorage.setItem('token', res.data.token);
    setUser({ username });
  };

  const register = async (username, password, email) => {
  try {
    const res = await axios.post('http://localhost:8000/api/auth/register', { username, password, email },{
  withCredentials: true ,
});
    localStorage.setItem('token', res.data.token);
    setUser({ username });
  } catch (err) {
    console.error('Registration error:', err.response?.data || err.message);
    throw err;
  }
};



  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
