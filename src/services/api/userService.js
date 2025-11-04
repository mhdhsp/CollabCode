import axiosInstance from './axiosInstance';

const userService = {
  getUserProjects: async () => {
    console.log("getUserProjects called");
    const res = await axiosInstance.get('/api/User/Projects');
    console.log("getUserProjects response:", res.data);
    return res.data ?? res.data.Data ?? res.data.data;
  },
};

export default userService;
