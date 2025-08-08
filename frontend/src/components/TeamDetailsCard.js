
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Button,
    CircularProgress,
    Paper,
    Card,
    CardContent,
} from '@mui/material';

const TeamDetailsCard = ({ open, handleClose, team, players }) => {
    if (!team) {
        return (
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Loading...</DialogTitle>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={team.logoUrl} alt={team.name} sx={{ width: 56, height: 56, mr: 2 }} />
                    <Typography variant="h4" component="span">
                        {team.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Paper elevation={0} sx={{ p: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Typography variant="h6" color="text.secondary">Budget</Typography>
                            <Typography variant="body1">₹{team.budgetAmount?.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" color="text.secondary">Remaining Budget</Typography>
                            <Typography variant="body1">₹{team.remainingBudget?.toLocaleString()}</Typography>
                        </Grid>
                    </Grid>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
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
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TeamDetailsCard;
