import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Stack,
    Chip,
    Divider,
    LinearProgress,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import { auctionService, teamService, playerService, bidService, accessService } from '../services/api';
import PremiumUpsellDialog from './PremiumUpsellDialog';

const AuctionSummary = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [bids, setBids] = useState([]);
    const [error, setError] = useState(null);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(true);
    const [upsellOpen, setUpsellOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const status = await accessService.getStatus(id);
                const allowed = !!status?.auctionAccessActive || !!status?.admin;
                setHasPremiumAccess(allowed);
                if (!allowed) {
                    if (mounted) setUpsellOpen(true);
                    throw new Error('Auction summary is available only on paid access.');
                }
                const [a, t, p, b] = await Promise.all([
                    auctionService.getById(id),
                    teamService.getByAuction(id),
                    playerService.getAll(id),
                    bidService.getByAuction(id)
                ]);
                if (!mounted) return;
                setAuction(a);
                setTeams(t || []);
                setPlayers(p || []);
                setBids(b || []);
            } catch (err) {
                console.error('Failed to load summary:', err);
                if (mounted) setError(err.response?.data?.message || err.message || 'Failed to load auction summary.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => { mounted = false; };
    }, [id]);

    if (loading) return (
        <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
        </Container>
    );

    if (!hasPremiumAccess) return (
        <Container sx={{ py: 8 }}>
            <Alert severity="info">Auction summary is available only on paid access.</Alert>
            <PremiumUpsellDialog
                open={upsellOpen}
                onClose={() => setUpsellOpen(false)}
                featureName="Auction Summary"
            />
        </Container>
    );

    if (!auction) return (
        <Container sx={{ py: 8 }}>
            <Alert severity="warning">{error || 'Failed to load auction summary.'}</Alert>
        </Container>
    );

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    };

    const metrics = (() => {
        const totalTeams = teams.length;
        const totalPlayers = players.length;
        const soldPlayers = players.filter((p) => p.status === 'SOLD').length;
        const unsoldPlayers = players.filter((p) => p.status === 'UNSOLD').length;
        const availablePlayers = players.filter((p) => p.status === 'AVAILABLE').length;
        const totalBids = bids.length;
        const highestBidFromBids = bids.length > 0 ? Math.max(...bids.map((x) => Number(x.amount || 0))) : 0;
        const highestSoldPrice = soldPlayers > 0
            ? Math.max(...players.filter((p) => p.status === 'SOLD').map((p) => Number(p.currentPrice || 0)))
            : 0;
        const highestBid = Math.max(highestBidFromBids, highestSoldPrice);
        const completionRate = totalPlayers ? Math.round((soldPlayers / totalPlayers) * 100) : 0;

        const totalBudget = teams.reduce((sum, team) => sum + Number(team.budgetAmount || 0), 0);
        const totalSpent = teams.reduce((sum, team) => sum + Number(team.pointsUsed || 0), 0);
        const remainingBudgetPool = teams.reduce((sum, team) => sum + Number(team.remainingBudget || 0), 0);
        const budgetUtilization = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const avgSoldPrice = soldPlayers ? totalSpent / soldPlayers : 0;

        const teamStandings = [...teams]
            .map((team) => {
                const spent = Number(team.pointsUsed || 0);
                const budget = Number(team.budgetAmount || 0);
                return {
                    id: team.id,
                    name: team.name,
                    playersCount: Number(team.playersCount || 0),
                    spent,
                    remaining: Number(team.remainingBudget || 0),
                    utilization: budget ? Math.round((spent / budget) * 100) : 0
                };
            })
            .sort((a, b) => b.spent - a.spent || b.playersCount - a.playersCount);

        const maxBidByPlayer = {};
        bids.forEach((bid) => {
            const playerId = bid.playerId;
            if (!playerId) return;
            const amount = Number(bid.amount || 0);
            if (!maxBidByPlayer[playerId] || amount > maxBidByPlayer[playerId].amount) {
                maxBidByPlayer[playerId] = {
                    playerId,
                    playerName: bid.playerName || 'Unknown Player',
                    teamId: bid.teamId,
                    teamName: bid.teamName || (bid.teamId ? `Team ${bid.teamId}` : 'Unassigned'),
                    amount
                };
            }
        });

        const winningBidRows = bids.filter((b) => b.isWinningBid);
        const topBuysFromWinningBids = [...winningBidRows]
            .map((bid) => ({
                playerId: bid.playerId,
                playerName: bid.playerName || 'Unknown Player',
                teamId: bid.teamId,
                teamName: bid.teamName || (bid.teamId ? `Team ${bid.teamId}` : 'Unassigned'),
                amount: Number(bid.amount || 0)
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const topBuysFromSoldPlayers = players
            .filter((p) => p.status === 'SOLD')
            .map((player) => {
                const bidInfo = maxBidByPlayer[player.id];
                return {
                    playerId: player.id,
                    playerName: player.name || 'Unknown Player',
                    teamName: player.teamName || bidInfo?.teamName || 'Unassigned',
                    amount: Math.max(
                        Number(player.currentPrice || 0),
                        Number(bidInfo?.amount || 0)
                    )
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const topBuys = topBuysFromWinningBids.length > 0 ? topBuysFromWinningBids : topBuysFromSoldPlayers;
        const topBuyDataSource = topBuysFromWinningBids.length > 0 ? 'winning-bids' : 'sold-players';

        const topSpenders = teamStandings.slice(0, 5).map((team) => ({
            teamId: team.id,
            teamName: team.name,
            amount: team.spent
        }));

        const playerTarget = Number(auction.playersPerTeam || 0);
        const teamsBelowTarget = playerTarget > 0
            ? teams.filter((t) => Number(t.playersCount || 0) < playerTarget).length
            : 0;
        const lowBudgetTeams = teams.filter((t) => Number(t.remainingBudget || 0) <= Number(auction.minimumBid || 0) * 2).length;

        return {
            totalTeams,
            totalPlayers,
            soldPlayers,
            unsoldPlayers,
            availablePlayers,
            totalBids,
            highestBid,
            completionRate,
            totalBudget,
            totalSpent,
            remainingBudgetPool,
            budgetUtilization,
            avgSoldPrice,
            teamStandings,
            topBuys,
            topBuyDataSource,
            topSpenders,
            teamsBelowTarget,
            lowBudgetTeams
        };
    })();

    const buildSummaryObject = () => ({
        id: auction.id,
        name: auction.name,
        date: auction.auctionDate,
        basePrice: auction.basePrice,
        minimumBid: auction.minimumBid,
        pointsPerTeam: auction.pointsPerTeam,
        playersPerTeam: auction.playersPerTeam,
        totalTeams: metrics.totalTeams,
        totalPlayers: metrics.totalPlayers,
        soldPlayers: metrics.soldPlayers,
        unsoldPlayers: metrics.unsoldPlayers,
        availablePlayers: metrics.availablePlayers,
        completionRate: metrics.completionRate,
        totalBids: metrics.totalBids,
        highestBid: metrics.highestBid,
        totalSpent: metrics.totalSpent,
        remainingBudgetPool: metrics.remainingBudgetPool,
        budgetUtilization: metrics.budgetUtilization,
        averageSoldPrice: Math.round(metrics.avgSoldPrice),
        topSpenders: metrics.topSpenders,
        topBuys: metrics.topBuys,
        topBuyDataSource: metrics.topBuyDataSource,
        teamStandings: metrics.teamStandings,
        insights: {
            teamsBelowTarget: metrics.teamsBelowTarget,
            lowBudgetTeams: metrics.lowBudgetTeams
        },
        generatedAt: new Date().toISOString()
    });

    const handleDownloadJSON = () => {
        const summary = buildSummaryObject();
        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auction-summary-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadText = () => {
        const s = buildSummaryObject();
        let text = `Auction Summary - ${s.name} (ID: ${s.id})\nDate: ${s.date}\nBase Price: ${s.basePrice}\nMinimum Bid: ${s.minimumBid}\n\n`;
        text += `Total Teams: ${s.totalTeams}\nTotal Players: ${s.totalPlayers}\nSold Players: ${s.soldPlayers}\nUnsold Players: ${s.unsoldPlayers}\nAvailable Players: ${s.availablePlayers}\nCompletion: ${s.completionRate}%\n\n`;
        text += `Total Bids: ${s.totalBids}\nHighest Bid: ${s.highestBid}\nTotal Spent: ${s.totalSpent}\nBudget Utilization: ${s.budgetUtilization}%\nAverage Sold Price: ${s.averageSoldPrice}\n\nTop Spenders:\n`;
        s.topSpenders.forEach(ts => { text += ` - ${ts.teamName}: ${ts.amount}\n`; });
        text += `\nTop Purchases:\n`;
        s.topBuys.forEach(p => { text += ` - ${p.playerName} (${p.teamName}): ${p.amount}\n`; });
        text += `\nGenerated At: ${s.generatedAt}\n`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auction-summary-${id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                        <Typography variant="h4" gutterBottom>Auction Summary</Typography>
                        <Typography variant="h6">{auction.name}</Typography>
                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            <Chip label={`Date: ${auction.auctionDate ? new Date(auction.auctionDate).toLocaleString() : 'N/A'}`} size="small" />
                            <Chip label={`Min Bid: ${formatCurrency(auction.minimumBid)}`} size="small" />
                            <Chip label={`Teams: ${metrics.totalTeams}/${auction.totalTeams || metrics.totalTeams}`} size="small" />
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Button variant="outlined" onClick={() => navigate(`/auctions/${id}`)}>Back</Button>
                        <Button variant="contained" color="primary" onClick={handleDownloadJSON}>Download JSON</Button>
                        <Button variant="outlined" onClick={handleDownloadText}>Download Text</Button>
                    </Stack>
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Sold Players</Typography>
                            <Typography variant="h5">{metrics.soldPlayers}</Typography>
                            <Typography variant="body2" color="text.secondary">{metrics.completionRate}% completion</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Total Spend</Typography>
                            <Typography variant="h5">{formatCurrency(metrics.totalSpent)}</Typography>
                            <Typography variant="body2" color="text.secondary">{metrics.budgetUtilization}% budget used</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Highest Bid</Typography>
                            <Typography variant="h5">{formatCurrency(metrics.highestBid)}</Typography>
                            <Typography variant="body2" color="text.secondary">{metrics.totalBids} total bids</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Avg Sold Price</Typography>
                            <Typography variant="h5">{formatCurrency(metrics.avgSoldPrice)}</Typography>
                            <Typography variant="body2" color="text.secondary">{formatCurrency(metrics.remainingBudgetPool)} pool remaining</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Auction Progress</Typography>
                    <Typography variant="body2">{metrics.completionRate}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={metrics.completionRate} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2">Available: {metrics.availablePlayers}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2">Unsold: {metrics.unsoldPlayers}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2">Total Players: {metrics.totalPlayers}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Team Standings</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Team</TableCell>
                                        <TableCell align="right">Players</TableCell>
                                        <TableCell align="right">Spent</TableCell>
                                        <TableCell align="right">Remaining</TableCell>
                                        <TableCell align="right">Utilization</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {metrics.teamStandings.map((team) => (
                                        <TableRow key={team.id}>
                                            <TableCell>{team.name}</TableCell>
                                            <TableCell align="right">{team.playersCount}</TableCell>
                                            <TableCell align="right">{formatCurrency(team.spent)}</TableCell>
                                            <TableCell align="right">{formatCurrency(team.remaining)}</TableCell>
                                            <TableCell align="right">{team.utilization}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Top Purchases</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Source: {metrics.topBuyDataSource === 'winning-bids' ? 'Winning bids' : 'Sold players (fallback)'}
                        </Typography>
                        {metrics.topBuys.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No purchases yet.</Typography>
                        ) : (
                            metrics.topBuys.map((buy, idx) => (
                                <Box key={`${buy.playerName}-${idx}`} sx={{ py: 1 }}>
                                    <Typography variant="body2">
                                        {idx + 1}. {buy.playerName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {buy.teamName} | {formatCurrency(buy.amount)}
                                    </Typography>
                                    {idx < metrics.topBuys.length - 1 && <Divider sx={{ mt: 1 }} />}
                                </Box>
                            ))
                        )}
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Actionable Insights</Typography>
                        {metrics.teamsBelowTarget > 0 ? (
                            <Alert severity="warning" sx={{ mb: 1 }}>
                                {metrics.teamsBelowTarget} team(s) are below target squad size ({auction.playersPerTeam}).
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mb: 1 }}>
                                All teams have met the configured squad size target.
                            </Alert>
                        )}
                        {metrics.lowBudgetTeams > 0 && (
                            <Alert severity="info">
                                {metrics.lowBudgetTeams} team(s) are close to minimum-bid capacity.
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AuctionSummary;
