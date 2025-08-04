import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Submitting login with credentials:', formData); // Debug log
            await login(formData);
            navigate('/auctions');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || err.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Paper elevation={0} sx={{ p: 4, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography component="h1" variant="h4" align="center" gutterBottom>
                            Login
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={formData.username}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#ced4da',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#007BFF',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#007BFF',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#ced4da',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#007BFF',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#007BFF',
                                        },
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate('/register')}
                                sx={{ color: 'primary.main', fontWeight: 600 }}
                            >
                                Don't have an account? Register
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Login; 