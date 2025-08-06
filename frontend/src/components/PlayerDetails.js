import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Avatar,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { playerService, bidService } from '../services/api';
import { webSocketService } from '../services/websocket';

const PlayerDetails = () => {
    const { id , auctionId} = useParams();
    const [player, setPlayer] = useState(null);
    const [bids, setBids] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const playerResponse = await playerService.getById(auctionId, id);
                setPlayer(playerResponse);

                const bidsResponse = await bidService.getByPlayer(auctionId, id);
                setBids(bidsResponse);

            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load player details or bids.');
                setPlayer(null);
                setBids([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // WebSocket subscriptions remain the same
        webSocketService.subscribeToBids((bid) => {
            if (bid.playerId === parseInt(id)) {
                setBids((prevBids) => [bid, ...prevBids]);
            }
        });

        webSocketService.subscribeToPlayerUpdates(id, () => {
            fetchData();
        });

        return () => {
            webSocketService.disconnect();
        };
    }, [id, auctionId]);

    

    if (loading) {
        return (
            <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!player) {
        return (
            <Container sx={{ py: 8 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                    Player not found.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar src={player.photoUrl || 'https://via.placeholder.com/150'} sx={{ width: 150, height: 150 }} />
                            </Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {player.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {player.role} | {player.category} | {player.nationality}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Age: {player.age}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Base Price: ₹{player.basePrice?.toLocaleString()}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Current Price: ₹{player.currentPrice?.toLocaleString()}
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
                                        primary={`${bid.teamName} - ${bid.amount?.toLocaleString()}`}
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