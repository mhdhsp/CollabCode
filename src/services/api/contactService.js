// src/services/api/contactService.js
import axiosInstance from './axiosInstance';

const contactService = {
  sendContact: async ({ name, email, message }) => {
    console.log("sendContact called with:", { name, email, message });
    try {
      console.log("Sending contact request to /api/contact");
      const res = await axiosInstance.post('/api/contact', {
        name,
        email,
        message,
      });
      console.log("Contact request successful", res.data);
      return res.data;
    } catch (err) {
      console.log("Contact request failed", err);
      const msg = err.response?.data?.message || err.message || 'Contact error';
      console.log("Error message:", msg);
      throw new Error(msg);
    }
  },
};

export default contactService;
