import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initializeAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                try {
                    // Set the token in axios headers
                    authService.setAuthToken(token);
                    
                    // Validate token by fetching current user
                    const userData = await authService.getCurrentUser();
                    if (userData) {
                        // Create a complete user object with all necessary data
                        const completeUserData = {
                            ...JSON.parse(storedUser),
                            ...userData,
                            token // Include the token in the user object
                        };
                        setUser(completeUserData);
                        // Update stored user data with fresh data
                        localStorage.setItem('user', JSON.stringify(completeUserData));
                    } else {
                        throw new Error('Invalid user data received');
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    // Only clear if it's an authentication error
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            console.log('AuthContext login response:', response);

            // Handle different response formats
            let token, userData;
            
            if (typeof response === 'object') {
                if (response.token) {
                    // Format: { token: "...", username: "..." }
                    token = response.token;
                    userData = {
                        username: response.username,
                        ...response
                    };
                } else if (response.accessToken) {
                    token = response.accessToken;
                    userData = response;
                } else if (response.jwt) {
                    token = response.jwt;
                    userData = response;
                } else {
                    console.error('Unexpected response format:', response);
                    throw new Error('Invalid response format from server');
                }
            } else {
                console.error('Unexpected response type:', typeof response);
                throw new Error('Invalid response type from server');
            }

            if (!token) {
                throw new Error('No token received from server');
            }

            // Set the token in axios headers
            authService.setAuthToken(token);
            
            try {
                // Fetch complete user data
                const completeUserData = await authService.getCurrentUser();
                const userWithToken = {
                    ...completeUserData,
                    token
                };
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userWithToken));
                setUser(userWithToken);
                return userWithToken;
            } catch (error) {
                // If we can't get user details, still store the token and basic user info
                const basicUserData = {
                    username: userData.username,
                    token
                };
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(basicUserData));
                setUser(basicUserData);
                return basicUserData;
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            setError(errorMessage);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        authService.logout();
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 