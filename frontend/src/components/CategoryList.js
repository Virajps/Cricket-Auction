import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button, Alert, Container, Paper, Typography, CircularProgress, Box } from '@mui/material';
import { categoryService } from '../services/api';
import { motion } from 'framer-motion';

const CategoryList = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll(auctionId);
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        loadCategories();
    }, [auctionId, loadCategories]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.delete(auctionId, id);
                loadCategories();
            } catch (err) {
                setError('Failed to delete category');
                console.error(err);
            }
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    const tableVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
    };

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={tableVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Categories
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => navigate(`/auctions/${auctionId}/categories/new`)}
                        >
                            Add Category
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="categories table">
                            <TableHead sx={{ bgcolor: 'primary.light' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Description</TableCell>
                                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map(category => (
                                    <TableRow
                                        key={category.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">{category.name}</TableCell>
                                        <TableCell>{category.description}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                sx={{ mr: 1 }}
                                                onClick={() => navigate(`/auctions/${auctionId}/categories/${category.id}/edit`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CategoryList;