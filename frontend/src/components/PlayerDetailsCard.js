
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
    Chip,
    Avatar,
    Button,
    CircularProgress,
    Paper,
} from '@mui/material';

const PlayerDetailsCard = ({ open, handleClose, player }) => {
    if (!player) {
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
                <Typography variant="h4" component="span">
                    {player.name}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Paper elevation={0} sx={{ p: 2 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary={`Role: ${player.role}`} />
                                </ListItem>
                                {player.mobileNumber && (
                                    <ListItem>
                                        <ListItemText primary={`Mobile: ${player.mobileNumber}`} />
                                    </ListItem>
                                )}
                                <ListItem>
                                    <ListItemText primary={`Age: ${player.age}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={`Base Price: ₹${player.basePrice?.toLocaleString()}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={`Current Price: ₹${player.currentPrice?.toLocaleString()}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                        <Typography variant="body1" component="span">Status: </Typography>
                                        <Chip label={player.status} color={player.status === 'SOLD' ? 'success' : player.status === 'UNSOLD' ? 'warning' : 'info'} size="small" />
                                    </ListItemText>
                                </ListItem>
                                {player.teamName && (
                                    <ListItem>
                                        <ListItemText primary={`Team: ${player.teamName}`} />
                                    </ListItem>
                                )}
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar src={player.photoUrl || 'https://via.placeholder.com/300'} sx={{ width: 300, height: 300, borderRadius: 2 }} variant="rounded" />
                        </Grid>
                    </Grid>
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

export default PlayerDetailsCard;
