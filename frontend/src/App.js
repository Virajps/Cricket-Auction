import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
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
import SponsorList from './components/SponsorList';
import SponsorForm from './components/SponsorForm';
import AuctionSettings from './components/AuctionSettings';
import BidRuleList from './components/BidRuleList';
import BidRuleForm from './components/BidRuleForm';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Auction from './components/Auction';
import './App.css';

function ProtectedRoute({ children, allowed, fallback }) {
  if (!allowed) {
    return fallback || <div style={{padding: 40}}><h2>Not authorized</h2></div>;
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
            <Route path="/" element={<AuctionList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            {/* Auction routes */}
            <Route path="/auctions" element={<AuctionList />} />
            <Route path="/auctions/create" element={<AuctionForm />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/auctions/:id/edit" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <AuctionForm />
              </ProtectedRoute>
            } />
            <Route path="/auctions/:id/live" element={<Auction />} />
            {/* Team routes */}
            <Route path="/auctions/:auctionId/teams" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <TeamList />
              </ProtectedRoute>
            } />
            <Route path="/auctions/:auctionId/teams/new" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <TeamForm />
              </ProtectedRoute>
            } />
            <Route path="/auctions/:auctionId/teams/:id/edit" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <TeamForm />
              </ProtectedRoute>
            } />
            {/* Player routes */}
            <Route path="/auctions/:auctionId/players" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <PlayerList />
              </ProtectedRoute>
            } />
            <Route path="/auctions/:auctionId/players/new" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <PlayerForm />
              </ProtectedRoute>
            } />
            <Route path="/auctions/:auctionId/players/:id/edit" element={
              <ProtectedRoute
                allowed={true} // Placeholder for actual logic, assuming ADMIN or creator check
                fallback={<div style={{padding: 40}}><h2>Not authorized</h2></div>}
              >
                <PlayerForm />
              </ProtectedRoute>
            } />
            {/* Category routes */}
            <Route path="/auctions/:auctionId/categories" element={<CategoryList />} />
            <Route path="/auctions/:auctionId/categories/new" element={<CategoryForm />} />
            <Route path="/auctions/:auctionId/categories/:id/edit" element={<CategoryForm />} />
            {/* Sponsor routes */}
            <Route path="/auctions/:auctionId/sponsors" element={<SponsorList />} />
            <Route path="/auctions/:auctionId/sponsors/new" element={<SponsorForm />} />
            <Route path="/auctions/:auctionId/sponsors/:id/edit" element={<SponsorForm />} />
            {/* Settings routes */}
            <Route path="/auctions/:auctionId/settings" element={<AuctionSettings />} />
            {/* Bid rules routes */}
            <Route path="/auctions/:auctionId/bid-rules" element={<BidRuleList />} />
            <Route path="/auctions/:auctionId/bid-rules/new" element={<BidRuleForm />} />
            <Route path="/auctions/:auctionId/bid-rules/:id/edit" element={<BidRuleForm />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
