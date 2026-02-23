import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Button,
    Chip,
    Tabs,
    Tab,
    Alert,
    Typography,
    Box,
    Divider,
    Paper,
    Avatar,
    CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { accessService, auctionService } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import PremiumUpsellDialog from './PremiumUpsellDialog';

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const AuctionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
    const [upsellOpen, setUpsellOpen] = useState(false);
    const [upsellFeatureName, setUpsellFeatureName] = useState('');
    const { user } = useAuth();

    const fetchAuctionDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await auctionService.getById(id);
            setAuction(response);
        } catch (error) {
            setError('Error fetching auction details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAuctionDetails();
    }, [id, fetchAuctionDetails]);

    useEffect(() => {
        let mounted = true;
        const fetchAccess = async () => {
            try {
                const status = await accessService.getStatus(id);
                if (mounted) {
                    setHasPremiumAccess(!!status?.auctionAccessActive || !!status?.admin);
                }
            } catch (e) {
                if (mounted) setHasPremiumAccess(false);
            }
        };
        fetchAccess();
        return () => { mounted = false; };
    }, [id]);

    

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openUpsell = (featureName) => {
        setUpsellFeatureName(featureName);
        setUpsellOpen(true);
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!auction) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="warning">Auction not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <motion.div initial="hidden" animate="visible" variants={pageVariants}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {auction.logoUrl && (
                            <Avatar src={auction.logoUrl} alt={auction.name} sx={{ width: 64, height: 64 }} />
                        )}
                        <Typography variant="h2" component="h1">
                            {auction.name}
                        </Typography>
                        <Chip
                            label={`ID: ${auction.id}`}
                            variant="outlined"
                            color="primary"
                        />
                        <Chip
                            label={auction.isActive ? 'Active' : 'Inactive'}
                            color={auction.isActive ? 'success' : 'default'}
                        />
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ mr: 2 }}
                                onClick={() => navigate(`/auctions`)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ mr: 2 }}
                            onClick={() => {
                                if (!hasPremiumAccess) {
                                    openUpsell('Auction Summary');
                                    return;
                                }
                                navigate(`/auctions/${id}/summary`);
                            }}
                        >
                            Summary
                        </Button>
                        {(auction.isActive && (user?.role === 'ADMIN' || user?.username === auction.createdBy)) && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ mr: 2 }}
                                    onClick={() => navigate(`/auctions/${id}/edit`)}
                                >
                                    Edit Auction
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/auctions/${id}/live`)}
                                >
                                    Go Live
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={3} textAlign="center">
                            {auction.logoUrl && (
                                <Avatar src={auction.logoUrl} alt={auction.name} sx={{ width: 120, height: 120, mx: 'auto' }} />
                            )}
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Auction Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Date:</strong> {formatDate(auction.auctionDate)}</Typography>
                                    <Typography variant="body1"><strong>Points per Team:</strong> {auction.pointsPerTeam}</Typography>
                                    <Typography variant="body1"><strong>Total Teams:</strong> {auction.totalTeams}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Min Bid:</strong> ${auction.minimumBid}</Typography>
                                    <Typography variant="body1"><strong>Bid Increment:</strong> ${auction.bidIncreaseBy}</Typography>
                                    <Typography variant="body1"><strong>Players per Team:</strong> {auction.playersPerTeam}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
                        <Tab label="Overview" />
                        <Tab label="Settings" />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={1}>
                                <CardHeader title="Teams" />
                                <CardContent>
                                    <Typography variant="body1">Total Teams: {auction.teams?.length || 0}</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate(`/auctions/${id}/teams`)}
                                    >
                                        Manage Teams
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card elevation={1}>
                                <CardHeader title="Players" />
                                <CardContent>
                                    <Typography variant="body1">Total Players: {auction.players?.length || 0}</Typography>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate(`/auctions/${id}/players`)}
                                    >
                                        Manage Players
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <Paper elevation={1} sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Auction Settings</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Bid Rules</Typography>
                                <Divider sx={{ my: 1 }} />
                                {auction.bidRules?.length > 0 ? (
                                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                                        {auction.bidRules.map((rule) => (
                                            <li key={rule.id}>
                                                <Typography variant="body2">
                                                    Above ${rule.thresholdAmount}: +${rule.incrementAmount}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                ) : <Typography variant="body2" color="text.secondary">No bid rules defined.</Typography>}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => {
                                        if (!hasPremiumAccess) {
                                            openUpsell('Bid Increase Rules');
                                            return;
                                        }
                                        navigate(`/auctions/${id}/bid-rules`);
                                    }}
                                >
                                    Manage Bid Rules
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Registration Settings</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" mb={1}>
                                    Player Registration: {' '}
                                    <Chip
                                        label={auction.playerRegistrationEnabled ? 'Enabled' : 'Disabled'}
                                        color={auction.playerRegistrationEnabled ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => navigate(`/auctions/${id}/settings`)}
                                >
                                    Manage Settings
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </motion.div>
            <PremiumUpsellDialog
                open={upsellOpen}
                onClose={() => setUpsellOpen(false)}
                featureName={upsellFeatureName}
            />
        </Container>
    );
};

export default AuctionDetails;
