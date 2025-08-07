import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    CircularProgress,
    MenuItem,
    Divider,
    Card,
    CardContent,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { playerService, auctionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage, { MessageType } from './common/ErrorMessage';
import { motion } from 'framer-motion';

const PlayerForm = () => {
    const { auctionId, id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        role: '',
        category: '',
        nationality: '',
        battingStyle: '',
        bowlingStyle: '',
        photoUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [auction, setAuction] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];
    const categories = ['A', 'B', 'C', 'D'];

    const formVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
    };

    const fetchAuction = useCallback(async () => {
        try {
            const response = await auctionService.getById(auctionId);
            setAuction(response);
        } catch (error) {
            console.error('Error fetching auction:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Load Auction',
                message: 'Unable to load auction details. Please try again later.'
            });
        }
    }, [auctionId]);

    const fetchPlayer = useCallback(async () => {
        try {
            setLoading(true);
            const response = await playerService.getById(auctionId, id);
                        setFormData({
                name: response.name,
                age: response.age,
                role: response.role,
                basePrice: response.basePrice,
                category: response.category,
                nationality: response.nationality,
                battingStyle: response.battingStyle || '',
                bowlingStyle: response.bowlingStyle || '',
                photoUrl: response.photoUrl || ''
            });
        } catch (error) {
            console.error('Error fetching player:', error);
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Load Player',
                message: 'Unable to load player details. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    }, [auctionId, id]);

    useEffect(() => {
        fetchAuction();
        if (id) {
            fetchPlayer();
        }
    }, [id, auctionId, fetchAuction, fetchPlayer]);

    useEffect(() => {
        fetchAuction();
        if (id) {
            fetchPlayer();
        }
    }, [id, auctionId, fetchAuction, fetchPlayer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous errors when user starts typing
        if (error) setError(null);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let photoUrl = formData.photoUrl;
            if (selectedFile) {
                const uploadResponse = await playerService.uploadPhoto(selectedFile);
                photoUrl = uploadResponse; // Assuming the response is the URL
            }

            const playerToSave = { ...formData, photoUrl };

            if (id) {
                await playerService.update(auctionId, id, playerToSave);
            } else {
                await playerService.create(auctionId, playerToSave);
            }
            navigate(`/auctions/${auctionId}/players`);
        } catch (error) {
            console.error('Error saving player:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save player';
            
            setError({
                type: MessageType.ERROR,
                title: 'Failed to Save Player',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <motion.div initial="hidden" animate="visible" variants={formVariants}>
                <Paper elevation={0} sx={{ p: 4, mt: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {id ? 'Edit Player' : 'Add New Player'}
                    </Typography>

                    {auction && (
                        <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Auction Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Name: {auction.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Minimum Bid: ₹{auction.minimumBid}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <ErrorMessage
                            type={error.type}
                            title={error.title}
                            message={error.message}
                            onClose={() => setError(null)}
                        />
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Player Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    inputProps={{ min: 16, max: 45 }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nationality"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Batting Style"
                                    name="battingStyle"
                                    value={formData.battingStyle}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Bowling Style"
                                    name="bowlingStyle"
                                    value={formData.bowlingStyle}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#ced4da',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007BFF',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    multiple
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button variant="outlined" component="span">
                                        Upload Photo
                                    </Button>
                                </label>
                                {selectedFile && <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>{selectedFile.name}</Typography>}
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(-1)}
                                        size="large"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        size="large"
                                    >
                                        {id ? 'Update' : 'Add'} Player
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default PlayerForm; 