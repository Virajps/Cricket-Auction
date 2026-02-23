import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    LinearProgress,
    Alert,
    Card,
    CardContent,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Rule as RuleIcon,
} from '@mui/icons-material';
import { getApiErrorMessage, playerService } from '../services/api';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PlayerImport = ({ auctionId, onImportComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [showDetailedErrors, setShowDetailedErrors] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return setError('Please select an .xlsx file to upload.');
        setLoading(true);
        setError(null);
        try {
            const resp = await playerService.importPlayers(auctionId, file);
            setResult(resp);
            setExpanded(true);
            if (onImportComplete) onImportComplete(resp);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Import failed. Please check file format and required columns.'));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setExpanded(false);
    };

    const successCount = result?.successfulRows || 0;
    const failedCount = result?.failedRows?.length || 0;
    const totalCount = result?.totalRows || 0;
    const successPercentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Import Players from Excel
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Upload an .xlsx file to bulk import players to this auction
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Box
                            sx={{
                                border: '2px dashed rgba(255,255,255,0.5)',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderColor: 'white',
                                }
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <CloudUploadIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7, cursor: 'pointer' }} />
                            <Typography variant="body1" sx={{ mb: 1, cursor: 'pointer' }}>
                                {file ? `Selected: ${file.name}` : 'Click to select or drag and drop .xlsx file'}
                            </Typography>
                            <Typography variant="caption">
                                Maximum file size: 10MB
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        }
                                    }}
                                >
                                    Select File
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="inherit"
                                onClick={handleUpload}
                                disabled={!file || loading}
                                startIcon={loading ? null : <CloudUploadIcon />}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#667eea',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                    }
                                }}
                            >
                                {loading ? 'Uploading...' : 'Upload Players'}
                            </Button>
                            {file && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Box>

                        {loading && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress sx={{ backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: 'white' } }} />
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                                    Processing your file...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <RuleIcon color="primary" />
                        <Typography variant="h6">Excel Import Rules</Typography>
                    </Box>
                    <List dense>
                        <ListItem disableGutters>
                            <ListItemText primary="Use .xlsx format only (not .xls or CSV)." />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemText primary="Required column: name. Recommended columns: age, role, basePrice, mobileNumber, photoUrl, status." />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemText primary="Use one header row. Header names can be variants (for example: Player Name, Base Price, Photo URL)." />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemText primary="basePrice must be numeric. age must be integer if provided." />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemText primary="Avoid blank rows and keep values clean (remove extra spaces)." />
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 1.5 }} />
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        Main instruction: make Google Form photo files public before import.
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                        If images from Google Forms are not public, photo URLs may import but images will not display due to access restrictions.
                        For Google Drive files, use sharing: "Anyone with the link" and role "Viewer".
                    </Typography>
                </CardContent>
            </Card>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Alert severity="error" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Import Failed
                            </Typography>
                            <Typography variant="body2">
                                {error}
                            </Typography>
                        </Box>
                    </Alert>
                </motion.div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card sx={{ mb: 3 }}>
                        <Box
                            onClick={() => setExpanded(!expanded)}
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                backgroundColor: successCount === totalCount ? '#e8f5e9' : failedCount > 0 ? '#fff3e0' : '#e3f2fd',
                                borderLeft: `5px solid ${successCount === totalCount ? '#4caf50' : failedCount > 0 ? '#ff9800' : '#2196f3'}`
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {successCount === totalCount ? (
                                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                                ) : (
                                    <ErrorIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                                )}
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Import Complete: {successCount} / {totalCount} Successful
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label={`${successCount} Imported`}
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                        />
                                        {failedCount > 0 && (
                                            <Chip
                                                icon={<ErrorIcon />}
                                                label={`${failedCount} Failed`}
                                                color="warning"
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            <IconButton size="small">
                                <ExpandMoreIcon
                                    sx={{
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s'
                                    }}
                                />
                            </IconButton>
                        </Box>

                        <Box sx={{ width: '100%', bgcolor: '#f5f5f5', height: 6 }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    width: `${successPercentage}%`,
                                    bgcolor: successCount === totalCount ? '#4caf50' : '#ff9800',
                                    transition: 'width 0.5s ease'
                                }}
                            />
                        </Box>

                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <CardContent>
                                {failedCount > 0 && (
                                    <Box>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<ErrorIcon />}
                                            onClick={() => setShowDetailedErrors(!showDetailedErrors)}
                                            sx={{ mb: 2 }}
                                        >
                                            View Failed Rows ({failedCount})
                                        </Button>

                                        <Collapse in={showDetailedErrors}>
                                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                <Table size="small">
                                                    <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Row #</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Error</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {result.failedRows.map((failedRow) => (
                                                            <TableRow key={failedRow.rowNumber} hover>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                                    {failedRow.rowNumber}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                        {failedRow.errors.map((error, idx) => (
                                                                            <Chip
                                                                                key={idx}
                                                                                label={error}
                                                                                color="warning"
                                                                                variant="outlined"
                                                                                size="small"
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Collapse>
                                    </Box>
                                )}
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button variant="contained" color="success" onClick={handleReset}>
                                        Import More
                                    </Button>
                                    <Button variant="outlined" onClick={() => setExpanded(false)}>
                                        Done
                                    </Button>
                                </Box>
                            </CardContent>
                        </Collapse>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
};

PlayerImport.propTypes = {
    auctionId: PropTypes.number.isRequired,
    onImportComplete: PropTypes.func
};

export default PlayerImport;
