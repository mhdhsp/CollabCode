// src/services/api/axiosInstance.js
import axios from 'axios';
import { API_BASE, LOCALSTORAGE_TOKEN_KEY } from '../../config/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 100000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request interceptor triggered");
    const token = localStorage.getItem("token");
    console.log("from instance" + token);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set", config.headers.Authorization);
    } else {
      console.log("No token found in localStorage");
    }
    console.log("Final request config", config);
    return config;
  },
  (error) => {
    console.log("Request interceptor error", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received", response);
    return response;
  },
  (error) => {
    console.log("Response error", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
