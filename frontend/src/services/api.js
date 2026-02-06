import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
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
    delete: async (id) => {
        const response = await api.delete(`/teams/${id}`);
        return response.data;
    },
    getByAuction: async (auctionId) => {
        const response = await api.get(`/auctions/${auctionId}/teams`);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await api.put(`/teams/${id}/toggle-status`);
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

export default api;
