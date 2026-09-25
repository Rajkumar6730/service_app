import api from './api';

export const requestService = {
  createRequest: async (formData) => {
    const response = await api.post('/service-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getMyRequests: async (params = {}) => {
    const response = await api.get('/service-requests/my', { params });
    return response.data;
  },

  updateRequest: async (requestId, formData) => {
    const response = await api.put(`/service-requests/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteRequest: async (requestId) => {
    const response = await api.delete(`/service-requests/${requestId}`);
    return response.data;
  },
  
  submitFeedback: async (requestId, feedbackData) => {
    const response = await api.post(`/feedback/${requestId}`, feedbackData);
    return response.data;
  },

  downloadAttachment: async (attachmentId, filename) => {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
