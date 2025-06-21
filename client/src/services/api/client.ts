import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 환경 변수 디버깅
console.log('🔍 환경 변수 디버깅:');
console.log('- process.env.EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
console.log('- __DEV__:', __DEV__);

// 개발 모드에서 환경 변수가 로드되지 않는 경우 대비
const DEV_API_URL = 'http://172.20.10.7:3000/api/v1';
const FALLBACK_API_URL = 'http://localhost:3000/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
  (__DEV__ ? DEV_API_URL : FALLBACK_API_URL);

console.log('🔗 최종 API Base URL:', API_BASE_URL);

// 환경 변수 로드 실패 경고
if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL 환경 변수가 없습니다. 기본값 사용:', API_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 추가
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${fullUrl}`);
    if (config.data) {
      console.log('📤 요청 데이터:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const fullUrl = `${response.config.baseURL}${response.config.url}`;
    console.log(`✅ API 응답 성공: ${response.status} ${fullUrl}`);
    console.log('📥 응답 데이터:', response.data);
    return response.data;
  },
  (error: AxiosError) => {
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
    console.error(`❌ API 응답 오류: ${error.response?.status || 'No Response'} ${fullUrl}`);
    
    // 에러 응답이 있는 경우
    if (error.response) {
      console.error('📥 오류 응답 데이터:', error.response.data);
      return Promise.reject({
        status: error.response.status,
        message: (error.response.data as any)?.message || '알 수 없는 오류가 발생했습니다.',
        data: error.response.data,
      });
    }
    
    // 네트워크 오류 등의 경우
    if (error.request) {
      console.error('🌐 네트워크 오류:', error.message);
      return Promise.reject({
        status: 500,
        message: '서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.',
        error: error.message,
      });
    }
    
    // 그 외의 오류
    console.error('🔥 요청 설정 오류:', error.message);
    return Promise.reject({
      status: 500,
      message: '요청 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
); 