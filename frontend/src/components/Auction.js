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
    Modal,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { motion } from 'framer-motion';
import { teamService, playerService, auctionService } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';



const Auction = () => {
    const { id: auctionId } = useParams();
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth(); // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
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
    const [jumpBidAmount, setJumpBidAmount] = useState('');
    const [jumpBidTeamId, setJumpBidTeamId] = useState('');
    const [showJumpBid, setShowJumpBid] = useState(false);
    const [biddingMode, setBiddingMode] = useState('LIVE');
    const [directEntryTeamId, setDirectEntryTeamId] = useState('');
    const [directEntryFinalPrice, setDirectEntryFinalPrice] = useState('');

    
    const lastBid = Array.isArray(bids) && bids.find(bid => bid.playerId === selectedPlayer?.id);
    
    const lastBidTeamId = lastBid?.teamId;

    useEffect(() => {
        if (selectedPlayer?.status === "SOLD") setPlayerStatus('Sold');
        else if (selectedPlayer?.status === "UNSOLD") setPlayerStatus('Unsold');
        else setPlayerStatus('Available');
    }, [selectedPlayer]);

    const resolveBidIncrement = (currentPrice) => {
        const baseIncrement = auction?.bidIncreaseBy || 1;
        const rules = Array.isArray(auction?.bidRules) ? auction.bidRules : [];
        if (rules.length === 0) return baseIncrement;
        const sorted = [...rules]
            .map(r => ({
                thresholdAmount: Number(r?.thresholdAmount),
                incrementAmount: Number(r?.incrementAmount)
            }))
            .filter(r => Number.isFinite(r.thresholdAmount) && Number.isFinite(r.incrementAmount))
            .sort((a, b) => a.thresholdAmount - b.thresholdAmount);
        let increment = baseIncrement;
        sorted.forEach(rule => {
            if (currentPrice >= rule.thresholdAmount) {
                increment = rule.incrementAmount;
            }
        });
        return increment;
    };

    const handleTeamBid = (teamId) => {
        if (!selectedPlayer || selectedPlayer.isSold || lastBidTeamId === teamId) return;
        const team = teams.find(t => t.id === Number(teamId));
        const currentPrice = selectedPlayer?.currentPrice ?? 0;
        const bidIncrement = resolveBidIncrement(currentPrice);
        if (!team || team.remainingBudget < currentPrice + bidIncrement) return;

        const newBidAmount = currentPrice + bidIncrement;
        setBids([{ id: Date.now(), playerId: selectedPlayer.id, teamId: team.id, teamName: team.name, amount: newBidAmount }, ...bids]);
        setSelectedPlayer({ ...selectedPlayer, currentPrice: newBidAmount });
    };

    const handleJumpBid = (teamId) => {
        if (!selectedPlayer || selectedPlayer.isSold || lastBidTeamId === teamId) return;
        const team = teams.find(t => t.id === Number(teamId));
        const currentPrice = selectedPlayer?.currentPrice ?? 0;
        const bidIncrement = resolveBidIncrement(currentPrice);
        const desired = Number(jumpBidAmount);
        if (!team) return;
        if (!Number.isFinite(desired)) {
            setSnackbarMessage('Enter a valid jump bid amount.');
            setShowSnackbar(true);
            return;
        }
        if (desired < currentPrice + bidIncrement) {
            setSnackbarMessage(`Jump bid must be at least ${currentPrice + bidIncrement}.`);
            setShowSnackbar(true);
            return;
        }
        if (desired > team.remainingBudget) {
            setSnackbarMessage('Jump bid exceeds team remaining budget.');
            setShowSnackbar(true);
            return;
        }
        setBids([{ id: Date.now(), playerId: selectedPlayer.id, teamId: team.id, teamName: team.name, amount: desired }, ...bids]);
        setSelectedPlayer({ ...selectedPlayer, currentPrice: desired });
    };
    
    const handleBiddingModeChange = (_, value) => {
        if (value) {
            setBiddingMode(value);
        }
    };

    const handleMarkSold = async () => {
        if (!selectedPlayer) {
            setSnackbarMessage('No player selected.');
            setShowSnackbar(true);
            return;
        }

        try {
            let soldTeamId;
            let soldAmount;

            if (biddingMode === 'DIRECT') {
                soldTeamId = Number(directEntryTeamId);
                soldAmount = Number(directEntryFinalPrice);
                const selectedTeam = teams.find((team) => team.id === soldTeamId);

                if (!soldTeamId || !selectedTeam) {
                    setSnackbarMessage('Select a team for direct entry.');
                    setShowSnackbar(true);
                    return;
                }
                if (!Number.isFinite(soldAmount) || soldAmount < 0) {
                    setSnackbarMessage('Enter a valid final sold price.');
                    setShowSnackbar(true);
                    return;
                }
                if (soldAmount > selectedTeam.remainingBudget) {
                    setSnackbarMessage('Final sold price exceeds selected team remaining budget.');
                    setShowSnackbar(true);
                    return;
                }
            } else {
                if (!lastBid || !lastBid.teamId || typeof lastBid.amount !== 'number' || isNaN(lastBid.amount)) {
                    setSnackbarMessage('Cannot mark as sold: No valid bid or bid amount found for this player.');
                    setShowSnackbar(true);
                    return;
                }
                soldTeamId = lastBid.teamId;
                soldAmount = lastBid.amount;
            }

            setStatusOverlayText('SOLD');
            setShowStatusOverlay(true);
            setSnackbarMessage(`${selectedPlayer.name} marked as SOLD!`);
            setShowSnackbar(true);
            await playerService.updateStatus(auctionId, selectedPlayer.id, 'SOLD', soldTeamId, soldAmount);
            setBids([]);
            setDirectEntryTeamId('');
            setDirectEntryFinalPrice('');
            setTimeout(async () => {
                setShowStatusOverlay(false);
                await refreshAvailablePlayers();
                await refreshTeams();
            }, 1500);
        } catch (e) {
            console.error('Failed to mark player as SOLD:', e);
            setShowStatusOverlay(false);
            setSnackbarMessage(e?.response?.data?.message || 'Failed to mark player as SOLD.');
            setShowSnackbar(true);
        }
    };

    const handleMarkUnsold = async () => {
        if (selectedPlayer) {
            try {
                setStatusOverlayText('UNSOLD');
                setShowStatusOverlay(true);
                setSnackbarMessage(`${selectedPlayer.name} marked as UNSOLD!`);
                setShowSnackbar(true);
                await playerService.updateStatus(auctionId, selectedPlayer.id, 'UNSOLD');
                setBids([]);
                setDirectEntryTeamId('');
                setDirectEntryFinalPrice('');
                setTimeout(async () => {
                    setShowStatusOverlay(false);
                    await refreshAvailablePlayers();
                    await refreshTeams();
                }, 1500);
            } catch (e) {
                console.error('Failed to mark player as UNSOLD:', e);
                setShowStatusOverlay(false);
                setSnackbarMessage(e?.response?.data?.message || 'Failed to mark player as UNSOLD.');
                setShowSnackbar(true);
            }
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

    const refreshTeams = useCallback(async () => {
        const teamsData = await teamService.getByAuction(auctionId);
        setTeams(teamsData || []);
    }, [auctionId]);

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
                        const idx = Math.floor(Math.random() * playersData.length);
                        setSelectedPlayer(playersData[idx]);
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

    useEffect(() => {
        if (!selectedPlayer) {
            setDirectEntryTeamId('');
            setDirectEntryFinalPrice('');
            return;
        }
        setDirectEntryTeamId('');
        setDirectEntryFinalPrice(String(selectedPlayer.currentPrice ?? selectedPlayer.basePrice ?? auction?.basePrice ?? ''));
    }, [selectedPlayer, auction?.basePrice]);

    const handleUndoLastBid = () => {
        if (!Array.isArray(bids) || bids.length === 0 || !selectedPlayer) return;
        setBids((prevBids) => {
            const idx = prevBids.findIndex(bid => bid.playerId === selectedPlayer.id);
            if (idx === -1) return prevBids;

            const nextBids = prevBids.filter((_, i) => i !== idx);
            const nextBidForPlayer = nextBids.find(bid => bid.playerId === selectedPlayer.id);
            const newPrice = nextBidForPlayer ? nextBidForPlayer.amount : 0;
            setSelectedPlayer({ ...selectedPlayer, currentPrice: newPrice });

            return nextBids;
        });
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
        <Container maxWidth="xl" sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="center" mb={0}>
                {auction?.logoUrl && (
                    <Avatar src={auction.logoUrl} alt={auction.name} sx={{ width: 60, height: 60, mr: 2 }} />
                )}
                <Typography variant="h5" component="h1">
                    {auction?.name}
                </Typography>
                
            </Box>

            {/* Player Search and Actions */}
            <Box display="flex" justifyContent="center" gap={2} mt={2} mb={1} flexWrap="wrap">
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
                    sx={{ minWidth: 320 }}
                />
                {biddingMode === 'LIVE' && (
                    <Button variant="outlined" color="secondary" onClick={handleUndoLastBid} disabled={bids.length === 0 || !selectedPlayer}>
                        Undo Last Bid
                    </Button>
                )}
                {biddingMode === 'LIVE' && (
                    <Button variant="outlined" onClick={() => setShowJumpBid((prev) => !prev)}>
                        {showJumpBid ? 'Hide Jump Bid' : 'Show Jump Bid'}
                    </Button>
                )}
                <ToggleButtonGroup
                    size="small"
                    color="primary"
                    exclusive
                    value={biddingMode}
                    onChange={handleBiddingModeChange}
                >
                    <ToggleButton value="LIVE">Live Bidding</ToggleButton>
                    <ToggleButton value="DIRECT">Direct Entry</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2 }}>
                    Back
                </Button>
            </Box>
            {biddingMode === 'LIVE' && showJumpBid && (
                <Box display="flex" justifyContent="center" gap={2} mb={2} flexWrap="wrap">
                    <TextField
                        label="Jump Bid Amount"
                        type="number"
                        size="small"
                        value={jumpBidAmount}
                        onChange={(e) => setJumpBidAmount(e.target.value)}
                        inputProps={{ min: 0 }}
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        label="Jump Bid Team"
                        select
                        size="small"
                        value={jumpBidTeamId}
                        onChange={(e) => setJumpBidTeamId(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ minWidth: 220 }}
                    >
                        <option value="" />
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </TextField>
                    <Button
                        variant="outlined"
                        onClick={() => handleJumpBid(jumpBidTeamId)}
                        disabled={
                            !jumpBidTeamId ||
                            !jumpBidAmount ||
                            !selectedPlayer ||
                            selectedPlayer.isSold ||
                            lastBidTeamId === Number(jumpBidTeamId) ||
                            !Number.isFinite(Number(jumpBidAmount)) ||
                            Number(jumpBidAmount) < (selectedPlayer.currentPrice ?? 0) + resolveBidIncrement(selectedPlayer.currentPrice ?? 0) ||
                            Number(jumpBidAmount) > (teams.find(t => t.id === Number(jumpBidTeamId))?.remainingBudget ?? 0)
                        }
                    >
                        Jump Bid
                    </Button>
                </Box>
            )}

            {/* Selected Player Details and Bidding */}
            {selectedPlayer && (
                <Card elevation={3} sx={{ p: { xs: 2, md: 3 }, width: '100%', borderRadius: 3 }}>
                    <Grid container spacing={3} alignItems="flex-start">
                        <Grid item xs={12} md={4} textAlign="center">
                            <Avatar 
                                src={selectedPlayer.photoUrl || 'https://via.placeholder.com/250'} 
                                alt={selectedPlayer.name} 
                                variant="rounded"
                                sx={{
                                    width: { xs: 340, md: 420 },
                                    height: { xs: 340, md: 420 },
                                    borderRadius: 3,
                                    mx: 'auto',
                                    mb: 1,
                                    cursor: 'pointer'
                                }} 
                                onClick={() => setShowPhotoModal(true)}
                            />
                            <Box
                                sx={{
                                    mt: 1.5,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'inline-block',
                                    minWidth: { xs: 260, md: 300 }
                                }}
                            >
                                <Typography variant="h4" component="h2">{selectedPlayer.name}</Typography>
                                <Typography variant="h6" color="text.secondary">{selectedPlayer.role}</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Box
                                display="flex"
                                justifyContent={{ xs: 'center', md: 'flex-start' }}
                                alignItems="stretch"
                                gap={2}
                                flexWrap="wrap"
                                py={0.5}
                                sx={{ width: '100%' }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: { xs: '100%', sm: 220 },
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary">Base Price</Typography>
                                    <Typography variant="h4">₹{auction.basePrice?.toLocaleString()}</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: { xs: '100%', sm: 260 },
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary">Current Bid</Typography>
                                    <Typography variant="h3" color="primary">₹{(selectedPlayer.currentPrice || selectedPlayer.basePrice)?.toLocaleString()}</Typography>
                                    {lastBidTeam && (
                                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={1}>
                                            <Avatar src={lastBidTeam.logoUrl} alt={lastBidTeam.name} sx={{ width: 32, height: 32 }} />
                                            <Typography variant="h6">{lastBidTeam.name}</Typography>
                                        </Box>
                                    )}
                                    {!lastBidTeam && <Typography variant="body2" color="text.secondary">No bids yet</Typography>}
                                </Box>
                            </Box>
                            {biddingMode === 'LIVE' ? (
                                <Box mt={2.5} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="h5" gutterBottom textAlign={{ xs: 'center', md: 'left' }}>Place a Bid</Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                        {teams.map(team => {
                                            const playersCount = team.playersCount ?? 0;
                                            const isFull = auction?.playersPerTeam && playersCount >= auction.playersPerTeam;
                                            return (
                                                <Button
                                                    key={team.id}
                                                    variant={lastBidTeamId === team.id ? 'outlined' : 'contained'}
                                                    onClick={() => handleTeamBid(team.id)}
                                                    disabled={selectedPlayer.isSold || lastBidTeamId === team.id || team.remainingBudget < (selectedPlayer.currentPrice ?? 0) + resolveBidIncrement(selectedPlayer.currentPrice ?? 0)}
                                                    startIcon={team.logoUrl ? <Avatar src={team.logoUrl} alt={team.name} sx={{ width: 24, height: 24 }} /> : null}
                                                    sx={{ position: 'relative', pr: 4, minWidth: 140 }}
                                                >
                                                    {team.name}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 6,
                                                            minWidth: 18,
                                                            height: 18,
                                                            px: 0.5,
                                                            borderRadius: '999px',
                                                            fontSize: 11,
                                                            lineHeight: '18px',
                                                            textAlign: 'center',
                                                            bgcolor: isFull ? 'error.main' : 'primary.main',
                                                            color: 'primary.contrastText',
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        {playersCount}
                                                    </Box>
                                                </Button>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            ) : (
                                <Box mt={2.5} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="h5" gutterBottom textAlign={{ xs: 'center', md: 'left' }}>Direct Sold Entry</Typography>
                                    <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={2} flexWrap="wrap">
                                        <TextField
                                            label="Team"
                                            select
                                            size="small"
                                            value={directEntryTeamId}
                                            onChange={(e) => setDirectEntryTeamId(e.target.value)}
                                            SelectProps={{ native: true }}
                                            sx={{ minWidth: 230 }}
                                        >
                                            <option value="" />
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </TextField>
                                        <TextField
                                            label="Final Sold Price"
                                            type="number"
                                            size="small"
                                            value={directEntryFinalPrice}
                                            onChange={(e) => setDirectEntryFinalPrice(e.target.value)}
                                            inputProps={{ min: 0 }}
                                            sx={{ minWidth: 230 }}
                                        />
                                    </Box>
                                </Box>
                            )}

                            <Box mt={2.5} display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleMarkSold}
                                    disabled={
                                        playerStatus === 'Sold' ||
                                        (biddingMode === 'LIVE'
                                            ? bids.length === 0
                                            : !directEntryTeamId ||
                                            !Number.isFinite(Number(directEntryFinalPrice)) ||
                                            Number(directEntryFinalPrice) < 0 ||
                                            Number(directEntryFinalPrice) > (teams.find(t => t.id === Number(directEntryTeamId))?.remainingBudget ?? 0))
                                    }
                                    sx={{ minWidth: 160 }}
                                >
                                    Mark as Sold
                                </Button>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleMarkUnsold}
                                    disabled={playerStatus === 'Unsold' || (biddingMode === 'LIVE' && bids.length > 0)}
                                    sx={{ minWidth: 160 }}
                                >
                                    Mark as Unsold
                                </Button>
                            </Box>
                            <Typography variant="h6" textAlign={{ xs: 'center', md: 'left' }} mt={1.5} color={playerStatus === 'Sold' ? 'success.main' : playerStatus === 'Unsold' ? 'warning.main' : 'text.primary'}>
                                Status: {playerStatus}
                            </Typography>
                        </Grid>
                    </Grid>
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
