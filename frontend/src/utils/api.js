import axios from 'axios';

axios.defaults.withCredentials = true;

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};
