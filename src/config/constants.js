// src/config/constants.js
export const API_BASE = import.meta.env.VITE_API_BASE_URL ;
export const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '';
export const FORCE_HTTPS = import.meta.env.VITE_FORCE_HTTPS === 'true';
export const LOCALSTORAGE_TOKEN_KEY = 'token';
export const EXTERNAL_EDITOR_URL = 'https://editor.example.com';
