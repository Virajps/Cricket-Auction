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
    Divider,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService, auctionService, accessService } from '../services/api';
import ErrorMessage, { MessageType } from './common/ErrorMessage';
import { motion } from 'framer-motion';
import PremiumUpsellDialog from './PremiumUpsellDialog';
import { useAuth } from '../contexts/AuthContext';

const TeamForm = () => {
    const { id, auctionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        isActive: true,
        logoUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [auction, setAuction] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
    const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
    const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes?.('ADMIN');

    const fetchAuction = useCallback(async () => {
        try {
            const response = await auctionService.getById(auctionId);
            setAuction(response);
        } catch (error) {
            console.error('Error fetching auction:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Load Auction',
                message: 'Unable to load auction details. Please try again later.'
            });
        }
    }, [auctionId]);

    const fetchTeams = useCallback(async () => {
        try {
            const response = await teamService.getByAuction(auctionId);
            setTeams(response);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError({
                type: MessageType.WARNING,
                title: 'Team Count Warning',
                message: 'Unable to fetch current team count. Please refresh the page.'
            });
        }
    }, [auctionId]);

    const fetchTeam = useCallback(async () => {
        try {
            setLoading(true);
            const response = await teamService.getById(id, auctionId);
            setFormData({
                name: response.name,
                isActive: true,
                logoUrl: response.logoUrl || ''
            });
        } catch (error) {
            console.error('Error fetching team:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Load Team',
                message: 'Unable to load team details. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    }, [id, auctionId]);

    useEffect(() => {
        fetchAuction();
        fetchTeams();
        if (id) {
            fetchTeam();
        }
    }, [id, auctionId, fetchAuction, fetchTeams, fetchTeam]);

    useEffect(() => {
        let mounted = true;
        const fetchAccess = async () => {
            try {
                const status = await accessService.getStatus(auctionId);
                if (mounted) setHasPremiumAccess(!!status?.auctionAccessActive || !!status?.admin);
            } catch {
                if (mounted) setHasPremiumAccess(false);
            }
        };
        fetchAccess();
        return () => { mounted = false; };
    }, [auctionId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear any previous errors when user starts typing
        if (error) setError(null);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!id && !isAdmin && !hasPremiumAccess && teams.length >= 2) {
            setPricingDialogOpen(true);
            setError({
                type: MessageType.WARNING,
                title: 'Upgrade Required',
                message: 'Free plan allows up to 2 teams. Upgrade to add a 3rd team.'
            });
            return;
        }

        setLoading(true);

        try {
            let logoUrl = formData.logoUrl;
            if (selectedFile) {
                const uploadResponse = await teamService.uploadLogo(selectedFile);
                logoUrl = uploadResponse; // Assuming the response is the URL
            }

            const teamToSave = { ...formData, logoUrl };

            if (id) {
                await teamService.update(auctionId, id, teamToSave);
            } else {
                await teamService.create(auctionId, teamToSave);
            }
            navigate(`/auctions/${auctionId}/teams`);
        } catch (error) {
            console.error('Error saving team:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save team';
            
            // Handle specific error cases
            if (errorMessage.includes('Team name already exists')) {
                setError({
                    type: MessageType.WARNING,
                    title: 'Team Name Already Exists',
                    message: 'Please choose a different team name. Team names must be unique within an auction.'
                });
            } else if (
                errorMessage.toLowerCase().includes('free') &&
                errorMessage.toLowerCase().includes('team') &&
                errorMessage.toLowerCase().includes('limit')
            ) {
                setPricingDialogOpen(true);
                setError({
                    type: MessageType.WARNING,
                    title: 'Upgrade Required',
                    message: 'Free plan allows up to 2 teams. Upgrade to add more teams.'
                });
            } else if (errorMessage.includes('maximum team limit')) {
                setError({
                    type: MessageType.WARNING,
                    title: 'Team Limit Reached',
                    message: `This auction has reached its maximum limit of ${auction?.totalTeams} teams.`
                });
            } else {
                setError({
                    type: MessageType.ERROR,
                    title: 'Failed to Save Team',
                    message: 'An unexpected error occurred. Please try again later.'
                });
            }
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

    const isTeamLimitReached = auction && teams.length >= auction.totalTeams;
    const isFreePlanTeamLimitReached = !id && !isAdmin && !hasPremiumAccess && teams.length >= 2;

    const formVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
    };

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {id ? 'Edit Team' : 'Create New Team'}
                    </Typography>

                    {auction && (
                        <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Auction Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Name: {auction.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Points per Team: {auction.pointsPerTeam}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="textSecondary">
                                                Teams: {teams.length} / {auction.totalTeams}
                                            </Typography>
                                            {isTeamLimitReached && (
                                                <Chip 
                                                    label="Team Limit Reached" 
                                                    color="error" 
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Minimum Bid: ₹{auction.minimumBid}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <ErrorMessage
                            type={error.type}
                            title={error.title}
                            message={error.message}
                            onClose={() => setError(null)}
                        />
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Team Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    helperText={isTeamLimitReached 
                                        ? "Cannot create more teams as the auction has reached its team limit"
                                        : isFreePlanTeamLimitReached
                                            ? "Free plan supports up to 2 teams. Upgrade to add more."
                                            : "Choose a unique name for your team"
                                    }
                                    disabled={!id && isTeamLimitReached}
                                    error={error?.type === MessageType.WARNING && error?.title === 'Team Name Already Exists'}
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
                            </Grid>

                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="team-logo-upload-button"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="team-logo-upload-button">
                                    <Button variant="outlined" component="span">
                                        Upload Team Logo
                                    </Button>
                                </label>
                                {selectedFile && <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>{selectedFile.name}</Typography>}
                                {formData.logoUrl && !selectedFile && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">Current Logo:</Typography>
                                        <img src={formData.logoUrl} alt="Current Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
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
                                        disabled={loading || (!id && isTeamLimitReached)}
                                        size="large"
                                    >
                                        {id ? 'Update' : 'Create'} Team
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
                <PremiumUpsellDialog
                    open={pricingDialogOpen}
                    onClose={() => setPricingDialogOpen(false)}
                    featureName="Creating more than 2 teams"
                />
            </motion.div>
        </Container>
    );
};

export default TeamForm; 
