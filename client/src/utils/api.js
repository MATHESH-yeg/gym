const API_URL = 'http://127.0.0.1:5000/api/v1';

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('oliva_access_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'API Request failed');
    }

    return data;
};

export const api = {
    auth: {
        registerMaster: (data) => apiRequest('/auth/register-master', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        login: (email, password) => apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        refresh: (refreshToken) => apiRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),
    },
    // Add more as needed
};
