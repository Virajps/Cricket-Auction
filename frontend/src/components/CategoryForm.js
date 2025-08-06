import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../services/api';
import { motion } from 'framer-motion';

const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const CategoryForm = () => {
    const { auctionId, id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCategory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await categoryService.getById(auctionId, id);
            setFormData({
                name: response.name,
                description: response.description || ''
            });
        } catch (error) {
            console.error('Error fetching category:', error);
            setError('Failed to load category details');
        } finally {
            setLoading(false);
        }
    }, [auctionId, id]);

    useEffect(() => {
        if (id) {
            fetchCategory();
        }
    }, [id, fetchCategory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (id) {
                await categoryService.update(auctionId, id, formData);
            } else {
                await categoryService.create(auctionId, formData);
            }
            navigate(`/auctions/${auctionId}/categories`);
        } catch (error) {
            console.error('Error saving category:', error);
            setError(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {id ? 'Edit Category' : 'Create New Category'}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Category Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(-1)}
                                        size="large"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        size="large"
                                    >
                                        {id ? 'Update' : 'Create'} Category
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CategoryForm;