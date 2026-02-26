import axios from 'axios';

// base url comes from environment variable or falls back to localhost for dev
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;