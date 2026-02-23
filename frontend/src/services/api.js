import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'https://pale-lucinda-squadify-d90cdf3a.koyeb.app/api').replace(/\/$/, '');
const API_ORIGIN = API_URL.replace(/\/api$/, '');

const toBackendAbsoluteUrl = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('//')) return `${window.location.protocol}${trimmed}`;
    if (trimmed.startsWith('/')) return `${API_ORIGIN}${trimmed}`;
    return `${API_ORIGIN}/${trimmed}`;
};

const normalizeBackendUrlFields = (payload, seen = new WeakSet()) => {
    if (!payload || typeof payload !== 'object') return payload;
    if (seen.has(payload)) return payload;
    seen.add(payload);

    if (Array.isArray(payload)) {
        payload.forEach((item) => normalizeBackendUrlFields(item, seen));
        return payload;
    }

    Object.entries(payload).forEach(([key, value]) => {
        if (typeof value === 'string' && /url$/i.test(key)) {
            payload[key] = toBackendAbsoluteUrl(value);
            return;
        }
        if (value && typeof value === 'object') {
            normalizeBackendUrlFields(value, seen);
        }
    });

    return payload;
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
    if (!error) return fallback;

    // No HTTP response means network/CORS/server unreachable
    if (!error.response) {
        return 'Unable to reach server. Check internet, backend status, or CORS settings.';
    }

    const data = error.response.data;
    if (!data) {
        return fallback;
    }

    if (typeof data === 'string' && data.trim()) {
        return data;
    }

    if (data.message && typeof data.message === 'string' && data.message.trim()) {
        return data.message;
    }

    if (data.details && typeof data.details === 'object') {
        const detailMessages = Object.entries(data.details).map(([field, msg]) => `${field}: ${msg}`);
        if (detailMessages.length > 0) {
            return detailMessages.join('; ');
        }
    }

    if (data.error && typeof data.error === 'string' && data.error.trim()) {
        return data.error;
    }

    return fallback;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        normalizeBackendUrlFields(response.data);
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const returnTo = `${window.location.pathname}${window.location.search}`;
            window.location.href = `/login?redirect=${encodeURIComponent(returnTo)}`;
        }
        const normalizedMessage = getApiErrorMessage(error);
        error.userMessage = normalizedMessage;
        error.message = normalizedMessage;
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    },
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    setAuthToken: (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }
};

export const auctionService = {
    getAll: async () => {
        const response = await api.get('/auctions');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/auctions/${id}`);
        return response.data;
    },
    create: async (auctionData) => {
        const response = await api.post('/auctions', auctionData);
        return response.data;
    },
    update: async (id, auctionData) => {
        const response = await api.put(`/auctions/${id}`, auctionData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/auctions/${id}`);
        return response.data;
    },
    getUpcoming: async () => {
        const response = await api.get('/auctions/upcoming');
        return response.data;
    },
    getRecent: async () => {
        const response = await api.get('/auctions/recent');
        return response.data;
    },
    getPast: async () => {
        const response = await api.get('/auctions/past');
        return response.data;
    },
    getMyAuctions: async () => {
        const response = await api.get('/auctions/my-auctions');
        return response.data;
    },
    togglePlayerRegistration: async (id) => {
        const response = await api.put(`/auctions/${id}/toggle-registration`);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await api.put(`/auctions/${id}/toggle-status`);
        return response.data;
    },
    setUnsoldPlayersAvailable: async (auctionId) => {
        const response = await api.patch(`/auctions/${auctionId}/players/set-unsold-available`);
        return response.data;
    },
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
export const teamService = {
    getAll: async () => {
        const response = await api.get('/teams');
        return response.data;
    },
    getByUsername: async (username) => {
        const response = await api.get(`/teams/user/${username}`);
        return response.data;
    },
    getById: async (id, auctionId) => {
        const response = await api.get(`auctions/${auctionId}/teams/${id}`);
        return response.data;
    },
    create: async (auctionId, teamData) => {
        const response = await api.post(`/auctions/${auctionId}/teams`, teamData);
        return response.data;
    },
    update: async (auctionId, id, teamData) => {
        const response = await api.put(`auctions/${auctionId}/teams/${id}`, teamData);
        return response.data;
    },
    delete: async (auctionId, id) => {
        const response = await api.delete(`/auctions/${auctionId}/teams/${id}`);
        return response.data;
    },
    getByAuction: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/teams`);
        return response.data;
    },
    updateBudget: async (id, budget) => {
        const response = await api.put(`/teams/${id}/budget`, { budget });
        return response.data;
    },
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    addIconPlayer: async (auctionId, teamId, playerId) => {
        const response = await api.post(`/auctions/${auctionId}/teams/${teamId}/icon-players/${playerId}`);
        return response.data;
    },
    removeIconPlayer: async (auctionId, teamId, playerId) => {
        const response = await api.delete(`/auctions/${auctionId}/teams/${teamId}/icon-players/${playerId}`);
        return response.data;
    },
    removePlayerFromTeam: async (auctionId, teamId, playerId) => {
        const response = await api.delete(`/auctions/${auctionId}/teams/${teamId}/players/${playerId}`);
        return response.data;
    },
    addPlayerToTeam: async (auctionId, teamId, playerId, finalBidAmount = null) => {
        const payload = finalBidAmount == null ? {} : { finalBidAmount };
        const response = await api.post(`/auctions/${auctionId}/teams/${teamId}/players/${playerId}`, payload);
        return response.data;
    }
};
export const playerService = {
    getAll: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/players`);
        return response.data;
    },
    getAvailable: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/players/available`);
        return response.data;
    },
    getByTeam: async (teamId, auctionId) => {
        const response = await api.get(`auctions/${auctionId}/players/team/${teamId}`);
        return response.data;
    },
    create: async (auctionId, playerData) => {
        const response = await api.post(`/auctions/${auctionId}/players`, playerData);
        return response.data;
    },
    update: async (auctionId, playerId, playerData) => {
        const response = await api.put(`/auctions/${auctionId}/players/${playerId}`, playerData);
        return response.data;
    },
    delete: async (auctionId, playerId) => {
        const response = await api.delete(`/auctions/${auctionId}/players/${playerId}`);
        return response.data;
    },
    getById: async (auctionId, playerId) => {
        const response = await api.get(`/auctions/${auctionId}/players/${playerId}`);
        return response.data;
    },
    register: async (auctionId, playerData) => {
        const response = await api.post(`/auctions/${auctionId}/players/register`, playerData);
        return response.data;
    },
    updateStatus: async (auctionId, playerId, status, teamId = null, finalBidAmount) => {
        const payload = { status };
        if (teamId) {
            payload.teamId = teamId;
        }
        payload.finalBidAmount = finalBidAmount;
        const response = await api.patch(`/auctions/${auctionId}/players/${playerId}/status`, payload);
        console.log('playerService.updateStatus response:', response.data);
        return response.data;
    },
    setAvailableFromUnsold: async (auctionId, playerId) => {
        const response = await api.patch(`/auctions/${auctionId}/players/${playerId}/set-available`);
        return response.data;
    },
    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    importPlayers: async (auctionId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/auctions/${auctionId}/players/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
export const bidService = {
    place: async (auctionId, playerId, bidData) => {
        const response = await api.post(`/auctions/${auctionId}/players/${playerId}/bids`, bidData);
        return response.data;
    },
    getByPlayer: async (auctionId, playerId) => {
        const response = await api.get(`/auctions/${auctionId}/players/${playerId}/bids`);
        return response.data;
    },
    getByTeam: async (teamId) => {
        const response = await api.get(`/teams/${teamId}/bids`);
        return response.data;
    },
    getByAuction: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/bids`);
        return response.data;
    }
};

