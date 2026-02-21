import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const redirectQuery = new URLSearchParams(location.search).get('redirect');
    const redirectFromState = location.state?.from?.pathname;
    const redirectTo = redirectQuery || redirectFromState || '/auctions';

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
            await login({
                username: formData.username.trim(),
                password: formData.password
            });
            navigate(redirectTo, { replace: true });
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
                        {redirectTo !== '/auctions' && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Please login to continue.
                            </Alert>
                        )}

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
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                inputProps={{ minLength: 6 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
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
                                disabled={loading || !formData.username.trim() || !formData.password}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate(`/register${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`, { state: { from: location.state?.from } })}
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
