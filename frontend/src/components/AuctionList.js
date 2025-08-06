import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Avatar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    PowerSettingsNew as PowerSettingsNewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
};

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const fetchAuctions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await auctionService.getAll();
            const allAuctions = Array.isArray(response) ? response : [];
            const filteredAuctions = allAuctions.filter(a => (activeTab === 0 ? a.isActive : !a.isActive));
            setAuctions(filteredAuctions);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch auctions');
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAuctions();
        }
    }, [activeTab, isAuthenticated, fetchAuctions]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this auction?')) {
            try {
                await auctionService.delete(id);
                fetchAuctions();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete auction');
            }
        }
    };

    const handleToggleRegistration = async (id) => {
        try {
            await auctionService.togglePlayerRegistration(id);
            fetchAuctions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle registration');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await auctionService.toggleStatus(id);
            fetchAuctions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Please log in to view auctions.
                </Alert>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/login')}
                >
                    Go to Login
                </Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1">
                    Auctions
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/auctions/create')}>
                    Create Auction
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab label="Active Auctions" />
                    <Tab label="Completed Auctions" />
                </Tabs>
            </Box>

            {auctions.length === 0 ? (
                <Alert severity="info">No auctions found in this category.</Alert>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {auctions.map((auction, i) => (
                            <Grid item xs={12} sm={6} md={4} key={auction.id}>
                                <motion.div initial="hidden" animate="visible" exit="hidden" variants={cardVariants} custom={i}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                {auction.logoUrl && (
                                                    <Avatar src={auction.logoUrl} alt={auction.name} sx={{ width: 50, height: 50, mr: 2 }} />
                                                )}
                                                <Typography variant="h5" component="h2" gutterBottom>
                                                    {auction.name}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {formatDate(auction.auctionDate)}
                                            </Typography>
                                            <Box sx={{ my: 2 }}>
                                                <Chip
                                                    label={auction.isActive ? 'Active' : 'Inactive'}
                                                    color={auction.isActive ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                                <Chip
                                                    label={auction.playerRegistrationEnabled ? 'Registration Open' : 'Registration Closed'}
                                                    color={auction.playerRegistrationEnabled ? 'primary' : 'default'}
                                                    size="small"
                                                    sx={{ mb: 1 }}
                                                />
                                            </Box>
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Points/Team</Typography>
                                                    <Typography variant="body1">{auction.pointsPerTeam}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Total Teams</Typography>
                                                    <Typography variant="body1">{auction.totalTeams}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Min Bid</Typography>
                                                    <Typography variant="body1">{auction.minimumBid}</Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => navigate(`/auctions/${auction.id}`)}
                                            >
                                                View Details
                                            </Button>
                                            {(user?.role === 'ADMIN' || user?.username === auction.createdBy) && (
                                                <Box>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => navigate(`/auctions/${auction.id}/edit`)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(auction.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Toggle Registration">
                                                        <IconButton size="small" color="secondary" onClick={() => handleToggleRegistration(auction.id)}>
                                                            <PersonAddIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Toggle Status">
                                                        <IconButton size="small" color={auction.isActive ? 'success' : 'default'} onClick={() => handleToggleStatus(auction.id)}>
                                                            <PowerSettingsNewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
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

export default AuctionList;
 