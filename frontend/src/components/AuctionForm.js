import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
    CircularProgress,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { auctionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const AuctionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unauthorized, setUnauthorized] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        logoUrl: '',
        auctionDate: '',
        pointsPerTeam: 0,
        totalTeams: 0,
        minimumBid: 0,
        bidIncreaseBy: 0,
        playersPerTeam: 0,
        isActive: false,
        playerRegistrationEnabled: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchAuction = useCallback(async () => {
        try {
            setLoading(true);
            const response = await auctionService.getById(id);
            const auction = response.data || response;
            // Only allow if user is admin or creator
            if (user?.role !== 'ADMIN' && user?.username !== auction.createdBy) {
                setUnauthorized(true);
                setLoading(false);
                return;
            }
            setFormData({
                name: auction.name,
                logoUrl: auction.logoUrl || '',
                auctionDate: new Date(auction.auctionDate).toISOString().slice(0, 16),
                pointsPerTeam: auction.pointsPerTeam,
                totalTeams: auction.totalTeams,
                minimumBid: auction.minimumBid,
                bidIncreaseBy: auction.bidIncreaseBy,
                playersPerTeam: auction.playersPerTeam,
                isActive: auction.isActive,
                playerRegistrationEnabled: auction.playerRegistrationEnabled
            });
        } catch (error) {
            console.error('Error fetching auction:', error);
            setError('Failed to load auction details');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        if (id) {
            fetchAuction();
        }
    }, [id, fetchAuction]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const auctionData = {
                ...formData,
                pointsPerTeam: parseInt(formData.pointsPerTeam),
                totalTeams: parseInt(formData.totalTeams),
                minimumBid: parseFloat(formData.minimumBid),
                bidIncreaseBy: parseFloat(formData.bidIncreaseBy),
                playersPerTeam: parseInt(formData.playersPerTeam),
                auctionDate: new Date(formData.auctionDate).toISOString()
            };

            console.log('Submitting auction data:', auctionData);

            if (id) {
                await auctionService.update(id, auctionData);
            } else {
                await auctionService.create(auctionData);
            }
            navigate('/auctions');
        } catch (error) {
            console.error('Error saving auction:', error);
            setError(error.response?.data?.message || 'Failed to save auction');
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

    if (unauthorized) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Alert severity="error">You are not authorized to edit this auction.</Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom color="primary.main" fontWeight={900}>
                        {id ? 'Edit Auction' : 'Create New Auction'}
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
                                    label="Auction Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Logo URL"
                                    name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Auction Date"
                                    name="auctionDate"
                                    type="datetime-local"
                                    value={formData.auctionDate}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Points per Team"
                                    name="pointsPerTeam"
                                    type="number"
                                    value={formData.pointsPerTeam}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Total Teams"
                                    name="totalTeams"
                                    type="number"
                                    value={formData.totalTeams}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Minimum Bid"
                                    name="minimumBid"
                                    type="number"
                                    value={formData.minimumBid}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Bid Increment"
                                    name="bidIncreaseBy"
                                    type="number"
                                    value={formData.bidIncreaseBy}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 0.01, step: 0.01 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Players per Team"
                                    name="playersPerTeam"
                                    type="number"
                                    value={formData.playersPerTeam}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            {id && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                    name="isActive"
                                                />
                                            }
                                            label="Auction Active"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.playerRegistrationEnabled}
                                                    onChange={handleChange}
                                                    name="playerRegistrationEnabled"
                                                />
                                            }
                                            label="Player Registration Enabled"
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/auctions')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {id ? 'Update' : 'Create'} Auction
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

export default AuctionForm; 