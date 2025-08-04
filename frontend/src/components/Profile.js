import React, { useState } from 'react';
import { Alert, Container, Box, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const Profile = () => {
    const { user } = useAuth();
    const [error] = useState('');

    if (!user) {
        return (
            <Container maxWidth="md">
                <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                    <MuiCard elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h4" color="primary.main" fontWeight={900} gutterBottom>
                                Profile
                            </Typography>
                            <Alert severity="info" sx={{ mb: 3 }}>Please log in to view your profile</Alert>
                        </CardContent>
                    </MuiCard>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                <MuiCard elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h4" color="primary.main" fontWeight={900} gutterBottom>
                            Profile
                        </Typography>
                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <MuiCard elevation={1} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            User Information
                                        </Typography>
                                        <Box mb={2}>
                                            <Typography variant="body1">
                                                <strong>Username:</strong> {user.username}
                                            </Typography>
                                        </Box>
                                        <Box mb={2}>
                                            <Typography variant="body1">
                                                <strong>Email:</strong> {user.email}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </MuiCard>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MuiCard>
            </motion.div>
        </Container>
    );
};

export default Profile;