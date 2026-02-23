import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Container } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import AuctionList from './components/AuctionList';
import AuctionForm from './components/AuctionForm';
import AuctionDetails from './components/AuctionDetails';
import TeamList from './components/TeamList';
import TeamForm from './components/TeamForm';

import PlayerList from './components/PlayerList';
import PlayerForm from './components/PlayerForm';

import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';

import AuctionSettings from './components/AuctionSettings';
import BidRuleList from './components/BidRuleList';
import BidRuleForm from './components/BidRuleForm';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Auction from './components/Auction';
import AuctionSummary from './components/AuctionSummary';
import AdminAccessManager from './components/AdminAccessManager';
import './App.css';

function RouteLoader() {
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/auctions" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Container maxWidth="xl" disableGutters sx={{ px: 0, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/auctions" replace />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin/access" element={<RequireAuth><AdminAccessManager /></RequireAuth>} />
            {/* Auction routes */}
            <Route path="/auctions" element={<RequireAuth><AuctionList /></RequireAuth>} />
            <Route path="/auctions/create" element={<RequireAuth><AuctionForm /></RequireAuth>} />
            <Route path="/auctions/:id" element={<RequireAuth><AuctionDetails /></RequireAuth>} />
            <Route path="/auctions/:id/edit" element={
              <RequireAuth>
                <AuctionForm />
              </RequireAuth>
            } />
            <Route path="/auctions/:id/live" element={<RequireAuth><Auction /></RequireAuth>} />
            <Route path="/auctions/:id/summary" element={<RequireAuth><AuctionSummary /></RequireAuth>} />
            {/* Team routes */}
            <Route path="/auctions/:auctionId/teams" element={
              <RequireAuth>
                <TeamList />
              </RequireAuth>
            } />
            <Route path="/auctions/:auctionId/teams/new" element={
              <RequireAuth>
                <TeamForm />
              </RequireAuth>
            } />
            <Route path="/auctions/:auctionId/teams/:id/edit" element={
              <RequireAuth>
                <TeamForm />
              </RequireAuth>
            } />
            
            {/* Player routes */}
            <Route path="/auctions/:auctionId/players" element={
              <RequireAuth>
                <PlayerList />
              </RequireAuth>
            } />
            <Route path="/auctions/:auctionId/players/new" element={
              <RequireAuth>
                <PlayerForm />
              </RequireAuth>
            } />
            <Route path="/auctions/:auctionId/players/:id/edit" element={
              <RequireAuth>
                <PlayerForm />
              </RequireAuth>
            } />
            
            {/* Category routes */}
            <Route path="/auctions/:auctionId/categories" element={<RequireAuth><CategoryList /></RequireAuth>} />
            <Route path="/auctions/:auctionId/categories/new" element={<RequireAuth><CategoryForm /></RequireAuth>} />
            <Route path="/auctions/:auctionId/categories/:id/edit" element={<RequireAuth><CategoryForm /></RequireAuth>} />
            
            {/* Settings routes */}
            <Route path="/auctions/:auctionId/settings" element={<RequireAuth><AuctionSettings /></RequireAuth>} />
            {/* Bid rules routes */}
            <Route path="/auctions/:auctionId/bid-rules" element={<RequireAuth><BidRuleList /></RequireAuth>} />
            <Route path="/auctions/:auctionId/bid-rules/new" element={<RequireAuth><BidRuleForm /></RequireAuth>} />
            <Route path="/auctions/:auctionId/bid-rules/:id/edit" element={<RequireAuth><BidRuleForm /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/auctions" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
