import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
};

const CategoryList = () => {
    const { auctionId } = useParams();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getAll(auctionId);
            setCategories(response || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || 'Failed to fetch categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        fetchCategories();
    }, [auctionId, fetchCategories]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.delete(auctionId, id);
                fetchCategories();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1">
                    Categories
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/auctions/${auctionId}/categories/new`)}
                >
                    Create Category
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {categories.length === 0 ? (
                <Alert severity="info">No categories found.</Alert>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {categories.map((category, i) => (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={cardVariants}
                                    custom={i}
                                >
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" component="h2" gutterBottom>
                                                {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {category.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => navigate(`/auctions/${auctionId}/categories/${category.id}/edit`)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(category.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </CardActions>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>
            )}
        </Container>
    );
};

export default CategoryList;