export const bidRuleService = {
    getAll: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/bid-rules`);
        return response.data;
    },
    getById: async (auctionId, id) => {
        const response = await api.get(`/auctions/${auctionId}/bid-rules/${id}`);
        return response.data;
    },
    create: async (auctionId, ruleData) => {
        const response = await api.post(`/auctions/${auctionId}/bid-rules`, ruleData);
        return response.data;
    },
    update: async (auctionId, id, ruleData) => {
        const response = await api.put(`/auctions/${auctionId}/bid-rules/${id}`, ruleData);
        return response.data;
    },
    delete: async (auctionId, id) => {
        const response = await api.delete(`/auctions/${auctionId}/bid-rules/${id}`);
        return response.data;
    }
};

export const sponsorService = {
    getAll: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/sponsors`);
        return response.data;
    },
    getById: async (auctionId, id) => {
        const response = await api.get(`/auctions/${auctionId}/sponsors/${id}`);
        return response.data;
    },
    create: async (auctionId, sponsorData) => {
        const response = await api.post(`/auctions/${auctionId}/sponsors`, sponsorData);
        return response.data;
    },
    update: async (auctionId, id, sponsorData) => {
        const response = await api.put(`/auctions/${auctionId}/sponsors/${id}`, sponsorData);
        return response.data;
    },
    delete: async (auctionId, id) => {
        const response = await api.delete(`/auctions/${auctionId}/sponsors/${id}`);
        return response.data;
    }
};

export const categoryService = {
    getAll: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/categories`);
        return response.data;
    },
    getById: async (auctionId, id) => {
        const response = await api.get(`/auctions/${auctionId}/categories/${id}`);
        return response.data;
    },
    create: async (auctionId, categoryData) => {
        const response = await api.post(`/auctions/${auctionId}/categories`, categoryData);
        return response.data;
    },
    update: async (auctionId, id, categoryData) => {
        const response = await api.put(`/auctions/${auctionId}/categories/${id}`, categoryData);
        return response.data;
    },
    delete: async (auctionId, id) => {
        const response = await api.delete(`/auctions/${auctionId}/categories/${id}`);
        return response.data;
    }
};

export const accessService = {
    getStatus: async (auctionId = null) => {
        const query = auctionId != null ? `?auctionId=${encodeURIComponent(auctionId)}` : '';
        const response = await api.get(`/access/status${query}`);
        return response.data;
    }
};

export const adminEntitlementService = {
    list: async (username = null) => {
        const query = username ? `?username=${encodeURIComponent(username)}` : '';
        const response = await api.get(`/admin/entitlements${query}`);
        return response.data;
    },
    grant: async (payload) => {
        const response = await api.post('/admin/entitlements', payload);
        return response.data;
    },
    revoke: async (id) => {
        const response = await api.delete(`/admin/entitlements/${id}`);
        return response.data;
    }
};

export default api;
