import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

// Get token from oidc-client-ts user session
const getAccessToken = (): string | null => {
    const oidcStorage = sessionStorage.getItem(`oidc.user:http://localhost:8080:hyperion-cms`);
    if (oidcStorage) {
        try {
            const user = JSON.parse(oidcStorage);
            return user.access_token;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Create axios instance with interceptors
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    // Request interceptor - add JWT token from OIDC session
    client.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid - redirect to login
                console.error('Unauthorized - redirecting to login');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

export const apiClient = createApiClient();

// API methods
export const pipelineApi = {
    getAll: async (domain?: string, status?: string) => {
        const params = new URLSearchParams();
        if (domain) params.append('domain', domain);
        if (status) params.append('status', status);

        const response = await apiClient.get(`/pipelines?${params}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/pipelines/${id}`);
        return response.data;
    },

    create: async (data: { domain: string; name: string; description?: string }) => {
        const response = await apiClient.post('/pipelines', data);
        return response.data;
    },

    update: async (id: string, data: { domain: string; name: string; description?: string }) => {
        const response = await apiClient.put(`/pipelines/${id}`, data);
        return response.data;
    },

    syncGraph: async (id: string, graph: { nodes: any[]; edges: any[] }) => {
        const response = await apiClient.put(`/pipelines/${id}/graph`, graph);
        return response.data;
    },

    validate: async (id: string) => {
        const response = await apiClient.get(`/pipelines/${id}/validate`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await apiClient.post(`/pipelines/${id}/activate`);
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/pipelines/${id}`);
    },

    getGraph: async (id: string) => {
        const [nodesRes, edgesRes] = await Promise.all([
            apiClient.get(`/pipelines/${id}/nodes`),
            apiClient.get(`/pipelines/${id}/edges`)
        ]);
        return {
            nodes: nodesRes.data,
            edges: edgesRes.data
        };
    }
};

export const executionApi = {
    runPipeline: async (id: string) => {
        const response = await apiClient.post(`/execution/run/${id}`);
        return response.data;
    },

    getRun: async (runId: string) => {
        const response = await apiClient.get(`/execution/runs/${runId}`);
        return response.data;
    },

    stopRun: async (runId: string) => {
        await apiClient.post(`/execution/runs/${runId}/stop`);
    },

    getRunLogs: async (runId: string) => {
        const response = await apiClient.get(`/execution/runs/${runId}/logs`);
        return response.data;
    }
};
