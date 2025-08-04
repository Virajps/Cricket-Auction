import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007BFF', // A clean, modern blue
      light: '#63a4ff',
      dark: '#004fa8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#673ab7', // A deep purple
      light: '#9a67ea',
      dark: '#320b86',
      contrastText: '#ffffff',
    },
    success: {
      main: '#28a745',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc3545',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Dark gray for high contrast
      secondary: '#6c757d', // Lighter gray for secondary text
    },
  },
  shape: {
    borderRadius: 8, // A more standard border radius
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0069d9',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                color: '#333'
            }
        }
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease-in-out',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#007BFF',
                    },
                },
            },
        },
    },
  },
});

export default theme; 