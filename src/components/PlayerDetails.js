import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { playerService, bidService } from '../services/api';
import { webSocketService } from '../services/websocket';

const PlayerDetails = () => {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const response = await playerService.getById(id);
                setPlayer(response.data);
            } catch (error) {
                console.error('Error fetching player:', error);
            }
        };

        const fetchBids = async () => {
            try {
                const response = await bidService.getByPlayer(id);
                setBids(response.data);
            } catch (error) {
                console.error('Error fetching bids:', error);
            }
        };

        fetchPlayer();
        fetchBids();

        // Subscribe to WebSocket updates
        webSocketService.subscribeToBids((bid) => {
            if (bid.playerId === parseInt(id)) {
                setBids((prevBids) => [bid, ...prevBids]);
            }
        });

        webSocketService.subscribeToPlayerUpdates(id, () => {
            fetchPlayer();
        });

        return () => {
            webSocketService.disconnect();
        };
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const amount = parseFloat(bidAmount);
            if (isNaN(amount) || amount <= player.currentPrice) {
                setError('Bid amount must be higher than current price');
                return;
            }

            await bidService.placeBid({
                playerId: parseInt(id),
                amount,
            });

            setBidAmount('');
        } catch (error) {
            setError('Error placing bid. Please try again.');
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
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {player.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {player.role} | {player.nationality}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Age: {player.age}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Base Price: ₹{player.basePrice.toLocaleString()}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Current Price: ₹{player.currentPrice.toLocaleString()}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Status: {player.status}
                            </Typography>
                            {player.teamName && (
                                <Typography variant="body1" paragraph>
                                    Team: {player.teamName}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>
                                Place Bid
                            </Typography>
                            {error && (
                                <Typography color="error" gutterBottom>
                                    {error}
                                </Typography>
                            )}
                            <form onSubmit={handleBid}>
                                <TextField
                                    fullWidth
                                    label="Bid Amount"
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    margin="normal"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    disabled={player.isSold}
                                >
                                    Place Bid
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Bidding History
                    </Typography>
                    <List>
                        {bids.map((bid, index) => (
                            <React.Fragment key={bid.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={`${bid.teamName} - $${bid.amount.toLocaleString()}`}
                                        secondary={new Date(bid.timestamp).toLocaleString()}
                                    />
                                </ListItem>
                                {index < bids.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
};

export default PlayerDetails; 