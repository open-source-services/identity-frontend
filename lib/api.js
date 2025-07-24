import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          console.log('Token refresh response:', response.data);
          
          // Handle nested token structure from backend
          const tokens = response.data?.data?.tokens || response.data?.tokens || response.data;
          const { access_token, refresh_token: newRefreshToken } = tokens;
          
          Cookies.set('access_token', access_token, { expires: 1/24 }); // 1 hour
          Cookies.set('refresh_token', newRefreshToken, { expires: 7 }); // 7 days
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  validate: () => apiClient.get('/auth/validate'),
  
  // OAuth endpoints
  getOAuthURL: (provider) => apiClient.get(`/auth/oauth/${provider}`),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  deleteAccount: () => apiClient.delete('/users/account'),
};

export default apiClient;