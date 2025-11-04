// src/utils/validators.js
export const isEmail = (value) => {
  if (!value) return false;
  // simple email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(value).toLowerCase());
};

export const minLength = (value, len) => {
  if (typeof value !== 'string') return false;
  return value.trim().length >= len;
};