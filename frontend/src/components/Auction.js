import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    Card,
    Typography,
    Box,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Snackbar,
    Avatar,
    Modal
} from '@mui/material';
import { motion } from 'framer-motion';
import { teamService, playerService, auctionService } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';



const Auction = () => {
    const { id: auctionId } = useParams();
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth(); // eslint-disable-next-line no-unused-vars
    const [players, setPlayers] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [teams, setTeams] = useState([]);
    const [auction, setAuction] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerStatus, setPlayerStatus] = useState('Available');
    const [showStatusOverlay, setShowStatusOverlay] = useState(false);
    const [statusOverlayText, setStatusOverlayText] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    
    const lastBid = Array.isArray(bids) && bids.find(bid => bid.playerId === selectedPlayer?.id);
    
    const lastBidTeamId = lastBid?.teamId;

    useEffect(() => {
        if (selectedPlayer?.status === "SOLD") setPlayerStatus('Sold');
        else if (selectedPlayer?.status === "UNSOLD") setPlayerStatus('Unsold');
        else setPlayerStatus('Available');
    }, [selectedPlayer]);

    const handleTeamBid = (teamId) => {
        if (!selectedPlayer || selectedPlayer.isSold || lastBidTeamId === teamId) return;
        const team = teams.find(t => t.id === Number(teamId));
        const currentPrice = selectedPlayer?.currentPrice || selectedPlayer?.basePrice || 0;
        const bidIncrement = auction?.bidIncreaseBy || 1;
        if (!team || team.remainingBudget < currentPrice + bidIncrement) return;

        const newBidAmount = currentPrice + bidIncrement;
        setBids([{ id: Date.now(), playerId: selectedPlayer.id, teamId: team.id, teamName: team.name, amount: newBidAmount }, ...bids]);
        setSelectedPlayer({ ...selectedPlayer, currentPrice: newBidAmount });
    };

    const handleMarkSold = async () => {
        if (!selectedPlayer) {
            setSnackbarMessage('No player selected.');
            setShowSnackbar(true);
            return;
        }

        if (!lastBid || !lastBid.teamId || typeof lastBid.amount !== 'number' || isNaN(lastBid.amount)) {
            setSnackbarMessage('Cannot mark as sold: No valid bid or bid amount found for this player.');
            setShowSnackbar(true);
            return;
        }

        setStatusOverlayText('SOLD');
        setShowStatusOverlay(true);
        setSnackbarMessage(`${selectedPlayer.name} marked as SOLD!`);
        setShowSnackbar(true);
        console.log('Sending update status request with:', { teamId: lastBid.teamId, finalBidAmount: lastBid.amount });
        await playerService.updateStatus(auctionId, selectedPlayer.id, 'SOLD', lastBid.teamId, lastBid.amount);
        setBids([]);
        setTimeout(async () => {
            setShowStatusOverlay(false);
            await refreshAvailablePlayers();
        }, 1500);
    };

    const handleMarkUnsold = async () => {
        if (selectedPlayer) {
            setStatusOverlayText('UNSOLD');
            setShowStatusOverlay(true);
            setSnackbarMessage(`${selectedPlayer.name} marked as UNSOLD!`);
            setShowSnackbar(true);
            console.log('Marking player as UNSOLD:', selectedPlayer.id);
            await playerService.updateStatus(auctionId, selectedPlayer.id, 'UNSOLD');
            setBids([]);
            setTimeout(async () => {
                setShowStatusOverlay(false);
                await refreshAvailablePlayers();
            }, 1500);
        }
    };

    const refreshAvailablePlayers = useCallback(async () => {
        const players = await playerService.getAvailable(auctionId);
        setPlayers(Array.isArray(players) ? players : []);
        if (!selectedPlayer && players && players.length > 0) {
            setSelectedPlayer(players[0]);
        } else if (selectedPlayer && !players.find(p => p.id === selectedPlayer.id)) {
            setSelectedPlayer(players[0] || null);
        }
    }, [auctionId, selectedPlayer]);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [playersData, teamsData, auctionData] = await Promise.all([
                    playerService.getAvailable(auctionId),
                    teamService.getByAuction(auctionId),
                    auctionService.getById(auctionId)
                ]);
                if (mounted) {
                    setPlayers(Array.isArray(playersData) ? playersData : []);
                    setTeams(teamsData || []);
                    setAuction(auctionData);
                    if (!selectedPlayer && playersData && playersData.length > 0) {
                        setSelectedPlayer(playersData[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                if (mounted) setError('Failed to load auction data');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [auctionId]);

    useEffect(() => {
        let mounted = true;

        const initializeWebSocket = () => {
            try {
                webSocketService.connect();
                webSocketService.subscribeToBids((bid) => {
                    if (mounted) {
                        setBids((prevBids) => [bid, ...prevBids]);
                        if (selectedPlayer && bid.playerId === selectedPlayer.id) {
                            setSelectedPlayer(prevPlayer => ({
                                ...prevPlayer,
                                currentPrice: bid.amount
                            }));
                        }
                    }
                });
                const interval = setInterval(() => {
                    if (mounted) { /* setWsConnected(webSocketService.client.connected); */ }
                }, 1000);
                return () => clearInterval(interval);
            } catch (error) {
                console.error('Error initializing WebSocket:', error);
                if (mounted) setError('Failed to connect to live updates');
            }
        };

        const cleanupInterval = initializeWebSocket();

        return () => {
            mounted = false;
            if (cleanupInterval) cleanupInterval();
            webSocketService.disconnect();
        };
    }, [auctionId, selectedPlayer]);

    const handleRandomPlayer = () => {
        if (players.length > 0) {
            const randomIndex = Math.floor(Math.random() * players.length);
            setSelectedPlayer(players[randomIndex]);
        }
    };

    const handleUndoLastBid = () => {
        if (Array.isArray(bids) && bids.length > 0 && selectedPlayer) {
            const idx = bids.findIndex(bid => bid.playerId === selectedPlayer.id);
            if (idx !== -1) {
                setBids(bids.filter((_, i) => i !== idx));
            }
        }
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

    const lastBidTeam = teams.find(team => team.id === lastBid?.teamId);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box textAlign="center" mb={4}>
                {auction?.logoUrl && (
                    <Avatar src={auction.logoUrl} alt={auction.name} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
                )}
                <Typography variant="h2" component="h1">
                    {auction?.name}
                </Typography>
            </Box>

            {/* Player Search and Actions */}
            <Box display="flex" justifyContent="center" gap={2} mb={4} flexWrap="wrap">
                <Button variant="contained" color="secondary" onClick={handleRandomPlayer} disabled={players.length === 0}>
                    New Random Player
                </Button>
                <Autocomplete
                    options={players}
                    getOptionLabel={(option) => option ? `${option.name} #${option.id}` : ''}
                    value={selectedPlayer}
                    onChange={(event, newValue) => setSelectedPlayer(newValue)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Search Player" variant="outlined" size="small" />
                    )}
                    sx={{ minWidth: 250 }}
                />
                <Button variant="outlined" color="secondary" onClick={handleUndoLastBid} disabled={bids.length === 0 || !selectedPlayer}>
                    Undo Last Bid
                </Button>
            </Box>

            {/* Selected Player Details and Bidding */}
            {selectedPlayer && (
                <Card elevation={3} sx={{ p: 4 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={4} textAlign="center">
                            <Avatar 
                                src={selectedPlayer.photoUrl || 'https://via.placeholder.com/250'} 
                                alt={selectedPlayer.name} 
                                sx={{ width: 250, height: 250, mx: 'auto', mb: 2, cursor: 'pointer' }} 
                                onClick={() => setShowPhotoModal(true)}
                            />
                            <Typography variant="h4" component="h2">{selectedPlayer.name}</Typography>
                            <Typography variant="h6" color="text.secondary">{selectedPlayer.role}</Typography>
                            <Typography variant="body1" color="text.secondary">{selectedPlayer.nationality}</Typography>
                        </Grid>

                        <Grid item xs={12} md={4} textAlign="center">
                            <Typography variant="h6" color="text.secondary">Base Price</Typography>
                            <Typography variant="h4" gutterBottom>₹{auction.basePrice?.toLocaleString()}</Typography>
                        </Grid>

                        <Grid item xs={12} md={4} textAlign="center">
                            <Typography variant="h6" color="text.secondary">Current Bid</Typography>
                            <Typography variant="h3" color="primary" gutterBottom>₹{(selectedPlayer.currentPrice || selectedPlayer.basePrice)?.toLocaleString()}</Typography>
                            {lastBidTeam && (
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                    <Avatar src={lastBidTeam.logoUrl} alt={lastBidTeam.name} sx={{ width: 32, height: 32 }} />
                                    <Typography variant="h6">{lastBidTeam.name}</Typography>
                                </Box>
                            )}
                            {!lastBidTeam && <Typography variant="body2" color="text.secondary">No bids yet</Typography>}
                        </Grid>
                    </Grid>

                    <Box mt={4} textAlign="center">
                        <Typography variant="h5" gutterBottom>Place a Bid</Typography>
                        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                            {teams.map(team => (
                                <Button
                                    key={team.id}
                                    variant={lastBidTeamId === team.id ? 'outlined' : 'contained'}
                                    onClick={() => handleTeamBid(team.id)}
                                    disabled={selectedPlayer.isSold || lastBidTeamId === team.id || team.remainingBudget < (selectedPlayer.currentPrice || selectedPlayer.basePrice) + (auction?.bidIncreaseBy || 1)}
                                    startIcon={team.logoUrl ? <Avatar src={team.logoUrl} alt={team.name} sx={{ width: 24, height: 24 }} /> : null}
                                >
                                    {team.name}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="center" gap={2}>
                        <Button variant="contained" color="success" onClick={handleMarkSold} disabled={playerStatus === 'Sold' || bids.length === 0}>
                            Mark as Sold
                        </Button>
                        <Button variant="contained" color="warning" onClick={handleMarkUnsold} disabled={playerStatus === 'Unsold' || bids.length > 0}>
                            Mark as Unsold
                        </Button>
                    </Box>
                    <Typography variant="h6" textAlign="center" mt={2} color={playerStatus === 'Sold' ? 'success.main' : playerStatus === 'Unsold' ? 'warning.main' : 'text.primary'}>
                        Status: {playerStatus}
                    </Typography>
                </Card>
            )}

            {/* Status Overlay */}
            {showStatusOverlay && (
                <Box position="fixed" top={0} left={0} width="100vw" height="100vh" display="flex" alignItems="center" justifyContent="center" zIndex={9999} bgcolor="rgba(0,0,0,0.5)">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                        <Typography variant="h1" color={statusOverlayText === 'SOLD' ? 'success.main' : 'warning.main'} sx={{ fontSize: { xs: '4rem', md: '8rem' }, textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
                            {statusOverlayText}
                        </Typography>
                    </motion.div>
                </Box>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            {/* Photo Modal */}
            <Modal
                open={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                aria-labelledby="player-photo-modal-title"
                aria-describedby="player-photo-modal-description"
            >
                <Box 
                    sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        bgcolor: 'background.paper', 
                        boxShadow: 24, 
                        p: 4 
                    }}
                >
                    <img src={selectedPlayer?.photoUrl} alt={selectedPlayer?.name} style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
                </Box>
            </Modal>
        </Container>
    );
};

export default Auction;