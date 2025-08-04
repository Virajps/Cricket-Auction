import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';

const MessageType = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    SUCCESS: 'success'
};

const ErrorMessage = ({ type = MessageType.ERROR, title, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case MessageType.ERROR:
                return <ErrorIcon />;
            case MessageType.WARNING:
                return <WarningIcon />;
            case MessageType.INFO:
                return <InfoIcon />;
            default:
                return null;
        }
    };

    const getColor = () => {
        switch (type) {
            case MessageType.ERROR:
                return 'error';
            case MessageType.WARNING:
                return 'warning';
            case MessageType.INFO:
                return 'info';
            case MessageType.SUCCESS:
                return 'success';
            default:
                return 'error';
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Alert 
                severity={getColor()} 
                icon={getIcon()}
                onClose={onClose}
                sx={{
                    '& .MuiAlert-message': {
                        width: '100%'
                    }
                }}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {message}
            </Alert>
        </Box>
    );
};

export { MessageType };
export default ErrorMessage; 