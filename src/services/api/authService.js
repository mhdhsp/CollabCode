import axiosInstance from './axiosInstance';

const authService = {
  register: async ({ userName, email, password }) => {
    console.log("authService.register called with", { userName, email });
    try {
      const payload = {
        userName,
        email,
        passWord: password,
      };
      console.log("Register payload", payload);
      const res = await axiosInstance.post('/api/Auth/Register', payload);
      console.log("Register response", res.data);
      return res.data;
    } catch (err) {
      console.log("Register error", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Register error';
      console.log("Register error message", msg);
      throw new Error(msg);
    }
  },

  login: async ({ userNameOrEmail, password }) => {
    console.log("authService.login called with", { userNameOrEmail });
    try {
      const payload = {
        userName: userNameOrEmail,
        passWord: password,
      };
      console.log("Login payload", payload);
      const res = await axiosInstance.post('/api/Auth/Login', payload);
      console.log("from login");
      console.log(res.data);
      console.log("Login response data", res.data.data);
      return res.data.data; 
    } catch (err) {
      console.log("Login error", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login error';
      console.log("Login error message", msg);
      throw new Error(msg);
    }
  },

  logout: async () => {
    console.log("authService.logout called");
    try {
      await axiosInstance.post('/api/Auth/Logout');
      console.log("Logout successful");
      return true;
    } catch (err) {
      console.log("Logout error", err);
      return true;
    }
  },
};

export default authService;
