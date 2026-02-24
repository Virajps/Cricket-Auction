import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from '@mui/material';

const CONTACT_PHONE = '7016194255';
const CONTACT_EMAIL = 'vpshah543@gmail.com';

const pricingRows = [
    { plan: 'Per Auction Pass', price: 'INR 799 / auction' },
    { plan: 'Full Access Monthly', price: 'INR 1,999 / month' },
    { plan: 'Full Access Yearly', price: 'INR 17,999 / year' }
];

const unlockedFeatures = [
    'Auction Summary',
    'Import Players (Excel)',
    'Bid Increase Rules',
    'Jump Bid',
    'Download Team Players List (PDF)'
];

const PremiumUpsellDialog = ({ open, onClose, featureName = 'This feature' }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Pay to Use</Typography>
                    <Chip label="Premium" color="warning" />
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(25,118,210,0.14) 0%, rgba(255,255,255,1) 60%)',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {featureName} is locked on Free plan.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upgrade once and unlock all premium tools for your auction workflow.
                    </Typography>
                </Box>

                <Typography variant="h6" sx={{ mb: 1.5 }}>Choose a Plan</Typography>
                <Grid container spacing={1.5}>
                    {pricingRows.map((row) => (
                        <Grid item xs={12} md={4} key={row.plan}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    borderRadius: 2,
                                    borderColor: 'primary.light',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,252,255,1) 100%)'
                                }}
                            >
                                <CardContent sx={{ pb: '16px !important' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{row.plan}</Typography>
                                    <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>{row.price}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6">Paid Version Unlocks</Typography>
                <List dense sx={{ mt: 0.5 }}>
                    {unlockedFeatures.map((item) => (
                        <ListItem key={item} disableGutters>
                            <ListItemText primary={`- ${item}`} />
                        </ListItem>
                    ))}
                </List>

                <Alert severity="info" sx={{ mt: 1.5 }}>
                    Manual activation: once payment is confirmed, access is granted from admin panel.
                </Alert>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6">Contact to Activate</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                    <Chip label={`Phone: ${CONTACT_PHONE}`} variant="outlined" color="primary" />
                    <Chip label={`Email: ${CONTACT_EMAIL}`} variant="outlined" color="primary" />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PremiumUpsellDialog;
