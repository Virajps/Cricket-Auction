import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Auctions', path: '/auctions' },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const renderNavLinks = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {navLinks.map((link, i) => (
        <motion.div key={link.label} variants={navItemVariants}>
          <Button
            color="inherit"
            component={Link}
            to={link.path}
            sx={{ fontWeight: 600, fontSize: '1rem' }}
          >
            {link.label}
          </Button>
        </motion.div>
      ))}
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <motion.div initial="hidden" animate="visible" variants={logoVariants}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: 'inherit',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '1px',
            }}
          >
            Squadify
          </Typography>
        </motion.div>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { width: 250 } }}
            >
              <List>
                {navLinks.map((link) => (
                  <ListItem
                    button
                    key={link.label}
                    component={Link}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary={link.label} />
                  </ListItem>
                ))}
                <Box sx={{ my: 1, mx: 2 }}><hr/></Box>
                {user ? (
                  <ListItem button onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItem>
                ) : (
                  <>
                    <ListItem button onClick={() => { setDrawerOpen(false); navigate('/login'); }}>
                      <ListItemText primary="Login" />
                    </ListItem>
                    <ListItem button onClick={() => { setDrawerOpen(false); navigate('/register'); }}>
                      <ListItemText primary="Register" />
                    </ListItem>
                  </>
                )}
              </List>
            </Drawer>
          </>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={navItemVariants}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderNavLinks()}
              {user ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/profile"
                  >
                    Profile
                  </Button>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </motion.div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
 
