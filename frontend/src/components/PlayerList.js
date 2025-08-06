import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Avatar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { playerService, auctionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage, { MessageType } from './common/ErrorMessage';



const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
};

const PlayerList = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [auction, setAuction] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredPlayers = players.filter(player => {
        if (statusFilter === 'ALL') {
            return true;
        }
        return player.status === statusFilter;
    });

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

    const fetchPlayers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await playerService.getAll(auctionId);
            setPlayers(response || []);
        } catch (error) {
            console.error('Error fetching players:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Load Players',
                message: 'Unable to load players. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        fetchAuction();
        fetchPlayers();
    }, [auctionId, fetchAuction, fetchPlayers]);

    const handleDeleteClick = (player) => {
        setPlayerToDelete(player);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await playerService.delete(auctionId, playerToDelete.id);
            setPlayers(players.filter(p => p.id !== playerToDelete.id));
            setDeleteDialogOpen(false);
            setPlayerToDelete(null);
        } catch (error) {
            console.error('Error deleting player:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Delete Player',
                message: 'Unable to delete player. Please try again later.'
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPlayerToDelete(null);
    };

    const handleSetUnsoldAvailable = async () => {
        try {
            await auctionService.setUnsoldPlayersAvailable(auctionId);
            fetchPlayers(); // Refresh player list to reflect changes
        } catch (error) {
            console.error('Error setting unsold players available:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Set Unsold Players Available',
                message: 'Unable to set unsold players available. Please try again later.'
            });
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1">
                    Players
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="AVAILABLE">Available</MenuItem>
                            <MenuItem value="SOLD">Sold</MenuItem>
                            <MenuItem value="UNSOLD">Unsold</MenuItem>
                        </Select>
                    </FormControl>
                    {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/auctions/${auctionId}/players/new`)}
                        >
                            Add Player
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                    {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                        <Button
                            variant="outlined"
                            color="info"
                            onClick={handleSetUnsoldAvailable}
                        >
                            Set All Unsold Players Available
                        </Button>
                    )}
                </Box>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error.message}
                </Alert>
            )}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player, i) => (
                            <Grid item xs={12} sm={6} md={4} key={player.id}>
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
                                                <Avatar src={player.photoUrl || 'https://via.placeholder.com/50'} sx={{ width: 50, height: 50, mr: 2 }} />
                                                <Typography variant="h5" component="h2" gutterBottom>
                                                    {player.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 1 }}>
                                                <Chip
                                                    label={player.role}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Chip
                                                    label={player.category}
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Chip
                                                    label={player.status}
                                                    color={player.status === 'SOLD' ? 'success' : player.status === 'UNSOLD' ? 'warning' : 'default'}
                                                    size="small"
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Age: {player.age} | {player.nationality}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Base Price: ₹{player.basePrice}
                                            </Typography>
                                            {player.battingStyle && (
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Batting: {player.battingStyle}
                                                </Typography>
                                            )}
                                            {player.bowlingStyle && (
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Bowling: {player.bowlingStyle}
                                                </Typography>
                                            )}
                                            {player.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {player.description}
                                                </Typography>
                                            )}
                                        </CardContent>
                                        {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                                            <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => navigate(`/auctions/${auctionId}/players/${player.id}/edit`)}
                                                >
                                                    Edit
                                                </Button>
                                                <Tooltip title="Delete Player">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(player)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        )}
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                No players found.
                            </Typography>
                        </Grid>
                    )}
                </AnimatePresence>
            </Grid>
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Delete Player</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {playerToDelete?.name}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PlayerList;