import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const redirectQuery = new URLSearchParams(location.search).get('redirect');
    const redirectFromState = location.state?.from?.pathname;
    const redirectTo = redirectQuery || redirectFromState || '/auctions';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setSuccess('');
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const username = formData.username.trim();
        const email = formData.email.trim();
        const password = formData.password;

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await register({ username, email, password });
            await login({ username, password });
            setSuccess('Account created successfully. Redirecting...');
            navigate(redirectTo, { replace: true });
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
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
                            Register
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                                {success}
                            </Alert>
                        )}
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ mt: 1, width: '100%' }}
                        >
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
                                inputProps={{ minLength: 3, maxLength: 20 }}
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
                                }} />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="new-password"
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
                                }} />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword}
                                helperText={
                                    formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
                                        ? 'Passwords do not match'
                                        : ''
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                }} />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
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
                                }} />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading || !formData.username.trim() || !formData.email.trim() || !formData.password || formData.password !== formData.confirmPassword}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate(`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`, { state: { from: location.state?.from } })}
                                sx={{ color: 'primary.main', fontWeight: 600 }}
                            >
                                Already have an account? Login
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Register; 
