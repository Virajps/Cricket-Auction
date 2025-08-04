import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Alert } from '@mui/material';
import { TextField, FormControlLabel, Switch } from '@mui/material';
import { auctionService } from '../services/api';
import { motion } from 'framer-motion';

const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const AuctionSettings = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        pointsPerTeam: '',
        totalTeams: '',
        minimumBid: '',
        bidIncreaseBy: '',
        playersPerTeam: '',
        isActive: false,
        playerRegistrationEnabled: false
    });

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await auctionService.getById(auctionId);
            setSettings({
                pointsPerTeam: data.pointsPerTeam,
                totalTeams: data.totalTeams,
                minimumBid: data.minimumBid,
                bidIncreaseBy: data.bidIncreaseBy,
                playersPerTeam: data.playersPerTeam,
                isActive: data.isActive,
                playerRegistrationEnabled: data.playerRegistrationEnabled,
                auctionDate: data.auctionDate,
                name: data.name
            });
        } catch (err) {
            setError('Failed to load auction settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        loadSettings();
    }, [auctionId, loadSettings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await auctionService.update(auctionId, settings);
            navigate(`/auctions/${auctionId}`);
        } catch (err) {
            setError('Failed to save settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.main" fontWeight={900} gutterBottom>
                        Auction Settings
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Auction Name"
                            name="name"
                            value={settings.name}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Points Per Team"
                            name="pointsPerTeam"
                            type="number"
                            value={settings.pointsPerTeam}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            fullWidth
                            label="Total Teams"
                            name="totalTeams"
                            type="number"
                            value={settings.totalTeams}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Minimum Bid"
                            name="minimumBid"
                            type="number"
                            value={settings.minimumBid}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            fullWidth
                            label="Bid Increase By"
                            name="bidIncreaseBy"
                            type="number"
                            value={settings.bidIncreaseBy}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 1 }}
                        />

                        <TextField
                            fullWidth
                            label="Players Per Team"
                            name="playersPerTeam"
                            type="number"
                            value={settings.playersPerTeam}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="Auction Date"
                            name="auctionDate"
                            type="datetime-local"
                            value={settings.auctionDate}
                            onChange={handleChange}
                            required
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.isActive}
                                    onChange={handleChange}
                                    name="isActive"
                                    color="primary"
                                />
                            }
                            label="Auction Active"
                            sx={{ mt: 2, mb: 1 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.playerRegistrationEnabled}
                                    onChange={handleChange}
                                    name="playerRegistrationEnabled"
                                    color="primary"
                                />
                            }
                            label="Player Registration Enabled"
                            sx={{ mb: 3 }}
                        />

                        <Button 
                            type="submit" 
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default AuctionSettings;