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

  accessLog({user_id=null, page = false}){
    if(user_id == null || page == false){
      return;
    }

    // 비동기로 요청만 보냄
    axiosInstance.get('/api/accessLog', {
      params: {
        user_id: user_id,
        page: page
      }
    });

    
  },

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

  // form-data 전용 POST 메서드 추가
  postForm(endpoint, data = {}, config = {}) {
    const formData = new URLSearchParams();
    
    // 객체를 URLSearchParams로 변환
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    return axiosInstance.post(endpoint, formData, {
      ...config,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...config.headers
      }
    }).then(response => response.data);
  },

  // multipart/form-data 전용 POST 메서드 추가
  postMultipart(endpoint, data = {}, config = {}) {
    const formData = new FormData();
    
    // 객체를 FormData로 변환
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    return axiosInstance.post(endpoint, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    }).then(response => response.data);
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

  // 이미지 업로드 전용 메서드
  uploadImage(file, config = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosInstance.post('/api/contentUpload', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      onUploadProgress: config.onUploadProgress
    }).then(response => response.data);
  },

  // axios 인스턴스 직접 접근 (필요시)
  instance: axiosInstance
};

export default ApiClient;