import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home/Home';
import Login from './auth/Login';
import SignUp from './auth/Signup';
import MyPosts from './components/MyPosts';
import { AuthContext, AuthProvider } from './auth/AuthContext';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/myposts" element={user ? <MyPosts /> : <Navigate to="/login" />} />
      <Route path="/login/new" element={user ? <Home /> : <Navigate to="/login" />} />


    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
