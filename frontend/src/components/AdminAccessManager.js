import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { adminEntitlementService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const defaultForm = {
    username: '',
    accessType: 'PER_AUCTION',
    auctionId: '',
    startsAt: '',
    expiresAt: '',
    notes: ''
};

const toInputDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AdminAccessManager = () => {
    const { user } = useAuth();
    const [form, setForm] = useState(defaultForm);
    const [entitlements, setEntitlements] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes?.('ADMIN');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const entitlementRows = await adminEntitlementService.list();
            setEntitlements(entitlementRows || []);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load entitlement data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin, loadData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const payload = {
                username: form.username.trim(),
                accessType: form.accessType,
                notes: form.notes?.trim() || null,
                auctionId: form.accessType === 'PER_AUCTION' && form.auctionId ? Number(form.auctionId) : null,
                startsAt: form.startsAt || null,
                expiresAt: form.expiresAt || null
            };
            await adminEntitlementService.grant(payload);
            setSuccess('Access granted.');
            setForm(defaultForm);
            loadData();
        } catch (e1) {
            setError(e1?.response?.data?.message || 'Failed to grant access.');
        }
    };

    const handleRevoke = async (id) => {
        setError('');
        setSuccess('');
        try {
            await adminEntitlementService.revoke(id);
            setSuccess('Access revoked.');
            loadData();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to revoke access.');
        }
    };

    if (!isAdmin) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">Only admin can access this page.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Manual Access Control</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
                Tip: Auction ID is shown in auction cards and auction detail pages.
            </Alert>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Grant Access</Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Username"
                                value={form.username}
                                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                                required
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Access Type</InputLabel>
                                <Select
                                    label="Access Type"
                                    value={form.accessType}
                                    onChange={(e) => setForm((prev) => ({ ...prev, accessType: e.target.value, auctionId: '' }))}
                                >
                                    <MenuItem value="PER_AUCTION">Per Auction</MenuItem>
                                    <MenuItem value="FULL_MONTHLY">Full Access Monthly</MenuItem>
                                    <MenuItem value="FULL_YEARLY">Full Access Yearly</MenuItem>
                                </Select>
                            </FormControl>
                            {form.accessType === 'PER_AUCTION' && (
                                <TextField
                                    label="Auction ID"
                                    value={form.auctionId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, auctionId: e.target.value }))}
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    required
                                    fullWidth
                                />
                            )}
                        </Stack>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                            <TextField
                                label="Starts At"
                                type="datetime-local"
                                value={form.startsAt}
                                onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Expires At"
                                type="datetime-local"
                                value={form.expiresAt}
                                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Notes"
                                value={form.notes}
                                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                fullWidth
                            />
                            <Button type="submit" variant="contained">Grant</Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Entitlements</Typography>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Auction ID</TableCell>
                                    <TableCell>Auction</TableCell>
                                    <TableCell>Starts</TableCell>
                                    <TableCell>Expires</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entitlements.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.username}</TableCell>
                                        <TableCell>{row.accessType}</TableCell>
                                        <TableCell>{row.auctionId || '-'}</TableCell>
                                        <TableCell>{row.auctionName || '-'}</TableCell>
                                        <TableCell>{toInputDateTime(row.startsAt).replace('T', ' ')}</TableCell>
                                        <TableCell>{toInputDateTime(row.expiresAt).replace('T', ' ')}</TableCell>
                                        <TableCell>{row.active ? 'Active' : 'Expired'}</TableCell>
                                        <TableCell>
                                            <Button size="small" color="error" onClick={() => handleRevoke(row.id)}>
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default AdminAccessManager;
