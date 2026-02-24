// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const config = {
  apiUrl: API_BASE_URL,
  socketUrl: API_BASE_URL
};

export default config;
