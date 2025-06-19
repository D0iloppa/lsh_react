import axios from 'axios';

const API_HOST = import.meta.env.VITE_API_HOST;

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_HOST,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 간단한 API 클라이언트
const ApiClient = {
  // GET 요청
  get(endpoint, config = {}) {
    return axiosInstance.get(endpoint, config).then(response => response.data);
  },

  // POST 요청  
  post(endpoint, data = null, config = {}) {
    return axiosInstance.post(endpoint, data, config).then(response => response.data);
  },

  // PUT 요청
  put(endpoint, data = null, config = {}) {
    return axiosInstance.put(endpoint, data, config).then(response => response.data);
  },

  // DELETE 요청
  delete(endpoint, config = {}) {
    return axiosInstance.delete(endpoint, config).then(response => response.data);
  },

  // PATCH 요청
  patch(endpoint, data = null, config = {}) {
    return axiosInstance.patch(endpoint, data, config).then(response => response.data);
  },

  // 인증 토큰 설정
  setAuthToken(token) {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  // axios 인스턴스 직접 접근 (필요시)
  instance: axiosInstance
};

export default ApiClient;