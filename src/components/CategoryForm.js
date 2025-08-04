import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Alert, TextField } from '@mui/material';
import { categoryService } from '../services/api';
import { motion } from 'framer-motion';

const CategoryForm = () => {
    const { auctionId, id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [category, setCategory] = useState({
        name: '',
        description: ''
    });

    const loadCategory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await categoryService.getById(auctionId, id);
            setCategory(data);
        } catch (err) {
            setError('Failed to load category details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auctionId, id]);

    useEffect(() => {
        if (id) {
            loadCategory();
        }
    }, [id, loadCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            if (id) {
                await categoryService.update(auctionId, id, category);
            } else {
                await categoryService.create(auctionId, category);
            }
            
            navigate(`/auctions/${auctionId}/categories`);
        } catch (err) {
            setError('Failed to save category');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
    };

    return (
        <Container maxWidth="sm">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.main" fontWeight={900} gutterBottom>
                        {id ? 'Edit Category' : 'Add New Category'}
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Name"
                            name="name"
                            value={category.name}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={category.description}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <Button 
                            className="w-100" 
                            type="submit" 
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Saving...' : (id ? 'Update Category' : 'Add Category')}
                        </Button>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CategoryForm; 