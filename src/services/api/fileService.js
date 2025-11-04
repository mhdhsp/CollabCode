import axiosInstance from './axiosInstance';

const fileService = {
  createFile: async (payload) => {
    console.log("createFile called with:", payload);
    const res = await axiosInstance.post('/api/File/create', payload);
    console.log("createFile response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  deleteFile: async (fileId) => {
    console.log("deleteFile called with fileId:", fileId);
    const res = await axiosInstance.delete(`/api/File/Delete/${fileId}`);
    console.log("deleteFile response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  saveFile:async(payload)=>{
     console.log("saveFile called with:", payload);
    const res = await axiosInstance.patch('/api/File/Save', payload);
    console.log("saveFile response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  updateFile: async (payload) => {
    console.log("updateFile called with:", payload);
    const res = await axiosInstance.put('/api/File/Update', payload);
    console.log("updateFile response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  assign: async (payload) => {
    console.log("assign called with:", payload);
    const res = await axiosInstance.patch('/api/File/Assign', payload);
    console.log("assign response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  unassign: async (fileId) => {
    console.log("unassign called with fileId:", fileId);
    const res = await axiosInstance.patch(`/api/File/UnAssign/${fileId}`);
    console.log("unassign response:", res.data);
    return res.data.data ?? res.data.data ?? res.data;
  },
  setFileAccess: async (payload) => {
    console.log("setFileAccess called with:", payload);
    const res = await axiosInstance.put('/api/File/Access', payload);
    console.log("setFileAccess response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  grantFileAccess: async (payload) => {
    console.log("grantFileAccess called with:", payload);
    const res = await axiosInstance.post('/api/File/GrantAccess', payload);
    console.log("grantFileAccess response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  revokeFileAccess: async (payload) => {
    console.log("revokeFileAccess called with:", payload);
    const res = await axiosInstance.post('/api/File/RevokeAccess', payload);
    console.log("revokeFileAccess response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  },
  getFileAccessList: async (fileId) => {
    console.log("getFileAccessList called with fileId:", fileId);
    const res = await axiosInstance.get(`/api/File/Access/${fileId}`);
    console.log("getFileAccessList response:", res.data);
    return res.data.data ?? res.data.Data ?? res.data;
  }
};

export default fileService;
