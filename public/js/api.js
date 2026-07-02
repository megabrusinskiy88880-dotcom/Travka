/**
 * API Client - обёртка для всех запросов к серверу
 */

const API = {
  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`/api${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Ошибка ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // User endpoints
  user: {
    login: (nickname) => API.request('POST', '/user/login', { nickname }),
    logout: () => API.request('POST', '/user/logout'),
    me: () => API.request('GET', '/user/me'),
    getLots: () => API.request('GET', '/user/lots'),
    createOrder: (lotId, quantity) => API.request('POST', '/user/orders', { lotId, quantity }),
    getMyOrders: () => API.request('GET', '/user/orders/mine')
  },

  // Admin endpoints
  admin: {
    login: (password) => API.request('POST', '/admin/login', { password }),
    logout: () => API.request('POST', '/admin/logout'),
    me: () => API.request('GET', '/admin/me'),
    getLots: () => API.request('GET', '/admin/lots'),
    createLot: (formData) => {
      return fetch('/api/admin/lots', {
        method: 'POST',
        body: formData
      }).then(r => r.json());
    },
    updateLot: (id, formData) => {
      return fetch(`/api/admin/lots/${id}`, {
        method: 'PUT',
        body: formData
      }).then(r => r.json());
    },
    deleteLot: (id) => API.request('DELETE', `/admin/lots/${id}`),
    getOrders: () => API.request('GET', '/admin/orders'),
    updateOrder: (id, data) => API.request('PUT', `/admin/orders/${id}`, data),
    getUsers: () => API.request('GET', '/admin/users')
  }
};
