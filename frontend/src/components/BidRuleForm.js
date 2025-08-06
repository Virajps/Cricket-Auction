import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Alert, TextField } from '@mui/material';
import { bidRuleService } from '../services/api';
import { motion } from 'framer-motion';

const BidRuleForm = () => {
    const { auctionId, id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rule, setRule] = useState({
        minimumBid: '',
        maximumBid: '',
        bidIncrement: ''
    });

    const loadRule = useCallback(async () => {
        try {
            setLoading(true);
            const data = await bidRuleService.getById(auctionId, id);
            setRule(data);
        } catch (err) {
            setError('Failed to load bid rule details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auctionId, id]);

    useEffect(() => {
        if (id) {
            loadRule();
        }
    }, [id, loadRule]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            if (id) {
                await bidRuleService.update(auctionId, id, rule);
            } else {
                await bidRuleService.create(auctionId, rule);
            }
            
            navigate(`/auctions/${auctionId}/bid-rules`);
        } catch (err) {
            setError('Failed to save bid rule');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRule(prev => ({
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
                        {id ? 'Edit Bid Rule' : 'Add New Bid Rule'}
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Category"
                            name="category"
                            value={rule.category}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Minimum Bid"
                            name="minimumBid"
                            type="number"
                            value={rule.minimumBid}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Maximum Bid"
                            name="maximumBid"
                            type="number"
                            value={rule.maximumBid}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Bid Increment"
                            name="bidIncrement"
                            type="number"
                            value={rule.bidIncrement}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                            inputProps={{ min: 1 }}
                        />
                        <Button 
                            className="w-100" 
                            type="submit" 
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 2, mr: 2 }}
                        >
                            {loading ? 'Saving...' : (id ? 'Update Bid Rule' : 'Add Bid Rule')}
                        </Button>
                        <Button 
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{ mt: 2 }}
                        >
                            Back
                        </Button>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default BidRuleForm; 