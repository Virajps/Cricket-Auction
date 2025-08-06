import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Card, CardContent, CardActions, Button, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService, playerService } from '../services/api';

const TeamDetails = () => {
    const navigate = useNavigate();
    const { auctionId, id } = useParams();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamAndPlayers = async () => {
            try {
                const [teamResponse, playersResponse] = await Promise.all([
                    teamService.getById(id, auctionId),
                    playerService.getByTeam(id, auctionId)
                ]);
                setTeam(teamResponse);
                setPlayers(playersResponse);
            } catch (error) {
                console.error('Error fetching team details:', error);
                setError('Failed to load team details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamAndPlayers();
    }, [id, auctionId]);

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

    if (!team) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="info">No team found.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar src={team.logoUrl} alt={team.name} sx={{ width: 64, height: 64, mr: 2 }} />
                                <Typography variant="h4" component="h1" gutterBottom>
                                    {team.name}
                                </Typography>
                            </Box>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Budget: ₹{team.budgetAmount?.toLocaleString()}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Remaining Budget: ₹{team.remainingBudget?.toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Players
                    </Typography>
                    <List>
                        {players.map((player) => (
                            <Card key={player.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar src={player.photoUrl} alt={player.name} sx={{ width: 56, height: 56 }} />
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="h6">{player.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {player.role} | {player.nationality}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sold Price: ₹{player.currentPrice?.toLocaleString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/auctions/${auctionId}/players/${player.id}`)}
                                            >
                                                Details
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
};

export default TeamDetails;