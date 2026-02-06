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
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    Stack,
    Avatar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as PowerSettingsNewIcon,
    Add as AddIcon,
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teamService, auctionService, playerService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import TeamDetailsCard from './TeamDetailsCard';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
};

const TeamList = () => {
    const { auctionId } = useParams();
    const [teams, setTeams] = useState([]);
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [teamDetailsDialogOpen, setTeamDetailsDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedTeamPlayers, setSelectedTeamPlayers] = useState([]);

        const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [teamsResponse, auctionResponse] = await Promise.all([
                teamService.getByAuction(auctionId),
                auctionService.getById(auctionId)
            ]);
            setTeams(teamsResponse || []);
            setAuction(auctionResponse);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
            setTeams([]);
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        fetchData();
    }, [auctionId, fetchData]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await teamService.delete(id);
                fetchData();
            } catch (err) {
                console.error('Error deleting team:', err);
                setError(err.response?.data?.message || 'Failed to delete team');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await teamService.toggleStatus(id);
            fetchData();
        } catch (err) {
            console.error('Error toggling status:', err);
            setError(err.response?.data?.message || 'Failed to toggle status');
        }
    };

    const handleOpenTeamDetails = async (team) => {
        try {
            const players = await playerService.getByTeam(team.id, auctionId);
            setSelectedTeam(team);
            setSelectedTeamPlayers(players);
            setTeamDetailsDialogOpen(true);
        } catch (error) {
            console.error('Error fetching team players:', error);
            setError('Failed to load team players.');
        }
    };

    const handleCloseTeamDetails = () => {
        setTeamDetailsDialogOpen(false);
        setSelectedTeam(null);
        setSelectedTeamPlayers([]);
    };

    const refreshTeams = useCallback(async () => {
        try {
            const teamsResponse = await teamService.getByAuction(auctionId);
            setTeams(teamsResponse || []);
        } catch (err) {
            console.error('Error refreshing teams:', err);
        }
    }, [auctionId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
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
            {auction && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {auction.name}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PeopleIcon color="primary" />
                                <Typography>
                                    Teams: {teams.length}/{auction.totalTeams}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <MoneyIcon color="primary" />
                                <Typography>
                                    Points per Team: {auction.pointsPerTeam}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TrophyIcon color="primary" />
                                <Typography>
                                    Min Bid: {formatCurrency(auction.minimumBid)}
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1">
                    Teams
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/auctions/${auctionId}/teams/new`)}
                >
                    Create Team
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/auctions/${auctionId}`)}
                >
                    Back
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {teams.length === 0 ? (
                <Alert severity="info">No teams found.</Alert>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {teams.map((team, i) => (
                            <Grid item xs={12} sm={6} md={4} key={team.id}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={cardVariants}
                                    custom={i}
                                >
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Avatar src={team.logoUrl || 'https://via.placeholder.com/50'} sx={{ width: 50, height: 50, mr: 2 }} />
                                                <Typography variant="h5" component="h2" gutterBottom>
                                                    {team.name}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Budget
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {formatCurrency(team.budgetAmount)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Remaining
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {formatCurrency(team.remainingBudget)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Points Used
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {team.pointsUsed}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Players
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {team.playersCount}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Divider />
                                        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenTeamDetails(team)}
                                            >
                                                View Details
                                            </Button>
                                            {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                                                <Box>
                                                    <Button
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        variant="outlined"
                                                        onClick={() => navigate(`/auctions/${auctionId}/teams/${team.id}/edit`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Tooltip title="Delete Team">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(team.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Toggle Status">
                                                        <IconButton
                                                            size="small"
                                                            color={team.isActive ? 'success' : 'default'}
                                                            onClick={() => handleToggleStatus(team.id)}
                                                        >
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
            <TeamDetailsCard
                open={teamDetailsDialogOpen}
                handleClose={handleCloseTeamDetails}
                team={selectedTeam}
                players={selectedTeamPlayers}
                auctionId={auctionId}
                auction={auction}
                onPlayersUpdated={setSelectedTeamPlayers}
                onTeamUpdated={refreshTeams}
            />
        </Container>
    );
};

export default TeamList;
