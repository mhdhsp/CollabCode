import axiosInstance from './axiosInstance';

const projectService = {
  createProject: async (payload) => {
    console.log("createProject called with:", payload);
    const res = await axiosInstance.post('/api/Project/Create', payload);
    console.log("createProject response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  joinProject: async (payload) => {
    console.log("joinProject called with:", payload);
    const res = await axiosInstance.post('/api/Project/Join', payload);
    console.log("joinProject response:", res.data);
    return res.data.data ?? res.data.data ?? res.data;
  },
  enterProject: async (projectId) => {
    console.log("enterProject called with projectId:", projectId);
    const res = await axiosInstance.get(`/api/Project/Enter/${projectId}`);
    console.log("enterProject response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  leaveProject:async (projectId)=>{
    console.log("leav project with id "+projectId);
    const res=await axiosInstance.get(`api/Project/Leave/${projectId}`);
    console.log("leave response", res.data);
    return res.data.data??  res.data;
  },
  destroyProject: async (projectId) => {
    console.log("destroyProject called with projectId:", projectId);
    const res = await axiosInstance.delete(`/api/Project/destroy/${projectId}`);
    console.log("destroyProject response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  removeMember: async (projectId, memberId) => {
    console.log("removeMember called with projectId:", projectId, "memberId:", memberId);
    const res = await axiosInstance.delete(`/api/Project/Member/${projectId}/${memberId}`);
    console.log("removeMember response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  }
};

export default projectService;
