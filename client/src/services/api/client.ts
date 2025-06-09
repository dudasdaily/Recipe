import axios, { AxiosResponse, AxiosError } from 'axios';

export const API_BASE_URL = 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // 에러 응답이 있는 경우
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || '알 수 없는 오류가 발생했습니다.',
      });
    }
    
    // 네트워크 오류 등의 경우
    return Promise.reject({
      status: 500,
      message: '서버와 통신할 수 없습니다.',
    });
  }
); 