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
    Avatar,
    Button,
    CircularProgress,
    Paper,
    Card,
    CardContent,
    Chip,
    Alert,
    DialogContentText,
    TextField,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { playerService, teamService } from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TeamDetailsCard = ({ open, handleClose, team, players, auctionId, auction, onPlayersUpdated, onTeamUpdated }) => {
    const [iconDialogOpen, setIconDialogOpen] = React.useState(false);
    const [availablePlayers, setAvailablePlayers] = React.useState([]);
    const [iconLoading, setIconLoading] = React.useState(false);
    const [iconError, setIconError] = React.useState(null);
    const [iconSearchQuery, setIconSearchQuery] = React.useState('');
    const [removeError, setRemoveError] = React.useState(null);
    const [directAddDialogOpen, setDirectAddDialogOpen] = React.useState(false);
    const [directAddPlayers, setDirectAddPlayers] = React.useState([]);
    const [directAddLoading, setDirectAddLoading] = React.useState(false);
    const [directAddError, setDirectAddError] = React.useState(null);
    const [directAddSearchQuery, setDirectAddSearchQuery] = React.useState('');
    const [directAddPriceByPlayer, setDirectAddPriceByPlayer] = React.useState({});

    const openIconDialog = async () => {
        setIconDialogOpen(true);
        setIconError(null);
        setIconSearchQuery('');
        setIconLoading(true);
        try {
            try {
                const available = await playerService.getAvailable(auctionId);
                setAvailablePlayers(available || []);
            } catch (err) {
                const all = await playerService.getAll(auctionId);
                const filtered = (all || []).filter((p) => p.status === 'AVAILABLE');
                setAvailablePlayers(filtered);
            }
        } catch (err) {
            console.error('Error fetching available players:', err);
            setIconError('Failed to load available players.');
        } finally {
            setIconLoading(false);
        }
    };

    const closeIconDialog = () => {
        setIconDialogOpen(false);
        setAvailablePlayers([]);
        setIconError(null);
        setIconSearchQuery('');
    };

    const openDirectAddDialog = async () => {
        setDirectAddDialogOpen(true);
        setDirectAddError(null);
        setDirectAddSearchQuery('');
        setDirectAddLoading(true);
        setDirectAddPriceByPlayer({});
        try {
            const available = await playerService.getAvailable(auctionId);
            const nextPlayers = available || [];
            setDirectAddPlayers(nextPlayers);
            const defaults = {};
            nextPlayers.forEach((p) => {
                defaults[p.id] = String(p.currentPrice ?? auction?.basePrice ?? 0);
            });
            setDirectAddPriceByPlayer(defaults);
        } catch (err) {
            console.error('Error fetching available players for direct add:', err);
            setDirectAddError('Failed to load available players.');
        } finally {
            setDirectAddLoading(false);
        }
    };

    const closeDirectAddDialog = () => {
        setDirectAddDialogOpen(false);
        setDirectAddPlayers([]);
        setDirectAddError(null);
        setDirectAddSearchQuery('');
        setDirectAddPriceByPlayer({});
    };

    const filteredAvailablePlayers = availablePlayers.filter((player) =>
        (player.name || '').toLowerCase().includes(iconSearchQuery.trim().toLowerCase())
    );
    const filteredDirectAddPlayers = directAddPlayers.filter((player) =>
        (player.name || '').toLowerCase().includes(directAddSearchQuery.trim().toLowerCase())
    );

    const handleAddIconPlayer = async (player) => {
        try {
            const added = await teamService.addIconPlayer(auctionId, team.id, player.id);
            const nextPlayers = [...players, added];
            onPlayersUpdated(nextPlayers);
            setAvailablePlayers((prev) => prev.filter((p) => p.id !== player.id));
            setIconDialogOpen(false);
            if (onTeamUpdated) {
                onTeamUpdated();
            }
        } catch (err) {
            console.error('Error adding icon player:', err);
            setIconError(err.response?.data?.message || 'Failed to add icon player.');
        }
    };

    const handleRemoveIconPlayer = async (player) => {
        try {
            const updated = await teamService.removeIconPlayer(auctionId, team.id, player.id);
            const nextPlayers = players.filter((p) => p.id !== updated.id);
            onPlayersUpdated(nextPlayers);
            setAvailablePlayers((prev) => {
                if (prev.some((p) => p.id === updated.id)) return prev;
                return [updated, ...prev];
            });
            if (onTeamUpdated) {
                onTeamUpdated();
            }
        } catch (err) {
            console.error('Error removing icon player:', err);
            setIconError(err.response?.data?.message || 'Failed to remove icon player.');
        }
    };

    const handleRemovePlayerFromTeam = async (player) => {
        try {
            setRemoveError(null);
            const updated = await teamService.removePlayerFromTeam(auctionId, team.id, player.id);
            const nextPlayers = players.filter((p) => p.id !== updated.id);
            onPlayersUpdated(nextPlayers);
            setAvailablePlayers((prev) => {
                if (prev.some((p) => p.id === updated.id)) return prev;
                return [updated, ...prev];
            });
            if (onTeamUpdated) {
                onTeamUpdated();
            }
        } catch (err) {
            console.error('Error removing player from team:', err);
            setRemoveError(err.response?.data?.message || 'Failed to remove player from team.');
        }
    };

    const handleDirectAddPlayer = async (player) => {
        try {
            setDirectAddError(null);
            const priceValue = Number(directAddPriceByPlayer[player.id]);
            if (!Number.isFinite(priceValue) || priceValue < 0) {
                setDirectAddError('Enter a valid final sold price.');
                return;
            }
            const added = await teamService.addPlayerToTeam(auctionId, team.id, player.id, priceValue);
            onPlayersUpdated([...players, added]);
            setDirectAddPlayers((prev) => prev.filter((p) => p.id !== player.id));
            if (onTeamUpdated) {
                onTeamUpdated();
            }
        } catch (err) {
            console.error('Error directly adding player to team:', err);
            setDirectAddError(err.response?.data?.message || 'Failed to add player to team.');
        }
    };

    const fetchImageDataUrl = async (url) => {
        if (!url) return null;
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const loaded = await new Promise((resolve, reject) => {
                img.onload = () => resolve(true);
                img.onerror = reject;
                img.src = url;
            });
            if (!loaded) return null;
            const canvas = document.createElement('canvas');
            const maxSize = 96;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = Math.max(1, Math.floor(img.width * scale));
            canvas.height = Math.max(1, Math.floor(img.height * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            if (!dataUrl.startsWith('data:image/jpeg')) return null;
            return { dataUrl, format: 'JPEG' };
        } catch (err) {
            console.error('Logo fetch failed:', err);
            return null;
        }
    };

    const handleDownloadPdf = async () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 40;
        let cursorY = 36;

        const [auctionLogo, teamLogo] = await Promise.all([
            fetchImageDataUrl(auction?.logoUrl).catch(() => null),
            fetchImageDataUrl(team?.logoUrl).catch(() => null)
        ]);

        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, pageWidth, 120, 'F');
        doc.setDrawColor(230);
        doc.line(marginX, 120, pageWidth - marginX, 120);

        if (auctionLogo?.dataUrl) {
            doc.addImage(auctionLogo.dataUrl, auctionLogo.format, marginX, cursorY, 56, 56);
        } else {
            doc.setDrawColor(180);
            doc.rect(marginX, cursorY, 56, 56);
            doc.setFontSize(8);
            doc.text('No Logo', marginX + 28, cursorY + 32, { align: 'center' });
        }
        if (teamLogo?.dataUrl) {
            doc.addImage(teamLogo.dataUrl, teamLogo.format, pageWidth - marginX - 56, cursorY, 56, 56);
        } else {
            doc.setDrawColor(180);
            doc.rect(pageWidth - marginX - 56, cursorY, 56, 56);
            doc.setFontSize(8);
            doc.text('No Logo', pageWidth - marginX - 28, cursorY + 32, { align: 'center' });
        }

        doc.setTextColor(33);
        doc.setFontSize(20);
        doc.text(auction?.name || 'Auction', pageWidth / 2, cursorY + 18, { align: 'center' });
        doc.setFontSize(13);
        doc.text(team?.name || 'Team Players', pageWidth / 2, cursorY + 40, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(90);
        doc.text('Team Players List', pageWidth / 2, cursorY + 58, { align: 'center' });
        cursorY = 134;

        const totalPlayers = players.length;
        const iconPlayers = players.filter((p) => p.isIcon === true).length;
        const pointsUsed = team?.pointsUsed ?? 0;
        const remaining = team?.remainingBudget ?? 0;
        const budget = team?.budgetAmount ?? 0;

        doc.setFontSize(11);
        doc.setTextColor(40);
        doc.text(`Total Players: ${totalPlayers}`, marginX, cursorY);
        doc.text(`Icon Players: ${iconPlayers}`, marginX + 170, cursorY);
        doc.text(`Points Used: Rs. ${Number(pointsUsed).toLocaleString('en-IN')}`, marginX + 330, cursorY);

        doc.setTextColor(70);
        doc.text(`Budget: Rs. ${Number(budget).toLocaleString('en-IN')}`, marginX, cursorY + 16);
        doc.text(`Remaining: Rs. ${Number(remaining).toLocaleString('en-IN')}`, marginX + 170, cursorY + 16);
        cursorY += 36;

        const rows = [...players]
            .sort((a, b) => (b.isIcon === true) - (a.isIcon === true))
            .map((p, idx) => ({
                index: idx + 1,
                name: p.name || '-',
                role: p.role || '-',
                price: p.currentPrice != null ? `Rs. ${Number(p.currentPrice).toLocaleString('en-IN')}` : '-',
                mobile: p.mobileNumber || '-',
                isIcon: p.isIcon === true
            }));

        doc.autoTable({
            startY: cursorY,
            head: [['#', 'Player', 'Role', 'Price', 'Mobile']],
            body: rows,
            columns: [
                { header: '#', dataKey: 'index' },
                { header: 'Player', dataKey: 'name' },
                { header: 'Role', dataKey: 'role' },
                { header: 'Price', dataKey: 'price' },
                { header: 'Mobile', dataKey: 'mobile' }
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [33, 60, 99], textColor: 255 },
            alternateRowStyles: { fillColor: [246, 248, 252] },
            columnStyles: {
                0: { cellWidth: 28 },
                3: { cellWidth: 80 }
            },
            margin: { left: marginX, right: marginX },
            didParseCell: (data) => {
                if (data.section === 'body' && data.row?.raw?.isIcon) {
                    data.cell.styles.fillColor = [255, 243, 224];
                    data.cell.styles.textColor = [102, 60, 0];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('Generated by Squadify', marginX, pageHeight - 24);
        doc.text(`Page 1 of 1`, pageWidth - marginX, pageHeight - 24, { align: 'right' });

        const safeTeamName = (team?.name || 'team').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
        doc.save(`${safeTeamName}-players.pdf`);
    };

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
                            <Typography variant="body1">{'\u20B9'}{team.budgetAmount?.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" color="text.secondary">Remaining Budget</Typography>
                            <Typography variant="body1">{'\u20B9'}{team.remainingBudget?.toLocaleString()}</Typography>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h5">Players</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={handleDownloadPdf}>
                                Download PDF
                            </Button>
                            <Button variant="contained" size="small" color="success" onClick={openDirectAddDialog}>
                                Direct Add Player
                            </Button>
                            <Button variant="contained" size="small" onClick={openIconDialog}>
                                Add Icon Player
                            </Button>
                        </Box>
                    </Box>
                    {removeError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {removeError}
                        </Alert>
                    )}
                    <List>
                        {[...players]
                            .sort((a, b) => (b.isIcon === true) - (a.isIcon === true))
                            .map((player) => (
                            <Card
                                key={player.id}
                                sx={{
                                    mb: 2,
                                    border: player.isIcon ? '2px solid #f4b400' : '1px solid transparent',
                                    bgcolor: player.isIcon ? 'rgba(255, 193, 7, 0.12)' : 'background.paper',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: player.isIcon ? 6 : 1
                                }}
                            >
                                {player.isIcon && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            px: 1.5,
                                            py: 0.5,
                                            bgcolor: '#f4b400',
                                            color: '#2a1c00',
                                            fontWeight: 700,
                                            fontSize: 12,
                                            letterSpacing: 0.5,
                                            borderBottomLeftRadius: 8
                                        }}
                                    >
                                        ICON PLAYER
                                    </Box>
                                )}
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar
                                                src={player.photoUrl}
                                                alt={player.name}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    border: player.isIcon ? '2px solid #f4b400' : 'none',
                                                    boxShadow: player.isIcon ? 2 : 0
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="h6">{player.name}</Typography>
                                                {player.isIcon && (
                                                    <Chip
                                                        size="small"
                                                        icon={<StarIcon />}
                                                        label="Icon"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {player.role}{player.mobileNumber && ` | ${player.mobileNumber}`}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sold Price: {'\u20B9'}{player.currentPrice?.toLocaleString()}
                                            </Typography>
                                        </Grid>
                                        {player.isIcon && (
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => handleRemoveIconPlayer(player)}
                                                >
                                                    Remove Icon
                                                </Button>
                                            </Grid>
                                        )}
                                        {!player.isIcon && (
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemovePlayerFromTeam(player)}
                                                >
                                                    Remove Player
                                                </Button>
                                            </Grid>
                                        )}
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
            <Dialog open={iconDialogOpen} onClose={closeIconDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Select Icon Player</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Icon players are added directly to this team without bidding.
                    </DialogContentText>
                    {iconLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {iconError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {iconError}
                        </Alert>
                    )}
                    {!iconLoading && availablePlayers.length > 0 && (
                        <TextField
                            fullWidth
                            size="small"
                            label="Search player by name"
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}
                    {!iconLoading && availablePlayers.length === 0 && (
                        <Alert severity="info">No available players found.</Alert>
                    )}
                    {!iconLoading && availablePlayers.length > 0 && filteredAvailablePlayers.length === 0 && (
                        <Alert severity="info">No players match your search.</Alert>
                    )}
                    <List>
                        {filteredAvailablePlayers.map((player) => (
                            <Card key={player.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar src={player.photoUrl} alt={player.name} sx={{ width: 48, height: 48 }} />
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="subtitle1">{player.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {player.role}{player.mobileNumber && ` | ${player.mobileNumber}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleAddIconPlayer(player)}
                                            >
                                                Add Icon
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeIconDialog}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={directAddDialogOpen} onClose={closeDirectAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Direct Add Player</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Add an available player directly to this team with a final sold price.
                    </DialogContentText>
                    {directAddLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {directAddError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {directAddError}
                        </Alert>
                    )}
                    {!directAddLoading && directAddPlayers.length > 0 && (
                        <TextField
                            fullWidth
                            size="small"
                            label="Search player by name"
                            value={directAddSearchQuery}
                            onChange={(e) => setDirectAddSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}
                    {!directAddLoading && directAddPlayers.length === 0 && (
                        <Alert severity="info">No available players found.</Alert>
                    )}
                    {!directAddLoading && directAddPlayers.length > 0 && filteredDirectAddPlayers.length === 0 && (
                        <Alert severity="info">No players match your search.</Alert>
                    )}
                    <List>
                        {filteredDirectAddPlayers.map((player) => (
                            <Card key={player.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar src={player.photoUrl} alt={player.name} sx={{ width: 48, height: 48 }} />
                                        </Grid>
                                        <Grid item xs={12} sm>
                                            <Typography variant="subtitle1">{player.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {player.role}{player.mobileNumber && ` | ${player.mobileNumber}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Final Price"
                                                fullWidth
                                                inputProps={{ min: 0 }}
                                                value={directAddPriceByPlayer[player.id] ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setDirectAddPriceByPlayer((prev) => ({
                                                        ...prev,
                                                        [player.id]: value
                                                    }));
                                                }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleDirectAddPlayer(player)}
                                            >
                                                Add
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDirectAddDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default TeamDetailsCard;
