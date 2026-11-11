
import axios from "axios";

// Automatically use the computer's network address
// so the API works on both PC and mobile.
const API = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the saved token to protected requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("vickstack_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
