import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/auction');
        } catch (error) {
            setError('Registration failed. Please try again.');
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
                                type="password"
                                id="password"
                                autoComplete="new-password"
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
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Register
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Register; 