import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoded for local dev
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optionally handle global errors here
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
