import axiosInstance from './axiosInstance';

const projectChatService = {
  getMessages: async (projectId, limit = 10) => {
    const res = await axiosInstance.get(`/api/Chat/GetAllMsg/${projectId}?limit=${limit}`);
    return res.data.data ?? [];
  },

  sendMessage: async (projectId, content) => {
    const res = await axiosInstance.post(`/api/Chat/AddMsg`, {
      projectId,
      content,
    });
    return res.data.data ?? res.data;
  },
};

export default projectChatService;