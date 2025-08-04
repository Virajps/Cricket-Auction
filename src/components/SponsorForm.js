import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Alert, Button } from '@mui/material';
import { sponsorService } from '../services/api';
import { motion } from 'framer-motion';
import { Container, Paper, Typography } from '@mui/material';

const SponsorForm = () => {
    const { auctionId, id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sponsor, setSponsor] = useState({
        name: '',
        logoUrl: '',
        website: '',
        description: ''
    });

    const loadSponsor = useCallback(async () => {
        try {
            setLoading(true);
            const data = await sponsorService.getById(auctionId, id);
            setSponsor(data);
        } catch (err) {
            setError('Failed to load sponsor details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auctionId, id]);

    useEffect(() => {
        if (id) {
            loadSponsor();
        }
    }, [id, loadSponsor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            if (id) {
                await sponsorService.update(auctionId, id, sponsor);
            } else {
                await sponsorService.create(auctionId, sponsor);
            }
            
            navigate(`/auctions/${auctionId}/sponsors`);
        } catch (err) {
            setError('Failed to save sponsor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSponsor(prev => ({
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
                        {id ? 'Edit Sponsor' : 'Add New Sponsor'}
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Name"
                            name="name"
                            value={sponsor.name}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Logo URL"
                            name="logoUrl"
                            value={sponsor.logoUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Website"
                            name="website"
                            value={sponsor.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            required
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={sponsor.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
                            margin="normal"
                        />

                        <Button 
                            type="submit" 
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Saving...' : (id ? 'Update Sponsor' : 'Add Sponsor')}
                        </Button>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default SponsorForm; 