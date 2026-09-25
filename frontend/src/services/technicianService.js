import api from './api';

export const technicianService = {
  getAssignedRequests: async (params = {}) => {
    const response = await api.get('/technician/requests', { params });
    return response.data;
  },
  
  updateRequestStatus: async (id, status, remarks = '') => {
    const response = await api.post(`/technician/requests/${id}/status`, { 
      status, 
      remarks 
    });
    return response.data;
  }
};
