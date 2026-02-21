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
    Pagination,
    TextField,
    Stack,
    Tab,
    Tabs,
} from '@mui/material';
import { Delete as DeleteIcon, Search as SearchIcon, Loop as LoopIcon, CloudUpload as CloudUploadIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { playerService, auctionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageType } from './common/ErrorMessage';
import PlayerDetailsCard from './PlayerDetailsCard';
import PlayerImport from './PlayerImport';



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
    const [iconFilter, setIconFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [playersPerPage] = useState(9);
    const [playerDetailsDialogOpen, setPlayerDetailsDialogOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const normalizeText = (value) => (value || '')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const filteredPlayers = players.filter(player => {
        const statusMatch = statusFilter === 'ALL' || player.status === statusFilter;
        const iconMatch = iconFilter === 'ALL'
            || (iconFilter === 'ICON' && player.isIcon)
            || (iconFilter === 'NON_ICON' && !player.isIcon);
        const nameMatch = normalizeText(player.name).includes(normalizeText(searchQuery));
        return statusMatch && iconMatch && nameMatch;
    });

    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, iconFilter]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / playersPerPage));
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredPlayers.length, playersPerPage, currentPage]);

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

    const handleDeleteClick = (event, player) => {
        event.stopPropagation();
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

    const handleSetSingleUnsoldAvailable = async (event, playerId) => {
        event.stopPropagation();
        try {
            await playerService.setAvailableFromUnsold(auctionId, playerId);
            await fetchPlayers();
        } catch (error) {
            console.error('Error setting single unsold player available:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Set Player Available',
                message: error?.response?.data?.message || 'Unable to set player available. Please try again later.'
            });
        }
    };

    const handlePlayerCardClick = (player) => {
        setSelectedPlayer(player);
        setPlayerDetailsDialogOpen(true);
    };

    const handleClosePlayerDetails = () => {
        setPlayerDetailsDialogOpen(false);
        setSelectedPlayer(null);
    };

    const handleImportComplete = (result) => {
        if (result && result.successfulRows > 0) {
            fetchPlayers();
            setActiveTab(0);
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
                    Players ({filteredPlayers.length})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {showSearchBar && (
                        <TextField
                            label="Search by Name"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ minWidth: 250, mr: 2 }}
                        />
                    )}
                    <Tooltip title="Search Players">
                        <IconButton onClick={() => setShowSearchBar(!showSearchBar)}>
                            <SearchIcon />
                        </IconButton>
                    </Tooltip>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
                        <FormControl sx={{ minWidth: 160 }}>
                            <InputLabel id="icon-filter-label">Icon Players</InputLabel>
                            <Select
                                labelId="icon-filter-label"
                                id="icon-filter"
                                value={iconFilter}
                                label="Icon Players"
                                onChange={(e) => setIconFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Players</MenuItem>
                                <MenuItem value="ICON">Only Icon Players</MenuItem>
                                <MenuItem value="NON_ICON">Non-Icon Players</MenuItem>
                            </Select>
                        </FormControl>
                        {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/auctions/${auctionId}/players/new`)}
                                >
                                    Add Player
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={() => setActiveTab(1)}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    }}
                                >
                                    Import Excel
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/auctions/${auctionId}`)}
                        >
                            Back
                        </Button>
                        {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                            <Tooltip title="Set All Unsold Players Available">
                                <IconButton
                                    color="info"
                                    onClick={handleSetUnsoldAvailable}
                                >
                                    <LoopIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error.message}
                </Alert>
            )}

            <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={`Players (${filteredPlayers.length})`} />
                {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                    <Tab label="Import Players" icon={<CloudUploadIcon />} iconPosition="start" />
                )}
            </Tabs>

            {activeTab === 0 && (
                <>
                    <Grid container spacing={3}>
                        <AnimatePresence>
                            {currentPlayers.length > 0 ? (
                                currentPlayers.map((player, i) => (
                                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={cardVariants}
                                            custom={i}
                                        >
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: 'pointer',
                                                    border: player.isIcon ? '1px solid' : 'none',
                                                    borderColor: player.isIcon ? 'warning.main' : 'transparent',
                                                    boxShadow: player.isIcon ? '0 0 0 2px rgba(237, 108, 2, 0.12)' : undefined,
                                                    background: player.isIcon
                                                        ? 'linear-gradient(135deg, rgba(255,244,229,0.95) 0%, rgba(255,255,255,1) 45%)'
                                                        : undefined
                                                }}
                                                onClick={() => handlePlayerCardClick(player)}
                                            >
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                            <Avatar
                                                                src={player.photoUrl || 'https://via.placeholder.com/50'}
                                                                sx={{
                                                                    width: 50,
                                                                    height: 50,
                                                                    mr: 2,
                                                                    border: player.isIcon ? '2px solid' : 'none',
                                                                    borderColor: player.isIcon ? 'warning.main' : 'transparent'
                                                                }}
                                                            />
                                                            <Typography variant="h5" component="h2" gutterBottom noWrap>
                                                                {player.name}
                                                            </Typography>
                                                        </Box>
                                                        {player.isIcon && (
                                                            <Chip
                                                                icon={<WorkspacePremiumIcon />}
                                                                label="Icon"
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ mb: 1 }}>
                                                        <Chip
                                                            label={player.role}
                                                            color={player.isIcon ? 'warning' : 'primary'}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        />
                                                        <Chip
                                                            label={player.status}
                                                            color={player.status === 'SOLD' ? 'success' : player.status === 'UNSOLD' ? 'warning' : 'default'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    {player.mobileNumber && (
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            Mobile: {player.mobileNumber}
                                                        </Typography>
                                                    )}
                                                    {player.description && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {player.description}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                                {(user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                                                    <CardActions
                                                        sx={{ p: 2, justifyContent: 'flex-end' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/auctions/${auctionId}/players/${player.id}/edit`);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        {player.status === 'UNSOLD' && (
                                                            <Button
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                                onClick={(e) => handleSetSingleUnsoldAvailable(e, player.id)}
                                                            >
                                                                Make Available
                                                            </Button>
                                                        )}
                                                        <Tooltip title="Delete Player">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={(e) => handleDeleteClick(e, player)}
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={Math.ceil(filteredPlayers.length / playersPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            {activeTab === 1 && (user?.role === 'ADMIN' || user?.username === auction?.createdBy) && (
                <Box sx={{ mt: 3 }}>
                    <PlayerImport auctionId={parseInt(auctionId)} onImportComplete={handleImportComplete} />
                </Box>
            )}
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
            <PlayerDetailsCard
                open={playerDetailsDialogOpen}
                handleClose={handleClosePlayerDetails}
                player={selectedPlayer}
            />
        </Container>
    );
};

export default PlayerList;
