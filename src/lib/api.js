

import axios from 'axios'

// Prefer environment variable
const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "https://staurants-server.onrender.com/api");

export const api = axios.create({ baseURL })

export function authHeader() {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
