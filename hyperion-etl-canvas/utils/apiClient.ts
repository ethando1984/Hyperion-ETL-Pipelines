import axios, { AxiosInstance } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8083/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
    (config) => {
        // Get user from session storage (oidc-client-ts stores it there)
        const oidcStorage = sessionStorage.getItem(`oidc.user:http://localhost:8080:hyperion-cms`);

        if (oidcStorage) {
            try {
                const user = JSON.parse(oidcStorage);
                if (user?.access_token) {
                    config.headers.Authorization = `Bearer ${user.access_token}`;
                }
            } catch (error) {
                console.error('Error parsing OIDC user data:', error);
            }
        } else {
            // Development mode: No token required
            console.log('API request without authentication (development mode)');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - in development, just log the error
            console.warn('Unauthorized request (401) - Auth may be disabled on backend');
            // Only redirect in production or when we have OAuth configured
            if (sessionStorage.getItem('oidc.user:http://localhost:8080:hyperion-cms')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
