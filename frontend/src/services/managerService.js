import api from './api';

export const managerService = {
  // Requests
  getAllRequests: async (params = {}) => {
    const response = await api.get('/manager/requests', { params });
    return response.data;
  },
  getRequestById: async (id) => {
    const response = await api.get(`/manager/requests/${id}`);
    return response.data;
  },
  updateRequestPriority: async (id, priority) => {
    const response = await api.patch(`/manager/requests/${id}/priority`, { priority });
    return response.data;
  },
  updateRequest: async (id, data) => {
    const response = await api.put(`/manager/requests/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteRequest: async (id) => {
    const response = await api.delete(`/manager/requests/${id}`);
    return response.data;
  },

  // Users & Technicians
  getCustomers: async () => {
    const response = await api.get('/manager/customers');
    return response.data;
  },
  getTechnicians: async () => {
    const response = await api.get('/manager/technicians');
    return response.data;
  },
  addTechnician: async (techData) => {
    const response = await api.post('/manager/technicians', techData);
    return response.data;
  },
  removeTechnician: async (id) => {
    const response = await api.delete(`/manager/technicians/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/manager/categories');
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/manager/categories', categoryData);
    return response.data;
  },
  
  // Assignment
  assignTechnician: async (request_id, technician_ids) => {
    const response = await api.post('/assignments', { request_id, technician_ids });
    return response.data;
  },
  
  // Analytics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};
